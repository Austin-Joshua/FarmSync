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
- **Dataset:** Agronomically calibrated synthetic crop dataset — 6,000+ rows, 24 crop classes, 7 features (N, P, K, temperature, humidity, pH, rainfall) generated based on published ICAR / FAO research ranges.
- **Split:** 80% train / 20% test (stratified by crop class)
- **Cross-validation:** 5-fold stratified CV on training split

### Yield Prediction Model
- **Dataset:** Synthetically generated agriculture dataset — 4,000 rows, 10 crop classes, 8 features (farm area, irrigation type, fertilizer used, pesticide used, water usage, soil type, season, crop type).
- **Split:** 80% train / 20% test (random split, seeded for reproducibility at `random_state=42`)

### Disease Detection Model
- **Dataset:** Authentic disease feature maps (12-row seed baseline mapping 14 color/texture channels for 6 leaf diseases) expanded using synthetic augmentation (normal/uniform perturbation) to 2,400+ samples.
- **Split:** 80% train / 20% test (stratified)

> **Caveat:** This accuracy is measured on data synthetically augmented from 12 real seed feature rows via random perturbation. Because the augmented samples cluster tightly around those 12 originals, this number reflects how separable the synthetic augmentation is, not validated accuracy on real, unseen leaf photographs. Before relying on this model for real diagnostic use, it should be evaluated against an actual held-out photographic dataset (e.g. PlantVillage).

---

## Quantum ML: Scope & Honest Claims

> **IMPORTANT:** All quantum components run on **classical simulators** (Qiskit AerSimulator / numpy quantum emulator). There is no connection to real quantum hardware.

This is a standard and valid approach for NISQ-era research. The VQC circuits are designed to run on near-term quantum hardware when available, but all benchmarks were produced on a classical simulation.

### Quantum components used:
| Component | Type | Purpose |
|---|---|---|
| VQC Classifier Ensemble | 4-qubit, 10-class / 24-class one-vs-rest variational circuits (COBYLA optimizer) | Confidences used as a dynamic prediction modifier |
| QAOA/QUBO Optimizer | Approximate quantum optimization | Resource allocation optimization |

### Hybrid blend ratio:
The final crop recommendation blends classical (RF) and quantum (VQC) via **Confidence Fusion** based on normalized entropy. Because the classical RF classifier achieves ~96% accuracy on the full 24-class dataset while the VQC ensemble operates at ~9.5% accuracy (~2.2x better than random guess for 24 classes), the classical engine contributes ~92% of the decision weight in production, with the quantum engine serving as a confidence-modulating adjustment layer contributing ~8% of the final decision drive.

---

## Performance Metrics

| Model | Metric | Value |
|---|---|---|
| Classical RF Crop Rec (24 classes) | Accuracy | 96.25% |
| Classical RF Crop Rec (24 classes) | CV (5-fold) | 96.20% ± 0.45% |
| VQC QML Ensemble (multiclass) | Accuracy | ~9.50% |
| Hybrid Confidence Fusion (dynamic) | Real contribution | 92% Classical / 8% Quantum |
| Disease Detection GBC (6 classes) | Accuracy | 100.00% (CV: 99.79%) |
| Yield Regression | R² | 0.9980 |
| Yield Regression | Model size | 9.3 MB |

> **Disease model caveat:** The 100.00% accuracy figure is measured on synthetically augmented data derived from 12 real seed feature rows. It reflects separability of the synthetic distribution, not validated performance on real leaf photographs.

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
