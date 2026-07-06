# 🌾 FarmSync — Precision Agriculture Intelligence Platform

**FarmSync** combines classical machine learning, simulator-based quantum ML, and a real-time Spring Boot API to help Indian farmers make data-driven decisions about crops, disease, yield, and expenses.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser / Mobile                         │
│              React 18 + Zustand + TypeScript (Port 5173)        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / REST
┌────────────────────────────▼────────────────────────────────────┐
│              Spring Boot 3.2 Backend (Port 9090)                │
│    JWT Auth · Rate Limiting · CORS · JPA + H2/PostgreSQL        │
└────────────────────────────┬────────────────────────────────────┘
                             │ Internal Secret Auth
┌────────────────────────────▼────────────────────────────────────┐
│              FastAPI ML Service (Port 8000)                     │
│    Random Forest · Gradient Boosting · VQC (AerSimulator)       │
│    Redis cache · Prometheus metrics                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18.3, TypeScript 5, Zustand, Tailwind CSS, React Leaflet, Recharts |
| Backend | Java 17, Spring Boot 3.2.4, Spring Security (JWT), Spring Data JPA |
| Database | H2 (dev/MVP) → PostgreSQL (production) |
| ML Service | Python 3.11, FastAPI, Scikit-Learn 1.4, Qiskit 1.x (AerSimulator), Redis cache |
| Auth | JWT access tokens + refresh tokens, Firebase Auth (social login) |
| CI/CD | GitHub Actions (backend, frontend, ML) |
| Deployment | Render (backend + ML), Vercel (frontend) |

---

## ⚡ Quickstart (3 terminals)

### Prerequisites
- Java 17+, Node.js 20+, Python 3.11+

### 1. ML Service (Port 8000)
```bash
cd ml-service
python -m venv .venv
source .venv/bin/activate   # Linux/macOS
# .venv\Scripts\activate    # Windows
pip install -r requirements.txt
cp .env.example .env        # Edit ML_SERVICE_SECRET
uvicorn main:app --port 8000 --reload
```
Docs: http://localhost:8000/docs

### 2. Backend (Port 9090)
```bash
cd backend
cp .env.example .env        # Edit JWT_SECRET and ML_SERVICE_SECRET
# Windows:
mvnw.cmd spring-boot:run
# Linux/macOS:
./mvnw spring-boot:run
```
Swagger: http://localhost:9090/swagger-ui.html  
Health: http://localhost:9090/api/health

### 3. Frontend (Port 5173)
```bash
cd frontend
cp .env.example .env.local  # Edit VITE_API_BASE_URL if needed
npm install
npm run dev
```
App: http://localhost:5173

### Demo credentials (dev mode only)
| Role | Email | Password |
|---|---|---|
| Admin | admin@farmsync.com | admin123 |
| Farmer | farmer@farmsync.com | farmer123 |
| Citizen | citizen@farmsync.com | citizen123 |

---

## 🧠 ML Performance

| Model | Accuracy / R² |
|---|---|
| Random Forest Crop Recommendation (22 classes) | 93.18% (CV: 93.64% ± 0.96%) |
| VQC Quantum Classifier (4-qubit AerSimulator, binary) | 72.95% |
| Hybrid Blend (70% RF + 30% VQC) | 92.50% |
| Yield Regression (Gradient Boosting) | R² = 0.998 |

> **Quantum note:** All quantum components run on Qiskit AerSimulator (classical simulation). No real quantum hardware is required.

---

## 🔒 Security

- JWT access tokens (HS256, configurable expiry) + refresh token rotation
- bcrypt password hashing
- Rate limiting via Bucket4j (IP-based, configurable burst)
- CORS restricted to configured frontend origin
- All service methods enforce owner-only access (IDOR protection)
- No secrets in code — all via environment variables
- Internal ML service protected by shared secret header

---

## 📁 Repository Structure

```
FarmSync/
├── backend/          Spring Boot API (Java 17)
├── frontend/         React 18 web app (TypeScript)
├── ml-service/       FastAPI ML microservice (Python 3.11)
├── database/         schema.sql with indexes
├── docs/
│   ├── architecture/ CODE_QUALITY_REPORT.md
│   ├── ml/           ML_METHODOLOGY.md (train/test, quantum claims)
│   └── STARTUP_READINESS.md
├── .github/workflows/ CI pipelines (backend, frontend, ml)
├── CONTRIBUTING.md
└── render.yaml       One-click Render deployment
```

---

## 🚀 Running Tests

```bash
# Backend
cd backend && ./mvnw test

# Frontend
cd frontend && npm run test

# ML Service
cd ml-service && pytest tests/ -v
```

---

## 📄 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions, branching strategy, and PR guidelines.
