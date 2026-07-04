"""
FarmSync — Redis Prediction Cache Layer
=======================================
Item 3: Redis-backed cache for repeated VQC/ML predictions.
Falls back gracefully to in-memory LRU (TTLCache) when Redis is unavailable.

Usage (in main.py):
    from prediction_cache import PredictionCache
    cache = PredictionCache()
    ...
    cached = cache.get(input_hash)
    if cached: return cached
    result = predictor.predict(data)
    cache.set(input_hash, result)
"""
import hashlib
import json
import time
import logging
from typing import Optional, Any

logger = logging.getLogger("farmsync.cache")

# ─── Try Redis (optional dependency) ───────────────────────────
try:
    import redis
    _REDIS_AVAILABLE = True
except ImportError:
    _REDIS_AVAILABLE = False

# ─── In-memory TTL fallback ─────────────────────────────────────
class _TTLCache:
    """Thread-safe in-memory LRU cache with per-entry TTL."""
    def __init__(self, maxsize: int = 512, ttl: int = 300):
        self._store: dict = {}
        self._maxsize = maxsize
        self._ttl = ttl
        import threading
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            value, expires_at = entry
            if time.monotonic() > expires_at:
                del self._store[key]
                return None
            return value

    def set(self, key: str, value: Any) -> None:
        with self._lock:
            # Evict oldest entry if full
            if len(self._store) >= self._maxsize:
                oldest = next(iter(self._store))
                del self._store[oldest]
            self._store[key] = (value, time.monotonic() + self._ttl)

    def delete(self, key: str) -> None:
        with self._lock:
            self._store.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._store.clear()

    @property
    def size(self) -> int:
        return len(self._store)

    @property
    def stats(self) -> dict:
        now = time.monotonic()
        valid = sum(1 for _, (_, exp) in self._store.items() if exp > now)
        return {'entries': len(self._store), 'valid': valid, 'backend': 'memory'}


class PredictionCache:
    """
    Unified prediction cache with Redis backend and in-memory fallback.

    TTL Strategy:
      - crop_recommend:  5 min (weather/soil rarely changes in one session)
      - yield_predict:   10 min (QAOA optimization is expensive)
      - pest_predict:    5 min
      - quantum_vqc:     15 min (quantum circuit is deterministic for same input)
    """

    DEFAULT_TTL = 300       # 5 minutes
    YIELD_TTL   = 600       # 10 minutes
    QUANTUM_TTL = 900       # 15 minutes

    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        self._redis: Optional[Any] = None
        self._memory = _TTLCache(maxsize=512, ttl=self.DEFAULT_TTL)
        self._hits = 0
        self._misses = 0
        self._backend = 'memory'

        if _REDIS_AVAILABLE:
            try:
                r = redis.from_url(redis_url, socket_connect_timeout=2, decode_responses=True)
                r.ping()
                self._redis = r
                self._backend = 'redis'
                logger.info(f"[Cache] Redis backend connected: {redis_url}")
            except Exception as e:
                logger.warning(f"[Cache] Redis unavailable ({e}) — using in-memory fallback")
        else:
            logger.info("[Cache] redis package not installed — using in-memory fallback")

    @staticmethod
    def make_key(endpoint: str, input_data: dict) -> str:
        """Deterministic cache key from endpoint + sorted input dict."""
        payload = json.dumps(input_data, sort_keys=True, default=str)
        digest = hashlib.sha256(f"{endpoint}:{payload}".encode()).hexdigest()[:24]
        return f"farmsync:pred:{endpoint}:{digest}"

    def get(self, key: str) -> Optional[dict]:
        if self._redis:
            try:
                raw = self._redis.get(key)
                if raw:
                    self._hits += 1
                    return json.loads(raw)
            except Exception as e:
                logger.warning(f"[Cache] Redis GET error: {e} — falling back to memory")
        val = self._memory.get(key)
        if val is not None:
            self._hits += 1
            return val
        self._misses += 1
        return None

    def set(self, key: str, value: dict, ttl: int = DEFAULT_TTL) -> None:
        payload = json.dumps(value, default=str)
        if self._redis:
            try:
                self._redis.setex(key, ttl, payload)
                return
            except Exception as e:
                logger.warning(f"[Cache] Redis SET error: {e} — falling back to memory")
        self._memory._ttl = ttl
        self._memory.set(key, value)

    def delete(self, key: str) -> None:
        if self._redis:
            try: self._redis.delete(key)
            except Exception: pass
        self._memory.delete(key)

    def clear_all(self) -> None:
        """Clear all FarmSync prediction keys."""
        if self._redis:
            try:
                keys = self._redis.keys("farmsync:pred:*")
                if keys: self._redis.delete(*keys)
            except Exception: pass
        self._memory.clear()

    @property
    def stats(self) -> dict:
        total = self._hits + self._misses
        rate = self._hits / total if total > 0 else 0
        base = {'backend': self._backend, 'hits': self._hits,
                'misses': self._misses, 'hit_rate_pct': round(rate*100, 1)}
        if self._backend == 'memory':
            base.update(self._memory.stats)
        return base


# ─── Singleton instance (imported by main.py) ───────────────────
import os
_REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
prediction_cache = PredictionCache(redis_url=_REDIS_URL)
