import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os
from pathlib import Path

def train_pest_model():
    dataset_path = Path(__file__).resolve().parent / "datasets" / 'pest_data.csv'
    model_dir = Path(__file__).parent / 'models'
    model_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Loading data from {dataset_path}...")
    df = pd.read_csv(dataset_path)
    
    # Encode categorical Crop feature
    le = LabelEncoder()
    df['Crop_Encoded'] = le.fit_transform(df['Crop'])
    joblib.dump(le, model_dir / 'pest_label_encoder.pkl')
    
    X = df[['Temperature', 'Humidity', 'Rainfall', 'Crop_Encoded']]
    y = df['Pest_Risk'] # Low, Medium, High
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)
    
    print("Training Pest Prediction Random Forest model...")
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    
    accuracy = rf.score(X_test, y_test)
    print(f"Model Accuracy on Test Set: {accuracy * 100:.2f}%")
    
    model_path = model_dir / 'pest_model.pkl'
    joblib.dump(rf, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_pest_model()
