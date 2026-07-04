# ================================================================
# FarmSync ML Service — Docker Production Image (Item 4)
# ================================================================
# Build: docker build -t farmsync-ml:2.0 .
# Run:   docker run -p 8000:8000 --env-file .env farmsync-ml:2.0
# ================================================================

FROM python:3.11-slim

# Build args for worker tuning
ARG ML_WORKERS=4
ARG ML_PORT=8000

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ML_WORKERS=${ML_WORKERS} \
    ML_PORT=${ML_PORT} \
    ML_HOST=0.0.0.0 \
    ML_TIMEOUT=120

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl && \
    rm -rf /var/lib/apt/lists/*

# Install Python deps first (layer cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir gunicorn prometheus-client redis

# Copy source
COPY . .

# Pre-create model dir
RUN mkdir -p models/vqc_ensemble datasets

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
    CMD curl -f http://localhost:${ML_PORT}/health || exit 1

EXPOSE ${ML_PORT}

# Run with 4 Uvicorn workers behind Gunicorn
CMD gunicorn main:app \
    --workers ${ML_WORKERS} \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind ${ML_HOST}:${ML_PORT} \
    --timeout ${ML_TIMEOUT} \
    --graceful-timeout 30 \
    --keep-alive 5 \
    --preload \
    --access-logfile - \
    --error-logfile - \
    --log-level info
