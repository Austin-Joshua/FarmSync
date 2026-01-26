# 🌾 FarmSync V1.0 - Digital Farm Record Management System

**Version:** V1.0 (Base Version - All Core Features)  
**Status:** ✅ Production Ready

---

## 👨‍🌾 Welcome to FarmSync V1.0 - Your Complete Farm Management Solution

### What is FarmSync V1.0?

FarmSync V1.0 is your **all-in-one digital farming assistant** - the **base version** with **all core features** you need to manage your entire farm. Think of it as your personal farm manager that helps you track crops, expenses, weather, and make better farming decisions - all from your phone or computer.

### Why Use FarmSync V1.0?

✅ **Complete Solution** - Everything you need in one app (15 major feature categories)  
✅ **Save Time** - No more paper records or spreadsheets  
✅ **Save Money** - Track expenses and income to see exactly where your money goes  
✅ **Make Better Decisions** - Get AI-powered crop recommendations (99.55% accuracy)  
✅ **Never Miss Important Dates** - Calendar reminders for planting, harvesting, fertilizing  
✅ **Work in Your Language** - Available in 6 languages (English, Tamil, Hindi, Telugu, Kannada, Malayalam)  
✅ **Access Anywhere** - Works on your phone, tablet, or computer - anytime, anywhere  
✅ **Secure & Private** - Your farm data is protected with industry-standard security

### What Can FarmSync V1.0 Do? (Complete Feature List)

**FarmSync V1.0 includes 15 major feature categories with 50+ individual features:**

1. **📱 Farm & Field Management** - Create farm profiles, manage multiple fields, track soil information
2. **🌱 Crop Management** - Plan crops, track growth, crop calendar, rotation planning
3. **💰 Financial Management** - Track expenses, record income, profit/loss reports, monthly summaries
4. **📊 Yield & Production** - Record harvests, calculate yields, compare seasons, production history
5. **🌤️ Weather & Alerts** - Current weather, forecasts, weather alerts, climate warnings
6. **🤖 AI Recommendations** - Crop suggestions, disease detection, pest management, fertilizer advice
7. **📅 Calendar & Reminders** - Farming calendar, event reminders, activity tracking
8. **💧 Irrigation Management** - Schedule irrigation, track water usage, irrigation history
9. **🌿 Fertilizer & Pesticide** - Record applications, stock management, usage history, cost tracking
10. **📦 Stock & Inventory** - Track supplies, stock levels, usage records, reorder alerts
11. **📈 Reports & Analytics** - Dashboard overview, financial reports, production reports, visual charts
12. **🔐 Security & Privacy** - Secure login, two-factor authentication, data privacy, multiple login options
13. **🌍 Multi-Language** - 6 languages supported with easy switching
14. **📱 Mobile & Desktop** - Works on phone, tablet, computer with responsive design
15. **👨‍💼 Admin Features** - User management, system reports, activity logs, data management

**See [Complete Documentation](DOCUMENTATION.md) for detailed feature descriptions.**

---

![FarmSync](https://img.shields.io/badge/FarmSync-V1.0-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![React](https://img.shields.io/badge/React-18.3-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

---

## 📋 Quick Navigation

- **[Quick Start Guide](#-quick-start)** - Get running in minutes
- **[Features](#-features)** - What FarmSync can do
- **[Tech Stack](#-tech-stack)** - Technology details
- **[Project Structure](#-project-structure)** - Folder organization
- **[Development](#-development)** - Setup & troubleshooting
- **[Documentation](#-documentation)** - Additional resources

---

## 🎯 Overview

**FarmSync V1.0** is the **base version** - a complete, modern, multilingual farm management system that helps farmers:

### Core Capabilities
- ✅ **Crop Management** - Track crops, varieties, and planting dates
- ✅ **Expense Tracking** - Monitor costs for fertilizers, seeds, labor
- ✅ **Yield Tracking** - Record harvest data and productivity metrics
- ✅ **AI Recommendations** - Get crop suggestions based on soil & weather
- ✅ **Weather Monitoring** - Real-time weather alerts and forecasts
- ✅ **Irrigation Management** - Optimize water usage
- ✅ **Pest & Disease Detection** - Image-based disease scanning
- ✅ **Reports & Analytics** - Generate data-driven insights
- ✅ **Multi-language Support** - English, Tamil, Hindi, Telugu, Kannada, Malayalam (6 languages)
- ✅ **Mobile Responsive** - Works on all devices

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Python 3.7+ (for ML features)

### Installation (3 steps)

**1. Clone & Install Dependencies**
```bash
git clone https://github.com/Austin-Joshua/FarmSync.git
cd FarmSync
cd Backend && npm install && cd ..
cd Frontend && npm install && cd ..
```

**2. Setup Database**
```bash
cd Backend
npm run setup-db      # Create database & tables
npm run seed         # Populate sample data (optional)
```

**3. Start the Application**

**Terminal 1 - Backend (Port 5000):**
```bash
cd Backend
npm run dev
# Output: ✅ Backend server is running on http://localhost:5000
```

**Terminal 2 - Frontend (Port 5174):**
```bash
cd Frontend
npm run dev
# Output: ➜ Local: http://localhost:5174/
```

### 🎉 You're Ready!
Open your browser to **http://localhost:5174** and register with your email.

---

## 📚 Features

### Authentication & Security
- Email/password registration and login
- JWT token-based authentication
- Two-factor authentication (2FA)
- Password strength validation
- Session management
- Role-based access control (Farmer/Admin)

### Farm Management
- Create and manage multiple farms
- Field mapping with geolocation
- Soil type and condition tracking
- Land size and crop allocation

### Crop Management
- Crop planning and scheduling
- Planting and harvest tracking
- Crop calendar with milestones
- Variety and seed information
- Crop rotation management

### Financial Management
- Expense tracking by category
- Cost per crop analysis
- Income tracking
- Profit/loss calculations
- Historical financial reports

### Yield & Productivity
- Harvest data recording
- Yield per acre/hectare
- Productivity trends
- Comparative analysis

### Weather & Alerts
- Real-time weather data
- Weather alerts and warnings
- Temperature and rainfall forecasting
- Alerts customization

### AI & Recommendations
- Machine Learning-based crop recommendations
- Soil condition analysis
- Pest and disease detection via image scanning
- Weather-based optimization suggestions

### Reporting & Analytics
- Generate PDF reports
- Data export (CSV, Excel)
- Dashboard analytics
- Performance metrics
- Charts and visualizations

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite 5.4** - Lightning-fast build tool
- **Tailwind CSS** - Beautiful, responsive styling
- **React Router 7.12** - Client-side routing
- **Recharts 3.6** - Data visualization
- **Leaflet & React-Leaflet** - Interactive maps
- **i18next 25.7** - Multi-language support

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express 4.18** - Web framework
- **TypeScript 5.3** - Type safety
- **MySQL 8.0** - Relational database
- **JWT** - Secure authentication
- **Bcryptjs** - Password encryption
- **Winston** - Logging
- **Helmet** - Security headers
- **CORS** - Cross-origin support

### Machine Learning
- **Python 3.7+**
- **Scikit-learn** - ML algorithms
- **Pandas** - Data processing
- **NumPy** - Numerical computing

---

## 📁 Project Structure

```
FarmSync/
├── Frontend/                    # React.js web application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service layer
│   │   ├── context/            # React Context (Auth, Theme)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Utility functions
│   │   ├── i18n/               # Internationalization files
│   │   └── types/              # TypeScript type definitions
│   ├── package.json
│   └── vite.config.ts
│
├── Backend/                     # Node.js/Express API
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic
│   │   ├── models/             # Database models
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Express middleware
│   │   ├── config/             # Configuration files
│   │   ├── database/           # Database setup & migrations
│   │   ├── utils/              # Helper utilities
│   │   └── server.ts           # Main server file
│   ├── ml/                      # Machine Learning models
│   │   ├── train_model.py     # ML model training script
│   │   └── predict.py          # ML predictions
│   ├── Dataset/                # Training & reference data
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                        # Documentation
│   ├── DATABASE_STRUCTURE.md   # Schema documentation
│   ├── API_DOCUMENTATION.md    # Endpoint reference
│   └── SETUP_GUIDE.md          # Detailed setup instructions
│
└── README.md                    # This file
```

---

## 🔧 Development

### Running in Development Mode

**Backend Server:**
```bash
cd Backend
npm run dev        # Starts with hot-reload on http://localhost:5000
```

**Frontend Development:**
```bash
cd Frontend
npm run dev        # Starts on http://localhost:5174
```

### Building for Production

**Backend:**
```bash
cd Backend
npm run build      # Compiles TypeScript to JavaScript
npm start          # Runs compiled backend
```

**Frontend:**
```bash
cd Frontend
npm run build      # Creates optimized production build
npm run preview    # Preview production build locally
```

### Available Scripts

**Backend Commands:**
```bash
npm run dev          # Development server with auto-reload
npm run build        # Build TypeScript
npm run start        # Run production build
npm run setup-db     # Initialize database
npm run migrate      # Run database migrations
npm run seed         # Populate sample data
npm run lint         # Check code quality
npm run typecheck    # Check TypeScript types
```

**Frontend Commands:**
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # Lint code
npm run typecheck    # Type checking
```

### Database Setup

```bash
cd Backend
npm run setup-db     # Creates database & all tables
```

The database includes tables for:
- Users & authentication
- Farms & fields
- Crops & crop calendars
- Expenses & income
- Yields & harvests
- Stock & fertilizers
- Weather alerts
- Audit logs
- And more...

---

## 📖 Documentation

### Available Resources

1. **[docs/DATABASE_STRUCTURE.md](docs/DATABASE_STRUCTURE.md)** - Complete database schema
2. **[docs/DBMS_SETUP_GUIDE.md](docs/DBMS_SETUP_GUIDE.md)** - Database setup instructions
3. **[docs/KEEP_BACKEND_RUNNING.md](docs/KEEP_BACKEND_RUNNING.md)** - Production deployment guide
4. **[Backend/README.md](Backend/README.md)** - Backend-specific documentation
5. **[Backend/ml/README.md](Backend/ml/README.md)** - ML model documentation

---

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill process on port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
```

**Database Connection Error:**
- Ensure MySQL is running
- Check credentials in `Backend/src/config/env.ts`
- Verify database exists: `npm run setup-db`

**Frontend Can't Connect to Backend:**
- Verify backend is running on port 5000
- Check CORS configuration in `Backend/src/server.ts`
- Clear browser cache and reload

**Port 5173/5174 in Use:**
- Frontend will auto-switch to next available port
- Check console for actual port being used

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

**Austin Joshua** - Full Stack Developer

GitHub: [@Austin-Joshua](https://github.com/Austin-Joshua)

---

## 📞 Support

For issues, questions, or suggestions:
1. Check the [Documentation](#-documentation) section
2. Review existing [GitHub Issues](https://github.com/Austin-Joshua/FarmSync/issues)
3. Create a new issue with detailed description

---

## 🎉 Thank You!

Thank you for using FarmSync! We hope it helps you manage your farm more effectively.

**Happy Farming! 🌾**

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
  - Email/password authentication
  - Secure password hashing
  - User onboarding flow

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

- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Complete comprehensive guide (start here!)
- `Backend/README.md` - Backend-specific documentation
- `Backend/ml/README.md` - ML model documentation
- `Backend/ENV_TEMPLATE.md` - Environment variables template

**For complete feature list and customer-friendly guide, see [DOCUMENTATION.md](DOCUMENTATION.md)**

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

---

## 🎯 FarmSync V1.0 - Base Version Summary

**FarmSync V1.0** is the **complete base version** with all essential farming features:

### ✅ What's Included in V1.0:
- **15 Major Feature Categories** - Everything from farm management to AI recommendations
- **50+ Individual Features** - Comprehensive tools for modern farming
- **6 Languages** - Use in your preferred language
- **131 API Endpoints** - Complete backend functionality
- **AI Crop Recommendations** - 99.55% accuracy machine learning model
- **Mobile Responsive** - Works perfectly on phones, tablets, and computers
- **Production Ready** - Fully tested and ready to deploy

### 🚀 What Makes V1.0 Special:
- **Complete Solution** - Everything you need in one app
- **No Missing Features** - All core functionality is included
- **Well Documented** - Easy to understand and use
- **Secure** - Industry-standard security
- **Scalable** - Can grow with your farm

**V1.0 is ready to use today - start managing your farm digitally!**

---

**Version:** V1.0 (Base Version - All Core Features)  
**Last Updated:** January 2026  
**Status:** ✅ Production Ready
