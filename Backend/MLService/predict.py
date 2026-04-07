"""
FarmSync — Crop Recommendation Predictor
=========================================
Loads the trained model artifacts and exposes a predict() function
that is called by main.py (FastAPI).

Call train_model.py first to generate the model files in models/.
"""

import os
import json
import pickle
import numpy as np
from typing import Dict, Any

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR    = os.path.join(BASE_DIR, "models")
MODEL_PATH   = os.path.join(MODEL_DIR, "crop_model.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")
SCALER_PATH  = os.path.join(MODEL_DIR, "scaler.pkl")
INFO_PATH    = os.path.join(MODEL_DIR, "model_info.json")

FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]

# ─── Crop care tips ──────────────────────────────────────────────────────────
CROP_TIPS: Dict[str, str] = {
    "rice":        "Requires flooded or waterlogged conditions. Keep soil pH 5.5–7.0. Needs warm temperatures (20–35°C).",
    "maize":       "Needs well-drained fertile soil. Optimal temp 18–32°C. Water regularly but avoid waterlogging.",
    "chickpea":    "Grows best in arid/semi-arid regions. Drought-tolerant. pH 6.0–9.0. Low rainfall needed.",
    "kidneybeans": "Prefers slightly acidic soil. Needs moderate moisture. Good drainage essential.",
    "pigeonpeas":  "Drought-tolerant. Sandy loam soil. pH 5.0–7.0. Fixes nitrogen naturally.",
    "mothbeans":   "Very drought-resistant. Sandy or loamy soil. Grows in hot, dry climates.",
    "mungbean":    "Short growing season. Warm temperatures. Moderate water. pH 6.2–7.2.",
    "blackgram":   "Warm humid climate. Well-drained loam. pH 6.0–7.5. Nitrogen-fixing.",
    "lentil":      "Cool weather crop. Well-drained soil. pH 6.0–8.0. Minimal water needs.",
    "pomegranate": "Semi-arid climate. Deep loamy soil. Drought-tolerant. pH 5.5–7.2.",
    "banana":      "Tropical crop. Sandy loam. High moisture. pH 5.5–7.0. Rich in potassium.",
    "mango":       "Tropical/subtropical. Deep well-drained soil. pH 5.5–7.5. Hot dry weather for flowering.",
    "grapes":      "Well-drained rocky soil. Hot dry summers. pH 6.0–7.0. Low rainfall ideal.",
    "watermelon":  "Sandy loam. Full sun. pH 6.0–7.0. Warm temperatures. Moderate watering.",
    "muskmelon":   "Sandy loam. Well-drained. Warm temps 25–35°C. Low humidity preferred.",
    "apple":       "Well-drained loam. Cool climate. pH 5.5–6.5. Requires chilling hours.",
    "orange":      "Subtropical. Deep well-drained soil. pH 6.0–7.5. Regular watering.",
    "papaya":      "Tropical. Rich well-drained soil. pH 6.0–7.0. Warm humid climate.",
    "coconut":     "Sandy loam coastal areas. High humidity. pH 5.5–7.0.",
    "cotton":      "Black or alluvial soil. pH 5.8–8.0. Warm climate. Drought-tolerant once established.",
    "jute":        "Alluvial/loamy soil. High humidity. pH 4.8–5.8. Requires heavy rainfall.",
    "coffee":      "Forest loam. pH 6.0–6.5. Tropical highland. Shade and rainfall needed.",
}


class CropPredictor:
    """Singleton predictor that loads models once at startup."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._loaded = False
        return cls._instance

    def load(self):
        if self._loaded:
            return
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                "Model not found. Run `python train_model.py` first to train the model."
            )
        with open(MODEL_PATH,   "rb") as f: self.model   = pickle.load(f)
        with open(ENCODER_PATH, "rb") as f: self.encoder = pickle.load(f)
        with open(SCALER_PATH,  "rb") as f: self.scaler  = pickle.load(f)
        with open(INFO_PATH,    "r")  as f: self.info    = json.load(f)
        self._loaded = True
        print(f"[ML] Model loaded — test accuracy: {self.info.get('test_accuracy', '?')}")

    def is_ready(self) -> bool:
        return self._loaded

    def predict(
        self,
        N: float, P: float, K: float,
        temperature: float, humidity: float,
        ph: float, rainfall: float,
        top_n: int = 3
    ) -> Dict[str, Any]:
        """
        Returns top-N crop recommendations with confidence scores and tips.
        """
        self.load()

        features = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
        features_scaled = self.scaler.transform(features)

        # Probability distribution over all crops
        proba = self.model.predict_proba(features_scaled)[0]
        top_indices = np.argsort(proba)[::-1][:top_n]

        recommendations = []
        for idx in top_indices:
            crop_name = self.encoder.classes_[idx]
            confidence = round(float(proba[idx]) * 100, 2)
            recommendations.append({
                "crop":       crop_name,
                "confidence": confidence,
                "tip":        CROP_TIPS.get(crop_name, "Follow standard agricultural practices."),
            })

        best_crop = recommendations[0]["crop"] if recommendations else "unknown"

        return {
            "recommended_crop": best_crop,
            "confidence":       recommendations[0]["confidence"] if recommendations else 0,
            "alternatives":     recommendations[1:],
            "all_recommendations": recommendations,
            "input": {
                "N": N, "P": P, "K": K,
                "temperature": temperature,
                "humidity": humidity,
                "ph": ph,
                "rainfall": rainfall
            },
            "model_accuracy": self.info.get("test_accuracy", None),
        }


# ─── Module-level singleton ───────────────────────────────────────────────────
predictor = CropPredictor()
