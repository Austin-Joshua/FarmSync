"""
FarmSync — Crop Recommendation Model Training
==============================================
Trains a Random Forest on the full 2400+ row dataset.
Run generate_dataset.py first to create the full dataset.

Pipeline:
  1. Load full dataset (generated + original)
  2. Preprocess and validate
  3. Train RandomForestClassifier
  4. Evaluate accuracy
  5. Save model + metadata

Expected accuracy: ~98% with the full synthetic dataset.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
import json
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent
DATASET_DIR = BASE_DIR / 'Dataset'

# Use real Kaggle Crop Recommendation dataset from canonical Dataset/ folder
FULL_DATASET_PATH = DATASET_DIR / 'Crop_recommendation.csv'
ORIGINAL_DATASET_PATH = DATASET_DIR / 'Crop_recommendation.csv'

MODEL_DIR = BASE_DIR / 'models'
os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_PATH = MODEL_DIR / 'crop_recommendation_model.pkl'
MODEL_INFO_PATH = MODEL_DIR / 'model_info.json'

FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']

def load_dataset():
    """Load the best available dataset."""
    if FULL_DATASET_PATH.exists():
        print(f"  Loading full dataset: {FULL_DATASET_PATH}")
        df = pd.read_csv(FULL_DATASET_PATH)
    elif ORIGINAL_DATASET_PATH.exists():
        print(f"  Full dataset not found. Loading original: {ORIGINAL_DATASET_PATH}")
        df = pd.read_csv(ORIGINAL_DATASET_PATH)
    else:
        raise FileNotFoundError("No dataset found.")
    
    # Normalize column names and map to standard FEATURES casing
    df.columns = [c.strip() for c in df.columns]
    df = df.rename(columns={'n': 'N', 'p': 'P', 'k': 'K'})
    print(f"  Rows: {len(df)}, Crops: {df['label'].nunique()}")
    print(f"  Crop classes: {sorted(df['label'].unique())}")
    return df

def preprocess_data(df):
    """Validate and extract features + labels."""
    # Check for required columns
    missing = [c for c in FEATURES + ['label'] if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns in dataset: {missing}")
    
    # Drop any rows with NaN
    initial_len = len(df)
    df = df.dropna(subset=FEATURES + ['label'])
    if len(df) < initial_len:
        print(f"  Dropped {initial_len - len(df)} rows with NaN values")
    
    X = df[FEATURES].values.astype(float)
    y = df['label'].values
    return X, y, FEATURES

def train_and_evaluate(X, y):
    """Train RandomForest with cross-validation."""
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=60
    )
    
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,       # Allow full depth for complex data
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42,
        n_jobs=-1,
        class_weight='balanced'  # Handle any class imbalance
    )
    
    print("  Training model...")
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n  === Evaluation Results ===")
    print(f"  Test Accuracy: {accuracy*100:.2f}%")
    print(f"\n  Classification Report:\n{classification_report(y_test, y_pred)}")
    
    # 2-fold cross validation (since min class size is 2)
    print("  Running 2-fold cross-validation...")
    cv_scores = cross_val_score(model, X, y, cv=2, n_jobs=-1)
    cv_mean = cv_scores.mean()
    cv_std = cv_scores.std()
    print(f"  CV Accuracy: {cv_mean*100:.2f}% ± {cv_std*100:.2f}%")
    
    # Feature importance
    importances = model.feature_importances_
    feat_imp = sorted(zip(FEATURES, importances), key=lambda x: -x[1])
    print("\n  Feature Importances:")
    for feat, imp in feat_imp:
        print(f"    {feat:15s}: {imp*100:.1f}%")
    
    return model, accuracy, cv_mean, cv_std, feat_imp

def save_model(model, accuracy, cv_mean, cv_std, feat_imp):
    """Persist the trained model and metadata."""
    joblib.dump(model, MODEL_PATH)
    
    model_info = {
        'model_type': 'RandomForestClassifier',
        'n_estimators': 200,
        'accuracy': float(accuracy),
        'accuracy_percent': float(accuracy * 100),
        'cv_accuracy': float(cv_mean * 100),
        'cv_std': float(cv_std * 100),
        'features': FEATURES,
        'classes': model.classes_.tolist(),
        'feature_importances': {f: float(i) for f, i in feat_imp}
    }
    
    with open(MODEL_INFO_PATH, 'w') as f:
        json.dump(model_info, f, indent=2)
    
    print(f"\n  Saved model -> {MODEL_PATH}")
    print(f"  Saved info  -> {MODEL_INFO_PATH}")

def main():
    print("=" * 60)
    print("FarmSync — Crop Recommendation Model Training")
    print("=" * 60)
    
    print("\n[1] Loading dataset...")
    df = load_dataset()
    
    print("\n[2] Preprocessing...")
    X, y, features = preprocess_data(df)
    
    print("\n[3] Training & Evaluating...")
    model, accuracy, cv_mean, cv_std, feat_imp = train_and_evaluate(X, y)
    
    print("\n[4] Saving model...")
    save_model(model, accuracy, cv_mean, cv_std, feat_imp)
    
    print(f"\n{'='*60}")
    print(f"Training Complete!")
    print(f"   Test Accuracy:   {accuracy*100:.2f}%")
    print(f"   CV Accuracy:     {cv_mean*100:.2f}% ± {cv_std*100:.2f}%")
    print(f"   Target (95%+):   {'ACHIEVED' if accuracy >= 0.95 else 'Not reached - run generate_dataset.py first'}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
