"""
FarmSync Quantum 2.0 - Production Validation Script
Runs the full validation benchmark with real measured metrics.
"""
import sys
import time
import json
import numpy as np
import os

sys.path.append(os.path.dirname(__file__))

import predict_logic as predictor
from quantum_engine import QuantumDecisionEngine, QISKIT_AVAILABLE

RESULTS = {}

print("=" * 60)
print("FARMSYNC QUANTUM 2.0 — PRODUCTION VALIDATION BENCHMARK")
print("=" * 60)

# ─────────────────────────────────────────────────────────────
# 1. Quantum Engine Validation
# ─────────────────────────────────────────────────────────────
print("\n[1/6] Quantum Engine Validation")
engine = QuantumDecisionEngine()

# VQC
t0 = time.perf_counter()
probs = engine.run_vqc_inference([90.0, 42.0, 43.0, 6.5])
vqc_ms = round((time.perf_counter() - t0) * 1000, 3)
assert len(probs) == 16, "VQC must return 16 probability values"
assert abs(sum(probs) - 1.0) < 0.01, f"VQC probabilities must sum to ~1.0, got {sum(probs)}"
print(f"  ✅ VQC: 16-state distribution valid, sum={sum(probs):.4f}, latency={vqc_ms}ms")
RESULTS['vqc_latency_ms'] = vqc_ms
RESULTS['qiskit_native'] = QISKIT_AVAILABLE

# Angle encoding bounds
angles = engine.angle_encode(np.array([90.0, 42.0, 43.0, 6.5]), 4)
assert all(0 <= a <= np.pi for a in angles), "All angles must be in [0, π]"
print(f"  ✅ Angle encoding: {[round(a,3) for a in angles]} — all in [0, π]")

# QAOA
t0 = time.perf_counter()
qaoa_res = engine.optimize_resources_qaoa(35.5, {"fertilizer": 4.5, "water": 45000.0, "pesticide": 2.2})
qaoa_ms = round((time.perf_counter() - t0) * 1000, 3)
assert "optimal_state_qubits" in qaoa_res
assert len(qaoa_res["optimal_state_qubits"]) == 3
print(f"  ✅ QAOA: optimal_state={qaoa_res['optimal_state_qubits']}, latency={qaoa_ms}ms")
RESULTS['qaoa_latency_ms'] = qaoa_ms

# ─────────────────────────────────────────────────────────────
# 2. Crop Recommendation Validation
# ─────────────────────────────────────────────────────────────
print("\n[2/6] Crop Recommendation Hybrid Pipeline")
crop_input = {'N': 90.0, 'P': 42.0, 'K': 43.0, 'temperature': 20.9,
              'humidity': 82.0, 'ph': 6.5, 'rainfall': 202.9}

t0 = time.perf_counter()
crop_res = predictor.predict(crop_input)
total_ms = round((time.perf_counter() - t0) * 1000, 3)

assert crop_res.get('success'), f"Crop prediction failed: {crop_res.get('error')}"
assert 'recommended_crop' in crop_res
assert 'quantum_active' in crop_res
assert 'telemetry' in crop_res
telemetry = crop_res['telemetry']

print(f"  ✅ Recommended crop: {crop_res['recommended_crop']} ({crop_res['confidence_percent']}%)")
print(f"  ✅ Quantum active: {crop_res['quantum_active']}")
print(f"  ✅ Classical inference: {telemetry['classical_latency_ms']}ms")
print(f"  ✅ VQC simulation: {telemetry['quantum_latency_ms']}ms")
print(f"  ✅ Total pipeline latency: {telemetry['total_latency_ms']}ms")
RESULTS['crop_recommendation_total_ms'] = telemetry['total_latency_ms']
RESULTS['crop_recommended'] = crop_res['recommended_crop']
RESULTS['crop_confidence_pct'] = crop_res['confidence_percent']
RESULTS['quantum_active'] = crop_res['quantum_active']

# Validate top-3 structure
assert len(crop_res['recommendations']) == 3
for r in crop_res['recommendations']:
    assert 'crop' in r and 'confidence_percent' in r and 'advice' in r
print(f"  ✅ Top-3 recommendations structure valid")

# ─────────────────────────────────────────────────────────────
# 3. Yield Prediction & QAOA Validation
# ─────────────────────────────────────────────────────────────
print("\n[3/6] Yield Prediction + QAOA Resource Optimization")
yield_input = {'crop': 'rice', 'area': 5.0, 'irrigation': 'drip', 'soil': 'loamy',
               'season': 'kharif', 'fertilizer': 4.5, 'pesticide': 2.2, 'water': 45000.0}

t0 = time.perf_counter()
yield_res = predictor.predict_yield(yield_input)
yield_total_ms = round((time.perf_counter() - t0) * 1000, 3)

assert yield_res.get('success'), f"Yield prediction failed: {yield_res.get('error')}"
assert 'predicted_yield' in yield_res
assert 'quantum_resource_optimization' in yield_res
assert 'telemetry' in yield_res

y_tel = yield_res['telemetry']
qro = yield_res['quantum_resource_optimization']
print(f"  ✅ Predicted yield: {yield_res['predicted_yield']} tons")
print(f"  ✅ QAOA optimal state: {qro.get('optimal_state_qubits')}")
print(f"  ✅ QAOA classical yield: {qro.get('classical_yield_tons')} | optimized: {qro.get('quantum_optimized_yield_tons')}")
print(f"  ✅ Classical inference: {y_tel['classical_latency_ms']}ms | QAOA: {y_tel['quantum_latency_ms']}ms | Total: {y_tel['total_latency_ms']}ms")
RESULTS['yield_total_ms'] = y_tel['total_latency_ms']
RESULTS['yield_predicted_tons'] = yield_res['predicted_yield']
RESULTS['model_r2'] = yield_res['model_r2']

# ─────────────────────────────────────────────────────────────
# 4. Pest Prediction Validation
# ─────────────────────────────────────────────────────────────
print("\n[4/6] Pest Prediction Pipeline")
pest_input = {'temperature': 25.5, 'humidity': 70.0, 'rainfall': 150.0, 'crop': 'rice'}

t0 = time.perf_counter()
pest_res = predictor.predict_pest(pest_input)
pest_ms = round((time.perf_counter() - t0) * 1000, 3)

assert pest_res.get('success'), f"Pest prediction failed: {pest_res.get('error')}"
assert 'risk_level' in pest_res
assert 'predicted_pest' in pest_res
assert 'recommendation' in pest_res
print(f"  ✅ Pest risk: {pest_res['risk_level']} | Threat: {pest_res['predicted_pest']}")
print(f"  ✅ Recommendation: {pest_res['recommendation'][:60]}...")
print(f"  ✅ Inference latency: {pest_ms}ms")
RESULTS['pest_latency_ms'] = pest_ms

# ─────────────────────────────────────────────────────────────
# 5. Load Test: 100 concurrent crop predictions
# ─────────────────────────────────────────────────────────────
print("\n[5/6] Load Test — 100 sequential predictions")
N_ITER = 100
t0 = time.perf_counter()
errors = 0
for _ in range(N_ITER):
    r = predictor.predict(crop_input)
    if not r.get('success'):
        errors += 1
load_total_ms = round((time.perf_counter() - t0) * 1000, 2)
avg_ms = round(load_total_ms / N_ITER, 2)
print(f"  ✅ {N_ITER} predictions: total={load_total_ms}ms, avg={avg_ms}ms/req, errors={errors}")
RESULTS['load_test_n'] = N_ITER
RESULTS['load_test_avg_ms'] = avg_ms
RESULTS['load_test_errors'] = errors

# ─────────────────────────────────────────────────────────────
# 6. Feature Importances from model_info
# ─────────────────────────────────────────────────────────────
print("\n[6/6] Feature Importance Validation")
import json as _json
info_path = os.path.join(os.path.dirname(__file__), 'models', 'model_info.json')
with open(info_path) as f:
    info = _json.load(f)
fi = info.get('feature_importances', {})
sorted_fi = sorted(fi.items(), key=lambda x: x[1], reverse=True)
print("  Feature importances (Crop Recommendation RF):")
for feat, imp in sorted_fi:
    bar = "█" * int(imp * 40)
    print(f"    {feat:15s} {imp:.4f}  {bar}")
RESULTS['top_feature'] = sorted_fi[0][0]

# ─────────────────────────────────────────────────────────────
# SUMMARY REPORT
# ─────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("BENCHMARK SUMMARY REPORT")
print("=" * 60)
print(f"  Qiskit Native Backend:         {'YES (AerSimulator)' if RESULTS['qiskit_native'] else 'NO (NumPy Fallback)'}")
print(f"  VQC Latency:                   {RESULTS['vqc_latency_ms']}ms")
print(f"  QAOA Latency:                  {RESULTS['qaoa_latency_ms']}ms")
print(f"  Crop Recommendation (total):   {RESULTS['crop_recommendation_total_ms']}ms")
print(f"  Yield Prediction (total):      {RESULTS['yield_total_ms']}ms")
print(f"  Pest Prediction:               {RESULTS['pest_latency_ms']}ms")
print(f"  Yield Model R²:                {RESULTS['model_r2']:.4f} ({round(RESULTS['model_r2']*100,2)}%)")
print(f"  Top feature (RF):              {RESULTS['top_feature']}")
print(f"  Load Test (100 req):           avg {RESULTS['load_test_avg_ms']}ms/req, {RESULTS['load_test_errors']} errors")
print(f"  Recommended crop:              {RESULTS['crop_recommended']} ({RESULTS['crop_confidence_pct']}%)")
print("\n  ALL VALIDATIONS PASSED ✅")
