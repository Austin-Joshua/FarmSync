"""
Crop Recommendation ML Model Training Script
Trains a Random Forest classifier on crop recommendation dataset
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import json
import os
from pathlib import Path

# Set paths
BASE_DIR = Path(__file__).parent
DATASET_PATH = BASE_DIR.parent / 'Dataset' / 'archive (3)' / 'Crop_recommendation.csv'
MODEL_PATH = BASE_DIR / 'crop_recommendation_model.pkl'
MODEL_INFO_PATH = BASE_DIR / 'model_info.json'

def load_dataset():
    """Load and preprocess the crop recommendation dataset"""
    print(f"Loading dataset from: {DATASET_PATH}")
    
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")
    
    df = pd.read_csv(DATASET_PATH)
    print(f"Dataset loaded: {df.shape[0]} samples, {df.shape[1]} features")
    print(f"\nDataset columns: {list(df.columns)}")
    print(f"\nFirst few rows:")
    print(df.head())
    
    return df

def preprocess_data(df):
    """Preprocess the data for training"""
    # Check column names (they might be different)
    print("\nPreprocessing data...")
    
    # Standardize column names (handle different naming conventions)
    column_mapping = {
        'N': 'N',
        'P': 'P', 
        'K': 'K',
        'temperature': 'temperature',
        'humidity': 'humidity',
        'ph': 'ph',
        'rainfall': 'rainfall',
        'label': 'label',
        'crop': 'label'
    }
    
    # Rename columns if needed
    df_clean = df.copy()
    for old_name, new_name in column_mapping.items():
        if old_name in df_clean.columns and old_name != new_name:
            df_clean.rename(columns={old_name: new_name}, inplace=True)
    
    # Identify feature columns and target
    feature_cols = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    target_col = 'label'
    
    # Check if all required columns exist
    missing_cols = [col for col in feature_cols + [target_col] if col not in df_clean.columns]
    if missing_cols:
        print(f"Warning: Missing columns: {missing_cols}")
        print(f"Available columns: {list(df_clean.columns)}")
        # Try to find similar column names
        for col in missing_cols:
            similar = [c for c in df_clean.columns if col.lower() in c.lower() or c.lower() in col.lower()]
            if similar:
                print(f"  '{col}' might be: {similar}")
    
    # Extract features and target
    X = df_clean[feature_cols].values
    y = df_clean[target_col].values
    
    print(f"Features shape: {X.shape}")
    print(f"Target shape: {y.shape}")
    print(f"Unique crops: {len(np.unique(y))}")
    print(f"Crop types: {np.unique(y)}")
    
    return X, y, feature_cols

def train_model(X, y):
    """Train the Random Forest classifier"""
    print("\n" + "="*50)
    print("Training Random Forest Classifier...")
    print("="*50)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training set: {X_train.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")
    
    # Train model
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        random_state=42,
        n_jobs=-1,
        verbose=1
    )
    
    print("\nTraining in progress...")
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print("\n" + "="*50)
    print("Model Evaluation")
    print("="*50)
    print(f"Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    return model, accuracy, X_test, y_test, y_pred

def save_model(model, accuracy, feature_cols):
    """Save the trained model and metadata"""
    print("\nSaving model...")
    
    # Save model
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to: {MODEL_PATH}")
    
    # Save model info
    model_info = {
        'model_type': 'RandomForestClassifier',
        'accuracy': float(accuracy),
        'accuracy_percent': float(accuracy * 100),
        'features': feature_cols,
        'n_estimators': 100,
        'max_depth': 20,
        'n_classes': len(model.classes_),
        'classes': model.classes_.tolist()
    }
    
    with open(MODEL_INFO_PATH, 'w') as f:
        json.dump(model_info, f, indent=2)
    
    print(f"Model info saved to: {MODEL_INFO_PATH}")
    print("\nModel Information:")
    print(json.dumps(model_info, indent=2))

def main():
    """Main training function"""
    try:
        print("="*50)
        print("Crop Recommendation ML Model Training")
        print("="*50)
        
        # Load dataset
        df = load_dataset()
        
        # Preprocess
        X, y, feature_cols = preprocess_data(df)
        
        # Train model
        model, accuracy, X_test, y_test, y_pred = train_model(X, y)
        
        # Save model
        save_model(model, accuracy, feature_cols)
        
        print("\n" + "="*50)
        print("[SUCCESS] Training completed successfully!")
        print("="*50)
        print(f"\nModel accuracy: {accuracy*100:.2f}%")
        print(f"Model saved to: {MODEL_PATH}")
        print(f"\nYou can now use the model for predictions!")
        
    except Exception as e:
        print(f"\n[ERROR] Error during training: {str(e)}")
        import traceback
        traceback.print_exc()
        exit(1)

if __name__ == '__main__':
    main()
