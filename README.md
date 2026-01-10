# 🌾 FarmSync - Digital Farm Record Management System

A comprehensive full-stack web application for managing farm operations, tracking crops, expenses, yields, and getting AI-powered crop recommendations with real-time weather monitoring.

![FarmSync](https://img.shields.io/badge/FarmSync-1.0.0-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![React](https://img.shields.io/badge/React-18.3-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [ML Model](#ml-model)
- [Contributing](#contributing)

---

## 🎯 Overview

FarmSync is a modern, multilingual farm management system that helps farmers:
- Track crops, expenses, and yields
- Get AI-powered crop recommendations based on soil conditions
- Monitor real-time weather and climate alerts
- Manage fertilizers, pesticides, and irrigation
- Generate comprehensive reports and analytics
- Track financial history and stock usage
- Support for multiple languages (English, Tamil, Hindi)

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI framework |
| **TypeScript** | 5.5.3 | Type-safe JavaScript |
| **Vite** | 5.4.2 | Build tool & dev server |
| **React Router DOM** | 7.12.0 | Client-side routing |
| **Tailwind CSS** | 3.4.1 | Utility-first CSS framework |
| **Recharts** | 3.6.0 | Data visualization & charts |
| **React i18next** | 16.5.1 | Internationalization (i18n) |
| **i18next** | 25.7.4 | Translation framework |
| **Leaflet** | 1.9.4 | Interactive maps |
| **React Leaflet** | 4.2.1 | React wrapper for Leaflet |
| **Lucide React** | 0.344.0 | Icon library |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express.js** | 4.18.2 | Web framework |
| **TypeScript** | 5.3.3 | Type-safe JavaScript |
| **MySQL2** | 3.6.5 | MySQL database driver |
| **JWT** | 9.0.2 | Authentication tokens |
| **Bcryptjs** | 2.4.3 | Password hashing |
| **Express Validator** | 7.0.1 | Request validation |
| **Axios** | 1.6.2 | HTTP client (weather API) |
| **Winston** | 3.11.0 | Logging |
| **Helmet** | 7.1.0 | Security headers |
| **Express Rate Limit** | 7.1.5 | Rate limiting |
| **CORS** | 2.8.5 | Cross-origin resource sharing |

### Database

| Technology | Version | Purpose |
|------------|---------|---------|
| **MySQL** | 8.0+ | Relational database |
| **Database Name** | farmsync_db | Main database |

### Machine Learning

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.7+ | ML runtime |
| **Scikit-learn** | Latest | ML library |
| **Pandas** | Latest | Data manipulation |
| **NumPy** | Latest | Numerical computing |
| **Random Forest** | - | Crop recommendation algorithm |

### External Services

| Service | Purpose |
|---------|---------|
| **OpenWeatherMap API** | Real-time weather data |
| **Google OAuth** | Social authentication (optional) |

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │   Services   │      │
│  │  (13 pages)  │  │  (10 comps)  │  │   (API)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Context    │  │   i18n       │  │   Utils      │      │
│  │  (Auth/Theme)│  │ (3 langs)    │  │             │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Controllers  │  │   Services   │  │   Models     │      │
│  │  (16 files)  │  │   (4 files)  │  │  (13 files)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes     │  │  Middleware  │  │   Utils      │      │
│  │  (16 files)  │  │  (3 files)   │  │  (2 files)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL Queries
                            │
┌─────────────────────────────────────────────────────────────┐
│                      MySQL Database                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Users      │  │    Farms     │  │    Crops     │      │
│  │   Settings   │  │   Expenses   │  │    Yields    │      │
│  │   History    │  │    Stock     │  │   Weather    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Python Script
                            │
┌─────────────────────────────────────────────────────────────┐
│                  ML Service (Python)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Train Model │  │  Predict.py  │  │  Model.pkl   │      │
│  │  (RF Class.) │  │              │  │  (99.55% acc)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Interaction** → Frontend (React Components)
2. **API Calls** → Backend (Express.js Routes)
3. **Business Logic** → Controllers → Services → Models
4. **Data Persistence** → MySQL Database
5. **ML Predictions** → Python Script → Model → Backend → Frontend
6. **Weather Data** → OpenWeatherMap API → Backend → Frontend

---

## ✨ Features

### Core Features

- ✅ **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access (Admin/Farmer)
  - Google OAuth support (optional)
  - Secure password hashing

- ✅ **Farm Management**
  - Multiple farm profiles
  - Farm location tracking with GPS
  - Farm details and settings

- ✅ **Crop Management**
  - Add, edit, delete crops
  - Track crop lifecycle
  - Crop categories and seasons
  - Search and filter crops

- ✅ **Expense Tracking**
  - Record farm expenses
  - Categorize expenses
  - Monthly/yearly summaries
  - Expense analytics

- ✅ **Yield Tracking**
  - Record crop yields
  - Track production over time
  - Yield analytics and charts
  - Production history

- ✅ **Stock Management**
  - Track seeds, fertilizers, pesticides
  - Stock levels and usage
  - Auto-save stock records
  - Stock consumption history

- ✅ **Irrigation Management**
  - Schedule irrigation
  - Track water usage
  - Irrigation history

- ✅ **Weather Integration**
  - Real-time weather data
  - GPS-based location detection
  - Climate alerts (temperature, rainfall, drought, storms)
  - Fungal growth risk detection
  - Weather caching (10 minutes)

- ✅ **ML Crop Recommendations**
  - AI-powered crop suggestions
  - Based on soil nutrients (N, P, K)
  - Environmental factors (temp, humidity, pH, rainfall)
  - 99.55% accuracy model
  - Confidence scores

- ✅ **Reports & Analytics**
  - Financial reports
  - Production reports
  - Expense breakdowns
  - Interactive charts (Recharts)

- ✅ **History & Records**
  - Monthly income tracking
  - Stock usage history
  - Crop production history
  - Financial history

- ✅ **Internationalization (i18n)**
  - English (default)
  - Tamil (தமிழ்)
  - Hindi (हिंदी)
  - Language persistence
  - Dynamic content translation

- ✅ **Theme Support**
  - Light mode
  - Dark mode
  - Theme persistence

- ✅ **Disease Tracking** (Backend Ready)
  - GPS-tagged disease scans
  - Disease heatmap data
  - Disease statistics

- ✅ **Admin Control Panel** (Enhanced)
  - District-wise farmer statistics visualization
  - System-wide reports dashboard
  - Crop variety management
  - Activity logs and system monitoring
  - Interactive charts and analytics

- ✅ **Email Notifications**
  - Multi-provider support (SendGrid, AWS SES, SMTP)
  - Climate alert emails (automatic for critical/high severity)
  - Low stock alert emails
  - Harvest reminder emails
  - HTML email templates

- ✅ **Push Notifications**
  - Service worker implementation
  - Browser push notifications
  - Offline support and caching
  - Permission management UI
  - Subscription management

- ✅ **Rule-Based Crop Recommendations**
  - Fallback when ML model is unavailable
  - 7+ comprehensive rules based on soil, weather, nutrients
  - Multiple crop suggestions with confidence scores
  - Seamless integration with ML service

- ✅ **Data Export**
  - Export reports as CSV
  - Export reports as PDF (printable format)
  - Export history data
  - Integrated into Reports and History pages

- ✅ **Audit & Logs System** (Admin)
  - Track all user actions (create, update, delete, view, export)
  - Login/logout history with IP and user agent
  - System activity summary (last 7 days)
  - Activity breakdown by action type
  - Admin-only access

---

## 📁 Project Structure

```
FarmSync/
│
├── Backend/                          # Backend API Server
│   ├── src/
│   │   ├── config/                   # Configuration files
│   │   │   ├── database.ts          # MySQL connection
│   │   │   └── env.ts               # Environment config
│   │   ├── controllers/              # Request handlers (16 files)
│   │   │   ├── authController.ts
│   │   │   ├── cropController.ts
│   │   │   ├── dashboardController.ts
│   │   │   ├── expenseController.ts
│   │   │   ├── farmController.ts
│   │   │   ├── fertilizerController.ts
│   │   │   ├── historyController.ts
│   │   │   ├── irrigationController.ts
│   │   │   ├── mlController.ts
│   │   │   ├── pesticideController.ts
│   │   │   ├── settingsController.ts
│   │   │   ├── soilController.ts
│   │   │   ├── stockController.ts
│   │   │   ├── weatherController.ts
│   │   │   └── yieldController.ts
│   │   ├── database/                 # Database setup & migrations
│   │   │   ├── setupDatabase.ts
│   │   │   ├── migrate.ts
│   │   │   ├── seed.ts
│   │   │   └── schema.sql
│   │   ├── middleware/               # Express middleware
│   │   │   ├── auth.ts              # JWT authentication
│   │   │   ├── errorHandler.ts      # Error handling
│   │   │   └── validation.ts        # Request validation
│   │   ├── models/                   # Database models (13 files)
│   │   │   ├── User.ts
│   │   │   ├── Farm.ts
│   │   │   ├── Crop.ts
│   │   │   ├── Expense.ts
│   │   │   ├── Yield.ts
│   │   │   └── ...
│   │   ├── routes/                   # API routes (16 files)
│   │   │   ├── authRoutes.ts
│   │   │   ├── cropRoutes.ts
│   │   │   ├── dashboardRoutes.ts
│   │   │   └── ...
│   │   ├── services/                 # Business logic
│   │   │   ├── authService.ts
│   │   │   ├── dashboardService.ts
│   │   │   ├── mlService.ts
│   │   │   └── weatherService.ts
│   │   ├── utils/                    # Utility functions
│   │   │   ├── dbHelper.ts
│   │   │   └── logger.ts
│   │   └── server.ts                 # Express app entry point
│   ├── ml/                           # Machine Learning
│   │   ├── train_model.py           # Model training script
│   │   ├── predict.py               # Prediction script
│   │   ├── crop_recommendation_model.pkl  # Trained model
│   │   ├── model_info.json          # Model metadata
│   │   └── requirements.txt         # Python dependencies
│   ├── Dataset/                      # Training datasets
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Environment template
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── Frontend/                         # React Frontend Application
│   ├── src/
│   │   ├── components/               # Reusable components (10 files)
│   │   │   ├── Layout.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   ├── WeatherCard.tsx
│   │   │   ├── CropCard.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── ...
│   │   ├── context/                  # React Context
│   │   │   ├── AuthContext.tsx      # Authentication state
│   │   │   └── ThemeContext.tsx     # Theme state
│   │   ├── hooks/                    # Custom React hooks
│   │   │   └── useLocation.ts       # GPS location hook
│   │   ├── i18n/                     # Internationalization
│   │   │   ├── config.ts            # i18next configuration
│   │   │   └── locales/             # Translation files
│   │   │       ├── en.json         # English
│   │   │       ├── ta.json         # Tamil
│   │   │       └── hi.json         # Hindi
│   │   ├── pages/                    # Page components (13 files)
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CropManagement.tsx
│   │   │   ├── ExpenseManagement.tsx
│   │   │   ├── YieldTracking.tsx
│   │   │   └── ...
│   │   ├── services/                 # API service layer
│   │   │   └── api.ts               # Axios API client
│   │   ├── types/                    # TypeScript types
│   │   │   └── index.ts
│   │   ├── utils/                    # Utility functions
│   │   │   └── translations.ts      # Dynamic translations
│   │   ├── App.tsx                   # Main app component
│   │   ├── main.tsx                  # React entry point
│   │   └── index.css                 # Global styles
│   ├── .env                          # Environment variables
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── README.md                         # This file
├── HOW_TO_RUN.md                     # Quick start guide
└── .gitignore
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Python 3.7+** (for ML model) - [Download](https://www.python.org/downloads/)
- **npm** (comes with Node.js)

### Installation Steps

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd FarmSync
```

#### 2. Start MySQL Service

**Windows:**
```powershell
net start MySQL80
```

**Linux/Mac:**
```bash
sudo systemctl start mysql
```

#### 3. Setup Backend

```bash
cd Backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Configure database credentials

# Setup database (creates database and tables)
npm run setup-db

# Seed initial data (creates default users)
npm run seed

# (Optional) Train ML model
cd ml
pip install -r requirements.txt
python train_model.py
cd ..
npm run add-ml-table

# Start backend server
npm run dev
```

Backend runs on: `http://localhost:5000`

#### 4. Setup Frontend

**Open a NEW terminal window:**

```bash
cd Frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

Frontend runs on: `http://localhost:5173`

#### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

**Default Login Credentials:**
- **Admin**: `admin@farmsync.com` / `admin123`
- **Farmer**: `farmer@test.com` / `farmer123`

---

## ⚙️ Configuration

### Backend Environment Variables

Create `Backend/.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=farmsync_db
DB_USER=root
DB_PASSWORD=123456

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# OpenWeatherMap API Key (Required for full weather features)
# Get your free API key at: https://openweathermap.org/api
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Logging
LOG_LEVEL=info
```

### Frontend Environment Variables

Create `Frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### OpenWeather API Setup

1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key
3. Add it to `Backend/.env`:
   ```env
   OPENWEATHER_API_KEY=your_actual_api_key_here
   ```
4. Restart the backend server

See `Backend/OPENWEATHER_SETUP.md` for detailed instructions.

---

## 📡 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Core Endpoints

- `GET /api/dashboard` - Dashboard statistics
- `GET /api/farms` - Get user farms
- `POST /api/farms` - Create farm
- `GET /api/crops` - Get crops
- `POST /api/crops` - Create crop
- `GET /api/expenses` - Get expenses
- `POST /api/expenses` - Create expense
- `GET /api/yields` - Get yields
- `POST /api/yields` - Create yield record
- `GET /api/stock` - Get stock items
- `POST /api/stock` - Add stock item

### ML & Weather Endpoints

- `POST /api/ml/recommend` - Get crop recommendation
- `POST /api/weather/current` - Get current weather
- `POST /api/weather/alerts` - Get climate alerts
- `POST /api/weather/location/current` - Get location info

### Full API Documentation

See `Backend/README.md` for complete API documentation.

---

## 🤖 ML Model

### Model Details

- **Algorithm**: Random Forest Classifier
- **Accuracy**: 99.55%
- **Dataset**: 2,200 samples
- **Features**: N, P, K, temperature, humidity, pH, rainfall
- **Output**: Crop recommendation with confidence score

### Supported Crops

22 crop types: apple, banana, blackgram, chickpea, coconut, coffee, cotton, grapes, jute, kidneybeans, lentil, maize, mango, mothbeans, mungbean, muskmelon, orange, papaya, pigeonpeas, pomegranate, rice, watermelon

### Training the Model

```bash
cd Backend/ml
pip install -r requirements.txt
python train_model.py
```

### Using the Model

```bash
POST /api/ml/recommend
{
  "N": 90,
  "P": 42,
  "K": 43,
  "temperature": 20.87,
  "humidity": 82.00,
  "ph": 6.50,
  "rainfall": 202.93
}
```

See `Backend/ml/README.md` for more details.

---

## 🌍 Internationalization

FarmSync supports multiple languages:

- **English** (en) - Default
- **Tamil** (ta) - தமிழ்
- **Hindi** (hi) - हिंदी

Language preference is persisted in localStorage and survives theme changes.

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet.js security headers
- Input validation with express-validator
- SQL injection prevention (parameterized queries)

---

## 📊 Database Schema

### Main Tables

- `users` - User accounts
- `user_settings` - User preferences
- `farms` - Farm profiles
- `crops` - Crop records
- `expenses` - Expense tracking
- `yields` - Yield records
- `stock` - Stock management
- `irrigation` - Irrigation schedules
- `fertilizers` - Fertilizer records
- `pesticides` - Pesticide records
- `soil` - Soil information
- `monthly_income` - Income history
- `monthly_stock_usage` - Stock usage history
- `crop_recommendations` - ML recommendations
- `disease_scans` - Disease tracking with GPS

See `Backend/DATABASE_STRUCTURE.md` for complete schema.

---

## 🧪 Development

### Backend Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run setup-db     # Setup database
npm run seed         # Seed initial data
npm run migrate      # Run migrations
npm run lint         # Lint code
npm run typecheck    # Type check
```

### Frontend Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code
npm run typecheck    # Type check
```

---

## 📝 Documentation

- `HOW_TO_RUN.md` - Quick start guide
- `Backend/README.md` - Backend documentation
- `Backend/DATABASE_STRUCTURE.md` - Database schema
- `Backend/WEATHER_SETUP.md` - Weather API setup
- `Backend/OPENWEATHER_SETUP.md` - OpenWeather API guide
- `Backend/ml/README.md` - ML model documentation

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👥 Authors

- FarmSync Development Team

---

## 🙏 Acknowledgments

- OpenWeatherMap for weather data API
- Scikit-learn for ML algorithms
- React and Express.js communities
- All contributors and testers

---

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Made with ❤️ for farmers worldwide**
