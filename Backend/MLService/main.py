from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import time
import os

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

# --- Models for Request/Response ---

class CropRecommendationRequest(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

# --- Mocked Disease Detection Logic ---
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

@app.get("/")
def read_root():
    # Check if model is ready
    model_ready = False
    if predictor:
        model, _ = predictor.load_model()
        model_ready = model is not None

    return {
        "status": "FarmSync ML Service is Online", 
        "version": "1.2.0",
        "models_ready": model_ready
    }

@app.post("/ml/disease-detect")
async def detect_disease(image: UploadFile = File(...)):
    """Detects diseases in crop leaves via image analysis (mocked CNN)."""
    time.sleep(1.2)
    prediction = random.choice(DISEASES)
    return {
        "filename": image.filename,
        **prediction,
        "timestamp": time.time()
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
