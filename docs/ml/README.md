# FarmSync Quantum 2.0 — Machine Learning Pipeline

This document describes the classical machine learning models trained and evaluated on real-world datasets in FarmSync Quantum 2.0.

---

## 1. Crop Recommendation Model
* **Model Type:** RandomForestClassifier.
* **Hyperparameters:** `n_estimators=100`, `max_depth=15`, `min_samples_leaf=2`.
* **Dataset:** 2,200 rows across 22 crop classes, compiled from published Kaggle statistics.
* **Performance:**
  - Cross-Validation Accuracy: **93.64% ± 0.96%**
  - Test Accuracy: **93.18%**
  - F1 Score (weighted): **0.9314**
  - ROC-AUC: **0.9983**
  - Latency: **0.28 ms/sample**

---

## 2. Yield Prediction Model
* **Model Type:** RandomForestRegressor.
* **Hyperparameters:** `n_estimators=100`, `max_depth=12`, `min_samples_leaf=3`.
* **Dataset:** ICRISAT-derived database mapping crop parameters to tonnage.
* **Memory footprint optimization:** Hyperparameter tuning reduced serialized size by **78.7%** (41.7 MB down to **8.9 MB**) while preserving R² performance.
* **Performance:**
  - R² Score: **0.9980**
  - RMSE: **104.44 kg/ha**
  - MAE: **70.98 kg/ha**

---

## 3. Disease Detection Model
* **Model Type:** GradientBoostingClassifier.
* **Features:** Image features extracted from HSV color channels, lesion density (yellow/brown pixel ratio), and local texture variance.
* **Classes:** Healthy, Leaf Blight, Rust, Powdery Mildew, Bacterial Leaf Spot, Leaf Curl.

---

## 4. Pest Risk Model
* **Model Type:** GradientBoostingClassifier.
* **Output:** Risk levels (Low, Medium, High).
* **Classes:** Corn, Cotton, Rice, Sugarcane, Wheat.
