# FarmSync Quantum 2.0 — System Architecture

This document describes the high-level architecture of FarmSync Quantum 2.0: A Hybrid Classical AI + Quantum Decision Intelligence Platform for Precision Agriculture.

---

## 1. System Overview

The application is structured as a decoupled multi-tier microservice architecture:

```
               [ React Frontend (Vite) ]
                           │ (HTTP/JSON + WebSockets)
                           ▼
          [ Spring Boot Facade (Port 9090) ]
            (Auth, DB Storage, Push, Facade)
             /                           \
            /                             \
           ▼                               ▼
[ PostgreSQL / H2 Database ]     [ FastAPI ML Service (Port 8000) ]
                                 (Crop, Yield, Pest, VQC, QAOA)
                                           │
                                           ▼
                               [ Redis / Local Cache ]
```

---

## 2. Component Detail

### A. Frontend (React 18 + Zustand + Tailwind CSS)
- **State Management:** Zustand (lightweight, decoupled from React render cycles).
- **Styling:** Tailwind CSS + Vanilla CSS for dynamic aesthetic (glassmorphism/dark mode).
- **Communication:** Axios for REST endpoints; STOMP/WebSockets for notifications and real-time chat.
- **Accessibility:** Fully compliant with ARIA labels for screen readers.

### B. Backend Facade (Spring Boot + Security + JPA)
- **Role:** Direct access controller, data persistent gatekeeper, and security facade.
- **Security:** JWT authentication with role-based access control (RBAC: Farmer, Government, Admin).
- **Database:** Hibernate JPA supporting transactional updates to schema tables (PostgreSQL/H2).

### C. ML Service (FastAPI + Scikit-Learn + Qiskit)
- **Role:** High-throughput microservice handling classical inference (Random Forest, Gradient Boosting) and quantum NISQ circuits.
- **Concurrency:** Multi-worker runtime managed via Gunicorn + Uvicorn worker thread pool, preventing CPU-bound Qiskit simulation from blocking uvicorn's event loop.
- **Caching:** Multi-tier cache (Redis -> thread-safe memory fallback) to cache expensive QML predictions.
- **Observability:** Prometheus client exposing request counters and latency histograms on `/metrics`.
