# 🌾 FarmSync Platform - Modern Digital Farm Record & Precision Agribusiness Management System

**Version:** V2.1 (Production Launch Ready)  
**Status:** ✅ Production Certified | Keyless Weather Services | Resilient AI/ML Fallbacks | JWT Session Security

---

## 👨‍🌾 Project Overview
FarmSync is an all-in-one digital agritech ecosystem platform designed to digitize and optimize agricultural operations for modern farmers, cooperatives, and agribusiness stakeholders. The platform integrates precision environmental analytics, satellite geofencing coordinates, interactive polygon field drawing, crop health diagnostics, expense auditing, and yield regression forecasting into a high-performance control panel.

### 🌟 Key Core Pillars
1. **Interactive Field Geofencing**: GPS tracking and interactive polygon drawing to map farm boundaries using Leaflet.
2. **Keyless Weather Telemetry**: Dynamic hyper-local 7-day climate updates utilizing Open-Meteo as a keyless default/fallback.
3. **Resilient AI/ML Engine**: Built-in client-side mathematical fallbacks for crop recommendations, pest forecasting, and leaf disease scans when the ML microservice is offline.
4. **Advanced Authentication & Security**: Multi-role JWT session rotation (Access + Refresh tokens), phone OTP simulation, password reset flows, and user-isolated query execution.
5. **Multi-Language Adaptability**: Instant translation of dashboards, alerts, and settings across 8+ languages (English, Hindi, Marathi, Telugu, Tamil, Kannada, Gujarati, Punjabi) using i18next.

---

## 🛠️ Technology Stack

### 💻 Frontend
- **React 18.3** (Vite compile-chain) - Premium modular UI framework
- **Zustand** - High-performance decentralized state management
- **TypeScript 5.x** - Strict static typing and interface verification
- **Tailwind CSS 3.4** - Harmonic green/earth responsive grid system
- **React Leaflet 4.x** - Real-time GIS map plotting and boundary coordinate vector overlays
- **Recharts 3.6** - Fluid analytics, district-wise metrics, and financial progress tracking
- **i18next** - Client-side translation translation middleware

### ☕ Backend
- **Java 17 (JDK)** - Long-Term Support enterprise runtime
- **Spring Boot 3.2.4** - REST API framework and dependency inject engines
- **Spring Security** - User isolation, role authority guards, and CORS configuration
- **Spring Data JPA** - Repository queries mapped to transactional operations
- **jjwt 0.12** - JWT authentication signature signing
- **Lombok** - Builder models and class getter/setter generation

### 🗄️ Database
- **H2 / PostgreSQL** - Enterprise relational storage schema
- **Durable Seeding** - Clean automatic seeding of default admin, farmer, and citizen credentials on clean start

---

## 🚀 Installation & Local Running Guide

### 📋 Prerequisites
- **Java 17+** (JDK configured on system environment path)
- **Node.js 18+** (with npm package manager)

### 📦 Quick Start Steps

**1. Clone and Navigate to Workspace**
```bash
git clone https://github.com/Austin-Joshua/FarmSync.git
cd FarmSync
```

**2. Launch Spring Boot Java REST Backend (Port 9090)**
```powershell
cd Backend
# Verify Maven build and run
.\mvnw.cmd clean spring-boot:run
# Backend API will boot and listen at http://localhost:9090
```

**3. Launch Vite React Frontend (Port 5173)**
```bash
cd Frontend
# Install lock-file dependencies
npm install
# Start local HMR hot reload dev server
npm run dev
# Frontend web portal will launch at http://localhost:5173
```

---

## 🔑 Environment Configuration Variables

### ☕ Backend Config (`Backend/src/main/resources/application.properties`)
```properties
server.port=9090
spring.datasource.url=jdbc:h2:mem:farmsyncdb;DB_CLOSE_DELAY=-1
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

# JWT Cryptographic Signature Key (Minimum 256 bits Base64 encoded)
jwt.secret=9a65a9a3f28cfbcbe4284cf63cf5f84d6b63ca04351a66810a9f24300a7b453a
jwt.expiration=86400000

# OpenWeather API Configuration (Optional - Falls back to keyless Open-Meteo)
openai.api.key=
ml.service.url=http://localhost:8000
```

### 💻 Frontend Config (`Frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:9090/api
# OpenWeather API key (Optional - falls back automatically to keyless Open-Meteo)
VITE_OPENWEATHER_API_KEY=
```

---

## 📁 Repository Directory Architecture

```
FarmSync/
├── Backend/                    # Spring Boot Application Root
│   ├── src/main/java/com/farmsync/
│   │   ├── config/             # Seeding Initializers & Web Configuration
│   │   ├── controller/         # REST Controllers (Auth, Farms, Yield, Crop)
│   │   ├── dto/                # Request & Response Data Transfer Objects
│   │   ├── model/              # JPA Entities (User, Farm, Crop, Yield, Expense)
│   │   ├── repository/         # Data Access Repositories
│   │   ├── security/           # JWT Filters & Web Filters
│   │   └── service/            # Business logic (Auth, Farms, Weather, AI)
│   └── pom.xml                 # Maven Dependency configuration
│
├── Frontend/                   # React Application Root
│   ├── src/
│   │   ├── components/         # Leaflet Map, StatCards, AI Chat overlay
│   │   ├── context/            # AuthContext & Language Switcher Context
│   │   ├── hooks/              # GPS Telemetry Geolocation hook
│   │   ├── pages/              # Landing, Register, Login, Dashboard, Profile
│   │   ├── services/           # Axios Instances & resilient ML Fallback APIs
│   │   └── utils/              # Translations, Date Formatter, Emojis
│   └── package.json            # React modules
```

---

## 📡 REST API Documentation Endpoint Directory

All endpoints are authenticated with a Bearer header: `Authorization: Bearer <JWT_Token>` (excluding `/api/auth/**`).

### 🔑 Authentication (`/api/auth`)
- **`POST /api/auth/register`**: Registers a new user and automatically spins up a farm profile.
- **`POST /api/auth/login`**: Authenticates user credentials and returns JWT, Refresh Token, and User payload.
- **`POST /api/auth/refresh`**: Performs JWT rotation when access tokens expire.
- **`POST /api/auth/otp/send`**: Triggers a verified mobile OTP verification message simulator.
- **`POST /api/auth/otp/verify`**: Validates simulated OTP payload checks.
- **`POST /api/auth/password-reset/request`**: Generates a secure recovery password token.

### 🚜 Farm & Fields (`/api/farms` & `/api/fields`)
- **`GET /api/farms`**: Fetches all farms owned by the logged-in user.
- **`PUT /api/farms/{id}`**: Updates farm details including state, district, village, and polygon `boundaryCoordinates`.
- **`POST /api/fields`**: Creates sub-fields inside a farm with specific soil health logs.

### 🌾 Crop Lifecycle & Analytics (`/api/crops` & `/api/yields`)
- **`GET /api/crops`**: Fetches active crop records.
- **`POST /api/crops`**: Registers a new crop under a specific farm geofence.
- **`POST /api/yields`**: Logs harvest production yields, quality indicators, and crop metrics.

### 🛡️ AI Disease Scans (`/api/ai` & `/api/disease`)
- **`POST /api/ai/disease-detect`**: Multi-part leaf image scan. Calls local mock classifiers if port 8000 is down.
- **`GET /api/disease`**: Retrieves historical disease scans and remedy progress logs.

---

## 🔧 Troubleshooting Guide

1. **Vite compilation warnings on HMR**:
   Ensure `npm install` runs cleanly. If i18n warnings occur, verify your language selection keys.
2. **Spring Boot Port conflicts**:
   If port 9090 is in use, modify `server.port` inside `application.properties` and change `VITE_API_BASE_URL` inside the `.env` configuration file.
3. **Map rendering grey or missing grids**:
   Vite require leaf css imports. Ensure `import 'leaflet/dist/leaflet.css';` is loaded in your map component.

---

**Happy Farming! 🌾**
