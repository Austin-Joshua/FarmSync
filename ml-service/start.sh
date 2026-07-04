#!/bin/bash
# ================================================================
# FarmSync ML Service — Production Start Script (Item 4)
# ================================================================
# Starts FastAPI with Gunicorn + Uvicorn workers for multi-core
# production deployment. 4 workers = 4x single-machine throughput.
#
# Usage:
#   chmod +x start.sh
#   ./start.sh              # production (4 workers)
#   ./start.sh dev          # development (1 worker, hot reload)
#   ./start.sh workers 8    # custom worker count
#
# Environment variables (override via .env or Docker/k8s):
#   ML_WORKERS      Number of Gunicorn workers (default: 4)
#   ML_HOST         Bind host (default: 0.0.0.0)
#   ML_PORT         Bind port (default: 8000)
#   ML_TIMEOUT      Worker timeout seconds (default: 120)
#   REDIS_URL       Redis connection URL (default: redis://localhost:6379/0)
#   JWT_SECRET      JWT secret for Spring Boot integration
#   FRONTEND_URL    Allowed CORS origin

set -euo pipefail

MODE="${1:-production}"
ML_WORKERS="${ML_WORKERS:-4}"
ML_HOST="${ML_HOST:-0.0.0.0}"
ML_PORT="${ML_PORT:-8000}"
ML_TIMEOUT="${ML_TIMEOUT:-120}"

echo "========================================================"
echo "  FarmSync ML Intelligence Service v2.0.0"
echo "  Mode: $MODE | Workers: $ML_WORKERS | Port: $ML_PORT"
echo "========================================================"

# Activate venv if present
if [ -d ".venv" ]; then
    source .venv/bin/activate
    echo "[OK] Virtual environment activated"
fi

if [ "$MODE" = "dev" ]; then
    echo "[DEV] Starting with hot reload (single worker)"
    uvicorn main:app --host "$ML_HOST" --port "$ML_PORT" --reload
elif [ "$MODE" = "workers" ]; then
    CUSTOM_WORKERS="${2:-$ML_WORKERS}"
    echo "[PROD] Starting with $CUSTOM_WORKERS Gunicorn workers"
    gunicorn main:app \
        --workers "$CUSTOM_WORKERS" \
        --worker-class uvicorn.workers.UvicornWorker \
        --bind "$ML_HOST:$ML_PORT" \
        --timeout "$ML_TIMEOUT" \
        --graceful-timeout 30 \
        --keep-alive 5 \
        --access-logfile - \
        --error-logfile - \
        --log-level info
else
    echo "[PROD] Starting with $ML_WORKERS Gunicorn workers"
    exec gunicorn main:app \
        --workers "$ML_WORKERS" \
        --worker-class uvicorn.workers.UvicornWorker \
        --bind "$ML_HOST:$ML_PORT" \
        --timeout "$ML_TIMEOUT" \
        --graceful-timeout 30 \
        --keep-alive 5 \
        --preload \
        --access-logfile - \
        --error-logfile - \
        --log-level info
fi
