from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import time
import os
import io
import joblib
import json
import numpy as np
from PIL import Image
from pathlib import Path

# Import our refined ML predictor
try:
    import predict_logic as predictor
except ImportError:
    predictor = None

app = FastAPI(title="FarmSync ML Intelligence Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Path Configurations ---
BASE_DIR = Path(__file__).parent
DISEASE_MODEL_PATH = BASE_DIR / 'models' / 'disease_model.pkl'
DISEASE_INFO_PATH = BASE_DIR / 'models' / 'disease_info.json'

# --- Load models at startup ---
disease_model = None
disease_info = None
if DISEASE_MODEL_PATH.exists():
    try:
        disease_model = joblib.load(DISEASE_MODEL_PATH)
        if DISEASE_INFO_PATH.exists():
            with open(DISEASE_INFO_PATH) as f:
                disease_info = json.load(f)
    except Exception as e:
        print(f"Error loading disease model: {e}")

# --- Models for Request/Response ---

class CropRecommendationRequest(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class YieldPredictionRequest(BaseModel):
    state: str
    district: str
    season: str
    crop: str
    area: float  # in hectares

class PestPredictionRequest(BaseModel):
    temperature: float
    humidity: float
    rainfall: float
    crop: str

# --- Fallback Disease List ---
DISEASES = [
    {
        "disease": "Leaf Blight",
        "confidence": 0.92,
        "solution": "Apply fungicide containing copper or mancozeb. Improve air circulation and reduce overhead watering."
    },
    {
        "disease": "Rust (Puccinia)",
        "confidence": 0.88,
        "solution": "Use sulfur or neem oil. Remove infected leaves immediately and avoid nitrogen-heavy fertilizers."
    },
    {
        "disease": "Powdery Mildew",
        "confidence": 0.95,
        "solution": "Apply a mixture of water and baking soda or use horticultural oils. Ensure plants have full sun exposure."
    },
    {
        "disease": "Healthy",
        "confidence": 0.99,
        "solution": "No disease detected. Continue standard monitoring and fertilization schedule."
    }
]

def extract_features_from_image(image_bytes: bytes) -> list:
    """Extract 14 color & texture features from leaf image bytes."""
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img_np = np.array(img)
    
    R = img_np[:, :, 0]
    G = img_np[:, :, 1]
    B = img_np[:, :, 2]
    
    R_mean, R_std = float(np.mean(R)), float(np.std(R))
    G_mean, G_std = float(np.mean(G)), float(np.std(G))
    B_mean, B_std = float(np.mean(B)), float(np.std(B))
    
    img_hsv = img.convert('HSV')
    hsv_np = np.array(img_hsv)
    H = hsv_np[:, :, 0]
    S = hsv_np[:, :, 1] / 255.0
    V = hsv_np[:, :, 2] / 255.0
    
    H_mean, H_std = float(np.mean(H)), float(np.std(H))
    S_mean, S_std = float(np.mean(S)), float(np.std(S))
    V_mean, V_std = float(np.mean(V)), float(np.std(V))
    
    # Estimate yellow/brown lesion density (Hue between 10 and 50)
    yellow_pixels = np.sum((H >= 10) & (H <= 50) & (S >= 0.2))
    total_pixels = img_np.shape[0] * img_np.shape[1]
    lesion_density = float(yellow_pixels / total_pixels) if total_pixels > 0 else 0.0
    
    # Grayscale variance for texture
    img_gray = img.convert('L')
    gray_np = np.array(img_gray)
    texture_variance = float(np.var(gray_np)) if len(gray_np) > 0 else 0.0
    
    return [
        R_mean, G_mean, B_mean, R_std, G_std, B_std,
        H_mean, S_mean, V_mean, H_std, S_std, V_std,
        lesion_density, texture_variance
    ]

@app.get("/")
def read_root():
    # Check if models are ready
    crop_model_ready = False
    yield_model_ready = False
    
    if predictor:
        model, _ = predictor.load_model()
        crop_model_ready = model is not None
        ymodel, _ = predictor.load_yield_model()
        yield_model_ready = ymodel is not None

    return {
        "status": "FarmSync ML Service is Online", 
        "version": "1.3.0",
        "crop_model_ready": crop_model_ready,
        "disease_model_ready": disease_model is not None,
        "yield_model_ready": yield_model_ready
    }

@app.post("/ml/disease-detect")
async def detect_disease(image: UploadFile = File(...)):
    """Detects diseases in crop leaves via image analysis (Gradient Boosting Classifier)."""
    try:
        image_bytes = await image.read()
        
        if disease_model is None:
            # Fallback to mock selection if not trained
            prediction = random.choice(DISEASES)
            return {
                "filename": image.filename,
                **prediction,
                "timestamp": time.time(),
                "fallback": True
            }
        
        # Extract features and predict
        features = extract_features_from_image(image_bytes)
        X = np.array([features])
        
        pred = disease_model.predict(X)[0]
        probs = disease_model.predict_proba(X)[0]
        
        class_idx = list(disease_model.classes_).index(pred)
        confidence = float(probs[class_idx])
        
        # Get advice
        advice_info = disease_info.get("disease_info", {}).get(pred, {}) if disease_info else {}
        
        return {
            "filename": image.filename,
            "disease": pred,
            "confidence": confidence,
            "solution": advice_info.get("solution", "Apply fungicide containing copper or mancozeb. Improve air circulation."),
            "severity": advice_info.get("severity", "Medium"),
            "urgency": advice_info.get("urgency", "medium"),
            "timestamp": time.time()
        }
    except Exception as e:
        # Fallback on failure
        prediction = random.choice(DISEASES)
        return {
            "filename": image.filename,
            **prediction,
            "timestamp": time.time(),
            "fallback": True,
            "error": str(e)
        }

@app.post("/ml/crop-recommend")
async def recommend_crop(data: CropRecommendationRequest):
    """Recommends the best crop based on soil and weather parameters."""
    if not predictor:
        raise HTTPException(status_code=500, detail="ML Predictor module not found.")
    
    input_data = data.dict()
    result = predictor.predict(input_data)
    
    if not result.get('success'):
        raise HTTPException(status_code=500, detail=result.get('error'))
        
    return result

@app.post("/ml/yield-predict")
async def predict_crop_yield(data: YieldPredictionRequest):
    """Predicts expected crop yield in tons/farm using Random Forest regressor."""
    if not predictor:
        raise HTTPException(status_code=500, detail="ML Predictor module not found.")
    
    input_data = data.dict()
    result = predictor.predict_yield(input_data)
    
    if not result.get('success'):
        raise HTTPException(status_code=500, detail=result.get('error'))
        
    return result

@app.post("/ml/pest-predict")
async def predict_pest_risk(data: PestPredictionRequest):
    """Predicts risk of pest outbreak (Low, Medium, High) based on tabular weather data."""
    if not predictor:
        raise HTTPException(status_code=500, detail="ML Predictor module not found.")
    
    input_data = data.dict()
    result = predictor.predict_pest(input_data)
    
    if not result.get('success'):
        raise HTTPException(status_code=500, detail=result.get('error'))
        
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
