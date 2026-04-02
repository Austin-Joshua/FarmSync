 wfrom fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import random
import time

app = FastAPI(title="FarmSync ML Disease Detection Service")

# CORS middleware for testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mocked classification logic
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
    return {"status": "ML Service is Online", "version": "1.0.0"}

@app.post("/ml/disease-detect")
async def detect_disease(image: UploadFile = File(...)):
    # Simulate image processing time
    time.sleep(1.5)
    
    # In a real scenario, we would use TensorFlow/PyTorch here:
    # model = load_model('models/crop_disease_v4.h5')
    # img = preprocess(image)
    # prediction = model.predict(img)
    
    # Return a random (mocked) prediction for demonstration
    prediction = random.choice(DISEASES)
    
    return {
        "filename": image.filename,
        **prediction,
        "timestamp": time.time()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
