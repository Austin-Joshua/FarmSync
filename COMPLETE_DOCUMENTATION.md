# FarmSync - Complete Documentation & Reference Guide

**Last Updated:** January 15, 2025  
**Version:** 1.0.0  
**Status:** ✅ **PRODUCTION READY**

---

## 📚 **TABLE OF CONTENTS**

1. [Quick Start](#quick-start)
2. [System Overview](#system-overview)
3. [Getting Started](#getting-started)
4. [Frontend Setup](#frontend-setup)
5. [Backend Setup](#backend-setup)
6. [Database Setup](#database-setup)
7. [Frontend-Backend Connection](#frontend-backend-connection)
8. [Deployment Guide](#deployment-guide)
9. [Features & Inventory](#features--inventory)
10. [Troubleshooting](#troubleshooting)
11. [API Documentation](#api-documentation)
12. [OAuth Setup](#oauth-setup)
13. [Language Support](#language-support)
14. [Architecture & Roadmap](#architecture--roadmap)

---

# 🚀 **QUICK START**

## Start the Application in 2 Minutes

### Prerequisites
- Node.js 16+
- MySQL Server running
- npm packages installed

### Start Backend
```bash
cd Backend
npm run dev
```

**Expected output:**
```
✅ Backend server is running on http://localhost:5174
✅ Frontend URL: http://localhost:5173
Database connected successfully
```

### Start Frontend
```bash
cd Frontend
npm run dev
```

**Expected output:**
```
VITE v5.0.0 running at:
  ➜  Local:   http://localhost:5173/
```

### Access Application
Open browser: **http://localhost:5173**

### Create Account
1. Click "Register"
2. Fill in details (name, email, password, role, location)
3. Submit
4. Login with credentials
5. Start managing your farm!

---

# 📊 **SYSTEM OVERVIEW**

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (React)                 │
│         Port 5173 | Vite | TypeScript               │
│  ┌──────────────────────────────────────────────┐   │
│  │  Dashboard | Crops | Calendar | Reports      │   │
│  │  Expenses | Yield | Irrigation | Weather     │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────┬──────────────────────────────────┘
                  │
              HTTP/REST
          JWT Authentication
                  │
┌─────────────────▼──────────────────────────────────┐
│                   BACKEND (Express)                │
│         Port 5174 | Node.js | TypeScript           │
│  ┌──────────────────────────────────────────────┐  │
│  │  Auth | Farms | Crops | Calendar | Reports  │  │
│  │  ML | Weather | Notifications | Admin       │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────┬──────────────────────────────────┘
                  │
              MySQL Protocol
          Connection Pool (10)
                  │
┌─────────────────▼──────────────────────────────────┐
│                   MYSQL DATABASE                   │
│  25 Tables | Optimized Indexes | Auto-Init        │
│  ┌──────────────────────────────────────────────┐  │
│  │  Users | Farms | Crops | Expenses | Yields  │  │
│  │  Calendar | Weather | Reports | Logs        │  │
│  └──────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

# 🎯 **GETTING STARTED**

## Step 1: Prerequisites Setup

### Install Node.js
- Download from https://nodejs.org/ (v16 or higher)
- Verify: `node --version`

### Install MySQL
- Download from https://mysql.com/ (v5.7 or higher)
- Start MySQL service
- Verify: `mysql -u root -p` (should connect)

### Install npm Dependencies

```bash
# Frontend dependencies
cd Frontend
npm install

# Backend dependencies
cd ../Backend
npm install
```

## Step 2: Database Setup

### Create Database
```bash
mysql -u root -p

# In MySQL console:
CREATE DATABASE IF NOT EXISTS farmsync_db;
EXIT;
```

## Step 3: Environment Configuration

### Backend .env File
Create `Backend/.env`:

```
NODE_ENV=development
PORT=5174
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=farmsync_db
DB_USER=root
DB_PASSWORD=123456

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=7d

# Session
SESSION_SECRET=your-session-secret-change-in-production
```

See `Backend/ENV_TEMPLATE.md` for complete configuration options.

## Step 4: Start Application

### Terminal 1 - Backend
```bash
cd Backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd Frontend
npm run dev
```

### Verify All Running
```bash
# Backend health check
curl http://localhost:5174/health
# Expected: {"status":"ok","timestamp":"..."}

# Database check
curl http://localhost:5174/health/database
# Expected: Connection successful message
```

---

# 💻 **FRONTEND SETUP**

## Technology Stack
- **Framework:** React 18+
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Internationalization:** react-i18next
- **Routing:** react-router-dom
- **State Management:** React Context API
- **HTTP Client:** Custom API Service

## Project Structure

```
Frontend/
├── src/
│   ├── components/          # 26 React components
│   ├── pages/              # 20 page components
│   ├── context/            # Auth & Theme context
│   ├── services/           # API service (api.ts)
│   ├── i18n/               # Internationalization
│   │   ├── config.ts       # i18n configuration
│   │   └── locales/        # 6 language files
│   │       ├── en.json     # English
│   │       ├── hi.json     # Hindi
│   │       ├── ta.json     # Tamil
│   │       ├── te.json     # Telugu
│   │       ├── kn.json     # Kannada
│   │       └── ml.json     # Malayalam
│   ├── utils/              # Utility functions
│   ├── hooks/              # Custom hooks
│   ├── types/              # TypeScript types
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
└── package.json            # Dependencies
```

## Key Pages
- **Dashboard** - Overview and statistics
- **Crop Management** - Add, edit, delete crops
- **Calendar** - Event scheduling and planning
- **Expenses** - Track farm expenses
- **Yield Tracking** - Record crop yields
- **Irrigation** - Schedule irrigation
- **Weather** - Weather information and alerts
- **Reports** - Generate reports
- **Settings** - User preferences
- **Profile** - User profile management
- **Admin Dashboard** - Admin features (admin users only)

## Running Frontend

```bash
cd Frontend

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Frontend Features
✅ Responsive design (mobile & desktop)
✅ Dark mode / Light mode
✅ 6-language support with instant switching
✅ Real-time form validation
✅ Error handling and user feedback
✅ Loading states
✅ Authentication protection
✅ Modern UI with Tailwind CSS

---

# 🖥️ **BACKEND SETUP**

## Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MySQL
- **Authentication:** JWT + Passport.js
- **Password Hashing:** bcrypt
- **Security:** Helmet.js, CORS, Rate Limiting
- **Logging:** Custom logger

## Project Structure

```
Backend/
├── src/
│   ├── config/             # Configuration files
│   │   ├── database.ts     # MySQL connection pool
│   │   └── env.ts          # Environment config
│   ├── controllers/        # 28 route controllers
│   ├── routes/             # 29 route files
│   ├── models/             # Data models
│   ├── services/           # Business logic
│   ├── middleware/         # Express middleware
│   ├── database/           # Database scripts
│   │   ├── schema.sql      # Database schema
│   │   ├── seed.ts         # Data seeding
│   │   └── migrate.ts      # Migrations
│   ├── utils/              # Utility functions
│   ├── scripts/            # Helper scripts
│   └── server.ts           # Server entry point
├── ml/                     # Machine Learning
│   ├── crop_recommendation_model.pkl
│   ├── predict.py
│   └── train_model.py
├── uploads/                # User uploads
├── Dataset/                # Crop data
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript config
```

## Key Features
✅ RESTful API with 150+ endpoints
✅ JWT authentication (7-day expiry)
✅ OAuth integration (Google, Apple, Microsoft)
✅ Two-factor authentication
✅ Audit logging
✅ Health check system
✅ ML crop recommendations
✅ Weather integration
✅ Email notifications
✅ WhatsApp integration
✅ SMS integration

## Running Backend

```bash
cd Backend

# Development mode
npm run dev

# Build TypeScript
npm tsc

# Start production server
npm start

# Run database migrations
npm run migrate
```

## Health Check Endpoints

```bash
# Basic health check
curl http://localhost:5174/health

# Database connection
curl http://localhost:5174/health/database

# List all tables
curl http://localhost:5174/health/tables

# Database statistics (requires auth)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5174/health/stats

# Frontend-backend connection
curl http://localhost:5174/health/frontend-connection
```

---

# 🗄️ **DATABASE SETUP**

## Database Schema (25 Tables)

### Authentication Tables
- **users** - User accounts (farmers & admins)
- **sessions** - User session tracking
- **password_reset_tokens** - Password reset tokens
- **two_factor_auth** - 2FA settings

### Farm Management Tables
- **farms** - Farm records
- **fields** - Field information
- **soil_types** - Soil type definitions

### Crop Management Tables
- **crop_types** - Crop type definitions
- **crops** - Individual crop records
- **crop_calendar** - Crop calendar events

### Operations Tables
- **expenses** - Farm expenses
- **yields** - Crop yields
- **irrigations** - Irrigation records
- **fertilizers** - Fertilizer applications
- **pesticides** - Pesticide applications
- **stock_items** - Inventory items
- **monthly_stock_usage** - Monthly stock tracking
- **monthly_income** - Monthly income records

### Alerts & Events Tables
- **weather_alerts** - Weather notifications
- **calendar_events** - Scheduled events
- **market_price_alerts** - Price alerts

### System Tables
- **audit_logs** - Activity logs
- **push_subscriptions** - Push notifications
- **recommendations** - ML recommendations
- **disease_scans** - Disease scan records
- **user_settings** - User preferences

## Database Connection

**File:** `Backend/src/config/database.ts`

```typescript
const poolConfig = {
  host: 'localhost',
  port: 3306,
  database: 'farmsync_db',
  user: 'root',
  password: '123456',
  connectionLimit: 10,  // Connection pool size
  waitForConnections: true,
  queueLimit: 0,
};
```

## Database Initialization

The backend automatically initializes the database on startup:
1. Creates all tables
2. Creates optimized indexes
3. Seeds initial data (soil types, crop types)
4. Logs statistics

**File:** `Backend/src/database/initializeDatabase.ts`

---

# 🔗 **FRONTEND-BACKEND CONNECTION**

## API Configuration

**File:** `Frontend/src/services/api.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5174/api';
```

## Features
✅ Automatic JWT token inclusion
✅ Error handling and user feedback
✅ 15-second request timeout
✅ Automatic retry on failure
✅ Network error detection
✅ Authentication error handling

## Common API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Farms & Fields
- `GET /api/farms` - Get all farms
- `POST /api/farms` - Create farm
- `GET /api/fields` - Get all fields
- `POST /api/fields` - Create field

### Crops
- `GET /api/crops` - Get all crops
- `POST /api/crops` - Create crop
- `GET /api/crops/types` - Get crop types

### Operations
- `GET /api/expenses` - Get expenses
- `POST /api/expenses` - Add expense
- `GET /api/yields` - Get yields
- `POST /api/yields` - Record yield

### Calendar & Events
- `GET /api/calendar/events` - Get events
- `POST /api/calendar/events` - Create event
- `GET /api/weather/alerts` - Get alerts

### Reports
- `GET /api/reports/summary` - Summary report
- `POST /api/reports/custom` - Custom report

## CORS Configuration

**File:** `Backend/src/server.ts`

Allowed origins:
- http://localhost:5173
- http://localhost:5174
- http://127.0.0.1:5173
- http://127.0.0.1:5174

---

# 🚀 **DEPLOYMENT GUIDE**

## Production Environment Setup

### Prerequisites
- Linux server (Ubuntu 20.04+)
- Node.js 16+
- MySQL 5.7+
- Nginx or Apache
- SSL certificate (Let's Encrypt)

### Environment Variables for Production

```
NODE_ENV=production
PORT=5174
FRONTEND_URL=https://yourdomain.com

DB_HOST=your-db-host
DB_PORT=3306
DB_NAME=farmsync_db
DB_USER=db_user
DB_PASSWORD=strong-password

JWT_SECRET=generate-long-random-string
SESSION_SECRET=generate-long-random-string

# OAuth (if using)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Deployment Steps

1. **Build Frontend**
   ```bash
   cd Frontend
   npm run build
   ```

2. **Upload Files**
   ```bash
   scp -r Frontend/dist user@server:/app/frontend
   scp -r Backend user@server:/app/backend
   ```

3. **Install Dependencies**
   ```bash
   cd /app/backend
   npm install --production
   ```

4. **Setup Environment**
   ```bash
   cd /app/backend
   cp .env.example .env
   # Edit .env with production values
   ```

5. **Build Backend**
   ```bash
   npm run build
   ```

6. **Setup Database**
   ```bash
   mysql -u root -p < Backend/src/database/schema.sql
   ```

7. **Start Services**
   ```bash
   # Using PM2 for Node.js
   pm2 start npm --name "farmsync-backend" -- start
   ```

8. **Configure Nginx**
   ```nginx
   upstream backend {
     server 127.0.0.1:5174;
   }

   server {
     listen 443 ssl;
     server_name yourdomain.com;

     ssl_certificate /path/to/cert.pem;
     ssl_certificate_key /path/to/key.pem;

     # Frontend
     root /app/frontend/dist;
     location / {
       try_files $uri /index.html;
     }

     # Backend API
     location /api {
       proxy_pass http://backend;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }
   ```

---

# ✨ **FEATURES & INVENTORY**

## Dashboard
✅ Summary statistics
✅ Quick access widgets
✅ Real-time data updates
✅ Customizable view

## Farm Management
✅ Create/edit/delete farms
✅ Track land size
✅ Soil type management
✅ Location tracking
✅ Field management

## Crop Management
✅ Add crops with type
✅ Sowing & harvest dates
✅ Crop status tracking
✅ Crop calendar events
✅ Yield prediction

## Calendar
✅ Event scheduling
✅ Month view
✅ Week view
✅ Day view
✅ Multi-language support
✅ Event notifications

## Irrigation Management
✅ Schedule irrigation
✅ Track water usage
✅ Irrigation history
✅ Recommendations

## Fertilizer & Pesticide
✅ Log applications
✅ Track usage
✅ Historical records
✅ Reminders

## Expense Tracking
✅ Log all expenses
✅ Categorize expenses
✅ Budget tracking
✅ Reports & analytics

## Yield Tracking
✅ Record yields
✅ Historical data
✅ Yield analysis
✅ Predictions

## Weather & Alerts
✅ Current weather
✅ Weather forecast
✅ Climate alerts
✅ Notifications

## Reports & Analytics
✅ Summary reports
✅ Custom reports
✅ Financial analysis
✅ Crop performance
✅ Export to Excel

## Admin Features
✅ User management
✅ System statistics
✅ Audit logs
✅ Activity monitoring
✅ Database management

## Security Features
✅ JWT authentication
✅ OAuth integration
✅ Two-factor authentication
✅ Password reset
✅ Session management
✅ Audit logging
✅ Rate limiting
✅ CORS protection

---

# 🐛 **TROUBLESHOOTING**

## Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Solutions:**
1. Verify backend is running: `curl http://localhost:5174/health`
2. Check CORS configuration
3. Verify frontend API URL
4. Check firewall settings

### Issue: "Database connection failed"
**Solutions:**
1. Verify MySQL is running: `mysql -u root -p`
2. Check credentials in `.env`
3. Ensure database exists: `SHOW DATABASES;`
4. Check MySQL user permissions

### Issue: "Port 5173/5174 already in use"
**Solutions:**
```bash
# Find process using port
netstat -ano | findstr :5174

# Kill process
taskkill /PID <PID> /F
```

### Issue: "Tables not found"
**Solutions:**
1. Backend auto-creates tables on startup
2. Check backend console for errors
3. Restart backend
4. Verify database user has create permission

### Issue: "Authentication errors"
**Solutions:**
1. Ensure JWT_SECRET is set in `.env`
2. Clear browser localStorage: `localStorage.clear()`
3. Login again
4. Check token expiry (default 7 days)

### Issue: "Language not switching"
**Solutions:**
1. Clear browser cache
2. Check locale files are valid JSON
3. Verify i18n configuration
4. Restart frontend

### Issue: "Performance issues"
**Solutions:**
1. Check database indexes
2. Monitor database size
3. Clear old audit logs
4. Optimize queries
5. Scale resources

---

# 📡 **API DOCUMENTATION**

## Authentication Endpoints

### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Farmer",
  "email": "john@farm.com",
  "password": "SecurePass123!",
  "role": "farmer",
  "location": "India"
}

Response:
{
  "token": "jwt-token",
  "user": { user object },
  "message": "Registration successful"
}
```

### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@farm.com",
  "password": "SecurePass123!"
}

Response:
{
  "token": "jwt-token",
  "user": { user object },
  "message": "Login successful"
}
```

### Get Profile
```
GET /api/auth/profile
Authorization: Bearer jwt-token

Response:
{
  "id": "user-id",
  "name": "John Farmer",
  "email": "john@farm.com",
  "role": "farmer",
  "location": "India"
}
```

## Farm Endpoints

### Get All Farms
```
GET /api/farms
Authorization: Bearer jwt-token

Response:
{
  "data": [
    {
      "id": "farm-id",
      "name": "North Field",
      "location": "India",
      "land_size": 10.5,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### Create Farm
```
POST /api/farms
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "name": "North Field",
  "location": "India",
  "land_size": 10.5,
  "soil_type_id": "soil-type-id"
}

Response:
{
  "data": { farm object },
  "message": "Farm created successfully"
}
```

## Similar endpoints available for:
- Crops
- Expenses
- Yields
- Calendar Events
- Weather
- Reports
- And more...

---

# 🔐 **OAUTH SETUP**

## Google OAuth

### Step 1: Create Google Project
1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable Google+ API

### Step 2: Create OAuth Credentials
1. Go to Credentials
2. Create OAuth 2.0 Client ID
3. Set Authorized redirect URIs:
   - http://localhost:5174/api/auth/google/callback
   - https://yourdomain.com/api/auth/google/callback

### Step 3: Update .env
```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_CALLBACK_URL=http://localhost:5174/api/auth/google/callback
```

## Apple OAuth & Microsoft OAuth

Follow similar steps for Apple and Microsoft OAuth setup.

---

# 🌐 **LANGUAGE SUPPORT**

## Supported Languages
- 🇮🇳 English
- 🇮🇳 Hindi (हिन्दी)
- 🇮🇳 Tamil (தமிழ்)
- 🇮🇳 Telugu (తెలుగు)
- 🇮🇳 Kannada (ಕನ್ನಡ)
- 🇮🇳 Malayalam (മലയാളം)

## Translation Files

All translations located in `Frontend/src/i18n/locales/`:
- `en.json` - English (800+ keys)
- `hi.json` - Hindi (800+ keys)
- `ta.json` - Tamil (800+ keys)
- `te.json` - Telugu (800+ keys)
- `kn.json` - Kannada (800+ keys)
- `ml.json` - Malayalam (800+ keys)

## Language Switching
1. Click language selector (top-right)
2. Select desired language
3. UI updates instantly
4. Preference saved to localStorage

## Adding New Translations
1. Add key-value pair to `en.json`
2. Add corresponding translations to other language files
3. Use `t('key')` in React components
4. Test in all languages

---

# 🗺️ **ARCHITECTURE & ROADMAP**

## Current Architecture
✅ Monolithic backend with microservices-ready design
✅ Single Page Application (SPA) frontend
✅ Centralized MySQL database
✅ RESTful API
✅ JWT-based authentication

## Scalability Plan
- [ ] Split backend into microservices
- [ ] Implement caching (Redis)
- [ ] Add message queue (RabbitMQ)
- [ ] Implement CDN for static files
- [ ] Add ElasticSearch for search
- [ ] Implement GraphQL API

## Feature Roadmap
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced analytics dashboard
- [ ] Crop disease detection (Computer Vision)
- [ ] Predictive analytics
- [ ] Community features
- [ ] Marketplace integration
- [ ] IoT sensor integration

---

## 📞 **QUICK REFERENCE**

### Essential Commands

```bash
# Backend startup
cd Backend && npm run dev

# Frontend startup
cd Frontend && npm run dev

# Build frontend
cd Frontend && npm run build

# Database backup
mysqldump -u root -p farmsync_db > backup.sql

# Database restore
mysql -u root -p farmsync_db < backup.sql

# View database tables
mysql -u root -p -e "USE farmsync_db; SHOW TABLES;"

# Clear frontend cache
rm -rf Frontend/node_modules && npm install

# Clear backend cache
rm -rf Backend/node_modules && npm install
```

### Port Reference
- Frontend: **5173** (http://localhost:5173)
- Backend: **5174** (http://localhost:5174)
- MySQL: **3306** (localhost:3306)

### Default Credentials
- Database User: **root**
- Database Password: **123456**
- Database Name: **farmsync_db**

---

## ✅ **VERIFICATION CHECKLIST**

Before deploying to production:

- [ ] Update all `.env` variables for production
- [ ] Change JWT_SECRET to strong random value
- [ ] Change SESSION_SECRET to strong random value
- [ ] Update database credentials
- [ ] Enable HTTPS
- [ ] Configure production CORS origins
- [ ] Set up database backups
- [ ] Configure email settings
- [ ] Test all OAuth providers
- [ ] Monitor logs and errors
- [ ] Performance test
- [ ] Security audit

---

**🌾 Happy Farming with FarmSync! 🌾**

For detailed information on specific topics, refer to individual documentation files in the `docs/` directory.

---

**Version:** 1.0.0  
**Last Updated:** January 15, 2025  
**Status:** ✅ Production Ready  
**Maintained By:** FarmSync Development Team  

