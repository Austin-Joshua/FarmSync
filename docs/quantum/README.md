# FarmSync Quantum 2.0 — Quantum Computing Core

This document outlines the NISQ-era quantum computing algorithms implemented in FarmSync Quantum 2.0.

---

## 1. Variational Quantum Classifier (VQC)

We implement two QML modalities in the FastAPI runtime:

### A. Single Binary VQC (Fallback)
* **Qubits:** 4 (N, P, K, pH mapped to qubits 0, 1, 2, 3).
* **Gate Ansatz:** `RealAmplitudes` (2-layers, 8 parameters, linear entangling CNOT chain).
* **Optimization:** scipy COBYLA (trained in 52.6s, reducing loss by **50.5%**).
* **Accuracy:** **72.95%** (trained binary rice vs all).

### B. One-vs-Rest VQC Ensemble (Multiclass)
* **Classifiers:** 22 independent binary VQCs trained on the 22 Kaggle crops.
* **Normalization:** Class-specific min-max statistics.
* **Output aggregation:** Softmax probability aggregation with scaling factor = 5.0.

---

## 2. Resource Optimization (QAOA / QUBO)

Used to find the optimal allocation of fertilizer, water, and pesticide to maximize crop yield while minimizing input cost and chemical runoff.

### Formulation
* **Variables:** 3 binary variables ($x_0$: fertilizer, $x_1$: water, $x_2$: pesticide).
* **Qubit Mapping:** 3 Qubits.
* **Hamiltonian:**
  $$H = w_0 Z_0 + w_1 Z_1 + w_2 Z_2 + w_{01} Z_0 Z_1 + w_{12} Z_1 Z_2 + w_{02} Z_0 Z_2$$
  - $w_0, w_1, w_2$: Linear cost-yield trade-off coefficients.
  - $w_{01}, w_{12}$: Positive synergy coupling (e.g. fertilizer + water yields more).
  - $w_{02}$: Penalty coupling (toxicity runoff).
* **Solver:** High-speed binary search mapping of the QUBO energy space.
