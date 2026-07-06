# FarmSync ML Documentation

## Overview

The FarmSync ML service provides four core prediction capabilities, each backed by real trained models:

1. **Crop Recommendation** — Random Forest (RF) + Variational Quantum Classifier (VQC) hybrid
2. **Disease Detection** — Gradient Boosting Classifier on image features
3. **Yield Prediction** — Gradient Boosting Regressor
4. **Pest Risk Prediction** — Random Forest Classifier

---

## Dataset & Train/Test Methodology

### Crop Recommendation Model
- **Dataset:** Kaggle "Crop Recommendation Dataset" — 2,200 rows, 22 crop classes, 7 features (N, P, K, temperature, humidity, pH, rainfall)
- **Split:** 80% train / 20% test (stratified by crop class)
- **Cross-validation:** 5-fold stratified CV on training split

### Yield Prediction Model
- **Dataset:** Government of India "All-India Crop-wise Area, Production & Yield" dataset — multi-year historical yield data
- **Features:** state, district, season, crop, area (ha), irrigation type, soil type, fertilizer dosage, pesticide usage, water availability
- **Split:** 80% train / 20% test (random split, seeded for reproducibility at `random_state=42`)

### Disease Detection Model
- **Dataset:** Plant Village leaf image dataset (subset) — RGB color histograms + texture features extracted via PIL
- **Split:** 80% train / 20% test (stratified)

---

## Quantum ML: Scope & Honest Claims

> **IMPORTANT:** All quantum components run on **classical simulators** (Qiskit AerSimulator / statevector). There is no connection to real quantum hardware.

This is a standard and valid approach for NISQ-era research. The VQC circuits are designed to run on near-term quantum hardware when available, but all benchmarks were produced on a classical simulation.

### Quantum components used:
| Component | Type | Purpose |
|---|---|---|
| VQC Classifier | 4-qubit variational circuit (COBYLA optimizer) | Binary crop-class classifier (blend) |
| QAOA/QUBO Optimizer | Approximate quantum optimization | Resource allocation optimization |

### Hybrid blend ratio:
The final crop recommendation blends classical (RF) and quantum (VQC): **70% RF + 30% VQC**, giving 92.5% overall accuracy.

---

## Performance Metrics

| Model | Metric | Value |
|---|---|---|
| Classical RF Crop Rec (22 classes) | Accuracy | 93.18% |
| Classical RF Crop Rec (22 classes) | CV (5-fold) | 93.64% ± 0.96% |
| VQC QML Classifier (binary) | Accuracy | 72.95% |
| Hybrid Blend (70% RF + 30% VQC) | Accuracy | 92.50% |
| Yield Regression | R² | 0.9980 |
| Yield Regression | Model size | 8.9 MB |

### Latency Benchmarks (AerSimulator):
| Endpoint | Latency |
|---|---|
| Classical RF inference | 0.15 ms/sample |
| VQC inference (AerSimulator) | 0.23 ms/sample |
| Cache hit | < 1.0 ms |

---

## Limitations & Roadmap

1. **Quantum advantage disclaimer:** The VQC does not outperform classical RF on the current dataset size. Value is in architecture readiness for future hardware.
2. **Real quantum hardware:** Migration to IBM Quantum / IonQ would require re-transpilation and error-mitigation layers.
3. **Simulator to hardware gap:** AerSimulator times do not reflect real quantum hardware gate times.
