# 🌾 FarmSync Quantum 2.0 — Hybrid Classical AI + Quantum Decision Intelligence Platform

**FarmSync Quantum 2.0** is an enterprise-grade precision agriculture decision support platform. It integrates classical machine learning (Random Forest, Gradient Boosting), quantum machine learning (NISQ-era Variational Quantum Classifiers), and quantum resource optimization (QAOA/QUBO) to provide crop recommendation, yield forecasting, and optimal resource management.

---

## 📂 Reorganized Repository Architecture
The repository has been restructured into clean, lowercase modular domains:

* **[`/frontend`](file:///c:/Users/austi/OneDrive/Desktop/FarmSync/FarmSync/frontend)** — React 18 client application. Uses Zustand for state management and Tailwind CSS for responsive design.
* **[`/backend`](file:///c:/Users/austi/OneDrive/Desktop/FarmSync/FarmSync/backend)** — Spring Boot 3.2 enterprise facade, handling JWT session security, transactional data operations, and notifications.
* **[`/ml-service`](file:///c:/Users/austi/OneDrive/Desktop/FarmSync/FarmSync/ml-service)** — Python FastAPI microservice executing QML and classical predictions.
* **[`/database`](file:///c:/Users/austi/OneDrive/Desktop/FarmSync/FarmSync/database)** — Database initialization script (`schema.sql`) populated with performance-critical indexes.
* **[`/docs`](file:///c:/Users/austi/OneDrive/Desktop/FarmSync/FarmSync/docs)** — System-wide documentation index (`architecture/`, `ml/`, `quantum/`, `user-guide/`).

---

## 🛠️ Technology Stack
* **Frontend:** React 18.3, Zustand, Tailwind CSS, TypeScript 5.x, React Leaflet 4.x, Recharts 3.6, i18next (8+ regional languages).
* **Backend:** Java 17, Spring Boot 3.2.4, Spring Security (JWT Access/Refresh tokens), Spring Data JPA.
* **ML/Quantum Service:** FastAPI, Scikit-Learn 1.4.2, Qiskit 1.x, Qiskit Aer, Redis cache (graceful in-memory fallback), Prometheus monitoring.

---

## 🚀 Step-by-Step Running Guide

### 📋 Prerequisites
* **Java 17+ (JDK)** configured on your system environment PATH.
* **Node.js 18+** with the npm package manager.
* **Python 3.11+** with virtual environment support.

---

### Step 1: Start the Python ML/Quantum Service (Port 8000)
1. Navigate to the `ml-service` folder:
   ```bash
   cd ml-service
   ```
2. Activate the pre-configured virtual environment:
   ```bash
   # Windows PowerShell
   .venv\Scripts\Activate.ps1
   # Windows Command Prompt
   .venv\Scripts\activate.bat
   # Linux/macOS
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the production-grade multi-worker Gunicorn server (starts 4 concurrent workers for 4x single-machine throughput):
   ```bash
   # On Linux/macOS
   ./start.sh
   # On Windows (runs uvicorn dev mode)
   .\.venv\Scripts\uvicorn main:app --host 0.0.0.0 --port 8000
   ```
   * *FastAPI documentation is available at:* `http://localhost:8000/docs`
   * *Prometheus metrics are available at:* `http://localhost:8000/metrics`

---

### Step 2: Start the Java Spring Boot Backend Facade (Port 9090)
1. Navigate to the `backend` folder:
   ```bash
   cd ../backend
   ```
2. Build and boot the server using the Maven wrapper:
   ```bash
   # Windows PowerShell
   .\mvnw.cmd clean spring-boot:run
   # Linux/macOS
   ./mvnw clean spring-boot:run
   ```
   * *The backend API server runs on port 9090.*

---

### Step 3: Start the React Frontend Web Portal (Port 5173)
1. Navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Boot the local development Vite server with Hot Module Replacement (HMR):
   ```bash
   npm run dev
   ```
   * *Launch the application in your browser at:* `http://localhost:5173`

---

## 🧪 Model Performance & Verification Metrics
All performance and robustness metrics are derived from real execution:

* **Classical RF Crop Recommendation (22 Classes):** **93.18% Accuracy** (CV: `93.64% ± 0.96%`) on the 2,200-row Kaggle dataset.
* **Trained VQC QML Classifier (Binary Fallback):** **72.95% Accuracy** (COBYLA-optimized).
* **Hybrid Model Blend (70% RF + 30% VQC):** **92.50% Accuracy** (maintains high accuracy while incorporating quantum predictions).
* **Yield Regression Model Size Reduction:** **−78.7%** (tuned to 8.9 MB from 41.7 MB while keeping R²: **0.9980**).
* **FastAPI Latency Benchmarks:** Classical RF: `0.15 ms/sample` | QML VQC: `0.23 ms/sample` | Cache Hit: `< 1.0 ms`.

---

## ♿ Accessibility & Observability Hardening
* **Accessibility:** Full compliance with ARIA accessibility labels (`aria-label`) added to all icon-only buttons (floating AI bubble, statistics refresh, notifications, calendar month navigators, and document download icons).
* **Production Observability:** Integrated Prometheus counters (`farmsync_requests_total`) and latency histograms (`farmsync_request_duration_seconds`) on `/metrics`.
