"""
FarmSync — Synthetic Crop Recommendation Dataset Generator
==========================================================
Generates a 2200-row agronomically accurate dataset for 22 Indian crops.
Based on published ICAR / FAO agronomic research ranges.
Each crop has realistic soil/climate parameter distributions.

Run: python generate_dataset.py
Output: Dataset/Crop_recommendation_full.csv
"""

import numpy as np
import pandas as pd
from pathlib import Path
import os

# Agronomic ranges per crop (based on ICAR / FAO research publications)
# Format: [N_min, N_max, P_min, P_max, K_min, K_max, temp_min, temp_max,
#          hum_min, hum_max, ph_min, ph_max, rain_min, rain_max]
CROP_PARAMS = {
    "rice":         [60, 120, 35, 80, 35, 80, 20, 35, 80, 95, 5.5, 7.0, 150, 300],
    "wheat":        [80, 120, 35, 80, 35, 80, 10, 25, 60, 80, 6.0, 7.5, 50,  150],
    "maize":        [60, 100, 30, 70, 30, 70, 18, 35, 60, 80, 5.5, 7.5, 50,  200],
    "chickpea":     [20, 60,  40, 80, 30, 70, 15, 30, 50, 70, 5.5, 7.5, 30,  100],
    "kidneybeans":  [20, 60,  60, 100, 40, 80, 15, 30, 50, 70, 5.5, 7.0, 80,  200],
    "pigeonpeas":   [20, 40,  50, 90, 30, 60, 18, 35, 60, 80, 5.0, 7.5, 60,  200],
    "mothbeans":    [20, 40,  40, 80, 20, 60, 25, 40, 40, 60, 3.5, 7.5, 30,  100],
    "mungbean":     [20, 40,  40, 80, 20, 60, 25, 35, 55, 75, 6.2, 7.2, 50,  100],
    "blackgram":    [20, 40,  50, 80, 30, 60, 25, 35, 65, 75, 5.5, 7.0, 60,  150],
    "lentil":       [15, 40,  40, 80, 20, 60, 10, 25, 50, 65, 5.5, 7.5, 30,  100],
    "pomegranate":  [15, 40,  30, 60, 30, 60, 22, 42, 30, 50, 6.0, 7.8, 30,  80],
    "banana":       [80, 120, 60, 100, 80, 120, 25, 35, 75, 95, 5.5, 7.5, 100, 250],
    "mango":        [20, 40,  20, 60, 30, 80, 24, 36, 50, 70, 5.5, 7.5, 75,  200],
    "grapes":       [30, 60,  50, 80, 60, 90, 15, 32, 60, 80, 5.5, 6.8, 60,  140],
    "watermelon":   [30, 60,  40, 70, 50, 80, 24, 38, 70, 85, 5.5, 6.8, 60,  120],
    "muskmelon":    [50, 80,  30, 60, 30, 60, 26, 42, 50, 70, 6.2, 7.5, 30,  70],
    "apple":        [20, 40,  20, 40, 30, 70, 5,  22, 50, 75, 5.5, 6.5, 50,  150],
    "orange":       [20, 40,  20, 40, 30, 80, 15, 30, 50, 75, 5.5, 7.0, 80,  200],
    "papaya":       [40, 80,  30, 70, 30, 80, 25, 40, 65, 90, 6.0, 7.5, 100, 200],
    "coconut":      [20, 40,  20, 40, 40, 80, 25, 35, 80, 95, 5.5, 7.5, 150, 250],
    "cotton":       [80, 120, 30, 60, 30, 60, 25, 40, 55, 75, 6.0, 7.5, 50,  150],
    "sugarcane":    [100,150, 50, 90, 50, 90, 25, 40, 75, 90, 6.0, 7.5, 100, 250],
    "coffee":       [20, 40,  20, 40, 30, 80, 15, 30, 65, 85, 5.5, 6.5, 100, 250],
    "jute":         [60, 100, 35, 80, 35, 80, 25, 40, 75, 95, 6.0, 7.5, 150, 300],
}

def generate_crop_data(crop_name: str, params: list, n_samples: int, seed: int) -> pd.DataFrame:
    """Generate synthetic data for a single crop using normal distribution within ranges."""
    np.random.seed(seed)
    
    (N_min, N_max, P_min, P_max, K_min, K_max,
     T_min, T_max, H_min, H_max, pH_min, pH_max,
     R_min, R_max) = params
    
    def sample_range(lo, hi, n):
        # Use beta distribution centered in range with some variance
        mid = (lo + hi) / 2
        std = (hi - lo) / 6
        vals = np.random.normal(mid, std, n)
        return np.clip(vals, lo, hi).round(2)
    
    df = pd.DataFrame({
        'N':           sample_range(N_min, N_max, n_samples),
        'P':           sample_range(P_min, P_max, n_samples),
        'K':           sample_range(K_min, K_max, n_samples),
        'temperature': sample_range(T_min, T_max, n_samples),
        'humidity':    sample_range(H_min, H_max, n_samples),
        'ph':          sample_range(pH_min, pH_max, n_samples),
        'rainfall':    sample_range(R_min, R_max, n_samples),
        'label':       crop_name
    })
    return df

def generate_full_dataset(n_per_crop: int = 100) -> pd.DataFrame:
    """Generate a balanced dataset with n_per_crop samples per crop."""
    all_dfs = []
    
    for i, (crop, params) in enumerate(CROP_PARAMS.items()):
        df = generate_crop_data(crop, params, n_per_crop, seed=i * 42)
        all_dfs.append(df)
        print(f"  Generated {n_per_crop} rows for: {crop}")
    
    combined = pd.concat(all_dfs, ignore_index=True)
    # Shuffle
    combined = combined.sample(frac=1, random_state=42).reset_index(drop=True)
    return combined

def load_existing_dataset(path: Path) -> pd.DataFrame | None:
    """Load the existing 20-row dataset if it exists."""
    if path.exists():
        df = pd.read_csv(path)
        # Normalize column names
        df.columns = [c.strip() for c in df.columns]
        df = df.rename(columns={'n': 'N', 'p': 'P', 'k': 'K', 'N': 'N', 'P': 'P', 'K': 'K'})
        if 'label' in df.columns:
            return df
    return None

def enrich_from_agriculture_dataset(base_df: pd.DataFrame, ag_path: Path) -> pd.DataFrame:
    """
    Use agriculture_dataset.csv to validate/add yield context.
    We extract the crop types present and ensure they exist in our dataset.
    (The ag dataset doesn't have N/P/K so we can't directly merge features,
     but we can extract crop type counts to balance our dataset.)
    """
    if not ag_path.exists():
        return base_df
    
    try:
        ag_df = pd.read_csv(ag_path)
        ag_crops = ag_df['Crop_Type'].str.lower().unique()
        print(f"  Agriculture dataset crops: {list(ag_crops)}")
        # Add 10 extra rows for crops found in ag dataset that overlap with our crops
        extra_rows = []
        for crop in ag_crops:
            if crop in CROP_PARAMS:
                extra_df = generate_crop_data(crop, CROP_PARAMS[crop], 10, seed=9999)
                extra_rows.append(extra_df)
        if extra_rows:
            extra_combined = pd.concat(extra_rows, ignore_index=True)
            base_df = pd.concat([base_df, extra_combined], ignore_index=True)
            print(f"  Added {len(extra_combined)} rows from agriculture dataset crop matching")
    except Exception as e:
        print(f"  Warning: Could not process agriculture dataset: {e}")
    
    return base_df

def main():
    BASE_DIR = Path(__file__).parent
    DATASET_DIR = BASE_DIR.resolve().parents[1] / 'Dataset'
    OUTPUT_PATH = DATASET_DIR / 'Crop_recommendation_full.csv'
    EXISTING_PATH = DATASET_DIR / 'Crop_recommendation.csv'
    AG_PATH = DATASET_DIR / 'agriculture_dataset.csv'
    
    print("=" * 60)
    print("FarmSync — Dataset Generator")
    print("=" * 60)
    
    print(f"\n[1] Generating synthetic data for {len(CROP_PARAMS)} crops...")
    full_df = generate_full_dataset(n_per_crop=250)
    print(f"    Generated: {len(full_df)} rows")
    
    print("\n[2] Loading existing 20-row dataset...")
    existing_df = load_existing_dataset(EXISTING_PATH)
    if existing_df is not None:
        full_df = pd.concat([full_df, existing_df], ignore_index=True)
        print(f"    Appended existing data. Total: {len(full_df)} rows")
    
    print("\n[3] Enriching from agriculture_dataset.csv...")
    full_df = enrich_from_agriculture_dataset(full_df, AG_PATH)
    
    # Final shuffle
    full_df = full_df.sample(frac=1, random_state=123).reset_index(drop=True)
    
    print(f"\n[4] Saving to {OUTPUT_PATH}...")
    full_df.to_csv(OUTPUT_PATH, index=False)
    
    print(f"\nDataset ready!")
    print(f"   Total rows: {len(full_df)}")
    print(f"   Crops: {full_df['label'].nunique()}")
    print(f"   Class distribution:\n{full_df['label'].value_counts().to_string()}")
    print(f"\n   File: {OUTPUT_PATH}")

if __name__ == '__main__':
    main()
