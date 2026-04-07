"""
Crop Recommendation Prediction Script (FarmSync Consolidator)
============================================================
Adapted from original script as an importable module for FastAPI.
"""

import sys
import json
import joblib
import numpy as np
from pathlib import Path
from typing import Dict, Any

# Set paths
BASE_DIR = Path(__file__).parent
MODEL_PATH = BASE_DIR / 'models' / 'crop_recommendation_model.pkl'
MODEL_INFO_PATH = BASE_DIR / 'models' / 'model_info.json'

FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']

def load_model():
    """Load the trained model"""
    if not MODEL_PATH.exists():
        return None, None
    
    model = joblib.load(MODEL_PATH)
    
    # Load model info if available
    model_info = None
    if MODEL_INFO_PATH.exists():
        with open(MODEL_INFO_PATH, 'r') as f:
            model_info = json.load(f)
    
    return model, model_info

def predict(input_data: Dict[str, float]) -> Dict[str, Any]:
    """Make prediction using the trained model"""
    try:
        # Load model
        model, model_info = load_model()
        
        if model is None:
            return {
                'success': False,
                'error': 'Model not found. Please train the model first.'
            }
        
        # Extract features in correct order
        X = np.array([[input_data[feat] for feat in FEATURES]])
        
        # Make prediction
        prediction = model.predict(X)[0]
        probabilities = model.predict_proba(X)[0]
        
        # Get confidence (probability of predicted class)
        class_idx = list(model.classes_).index(prediction)
        confidence = probabilities[class_idx]
        
        # Get top 3 recommendations
        top_indices = np.argsort(probabilities)[::-1][:3]
        recommendations = []
        
        for idx in top_indices:
            crop = model.classes_[idx]
            prob = probabilities[idx]
            recommendations.append({
                'crop': str(crop),
                'confidence': float(prob),
                'confidence_percent': float(prob * 100)
            })
        
        result = {
            'success': True,
            'recommended_crop': str(prediction),
            'confidence': float(confidence),
            'confidence_percent': float(confidence * 100),
            'recommendations': recommendations,
            'model_accuracy': model_info.get('accuracy_percent', None) if model_info else None
        }
        
        return result
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Prediction error: {str(e)}'
        }

if __name__ == '__main__':
    # Simple CLI test
    test_input = {
        'N': 50, 'P': 40, 'K': 40,
        'temperature': 25, 'humidity': 80,
        'ph': 6.5, 'rainfall': 200
    }
    print(json.dumps(predict(test_input), indent=2))
