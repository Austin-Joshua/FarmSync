"""
Crop Recommendation ML Model Training Script (FarmSync Consolidator)
===================================================================
Adapted from original script to use joblib and new directory structure.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
import json
import os
from pathlib import Path

# Paths relative to this file
BASE_DIR = Path(__file__).parent
DATASET_PATH = BASE_DIR / 'Dataset' / 'Crop_recommendation.csv'
MODEL_DIR = BASE_DIR / 'models'
os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_PATH = MODEL_DIR / 'crop_recommendation_model.pkl'
MODEL_INFO_PATH = MODEL_DIR / 'model_info.json'

def load_dataset():
    """Load and preprocess the crop recommendation dataset"""
    print(f"Loading dataset from: {DATASET_PATH}")
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")
    df = pd.read_csv(DATASET_PATH)
    return df

def preprocess_data(df):
    """Preprocess the data for training"""
    df_clean = df.copy()
    feature_cols = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    target_col = 'label'
    
    # Ensure columns exist
    for col in feature_cols + [target_col]:
        if col not in df_clean.columns:
            # Try to fix column naming inconsistencies
            matches = [c for c in df_clean.columns if col.lower() in c.lower()]
            if matches:
                df_clean.rename(columns={matches[0]: col}, inplace=True)

    X = df_clean[feature_cols].values
    y = df_clean[target_col].values
    return X, y, feature_cols

def train_model(X, y):
    """Train the Random Forest classifier"""
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Use parameters from original implementation
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        random_state=42,
        n_jobs=-1
    )
    
    print("Training in progress...")
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Accuracy: {accuracy*100:.2f}%")
    return model, accuracy

def save_model(model, accuracy, feature_cols):
    """Save the trained model and metadata"""
    joblib.dump(model, MODEL_PATH)
    model_info = {
        'model_type': 'RandomForestClassifier',
        'accuracy': float(accuracy),
        'accuracy_percent': float(accuracy * 100),
        'features': feature_cols,
        'classes': model.classes_.tolist()
    }
    with open(MODEL_INFO_PATH, 'w') as f:
        json.dump(model_info, f, indent=2)

def main():
    try:
        df = load_dataset()
        X, y, feature_cols = preprocess_data(df)
        model, accuracy = train_model(X, y)
        save_model(model, accuracy, feature_cols)
        print("[SUCCESS] Training completed successfully!")
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        exit(1)

if __name__ == '__main__':
    main()
