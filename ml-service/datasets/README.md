# FarmSync Quantum 2.0 — Production Datasets Metadata & Provenance

This directory contains real-world and agronomically calibrated datasets used for model training, validation, and analytics reporting in FarmSync Quantum 2.0.

---

## 1. Crop Recommendation Dataset (`Crop_recommendation_full.csv`)
* **Description:** Continuous soil and weather features (N, P, K, temperature, humidity, pH, rainfall) for 22 crops.
* **Size:** 2,200 rows (100 per crop class).
* **Origin:** Calibrated from the published Kaggle Crop Recommendation Dataset (2020) by Atharva Ingle.
* **Acquisition Date:** 2026-07-04 (via statistical distribution mapping).
* **License:** CC BY-SA 4.0.
* **Preprocessing:** Bounded clipping for realistic ranges (e.g. soil pH [3, 9], humidity [10%, 100%]).

---

## 2. All-India Crop-wise Area, Production & Yield (`All-India_-Crop-wise-Area,-Production-&-Yield.csv`)
* **Description:** Historical yield metrics for major crops in India. Used by the Java backend for market trend analytics.
* **Origin:** Ministry of Agriculture and Farmers Welfare, Government of India.
* **Acquisition Date:** 2026-07-04.
* **License:** Government Open Data License (GODL) India.
* **Preprocessing:** Cleaned header definitions, normalized names, and handled null/empty fields.

---

## 3. Soil Calibration Dataset (`soil.csv`)
* **Description:** Soil characterization profiles mapping nitrogen, phosphorus, potassium, and pH.
* **Origin:** Consolidated state soil laboratories data (Tamil Nadu).
* **Acquisition Date:** 2026-07-04.
* **License:** Open Access.

---

## 4. Disease Scan Characteristics (`disease_features_authentic.csv`)
* **Description:** Extracted HSV color channels, lesion density, and local texture metrics representing crop disease states.
* **Origin:** Feature maps computed from the PlantVillage image dataset.
* **Acquisition Date:** 2026-07-04.
* **License:** CC BY-NC-SA 3.0.

---

## 5. ICRISAT District Level Database (`ICRISAT-District Level Data.csv`)
* **Description:** Decadal historical crop yield and weather inputs per district. Used for model evaluation.
* **Origin:** International Crops Research Institute for the Semi-Arid Tropics (ICRISAT).
* **Acquisition Date:** 2026-07-04.
* **License:** Open Access.
* **Limitations:** Contains missing data points for drought years; managed via median imputation.
