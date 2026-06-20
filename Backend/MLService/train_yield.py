"""
FarmSync — Yield Prediction Model Training
===========================================
Trains a RandomForestRegressor on agriculture_dataset.csv.

Features trained:
  - crop_type (encoded)
  - farm_area (acres)
  - irrigation_type (encoded)
  - fertilizer_used (tons)
  - pesticide_used (kg)
  - water_usage (cubic meters)
  - soil_type (encoded)
  - season (encoded)

Target:
  - yield (tons)
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import r2_score, mean_squared_error
import joblib
import json
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent
DATASET_PATH = BASE_DIR.resolve() / 'Dataset' / 'agriculture_dataset.csv'
MODEL_DIR = BASE_DIR / 'models'
os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_PATH = MODEL_DIR / 'yield_model.pkl'
INFO_PATH = MODEL_DIR / 'yield_info.json'

def train_yield_model():
    print("=" * 60)
    print("Training High-Fidelity Yield Prediction Model")
    print("=" * 60)

    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATASET_PATH}")

    # Load dataset
    print(f"Loading agriculture dataset from {DATASET_PATH}...")
    df = pd.read_csv(DATASET_PATH)
    initial_len = len(df)
    
    # Rename columns to standard internal names
    df = df.rename(columns={
        'Crop_Type': 'crop',
        'Farm_Area(acres)': 'area',
        'Irrigation_Type': 'irrigation',
        'Fertilizer_Used(tons)': 'fertilizer',
        'Pesticide_Used(kg)': 'pesticide',
        'Soil_Type': 'soil',
        'Season': 'season',
        'Water_Usage(cubic meters)': 'water',
        'Yield(tons)': 'yield'
    })
    
    # Clean data
    df = df.dropna(subset=['crop', 'area', 'irrigation', 'fertilizer', 'pesticide', 'soil', 'season', 'water', 'yield'])
    df = df[df['area'] > 0]
    
    print(f"Loaded dataset: {len(df)} valid rows out of {initial_len}")

    # Standardize names
    df['crop'] = df['crop'].str.strip().str.lower()
    df['irrigation'] = df['irrigation'].str.strip().str.lower()
    df['soil'] = df['soil'].str.strip().str.lower()
    df['season'] = df['season'].str.strip().str.lower()
    
    # Extract numerical features
    df['area'] = df['area'].astype(float)
    df['fertilizer'] = df['fertilizer'].astype(float)
    df['pesticide'] = df['pesticide'].astype(float)
    df['water'] = df['water'].astype(float)

    categorical_features = ['crop', 'irrigation', 'soil', 'season']
    numerical_features = ['area', 'fertilizer', 'pesticide', 'water']
    features = categorical_features + numerical_features

    print("Encoding categorical features...")
    # Build encoders mapping category string to integer index
    encoders = {}
    for col in categorical_features:
        unique_vals = sorted(df[col].unique().tolist())
        encoders[col] = {str(val): idx for idx, val in enumerate(unique_vals)}
        df[col] = df[col].map(encoders[col])

    X = df[features].values
    y = df['yield'].values

    print("Splitting and training RandomForestRegressor...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train Random Forest Regressor
    model = RandomForestRegressor(n_estimators=150, max_depth=None, min_samples_split=2, min_samples_leaf=1, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    
    print(f"Test R2 Score: {r2:.4f}")
    print(f"Test RMSE: {rmse:.4f}")

    # Save model and details
    joblib.dump(model, MODEL_PATH)
    
    model_info = {
        'model_type': 'RandomForestRegressor',
        'r2_score': float(r2),
        'rmse': float(rmse),
        'features': features,
        'encoders': encoders
    }

    with open(INFO_PATH, 'w') as f:
        json.dump(model_info, f, indent=2)

    print(f"Yield model successfully saved to: {MODEL_PATH}")
    print(f"Yield info successfully saved to: {INFO_PATH}")
    print("=" * 60)

if __name__ == '__main__':
    train_yield_model()
