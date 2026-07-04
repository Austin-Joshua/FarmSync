import pandas as pd
import numpy as np
import os
from pathlib import Path

# Set a seed for reproducibility
np.random.seed(42)

# Generate 500 rows of synthetic data
num_samples = 500

# Features
temperatures = np.random.normal(loc=28.0, scale=5.0, size=num_samples) # 23-33C roughly
humidity = np.random.normal(loc=65.0, scale=15.0, size=num_samples) # 50-80% roughly
rainfall = np.random.exponential(scale=20.0, size=num_samples) # mm

# Categorical Crop Types
crop_types = ['Wheat', 'Rice', 'Corn', 'Cotton', 'Sugarcane']
crops = np.random.choice(crop_types, size=num_samples)

# Rule-based generation of labels to ensure the model has something to learn
labels = []
for i in range(num_samples):
    risk_score = 0
    # High humidity and high temp often breeds pests
    if temperatures[i] > 30 and humidity[i] > 75:
        risk_score += 2
    elif temperatures[i] > 25 and humidity[i] > 60:
        risk_score += 1
        
    # Certain crops might be more vulnerable in this dummy dataset (e.g. Cotton)
    if crops[i] == 'Cotton':
        risk_score += 1
        
    # Translate score to label
    if risk_score >= 2:
        labels.append('High')
    elif risk_score == 1:
        labels.append('Medium')
    else:
        labels.append('Low')

df = pd.DataFrame({
    'Temperature': temperatures,
    'Humidity': humidity,
    'Rainfall': rainfall,
    'Crop': crops,
    'Pest_Risk': labels
})

# Save to Dataset folder
dataset_path = Path(__file__).resolve().parent / 'Dataset' / 'pest_data.csv'
dataset_path.parent.mkdir(parents=True, exist_ok=True)
df.to_csv(dataset_path, index=False)
print(f"Generated {num_samples} rows of pest data at {dataset_path}")
