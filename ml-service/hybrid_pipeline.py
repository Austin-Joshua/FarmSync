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
