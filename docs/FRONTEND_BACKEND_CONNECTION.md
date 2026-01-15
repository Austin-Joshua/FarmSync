# FarmSync Frontend-Backend Connection Guide

## 📋 Overview

This guide explains how the FarmSync frontend and backend are connected, and how to verify the connection is working properly.

## 🔗 Connection Architecture

```
Frontend (React + Vite)
    ↓
API Service (src/services/api.ts)
    ↓
HTTP Requests (REST API)
    ↓
Backend (Node.js + Express)
    ↓
Database (MySQL)
```

## 🛠️ Configuration

### Frontend Configuration

**File:** `Frontend/src/services/api.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5174/api';
```

### Backend Configuration

**File:** `Backend/src/config/database.ts`

Database connection settings:
- **Host:** localhost (or from DB_HOST env var)
- **Port:** 3306 (or from DB_PORT env var)
- **Database:** farmsync_db (or from DB_NAME env var)
- **User:** root (or from DB_USER env var)
- **Password:** 123456 (or from DB_PASSWORD env var)

## ✅ Verification Steps

### 1. Check Backend Status

```bash
# Backend health check
curl http://localhost:5174/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-15T..."}
```

### 2. Check Database Connection

```bash
# Database health check
curl http://localhost:5174/health/database

# Expected response:
# {
#   "status":"✅ Connected",
#   "database":"farmsync_db",
#   "host":"localhost",
#   "port":"3306"
# }
```

### 3. Verify All Tables

```bash
# Check if all required tables exist
curl http://localhost:5174/health/tables

# Expected response includes list of tables:
# {
#   "status":"✅ Success",
#   "tableCount":25,
#   "tables":["users","farms","crops","..."]
# }
```

### 4. Check Frontend Connection (Authenticated)

```bash
# Note: This requires authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5174/health/frontend-connection

# Expected response:
# {
#   "status":"✅ Frontend-Backend Connection OK",
#   "frontend":"http://localhost:5173",
#   "backend":"http://localhost:5174",
#   "database":"✅ Connected"
# }
```

### 5. Get Database Statistics (Authenticated)

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5174/health/stats

# Returns count of records in each table
```

## 🚀 Starting the Application

### Start Backend

```bash
# From Backend directory
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
# From Frontend directory
cd Frontend
npm run dev
```

**Expected output:**
```
VITE v5.0.0 running at:
  ➜  Local:   http://localhost:5173/
```

## 📊 API Endpoints Available

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Farms & Fields
- `GET /api/farms` - Get all farms
- `POST /api/farms` - Create new farm
- `GET /api/fields` - Get all fields
- `POST /api/fields` - Create new field

### Crops
- `GET /api/crops` - Get all crops
- `POST /api/crops` - Create new crop
- `GET /api/crops/types` - Get crop types

### Management
- `GET /api/expenses` - Get expenses
- `GET /api/yields` - Get yields
- `GET /api/irrigations` - Get irrigations
- `GET /api/fertilizers` - Get fertilizers
- `GET /api/pesticides` - Get pesticides

### Calendar & Weather
- `GET /api/calendar/events` - Get calendar events
- `GET /api/weather/current` - Get current weather
- `GET /api/weather/alerts` - Get weather alerts

### Reports
- `GET /api/reports/summary` - Get summary report
- `POST /api/reports/custom` - Get custom report

### ML & Recommendations
- `POST /api/ml/recommend` - Get crop recommendation
- `GET /api/ml/history` - Get recommendation history

### Admin
- `GET /api/admin/statistics` - Get admin statistics
- `GET /api/audit-logs` - Get audit logs

## 🔍 Common Issues & Solutions

### Issue: "Failed to connect to server"

**Cause:** Backend is not running or wrong port

**Solution:**
1. Verify backend is running on port 5174
2. Check `VITE_API_URL` environment variable
3. Ensure no firewall blocking the connection

### Issue: "Database connection error"

**Cause:** MySQL not running or wrong credentials

**Solution:**
1. Verify MySQL is running
2. Check database credentials in `.env`
3. Ensure database `farmsync_db` exists
4. Run: `curl http://localhost:5174/health/database`

### Issue: "CORS error"

**Cause:** Frontend and backend on different origins

**Solution:**
1. Frontend runs on `http://localhost:5173`
2. Backend runs on `http://localhost:5174`
3. Both are allowed in CORS configuration
4. Check `Backend/src/server.ts` for CORS setup

### Issue: "401 Unauthorized"

**Cause:** Missing or invalid authentication token

**Solution:**
1. Login first to get token
2. Token stored in localStorage as `token`
3. Ensure token is included in API requests
4. Check token expiry (default 7 days)

## 📝 Database Tables

Essential tables for the connection:

```
users          - User accounts (farmers & admins)
farms          - Farm information
fields         - Individual fields in farms
crops          - Crop records
crop_types     - Crop type definitions
expenses       - Farm expenses
yields         - Crop yields
irrigations    - Irrigation records
fertilizers    - Fertilizer applications
pesticides     - Pesticide applications
weather_alerts - Weather notifications
calendar_events- Scheduled events
audit_logs     - System activity logs
stock_items    - Inventory tracking
sessions       - User sessions
password_reset_tokens - Password reset tokens
two_factor_auth- Two-factor authentication
push_subscriptions - Push notification subscriptions
```

## 🔄 Data Flow Example

### User Registration Flow

```
1. Frontend: User fills registration form
2. Frontend: POST /api/auth/register (name, email, password, role)
3. Backend: Validate input
4. Backend: Hash password
5. Backend: Check if email already exists
6. Backend: Create new user in database
7. Backend: Generate JWT token
8. Backend: Return token and user data
9. Frontend: Save token to localStorage
10. Frontend: Redirect to dashboard
```

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ Two-factor authentication support
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Audit logging
- ✅ Session management

## 📚 Additional Resources

- [Backend README](./Backend/README.md)
- [Database Structure](../docs/DATABASE_STRUCTURE.md)
- [API Documentation](../docs/FEATURES_GUIDE.md)
- [Deployment Guide](../docs/DEPLOYMENT_GUIDE.md)

## 🎯 Testing the Connection

### Using Thunder Client or Postman

1. **Import Collection:** Backend API endpoints
2. **Set Variables:**
   - `baseUrl` = `http://localhost:5174/api`
   - `token` = [your JWT token from login]
3. **Test Endpoints:**
   - GET `/health` - Simple health check
   - GET `/health/database` - Database check
   - POST `/auth/login` - Authenticate
   - GET `/farms` - Get farms (requires auth)

---

**Last Updated:** January 2025
**Version:** 1.0.0
