"""
Crop Recommendation Prediction Script
Uses the trained model to predict crop recommendations
"""

import sys
import json
import joblib
import numpy as np
from pathlib import Path

# Set paths
BASE_DIR = Path(__file__).parent
MODEL_PATH = BASE_DIR / 'crop_recommendation_model.pkl'
MODEL_INFO_PATH = BASE_DIR / 'model_info.json'

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

def predict(input_data):
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
        features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        X = np.array([[input_data[feat] for feat in features]])
        
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
            'model_accuracy': model_info['accuracy_percent'] if model_info else None
        }
        
        return result
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Prediction error: {str(e)}'
        }

def main():
    """Main prediction function"""
    try:
        # Read input from stdin
        input_json = sys.stdin.read()
        input_data = json.loads(input_json)
        
        # Validate input
        required_fields = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        missing_fields = [field for field in required_fields if field not in input_data]
        
        if missing_fields:
            result = {
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }
        else:
            # Make prediction
            result = predict(input_data)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except json.JSONDecodeError:
        result = {
            'success': False,
            'error': 'Invalid JSON input'
        }
        print(json.dumps(result))
    except Exception as e:
        result = {
            'success': False,
            'error': f'Error: {str(e)}'
        }
        print(json.dumps(result))

if __name__ == '__main__':
    main()
