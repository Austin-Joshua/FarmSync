from fastapi import FastAPI, File, UploadFile, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from contextlib import asynccontextmanager
from pydantic import BaseModel
import asyncio
import concurrent.futures
import random
import time
import os
import io
import joblib
import json
import numpy as np
from PIL import Image
from pathlib import Path

# Thread pool for blocking ML/Qiskit calls — keeps the asyncio event loop free
_ML_EXECUTOR = concurrent.futures.ThreadPoolExecutor(max_workers=4, thread_name_prefix="farmsync-ml")

# Import our refined ML predictor
try:
    import predict_logic as predictor
except ImportError:
    predictor = None

# --- Path Configurations ---
BASE_DIR = Path(__file__).parent
DISEASE_MODEL_PATH = BASE_DIR / 'models' / 'disease_model.pkl'
DISEASE_INFO_PATH = BASE_DIR / 'models' / 'disease_info.json'

# Shared model state
disease_model = None
disease_info = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Preload all ML models and pre-transpile quantum circuits at startup to eliminate cold-start latency."""
    global disease_model, disease_info
    t0 = time.perf_counter()
    print("FarmSync ML Service: Preloading models...")

    # Preload disease model
    if DISEASE_MODEL_PATH.exists():
        try:
            disease_model = joblib.load(DISEASE_MODEL_PATH)
            if DISEASE_INFO_PATH.exists():
                with open(DISEASE_INFO_PATH) as f:
                    disease_info = json.load(f)
            print(f"  [OK] Disease model loaded.")
        except Exception as e:
            print(f"  [WARN] Disease model load error: {e}")

    # Preload crop recommendation model via predict_logic (warms singleton cache)
    if predictor:
        try:
            predictor.load_model()
            print(f"  [OK] Crop recommendation model loaded.")
        except Exception as e:
            print(f"  [WARN] Crop model preload error: {e}")

        # Preload yield model
        try:
            predictor.load_yield_model()
            print(f"  [OK] Yield model loaded.")
        except Exception as e:
            print(f"  [WARN] Yield model preload error: {e}")

        # Preload pest model
        try:
            predictor.load_pest_model()
            print(f"  [OK] Pest model loaded.")
        except Exception as e:
            print(f"  [WARN] Pest model preload error: {e}")

        # Pre-warm quantum engine (triggers circuit construction, avoiding first-call overhead)
        try:
            if predictor._QUANTUM_ENGINE is not None:
                _ = predictor._QUANTUM_ENGINE.run_vqc_inference([90.0, 42.0, 43.0, 6.5])
                print(f"  [OK] Quantum VQC circuit pre-warmed (AerSimulator transpilation cached).")
        except Exception as e:
            print(f"  [WARN] Quantum pre-warm error: {e}")

    elapsed = round((time.perf_counter() - t0) * 1000, 1)
    print(f"FarmSync ML Service: All models preloaded in {elapsed}ms. Ready to serve requests.")
    yield
    # Shutdown cleanup (if needed)
    print("FarmSync ML Service: Shutting down.")

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds OWASP-recommended security response headers."""
    async def dispatch(self, request: StarletteRequest, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Cache-Control"] = "no-store"
        return response


_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://farm-sync-sepia.vercel.app",
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
]

ML_SERVICE_SECRET = os.getenv("ML_SERVICE_SECRET")

async def verify_internal_secret(x_internal_secret: str = Header(None)):
    if not ML_SERVICE_SECRET or x_internal_secret != ML_SERVICE_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")

app = FastAPI(
    title="FarmSync ML Intelligence Service",
    version="2.0.0",
    description="Hybrid Classical AI + Quantum Decision Intelligence for Precision Agriculture",
    lifespan=lifespan
)

app.add_middleware(GZipMiddleware, minimum_size=500)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)


async def _run_in_executor(fn, *args):
    """Run a blocking function in the ML thread pool, freeing the async event loop."""
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(_ML_EXECUTOR, fn, *args)


# ─── Prediction Cache (Redis + in-memory fallback) ───────────────
try:
    from prediction_cache import prediction_cache, PredictionCache
    _CACHE_ENABLED = True
except ImportError:
    prediction_cache = None
    _CACHE_ENABLED = False

# ─── Prometheus Metrics ──────────────────────────────────────────
try:
    from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
    _PROM_AVAILABLE = True
    _req_counter = Counter('farmsync_requests_total', 'Total ML requests', ['endpoint', 'status'])
    _latency_hist = Histogram('farmsync_request_duration_seconds', 'ML request latency', ['endpoint'],
                               buckets=[0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0])
except ImportError:
    _PROM_AVAILABLE = False

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
    irrigation: str = "manual"
    soil: str = "loamy"
    fertilizer: float = 0.5
    pesticide: float = 10.0
    water: float = 1000.0

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
        "version": "2.0.0",
        "crop_model_ready": crop_model_ready,
        "disease_model_ready": disease_model is not None,
        "yield_model_ready": yield_model_ready,
        "cache_backend": prediction_cache.stats.get('backend', 'disabled') if _CACHE_ENABLED else 'disabled',
        "prometheus_enabled": _PROM_AVAILABLE,
    }


from fastapi.responses import PlainTextResponse

@app.get("/metrics", response_class=PlainTextResponse,
         summary="Prometheus metrics endpoint")
async def prometheus_metrics():
    """Exposes Prometheus-compatible metrics for scraping (Item 5: production observability)."""
    if _PROM_AVAILABLE:
        return PlainTextResponse(generate_latest(), media_type=CONTENT_TYPE_LATEST)
    # Fallback: emit simple text metrics
    cache_stats = prediction_cache.stats if _CACHE_ENABLED else {}
    lines = [
        "# HELP farmsync_cache_hits_total Total prediction cache hits",
        "# TYPE farmsync_cache_hits_total counter",
        f"farmsync_cache_hits_total {cache_stats.get('hits', 0)}",
        "# HELP farmsync_cache_misses_total Total prediction cache misses",
        "# TYPE farmsync_cache_misses_total counter",
        f"farmsync_cache_misses_total {cache_stats.get('misses', 0)}",
        "# HELP farmsync_ml_service_up ML service availability",
        "# TYPE farmsync_ml_service_up gauge",
        "farmsync_ml_service_up 1",
    ]
    return PlainTextResponse("\n".join(lines) + "\n", media_type="text/plain")


@app.get("/cache/stats", summary="Cache statistics")
async def cache_stats_endpoint():
    """Returns prediction cache hit/miss statistics and backend info."""
    if not _CACHE_ENABLED:
        return {"enabled": False, "backend": "disabled"}
    return {"enabled": True, **prediction_cache.stats}


@app.post("/ml/disease-detect", dependencies=[Depends(verify_internal_secret)])
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

@app.post("/ml/crop-recommend", dependencies=[Depends(verify_internal_secret)])
async def recommend_crop(data: CropRecommendationRequest):
    """Recommends the best crop (async, cached, non-blocking)."""
    if not predictor:
        raise HTTPException(status_code=500, detail="ML Predictor module not found.")
    input_data = data.dict()
    # Check cache first
    if _CACHE_ENABLED:
        cache_key = PredictionCache.make_key('crop-recommend', input_data)
        cached = prediction_cache.get(cache_key)
        if cached:
            cached['cache_hit'] = True
            return cached
    result = await _run_in_executor(predictor.predict, input_data)
    if not result.get('success'):
        raise HTTPException(status_code=500, detail=result.get('error'))
    if _CACHE_ENABLED:
        prediction_cache.set(cache_key, result, ttl=PredictionCache.DEFAULT_TTL)
    return result

@app.post("/ml/yield-predict", dependencies=[Depends(verify_internal_secret)])
async def predict_crop_yield(data: YieldPredictionRequest):
    """Predicts crop yield (async, cached — QAOA result cached 10min)."""
    if not predictor:
        raise HTTPException(status_code=500, detail="ML Predictor module not found.")
    input_data = data.dict()
    if _CACHE_ENABLED:
        cache_key = PredictionCache.make_key('yield-predict', input_data)
        cached = prediction_cache.get(cache_key)
        if cached:
            cached['cache_hit'] = True
            return cached
    result = await _run_in_executor(predictor.predict_yield, input_data)
    if not result.get('success'):
        raise HTTPException(status_code=500, detail=result.get('error'))
    if _CACHE_ENABLED:
        prediction_cache.set(cache_key, result, ttl=PredictionCache.YIELD_TTL)
    return result

@app.post("/ml/pest-predict", dependencies=[Depends(verify_internal_secret)])
async def predict_pest_risk(data: PestPredictionRequest):
    """Predicts risk of pest outbreak (Low, Medium, High) — async, non-blocking."""
    if not predictor:
        raise HTTPException(status_code=500, detail="ML Predictor module not found.")
    input_data = data.dict()
    result = await _run_in_executor(predictor.predict_pest, input_data)
    if not result.get('success'):
        raise HTTPException(status_code=500, detail=result.get('error'))
    return result

@app.post("/ml/quantum-recommend", dependencies=[Depends(verify_internal_secret)])
async def quantum_recommend_crop(data: CropRecommendationRequest):
    """Hybrid VQC+RF crop recommendation — async, non-blocking."""
    if not predictor:
        raise HTTPException(status_code=500, detail="ML Predictor module not found.")
    input_data = data.dict()
    result = await _run_in_executor(predictor.predict, input_data)
    if not result.get('success'):
        raise HTTPException(status_code=500, detail=result.get('error'))
    return {
        "success": True,
        "recommended_crop": result.get("recommended_crop"),
        "confidence_percent": result.get("confidence_percent"),
        "recommendations": result.get("recommendations"),
        "quantum_active": result.get("quantum_active"),
        "vqc_is_trained": result.get("vqc_is_trained"),
        "vqc_param_source": result.get("vqc_param_source"),
        "quantum_vqc_probabilities": result.get("quantum_vqc_probabilities"),
        "classical_probabilities": result.get("classical_probabilities")
    }

class QuantumOptimizeRequest(BaseModel):
    predicted_yield: float
    fertilizer: float
    water: float
    pesticide: float

@app.post("/ml/quantum-optimize", dependencies=[Depends(verify_internal_secret)])
async def quantum_optimize_resources(data: QuantumOptimizeRequest):
    """Optimizes operational resources (fertilizer, water, pesticide) using QAOA/QUBO."""
    if not predictor or not predictor._QUANTUM_ENGINE:
        raise HTTPException(status_code=500, detail="Quantum engine not loaded.")
        
    try:
        input_data = {
            'fertilizer': data.fertilizer,
            'water': data.water,
            'pesticide': data.pesticide
        }
        result = predictor._QUANTUM_ENGINE.optimize_resources_qaoa(data.predicted_yield, input_data)
        return {
            "success": True,
            "quantum_resource_optimization": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quantum optimization error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
