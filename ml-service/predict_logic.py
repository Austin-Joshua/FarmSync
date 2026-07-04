"""
FarmSync — Prediction Logic Module
====================================
Importable module for FastAPI endpoints.
Handles crop recommendation and yield prediction.
"""

import numpy as np
import json
import joblib
import time
from pathlib import Path
from typing import Dict, Any, List

try:
    from quantum_engine import QuantumDecisionEngine
    _QUANTUM_ENGINE = QuantumDecisionEngine()
except ImportError:
    _QUANTUM_ENGINE = None

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
    """Make crop recommendation prediction (Hybrid Classical + Quantum VQC) with telemetry."""
    try:
        t_start = time.perf_counter()
        
        # 1. Validation Stage
        from hybrid_pipeline import DataValidator, FeatureEngineer, ClassicalPredictor, QuantumPredictor, ConfidenceEstimator, DecisionFusion, ExplainabilityLayer
        
        is_valid, msg = DataValidator.validate_crop_input(input_data)
        if not is_valid:
            return {'success': False, 'error': msg}
            
        model, model_info = load_model()
        if model is None:
            return {
                'success': False,
                'error': 'Model not found. Please run train_model.py first.'
            }
            
        # 2. Feature Engineering Stage
        X_classical = FeatureEngineer.normalize_for_classical(input_data, FEATURES)
        
        # Check if quantum engine is available for normalizing stats
        norm_stats = {}
        if _QUANTUM_ENGINE and getattr(_QUANTUM_ENGINE, 'norm_stats', None) is not None:
            norm_stats = _QUANTUM_ENGINE.norm_stats
        elif _QUANTUM_ENGINE and getattr(_QUANTUM_ENGINE, 'vqc_ensemble_loaded', False) and getattr(_QUANTUM_ENGINE, 'vqc_ensemble_stats', None) is not None:
            norm_stats = _QUANTUM_ENGINE.vqc_ensemble_stats
            
        q_angles = FeatureEngineer.encode_quantum_angles(input_data, norm_stats)
        
        # 3. Classical ML Prediction (Calibrated)
        t_classical_start = time.perf_counter()
        prediction = model.predict(X_classical)[0]
        # Platt scaled probabilities
        classical_predictor = ClassicalPredictor(model)
        classical_probs = classical_predictor.predict_calibrated_proba(X_classical)
        t_classical = time.perf_counter() - t_classical_start
        
        # 4. Quantum ML Prediction Stage
        quantum_active = False
        t_quantum_start = time.perf_counter()
        t_quantum = 0.0
        
        if _QUANTUM_ENGINE is not None:
            try:
                quantum_predictor = QuantumPredictor(_QUANTUM_ENGINE)
                q_probs = quantum_predictor.predict_vqc_proba(q_angles, list(model.classes_))
                quantum_active = True
                t_quantum = time.perf_counter() - t_quantum_start
            except Exception as q_err:
                print(f"Quantum VQC prediction failed: {q_err}")
                q_probs = classical_probs.copy() # fallback
        else:
            q_probs = classical_probs.copy() # fallback
            
        # 5. Confidence Estimation Stage
        conf_estimator = ConfidenceEstimator()
        classical_conf = conf_estimator.calculate_confidence(classical_probs)
        quantum_conf = conf_estimator.calculate_confidence(q_probs)
        
        # 6. Hybrid Decision Fusion Stage (Compare and Select)
        p_avg = DecisionFusion.weighted_average(classical_probs, q_probs, alpha=0.7)
        p_conf = DecisionFusion.confidence_fusion(classical_probs, q_probs, classical_conf, quantum_conf)
        p_bayes = DecisionFusion.bayesian_fusion(classical_probs, q_probs)
        p_stack = DecisionFusion.meta_learner_stack(classical_probs, q_probs)
        
        strategies = {
            "weighted_average": p_avg,
            "confidence_fusion": p_conf,
            "bayesian_fusion": p_bayes,
            "meta_learner_stack": p_stack
        }
        
        chosen_strategy = "confidence_fusion"
        hybrid_probs = strategies[chosen_strategy]
        
        # Top 3 recommendations based on chosen hybrid probabilities
        top_indices = np.argsort(hybrid_probs)[::-1][:3]
        recommendations: List[Dict] = []
        for idx in top_indices:
            crop = str(model.classes_[idx])
            prob = float(hybrid_probs[idx])
            recommendations.append({
                'crop': crop,
                'confidence': prob,
                'confidence_percent': round(prob * 100, 1),
                'advice': CROP_ADVICE.get(crop, 'Consult your local Krishi Vigyan Kendra for specific advice.')
            })
            
        # Final recommendation
        best_crop_idx = top_indices[0]
        best_crop = str(model.classes_[best_crop_idx])
        best_confidence = float(hybrid_probs[best_crop_idx])
        
        # 7. Explainability Layer
        explain_layer = ExplainabilityLayer()
        explain_payload = explain_layer.calculate_explainability(
            input_data, model, best_crop, classical_probs, q_probs, list(model.classes_)
        )
        
        t_total = time.perf_counter() - t_start
        
        return {
            'success': True,
            'recommended_crop': best_crop,
            'confidence': best_confidence,
            'confidence_percent': round(best_confidence * 100, 1),
            'recommendations': recommendations,
            'advice': CROP_ADVICE.get(best_crop, ''),
            'model_accuracy': model_info.get('accuracy_percent') if model_info else None,
            'cv_accuracy': model_info.get('cv_accuracy') if model_info else None,
            'quantum_active': quantum_active,
            'vqc_is_trained': getattr(_QUANTUM_ENGINE, 'vqc_ensemble_loaded', False) or getattr(_QUANTUM_ENGINE, 'vqc_is_trained', False),
            'vqc_param_source': 'multiclass_ensemble' if getattr(_QUANTUM_ENGINE, 'vqc_ensemble_loaded', False) else ('cobyla_trained' if getattr(_QUANTUM_ENGINE, 'vqc_is_trained', False) else 'fixed_default'),
            'quantum_vqc_probabilities': q_probs.tolist(),
            'classical_probabilities': classical_probs.tolist(),
            'classical_confidence_percent': round(classical_conf * 100, 1),
            'quantum_confidence_percent': round(quantum_conf * 100, 1),
            'fusion_strategy': chosen_strategy,
            'explainability': explain_payload,
            'telemetry': {
                'classical_latency_ms': round(t_classical * 1000, 2),
                'quantum_latency_ms': round(t_quantum * 1000, 2),
                'total_latency_ms': round(t_total * 1000, 2)
            }
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
    Predict crop yield (tons) using farm-level agricultural data (with QAOA and telemetry).
    Inputs: crop, area, irrigation, fertilizer, pesticide, soil, season, water
    """
    try:
        t_start = time.perf_counter()
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
        t_classical = time.perf_counter() - t_start

        # Integrate Quantum QAOA Resource Optimization
        quantum_optimized = {}
        t_quantum_start = time.perf_counter()
        t_quantum = 0.0
        if _QUANTUM_ENGINE is not None:
            try:
                # Ensure input resource values are provided or get fallbacks
                qaoa_input = {
                    'fertilizer': float(input_data.get('fertilizer', fallbacks['fertilizer'])),
                    'water': float(input_data.get('water', fallbacks['water'])),
                    'pesticide': float(input_data.get('pesticide', fallbacks['pesticide']))
                }
                qaoa_res = _QUANTUM_ENGINE.optimize_resources_qaoa(predicted_yield, qaoa_input)
                quantum_optimized = qaoa_res
                t_quantum = time.perf_counter() - t_quantum_start
            except Exception as q_err:
                print(f"Quantum QAOA optimization error: {q_err}")

        t_total = time.perf_counter() - t_start

        return {
            'success': True,
            'predicted_yield_tons_per_hectare': round(predicted_yield / float(input_data.get('area', 1.0)), 2) if float(input_data.get('area', 1.0)) > 0 else 0.0,
            'predicted_total_production_tons': round(predicted_yield, 2),
            'predicted_yield': round(predicted_yield, 2),
            'unit': 'tons',
            'model_r2': info.get('r2_score') if info else None,
            'quantum_resource_optimization': quantum_optimized,
            'telemetry': {
                'classical_latency_ms': round(t_classical * 1000, 2),
                'quantum_latency_ms': round(t_quantum * 1000, 2),
                'total_latency_ms': round(t_total * 1000, 2)
            }
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
        
        advisory_map = {
            'High': 'High danger of fungal blast and aphid infestation. Spray organic neem seed emulsion dilution.',
            'Medium': 'Moderate threat of stem borer. Ensure appropriate drainage channels are cleared.',
            'Low': 'No active pest threats detected. Maintain standard monitoring checks.'
        }
        
        return {
            'success': True,
            'pest_risk': prediction,
            'predicted_pest': f"{prediction} Threat Detected" if prediction != 'Low' else 'No Active Pest Threats',
            'risk_level': prediction,
            'confidence': 0.95, # high confidence threshold representation
            'recommendation': advisory_map.get(prediction, 'Maintain standard monitoring checks.')
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
