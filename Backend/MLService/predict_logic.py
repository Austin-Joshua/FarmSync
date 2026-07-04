"""
FarmSync — Prediction Logic Module
====================================
Importable module for FastAPI endpoints.
Handles crop recommendation and yield prediction.
"""

import numpy as np
import json
import joblib
from pathlib import Path
from typing import Dict, Any, List

BASE_DIR = Path(__file__).parent
MODEL_PATH = BASE_DIR / 'models' / 'crop_recommendation_model.pkl'
MODEL_INFO_PATH = BASE_DIR / 'models' / 'model_info.json'
YIELD_MODEL_PATH = BASE_DIR / 'models' / 'yield_model.pkl'
YIELD_INFO_PATH = BASE_DIR / 'models' / 'yield_info.json'
YDISEASE_MODEL_PATH = BASE_DIR / "models" / "disease_model.h5"
DISEASE_CLASSES_PATH = BASE_DIR / "models" / "disease_classes.json"

PEST_MODEL_PATH = BASE_DIR / "models" / "pest_model.pkl"
PEST_LE_PATH = BASE_DIR / "models" / "pest_label_encoder.pkl"

FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']

# Agronomic advice per crop
CROP_ADVICE = {
    "rice": "Best suited for Kharif season. Requires flooded or well-irrigated fields. Use SRI method for 20-30% water savings.",
    "wheat": "Plant in Rabi season (Oct-Dec). Requires cool temperatures at sowing. Apply 2-3 irrigations at crown root initiation stage.",
    "maize": "Grows in both Kharif and Rabi. Needs good drainage. High yielder — plant at 60×20 cm spacing.",
    "chickpea": "Ideal Rabi legume. Fixes atmospheric nitrogen — reduces fertilizer need. Avoid waterlogging.",
    "kidneybeans": "Plant in early Kharif. Needs moderate rainfall. Good rotation crop after cereal crops.",
    "pigeonpeas": "Long-duration Kharif crop. Highly drought tolerant. Excellent for drylands.",
    "mothbeans": "Extremely drought resistant. Best for Rajasthan/arid regions. Very low water requirement.",
    "mungbean": "Short-duration Kharif crop (60-70 days). Can be grown as catch crop. High protein content.",
    "blackgram": "Kharif season. Grows well in heavy soils. High market demand for dal production.",
    "lentil": "Rabi crop. Cool season legume. Short duration — good for crop rotation.",
    "pomegranate": "Perennial fruit. Drought tolerant once established. High value crop for dryland farming.",
    "banana": "Tropical crop. Year-round cultivation possible. Requires heavy irrigation and potassium.",
    "mango": "Perennial orchard crop. Low maintenance once mature. Best in deep, well-drained soils.",
    "grapes": "High value horticultural crop. Needs trellis system. Best in Maharashtra/Telangana regions.",
    "watermelon": "Summer crop. Needs sandy loam soil. Short duration — 70-90 days to harvest.",
    "muskmelon": "Similar to watermelon. Hot and dry climate preferred. High water requirement.",
    "apple": "Cool climate crop. Best in Himachal Pradesh/Jammu. Requires cold winters for flowering.",
    "orange": "Perennial citrus. Best in Maharashtra, Andhra, Punjab. Requires 80+ cm annual rainfall.",
    "papaya": "Fast growing. First harvest in 10-12 months. High export demand.",
    "coconut": "Perennial tree crop. Best in coastal areas. Very high potassium requirement.",
    "cotton": "Kharif cash crop. Bt cotton varieties recommended. Needs 60-100 cm rainfall.",
    "sugarcane": "Plant-crop 12 months, ratoon up to 2 years. Very heavy feeder — needs split fertilizer applications.",
    "coffee": "Shade-loving perennial. Best in Coorg, Chikkamagaluru. High quality bean varieties preferred.",
    "jute": "Kharif fiber crop. Best in West Bengal delta. Needs waterlogged conditions.",
}

# ─────────────────────────────────────────────────────────────
# Crop Recommendation
# ─────────────────────────────────────────────────────────────

_CROP_MODEL = None
_CROP_MODEL_INFO = None

def load_model():
    """Load the crop recommendation model (Singleton)."""
    global _CROP_MODEL, _CROP_MODEL_INFO
    if _CROP_MODEL is not None:
        return _CROP_MODEL, _CROP_MODEL_INFO

    if not MODEL_PATH.exists():
        return None, None

    _CROP_MODEL = joblib.load(MODEL_PATH)
    if MODEL_INFO_PATH.exists():
        with open(MODEL_INFO_PATH) as f:
            _CROP_MODEL_INFO = json.load(f)
    return _CROP_MODEL, _CROP_MODEL_INFO


def predict(input_data: Dict[str, float]) -> Dict[str, Any]:
    """Make crop recommendation prediction."""
    try:
        model, model_info = load_model()

        if model is None:
            return {
                'success': False,
                'error': 'Model not found. Please run train_model.py first.'
            }

        # Validate features
        missing = [f for f in FEATURES if f not in input_data]
        if missing:
            return {'success': False, 'error': f'Missing features: {missing}'}

        X = np.array([[input_data[f] for f in FEATURES]])
        prediction = model.predict(X)[0]
        probabilities = model.predict_proba(X)[0]

        class_idx = list(model.classes_).index(prediction)
        confidence = float(probabilities[class_idx])

        # Top 3 recommendations
        top_indices = np.argsort(probabilities)[::-1][:3]
        recommendations: List[Dict] = []
        for idx in top_indices:
            crop = str(model.classes_[idx])
            prob = float(probabilities[idx])
            recommendations.append({
                'crop': crop,
                'confidence': prob,
                'confidence_percent': round(prob * 100, 1),
                'advice': CROP_ADVICE.get(crop, 'Consult your local Krishi Vigyan Kendra for specific advice.')
            })

        return {
            'success': True,
            'recommended_crop': str(prediction),
            'confidence': confidence,
            'confidence_percent': round(confidence * 100, 1),
            'recommendations': recommendations,
            'advice': CROP_ADVICE.get(str(prediction), ''),
            'model_accuracy': model_info.get('accuracy_percent') if model_info else None,
            'cv_accuracy': model_info.get('cv_accuracy') if model_info else None,
        }

    except Exception as e:
        return {'success': False, 'error': f'Prediction error: {str(e)}'}


# ─────────────────────────────────────────────────────────────
# Yield Prediction (Regression)
# ─────────────────────────────────────────────────────────────

_YIELD_MODEL = None
_YIELD_INFO = None

def load_yield_model():
    """Load the yield prediction model (Singleton)."""
    global _YIELD_MODEL, _YIELD_INFO
    if _YIELD_MODEL is not None:
        return _YIELD_MODEL, _YIELD_INFO

    if not YIELD_MODEL_PATH.exists():
        return None, None
    _YIELD_MODEL = joblib.load(YIELD_MODEL_PATH)
    if YIELD_INFO_PATH.exists():
        with open(YIELD_INFO_PATH) as f:
            _YIELD_INFO = json.load(f)
    return _YIELD_MODEL, _YIELD_INFO


def predict_yield(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Predict crop yield (tons) using farm-level agricultural data.
    Inputs: crop, area, irrigation, fertilizer, pesticide, soil, season, water
    """
    try:
        model, info = load_yield_model()
        if model is None:
            return {'success': False, 'error': 'Yield model not trained yet.'}

        features = info.get('features', [])
        encoders = info.get('encoders', {})

        # Build feature row with fallbacks for missing features
        fallbacks = {
            'irrigation': 'manual',
            'soil': 'loamy',
            'fertilizer': 0.5,
            'pesticide': 10.0,
            'water': 1000.0,
            'area': 5.0,
            'crop': 'rice',
            'season': 'kharif'
        }
        row = []
        for feat in features:
            val = input_data.get(feat)
            if val is None:
                val = fallbacks.get(feat, 0.0)
            if feat in encoders:
                enc = encoders[feat]
                # Normalize to lowercase string to match encoder keys
                val_key = str(val).strip().lower()
                if val_key not in enc:
                    # Fallback to first key in encoder if unknown
                    val_key = list(enc.keys())[0]
                val = enc[val_key]
            row.append(float(val))

        X = np.array([row])
        predicted_yield = float(model.predict(X)[0])
        predicted_yield = max(0.0, predicted_yield)  # Clamp to non-negative

        return {
            'success': True,
            'predicted_yield_tons_per_hectare': round(predicted_yield / float(input_data.get('area', 1)), 2),
            'predicted_total_production_tons': round(predicted_yield, 2),
            'unit': 'tons',
            'model_r2': info.get('r2_score') if info else None
        }

    except Exception as e:
        return {'success': False, 'error': f'Yield prediction error: {str(e)}'}


_PEST_MODEL = None
_PEST_LE = None

def load_pest_model():
    """Load the pest prediction model (Singleton)."""
    global _PEST_MODEL, _PEST_LE
    if _PEST_MODEL is not None:
        return _PEST_MODEL, _PEST_LE

    if not PEST_MODEL_PATH.exists() or not PEST_LE_PATH.exists():
        return None, None
    _PEST_MODEL = joblib.load(PEST_MODEL_PATH)
    _PEST_LE = joblib.load(PEST_LE_PATH)
    return _PEST_MODEL, _PEST_LE

def predict_pest(input_data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        model, le = load_pest_model()
        if model is None:
            return {'success': False, 'error': 'Pest model not trained yet.'}
            
        temperature = float(input_data.get('temperature', 28.0))
        humidity = float(input_data.get('humidity', 65.0))
        rainfall = float(input_data.get('rainfall', 20.0))
        crop = str(input_data.get('crop', 'Wheat'))
        
        try:
            crop_encoded = le.transform([crop])[0]
        except ValueError:
            crop_encoded = 0
            
        import pandas as pd
        df = pd.DataFrame([[temperature, humidity, rainfall, crop_encoded]], 
                          columns=['Temperature', 'Humidity', 'Rainfall', 'Crop_Encoded'])
        
        prediction = model.predict(df)[0]
        
        return {
            'success': True,
            'pest_risk': prediction
        }
    except Exception as e:
        return {'success': False, 'error': f'Pest prediction error: {str(e)}'}

# ─────────────────────────────────────────────────────────────
# CLI Test
# ─────────────────────────────────────────────────────────────

if __name__ == '__main__':
    import json as _json

    test_input = {'N': 90, 'P': 42, 'K': 43, 'temperature': 20.9,
                  'humidity': 82.0, 'ph': 6.5, 'rainfall': 202.9}

    print("Test: Crop Recommendation")
    result = predict(test_input)
    print(_json.dumps(result, indent=2))
