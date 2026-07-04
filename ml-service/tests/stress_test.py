"""
FarmSync Quantum 2.0 — Scalability & Load Testing
==================================================
Phase 5: Concurrent load test with threading to simulate real user load.
Tests crop recommendation pipeline under concurrent request pressure.

Outputs real P50/P95/P99 latency percentiles and throughput.
"""
import sys, os, time, json, threading
import numpy as np
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, str(Path(__file__).parent.parent))
import predict_logic as pl

BASE_DIR = Path(__file__).parent.parent
RESULTS_PATH = BASE_DIR / "models" / "scalability_report.json"

TEST_INPUT = {
    'N': 90.0, 'P': 42.0, 'K': 43.0,
    'temperature': 20.9, 'humidity': 82.0,
    'ph': 6.5, 'rainfall': 202.9
}

YIELD_INPUT = {
    'crop': 'rice', 'area': 5.0, 'irrigation': 'drip',
    'soil': 'loamy', 'season': 'kharif',
    'fertilizer': 4.5, 'pesticide': 2.2, 'water': 45000.0
}

print("=" * 60)
print("FARMSYNC QUANTUM 2.0 — SCALABILITY & LOAD TESTING")
print("=" * 60)

# Preload models before testing (simulates running FastAPI server)
print("\n[Preloading models...]")
t_preload = time.perf_counter()
pl.load_model()
pl.load_yield_model()
pl.load_pest_model()
print(f"  Models preloaded in {round((time.perf_counter()-t_preload)*1000,1)}ms")


def run_crop_predict(_):
    t0 = time.perf_counter()
    r = pl.predict(TEST_INPUT)
    ms = (time.perf_counter() - t0) * 1000
    return ms, r.get('success', False)


def run_yield_predict(_):
    t0 = time.perf_counter()
    r = pl.predict_yield(YIELD_INPUT)
    ms = (time.perf_counter() - t0) * 1000
    return ms, r.get('success', False)


def load_test(fn, n_requests: int, n_threads: int, label: str):
    print(f"\n  [{label}] {n_requests} requests, {n_threads} threads...")
    latencies = []
    errors = 0
    t_wall_start = time.perf_counter()
    with ThreadPoolExecutor(max_workers=n_threads) as executor:
        futures = [executor.submit(fn, i) for i in range(n_requests)]
        for f in as_completed(futures):
            ms, ok = f.result()
            latencies.append(ms)
            if not ok:
                errors += 1
    wall_ms = (time.perf_counter() - t_wall_start) * 1000
    lat = sorted(latencies)
    n = len(lat)
    result = {
        "label": label,
        "n_requests": n_requests,
        "n_threads": n_threads,
        "errors": errors,
        "wall_time_ms": round(wall_ms, 1),
        "throughput_rps": round(n_requests / (wall_ms / 1000), 1),
        "latency_ms": {
            "min": round(lat[0], 1),
            "p50": round(lat[n//2], 1),
            "p90": round(lat[int(n*0.90)], 1),
            "p95": round(lat[int(n*0.95)], 1),
            "p99": round(lat[min(int(n*0.99), n-1)], 1),
            "max": round(lat[-1], 1),
            "mean": round(np.mean(lat), 1)
        }
    }
    print(f"    Throughput:  {result['throughput_rps']} req/s")
    print(f"    P50:         {result['latency_ms']['p50']}ms")
    print(f"    P95:         {result['latency_ms']['p95']}ms")
    print(f"    P99:         {result['latency_ms']['p99']}ms")
    print(f"    Errors:      {errors}")
    return result


all_results = []

# Test tiers
print("\n=== CROP RECOMMENDATION LOAD TEST ===")
all_results.append(load_test(run_crop_predict, 20,  1,  "Sequential baseline (20 req, 1 thread)"))
all_results.append(load_test(run_crop_predict, 50,  4,  "Light load (50 req, 4 threads)"))
all_results.append(load_test(run_crop_predict, 100, 8,  "Medium load (100 req, 8 threads)"))
all_results.append(load_test(run_crop_predict, 200, 16, "Heavy load (200 req, 16 threads)"))

print("\n=== YIELD PREDICTION LOAD TEST ===")
all_results.append(load_test(run_yield_predict, 50,  4,  "Yield light load (50 req, 4 threads)"))
all_results.append(load_test(run_yield_predict, 100, 8,  "Yield medium load (100 req, 8 threads)"))

# Compute scalability projection
print("\n=== SCALABILITY PROJECTION ===")
# Using heavy load result as baseline
heavy = next(r for r in all_results if "Heavy" in r["label"])
rps = heavy["throughput_rps"]
p95 = heavy["latency_ms"]["p95"]
print(f"  Measured throughput (16 threads):  {rps} req/s")
print(f"  P95 latency (16 threads):          {p95}ms")
print()
print(f"  PROJECTION (based on horizontal scaling):")
instances = [1, 2, 4, 8, 16]
for inst in instances:
    proj_rps = round(rps * inst, 0)
    concurrent_users = round(proj_rps * (p95 / 1000), 0)
    print(f"    {inst:3d} instance(s): ~{proj_rps:,} req/s → ~{concurrent_users:,} concurrent users")

projection_note = (
    "These projections assume linear horizontal scaling behind a load balancer. "
    "Actual scaling efficiency will be limited by I/O-bound model loading, GIL constraints in Python, "
    "and database connection pool saturation. Production deployment should use async FastAPI workers "
    "(uvicorn --workers N) with Redis caching for repeated predictions and PostgreSQL connection pooling."
)
print(f"\n  Note: {projection_note[:120]}...")

# Save report
scalability_report = {
    "test_results": all_results,
    "projection": {
        "baseline_rps": rps,
        "baseline_p95_ms": p95,
        "horizontal_scaling": {
            str(inst): {
                "instances": inst,
                "projected_rps": round(rps * inst, 0),
                "projected_concurrent_users": round(rps * inst * (p95 / 1000), 0)
            }
            for inst in instances
        },
        "scaling_note": projection_note
    },
    "architecture_recommendations": [
        "Deploy FastAPI with uvicorn --workers $(nproc) for CPU-level parallelism",
        "Use Redis to cache repeated crop recommendation results (TTL: 300s)",
        "Pre-warm VQC circuit at startup (already implemented via lifespan hook)",
        "Use async FastAPI endpoints with asyncio.run_in_executor for blocking ML calls",
        "Implement PostgreSQL connection pooling (PgBouncer) for DB-heavy endpoints",
        "Add CDN (Cloudflare) for static frontend assets",
        "Use Kubernetes HPA for auto-scaling based on CPU/memory thresholds"
    ],
    "generated_at": str(__import__('datetime').datetime.now())
}

RESULTS_PATH.parent.mkdir(exist_ok=True)
with open(RESULTS_PATH, 'w') as f:
    json.dump(scalability_report, f, indent=2)

print(f"\n  Report saved: {RESULTS_PATH}")
print("\nLoad testing complete.")
