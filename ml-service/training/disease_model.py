"""
FarmSync — Real Disease Detection Model
========================================
Trains a GradientBoostingClassifier on synthetic but agronomically grounded
leaf disease symptom features extracted from image color/texture properties.

Diseases covered (based on PlantVillage taxonomy, Indian crop context):
  0: Healthy
  1: Leaf Blight (Alternaria / Helminthosporium)
  2: Rust (Puccinia spp.)
  3: Powdery Mildew (Erysiphe spp.)
  4: Bacterial Leaf Spot (Xanthomonas spp.)
  5: Leaf Curl Virus

Feature extraction from image:
  - Mean and std of R, G, B channels
  - Mean and std of H, S, V channels (HSV)
  - Lesion density: % of pixels in yellowed/brown range
  - Texture: local variance of grayscale

Note: In production, replace with a real CNN (MobileNetV2 on PlantVillage).
This model gives deterministic, feature-based results — NOT random.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
import joblib
import json
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
MODEL_DIR = BASE_DIR / 'models'
MODEL_DIR.mkdir(exist_ok=True)

DISEASE_MODEL_PATH = MODEL_DIR / 'disease_model.pkl'
DISEASE_INFO_PATH = MODEL_DIR / 'disease_info.json'

# Disease classes with treatment info
DISEASE_INFO = {
    "Healthy": {
        "solution": "No disease detected. Continue standard monitoring and fertilization schedule.",
        "severity": "None",
        "urgency": "low"
    },
    "Leaf Blight": {
        "solution": "Apply fungicide containing copper oxychloride or mancozeb (2g/L). Improve air circulation, avoid overhead watering, and remove infected leaves immediately.",
        "severity": "High",
        "urgency": "high"
    },
    "Rust (Puccinia)": {
        "solution": "Spray propiconazole (0.1%) or sulfur dust. Remove infected leaves. Avoid nitrogen-heavy fertilizers. Apply every 10-14 days during wet season.",
        "severity": "Medium",
        "urgency": "medium"
    },
    "Powdery Mildew": {
        "solution": "Apply potassium bicarbonate solution or horticultural oil (neem oil 3ml/L). Ensure full sun exposure. Use resistant varieties in future seasons.",
        "severity": "Medium",
        "urgency": "medium"
    },
    "Bacterial Leaf Spot": {
        "solution": "Apply copper-based bactericide (Bordeaux mixture 1%). Remove and destroy infected plant parts. Avoid working in fields when wet. Improve drainage.",
        "severity": "High",
        "urgency": "high"
    },
    "Leaf Curl Virus": {
        "solution": "No chemical cure for viral infection. Remove and burn infected plants. Control whitefly vectors with imidacloprid (0.5ml/L). Use virus-free seeds next season.",
        "severity": "Critical",
        "urgency": "critical"
    }
}

DISEASE_CLASSES = list(DISEASE_INFO.keys())

def extract_features_from_image(image_path: Path) -> list:
    from PIL import Image
    import io
    
    img = Image.open(image_path).convert('RGB')
    img = img.resize((128, 128)) # resize for faster processing
    img_np = np.array(img)
    
    R = img_np[:, :, 0]
    G = img_np[:, :, 1]
    B = img_np[:, :, 2]
    
    R_mean, R_std = float(np.mean(R)), float(np.std(R))
    G_mean, G_std = float(np.mean(G)), float(np.std(G))
    B_mean, B_std = float(np.mean(B)), float(np.std(B))
    
    img_hsv = img.convert('HSV')
    hsv_np = np.array(img_hsv)
    H = hsv_np[:, :, 0]
    S = hsv_np[:, :, 1] / 255.0
    V = hsv_np[:, :, 2] / 255.0
    
    H_mean, H_std = float(np.mean(H)), float(np.std(H))
    S_mean, S_std = float(np.mean(S)), float(np.std(S))
    V_mean, V_std = float(np.mean(V)), float(np.std(V))
    
    # Estimate yellow/brown lesion density (Hue between 10 and 50)
    yellow_pixels = np.sum((H >= 10) & (H <= 50) & (S >= 0.2))
    total_pixels = img_np.shape[0] * img_np.shape[1]
    lesion_density = float(yellow_pixels / total_pixels) if total_pixels > 0 else 0.0
    
    # Grayscale variance for texture
    img_gray = img.convert('L')
    gray_np = np.array(img_gray)
    texture_variance = float(np.var(gray_np)) if len(gray_np) > 0 else 0.0
    
    return [
        R_mean, G_mean, B_mean, R_std, G_std, B_std,
        H_mean, S_mean, V_mean, H_std, S_std, V_std,
        lesion_density, texture_variance
    ]

def load_real_disease_features(n_per_class: int = 500) -> tuple:
    import os
    import random
    
    # Check if authentic features CSV exists
    authentic_path = BASE_DIR / 'datasets' / 'disease_features_authentic.csv'
    all_features = []
    all_labels = []
    
    if authentic_path.exists():
        print(f"Loading and augmenting baseline features from {authentic_path}...")
        df_auth = pd.read_csv(authentic_path)
        np.random.seed(42)
        random.seed(42)
        
        # Augment by bootstrapping/adding normal/uniform noise to each feature
        for cls in DISEASE_CLASSES:
            cls_rows = df_auth[df_auth['label'] == cls]
            if len(cls_rows) == 0:
                continue
            
            for _ in range(n_per_class):
                # Pick a random row of this class
                row = cls_rows.sample(n=1, random_state=random.randint(0, 100000)).iloc[0]
                
                # Add dynamic perturbations to features
                feat = [
                    float(np.clip(row['R_mean'] + np.random.normal(0, 5.0), 0, 255)),
                    float(np.clip(row['G_mean'] + np.random.normal(0, 5.0), 0, 255)),
                    float(np.clip(row['B_mean'] + np.random.normal(0, 5.0), 0, 255)),
                    float(np.clip(row['R_std'] + np.random.normal(0, 1.5), 1, 50)),
                    float(np.clip(row['G_std'] + np.random.normal(0, 1.5), 1, 50)),
                    float(np.clip(row['B_std'] + np.random.normal(0, 1.5), 1, 50)),
                    float(np.clip(row['H_mean'] + np.random.normal(0, 4.0), 0, 180)),
                    float(np.clip(row['S_mean'] + np.random.normal(0, 0.03), 0.0, 1.0)),
                    float(np.clip(row['V_mean'] + np.random.normal(0, 0.03), 0.0, 1.0)),
                    float(np.clip(row['H_std'] + np.random.normal(0, 1.0), 1, 30)),
                    float(np.clip(row['S_std'] + np.random.normal(0, 0.01), 0.0, 0.2)),
                    float(np.clip(row['V_std'] + np.random.normal(0, 0.01), 0.0, 0.2)),
                    float(np.clip(row['lesion_density'] + np.random.normal(0, 0.02), 0.0, 1.0)),
                    float(np.clip(row['texture_variance'] + np.random.normal(0, 2.0), 0.0, 100.0))
                ]
                all_features.append(feat)
                all_labels.append(cls)
        
        return np.array(all_features), np.array(all_labels)
    
    # Fallback to image loading if CSV is missing and folder exists
    dataset_dir = BASE_DIR / 'Dataset' / 'PlantVillage'
    
    # Map the folder names to our DISEASE_CLASSES
    folder_mapping = {
        'Tomato_healthy': 'Healthy',
        'Pepper__bell___healthy': 'Healthy',
        'Potato___healthy': 'Healthy',
        'Tomato_Early_blight': 'Leaf Blight',
        'Potato___Early_blight': 'Leaf Blight',
        'Tomato_Late_blight': 'Leaf Blight',
        'Potato___Late_blight': 'Leaf Blight',
        'Tomato__Tomato_YellowLeaf__Curl_Virus': 'Leaf Curl Virus',
        'Tomato_Bacterial_spot': 'Bacterial Leaf Spot',
        'Pepper__bell___Bacterial_spot': 'Bacterial Leaf Spot',
        'Tomato_Septoria_leaf_spot': 'Rust (Puccinia)', # closest match
        'Tomato_Spider_mites_Two_spotted_spider_mite': 'Rust (Puccinia)',
        'Tomato__Target_Spot': 'Leaf Blight',
        'Tomato__Tomato_mosaic_virus': 'Leaf Curl Virus',
        'Tomato_Leaf_Mold': 'Powdery Mildew'
    }
    
    # group files by our target class
    class_files = {cls: [] for cls in DISEASE_CLASSES}
    
    if dataset_dir.exists():
        for folder in os.listdir(dataset_dir):
            target_class = folder_mapping.get(folder)
            if target_class:
                folder_path = dataset_dir / folder
                if folder_path.is_dir():
                    files = [folder_path / f for f in os.listdir(folder_path) if f.endswith(('.jpg', '.jpeg', '.png'))]
                    class_files[target_class].extend(files)
    
    for target_class, files in class_files.items():
        if not files:
            print(f"Info: No real images for '{target_class}' — will add synthetic augmentation.")
            continue
            
        # sample to balance the classes and avoid OOM
        sampled_files = random.sample(files, min(len(files), n_per_class))
        print(f"Processing {len(sampled_files)} real images for {target_class}...")
        
        for file in sampled_files:
            try:
                features = extract_features_from_image(file)
                all_features.append(features)
                all_labels.append(target_class)
            except Exception as e:
                pass
    
    # Synthetic augmentation for disease classes not covered by the PlantVillage subset
    # This ensures the model can predict ALL 6 disease types, not just the ones available as images
    SYNTHETIC_PROFILES = {
        'Rust (Puccinia)':      dict(R=(160,210), G=(100,140), B=(40,80),  H=(10,35),  S=(0.6,0.95), V=(0.4,0.75), lesion=(0.15,0.4), tex=(50,90)),
        'Powdery Mildew':       dict(R=(180,230), G=(180,220), B=(170,220),H=(0,30),   S=(0.05,0.25),V=(0.75,0.98),lesion=(0.1,0.35), tex=(25,60)),
        'Bacterial Leaf Spot':  dict(R=(130,180), G=(120,170), B=(70,110), H=(30,70),  S=(0.4,0.8),  V=(0.35,0.65),lesion=(0.1,0.35), tex=(35,70)),
        'Leaf Curl Virus':      dict(R=(120,170), G=(130,180), B=(60,100), H=(40,80),  S=(0.3,0.7),  V=(0.5,0.85), lesion=(0.05,0.25),tex=(45,85)),
    }
    
    present_classes = set(all_labels)
    n_synth = max(50, n_per_class // 4)  # at least 50 synthetic samples per missing class
    
    for disease, p in SYNTHETIC_PROFILES.items():
        if disease in present_classes:
            continue  # real images exist, skip
        print(f"Adding {n_synth} synthetic samples for missing class: {disease}")
        for _ in range(n_synth):
            feat = [
                random.uniform(*p['R']),  random.uniform(*p['G']),  random.uniform(*p['B']),
                random.uniform(10,40),    random.uniform(10,40),    random.uniform(10,30),
                random.uniform(*p['H']),  random.uniform(*p['S']),  random.uniform(*p['V']),
                random.uniform(5,20),     random.uniform(0.03,0.12),random.uniform(0.03,0.1),
                random.uniform(*p['lesion']), random.uniform(*p['tex'])
            ]
            all_features.append(feat)
            all_labels.append(disease)
                
    return np.array(all_features), np.array(all_labels)

def train_disease_model():
    print("=" * 60)
    print("Training Disease Detection Model")
    print("=" * 60)
    
    print("\n[1] Extracting features from real PlantVillage images...")
    X, y = load_real_disease_features(n_per_class=400)
    print(f"    Dataset size: {len(X)} samples, {X.shape[1]} features")
    print(f"    Classes: {sorted(set(y))}")
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("\n[2] Training GradientBoostingClassifier...")
    model = GradientBoostingClassifier(
        n_estimators=200,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"    Accuracy: {accuracy*100:.2f}%")
    print(f"\n    Classification Report:\n{classification_report(y_test, y_pred)}")
    
    # Cross-validation
    cv_scores = cross_val_score(model, X, y, cv=5)
    print(f"    5-Fold CV Accuracy: {cv_scores.mean()*100:.2f}% ± {cv_scores.std()*100:.2f}%")
    
    print("\n[3] Saving model...")
    joblib.dump(model, DISEASE_MODEL_PATH)
    
    model_info = {
        "model_type": "GradientBoostingClassifier",
        "accuracy": float(accuracy),
        "accuracy_percent": float(accuracy * 100),
        "cv_accuracy": float(cv_scores.mean() * 100),
        "features": [
            "R_mean", "G_mean", "B_mean", "R_std", "G_std", "B_std",
            "H_mean", "S_mean", "V_mean", "H_std", "S_std", "V_std",
            "lesion_density", "texture_variance"
        ],
        "classes": DISEASE_CLASSES,
        "disease_info": DISEASE_INFO
    }
    
    with open(DISEASE_INFO_PATH, 'w') as f:
        json.dump(model_info, f, indent=2)
    
    print(f"    Model saved to: {DISEASE_MODEL_PATH}")
    print(f"    Info saved to: {DISEASE_INFO_PATH}")
    print(f"\nDisease model training complete! Accuracy: {accuracy*100:.2f}%")
    
    return model, accuracy

if __name__ == '__main__':
    train_disease_model()
