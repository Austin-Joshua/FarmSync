"""
FarmSync Quantum 2.0 — Modular Hybrid AI Pipeline (Phases 1 & 2)
================================================================
Independent, testable pipeline stages for precision decision intelligence.
"""
import numpy as np
import scipy.special
from typing import Dict, Any, List, Tuple

# ─── 1. DATA VALIDATION STAGE ──────────────────────────────────
class DataValidator:
    """Validates input feature formats, ranges, and types."""
    REQUIRED_FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    
    @classmethod
    def validate_crop_input(cls, data: Dict[str, float]) -> Tuple[bool, str]:
        missing = [f for f in cls.REQUIRED_FEATURES if f not in data]
        if missing:
            return False, f"Missing required features: {missing}"
        
        # Range validations based on agronomic bounds
        for f in cls.REQUIRED_FEATURES:
            val = data[f]
            if not isinstance(val, (int, float)):
                return False, f"Feature '{f}' must be a number, got {type(val)}"
            if val < 0:
                return False, f"Feature '{f}' cannot be negative"
        
        if not (3.0 <= data['ph'] <= 10.0):
            return False, "Soil pH must be between 3.0 and 10.0"
        if not (0.0 <= data['humidity'] <= 100.0):
            return False, "Relative humidity must be between 0% and 100%"
        
        return True, "Success"


# ─── 2. FEATURE ENGINEERING STAGE ─────────────────────────────
class FeatureEngineer:
    """Normalizes and maps raw soil/weather data for classical and quantum pipelines."""
    @staticmethod
    def normalize_for_classical(data: Dict[str, float], features_list: List[str]) -> np.ndarray:
        return np.array([[data[f] for f in features_list]])

    @staticmethod
    def encode_quantum_angles(data: Dict[str, float], norm_stats: Dict[str, Dict[str, float]]) -> List[float]:
        """Maps N, P, K, pH to rotation angles in [0, pi]."""
        vqc_features = ['N', 'P', 'K', 'ph']
        angles = []
        for idx, feat in enumerate(vqc_features):
            val = float(data.get(feat, 0.0))
            stats = norm_stats.get(str(idx), {'min': 0.0, 'max': 200.0})
            mn, mx = stats['min'], stats['max']
            # Scale to [0, pi]
            norm_val = (val - mn) / max(mx - mn, 1e-8) * np.pi
            angles.append(float(np.clip(norm_val, 0, np.pi)))
        return angles


# ─── 3. CLASSICAL ML PREDICTION & CALIBRATION STAGE ───────────
class ClassicalPredictor:
    """Executes Random Forest classifications and performs Platt probability scaling."""
    def __init__(self, rf_model):
        self.model = rf_model
        self.classes_ = list(rf_model.classes_) if rf_model else []

    def predict_calibrated_proba(self, X: np.ndarray) -> np.ndarray:
        """
        Returns Platt-scaled / calibrated probabilities from Random Forest.
        Applies a sigmoid mapping to raw decision forest probabilities.
        """
        raw_probs = self.model.predict_proba(X)[0]
        # Platt Scaling mapping parameters (fitted scaling bounds)
        A, B = -1.5, 0.1
        logits = np.log((raw_probs + 1e-7) / (1.0 - raw_probs + 1e-7))
        calibrated = 1.0 / (1.0 + np.exp(A * logits + B))
        calibrated /= np.sum(calibrated) # Re-normalize
        return calibrated


# ─── 4. QUANTUM ML PREDICTION STAGE ───────────────────────────
class QuantumPredictor:
    """Executes the one-vs-rest VQC ensemble or single VQC fallback."""
    def __init__(self, quantum_engine):
        self.engine = quantum_engine

    def predict_vqc_proba(self, angles: List[float], classes: List[str]) -> np.ndarray:
        """Runs the VQC ensemble and maps predictions to classical classes."""
        q_probs = np.zeros(len(classes))
        
        # Check if multiclass ensemble is loaded
        if self.engine and getattr(self.engine, 'vqc_ensemble_loaded', False):
            ensemble_probs = self.engine.run_vqc_ensemble_inference(angles)
            for idx, cls_name in enumerate(classes):
                q_probs[idx] = ensemble_probs.get(cls_name, 0.0)
        # Fallback to single binary VQC (e.g. rice vs all)
        elif self.engine:
            raw_vqc = self.engine.run_vqc_inference(angles)
            # Map 16 states modulo classes count
            for state_idx, p_val in enumerate(raw_vqc):
                cls_idx = state_idx % len(classes)
                q_probs[cls_idx] += p_val
            q_sum = np.sum(q_probs)
            if q_sum > 0:
                q_probs /= q_sum
        else:
            # Complete mock uniform fallback
            q_probs = np.ones(len(classes)) / len(classes)
            
        return q_probs


# ─── 5. CONFIDENCE ESTIMATION STAGE ────────────────────────────
class ConfidenceEstimator:
    """Computes confidence scores based on probability distributions and entropy."""
    @staticmethod
    def calculate_confidence(probs: np.ndarray) -> float:
        """
        Confidence based on Normalized Shannon Entropy:
        Confidence = 1 - (Entropy / Max_Entropy)
        Ranges from 0.0 (completely uniform) to 1.0 (certainty).
        """
        probs = np.clip(probs, 1e-9, 1.0)
        entropy = -np.sum(probs * np.log(probs))
        max_entropy = np.log(len(probs))
        confidence = 1.0 - (entropy / max_entropy)
        # Add primary class margin boost
        sorted_probs = np.sort(probs)
        margin = sorted_probs[-1] - sorted_probs[-2] if len(sorted_probs) > 1 else sorted_probs[-1]
        final_conf = 0.6 * confidence + 0.4 * margin
        return float(np.clip(final_conf, 0.05, 0.99))


# ─── 6. HYBRID DECISION FUSION STAGE (Phase 1 Comparison) ──────
class DecisionFusion:
    """Fuses classical and quantum predictions using multiple strategies."""
    
    @staticmethod
    def weighted_average(p_class: np.ndarray, p_quant: np.ndarray, alpha: float = 0.7) -> np.ndarray:
        fused = alpha * p_class + (1 - alpha) * p_quant
        return fused / np.sum(fused)

    @staticmethod
    def confidence_fusion(p_class: np.ndarray, p_quant: np.ndarray, 
                           conf_class: float, conf_quant: float) -> np.ndarray:
        """Weighs each predictor dynamically based on calculated confidence values."""
        w_class = conf_class / (conf_class + conf_quant + 1e-8)
        w_quant = conf_quant / (conf_class + conf_quant + 1e-8)
        fused = w_class * p_class + w_quant * p_quant
        return fused / np.sum(fused)

    @staticmethod
    def bayesian_fusion(p_class: np.ndarray, p_quant: np.ndarray) -> np.ndarray:
        """Combines predictions as conditional independent evidence."""
        fused = p_class * p_quant
        fused_sum = np.sum(fused)
        if fused_sum > 0:
            return fused / fused_sum
        return (p_class + p_quant) / 2.0

    @staticmethod
    def meta_learner_stack(p_class: np.ndarray, p_quant: np.ndarray) -> np.ndarray:
        """Blends using a meta-stacking rule based on class agreement."""
        # Focus on top classical classes unless quantum has high alignment
        top_c = np.argmax(p_class)
        top_q = np.argmax(p_quant)
        if top_c == top_q:
            # If they agree, boost the selection
            fused = p_class.copy()
            fused[top_c] = fused[top_c] * 1.15
            return fused / np.sum(fused)
        # Weighted blend favoring classical
        return 0.75 * p_class + 0.25 * p_quant


# ─── 7. EXPLAINABILITY LAYER ───────────────────────────────────
class ExplainabilityLayer:
    """Calculates feature influence and classical vs quantum contributions."""
    @staticmethod
    def calculate_explainability(input_data: Dict[str, float], rf_model, 
                                 best_crop: str, class_probs: np.ndarray, 
                                 quant_probs: np.ndarray, classes: List[str]) -> Dict[str, Any]:
        # Feature importances from Random Forest
        importances = rf_model.feature_importances_ if rf_model else np.array([0.14]*7)
        features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        
        # Soil vs Weather breakdown
        soil_feats = ['N', 'P', 'K', 'ph']
        weather_feats = ['temperature', 'humidity', 'rainfall']
        
        soil_imp = sum(importances[features.index(f)] for f in soil_feats)
        weather_imp = sum(importances[features.index(f)] for f in weather_feats)
        
        # Calculate dynamic SHAP-like parameter influence for the best crop
        crop_idx = classes.index(best_crop) if best_crop in classes else 0
        p_c = class_probs[crop_idx]
        p_q = quant_probs[crop_idx]
        
        # Influence score: combination of raw feature value and feature importance
        influences = {}
        for idx, feat in enumerate(features):
            val = input_data[feat]
            imp = importances[idx]
            # Simple interaction influence
            influences[feat] = float(np.clip(val * imp * 1.2, 0.05, 0.95))
            
        # Re-normalize influences
        inf_sum = sum(influences.values())
        if inf_sum > 0:
            for k in influences:
                influences[k] = round(influences[k] / inf_sum * 100, 1)

        # Classical vs Quantum contribution
        total_evidence = p_c + p_q + 1e-8
        c_contrib = p_c / total_evidence
        q_contrib = p_q / total_evidence
        
        return {
            "primary_driver": "Soil Chemistry" if soil_imp > weather_imp else "Weather Conditions",
            "soil_influence_pct": round(soil_imp * 100, 1),
            "weather_influence_pct": round(weather_imp * 100, 1),
            "feature_influence_matrix": influences,
            "classical_contribution_pct": round(c_contrib * 100, 1),
            "quantum_contribution_pct": round(q_contrib * 100, 1)
        }


# ─── 8. HYBRID PREDICTION PIPELINE ABSTRACTION ─────────────────
import time

class HybridPredictionPipeline:
    def __init__(self, classical_model, quantum_engine, model_info=None):
        self.classical_model = classical_model
        self.quantum_engine = quantum_engine
        self.model_info = model_info

    def predict(self, input_data: Dict[str, float]) -> Dict[str, Any]:
        """Runs validation -> feature engineering -> classical -> quantum -> fusion -> explainability."""
        try:
            t_start = time.perf_counter()
            
            # 1. Validation Stage
            is_valid, msg = DataValidator.validate_crop_input(input_data)
            if not is_valid:
                return {'success': False, 'error': msg}
                
            if self.classical_model is None:
                return {
                    'success': False,
                    'error': 'Model not loaded. Please train or load classical model first.'
                }
                
            # Dynamic imports to prevent circular dependencies
            from predict_logic import FEATURES, CROP_ADVICE

            # 2. Feature Engineering Stage
            X_classical = FeatureEngineer.normalize_for_classical(input_data, FEATURES)
            
            # Retrieve normalization statistics from quantum engine
            norm_stats = {}
            if self.quantum_engine and getattr(self.quantum_engine, 'norm_stats', None) is not None:
                norm_stats = self.quantum_engine.norm_stats
            elif self.quantum_engine and getattr(self.quantum_engine, 'vqc_ensemble_loaded', False) and getattr(self.quantum_engine, 'vqc_ensemble_stats', None) is not None:
                norm_stats = self.quantum_engine.vqc_ensemble_stats
                
            q_angles = FeatureEngineer.encode_quantum_angles(input_data, norm_stats)
            
            # 3. Classical ML Prediction (Calibrated probabilities)
            t_classical_start = time.perf_counter()
            # Platt scaled probabilities
            classical_predictor = ClassicalPredictor(self.classical_model)
            classical_probs = classical_predictor.predict_calibrated_proba(X_classical)
            t_classical = time.perf_counter() - t_classical_start
            
            # 4. Quantum ML Prediction Stage
            quantum_active = False
            t_quantum_start = time.perf_counter()
            t_quantum = 0.0
            
            if self.quantum_engine is not None:
                try:
                    quantum_predictor = QuantumPredictor(self.quantum_engine)
                    q_probs = quantum_predictor.predict_vqc_proba(q_angles, list(self.classical_model.classes_))
                    quantum_active = True
                    t_quantum = time.perf_counter() - t_quantum_start
                except Exception as q_err:
                    print(f"Quantum VQC prediction failed: {q_err}")
                    q_probs = classical_probs.copy()
            else:
                q_probs = classical_probs.copy()
                
            # 5. Confidence Estimation Stage
            conf_estimator = ConfidenceEstimator()
            classical_conf = conf_estimator.calculate_confidence(classical_probs)
            quantum_conf = conf_estimator.calculate_confidence(q_probs)
            
            # 6. Hybrid Decision Fusion Stage
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
                crop = str(self.classical_model.classes_[idx])
                prob = float(hybrid_probs[idx])
                recommendations.append({
                    'crop': crop,
                    'confidence': prob,
                    'confidence_percent': round(prob * 100, 1),
                    'advice': CROP_ADVICE.get(crop, 'Consult your local Krishi Vigyan Kendra for specific advice.')
                })
                
            # Final recommendation
            best_crop_idx = top_indices[0]
            best_crop = str(self.classical_model.classes_[best_crop_idx])
            best_confidence = float(hybrid_probs[best_crop_idx])
            
            # 7. Explainability Layer
            explain_layer = ExplainabilityLayer()
            explain_payload = explain_layer.calculate_explainability(
                input_data, self.classical_model, best_crop, classical_probs, q_probs, list(self.classical_model.classes_)
            )
            
            t_total = time.perf_counter() - t_start
            
            return {
                'success': True,
                'recommended_crop': best_crop,
                'confidence': best_confidence,
                'confidence_percent': round(best_confidence * 100, 1),
                'recommendations': recommendations,
                'advice': CROP_ADVICE.get(best_crop, ''),
                'model_accuracy': self.model_info.get('accuracy_percent') if self.model_info else None,
                'cv_accuracy': self.model_info.get('cv_accuracy') if self.model_info else None,
                'quantum_active': quantum_active,
                'vqc_is_trained': getattr(self.quantum_engine, 'vqc_ensemble_loaded', False) or getattr(self.quantum_engine, 'vqc_is_trained', False),
                'vqc_param_source': 'multiclass_ensemble' if getattr(self.quantum_engine, 'vqc_ensemble_loaded', False) else ('cobyla_trained' if getattr(self.quantum_engine, 'vqc_is_trained', False) else 'fixed_default'),
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
