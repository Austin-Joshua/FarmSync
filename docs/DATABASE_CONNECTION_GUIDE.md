# Database Connection & Initialization Guide

## 📋 Quick Start

This guide helps you set up and verify the FarmSync database connection.

## 🔧 Prerequisites

Before starting, ensure you have:

- ✅ Node.js (v16+)
- ✅ MySQL Server running
- ✅ npm packages installed (`npm install` in both Frontend and Backend)

## 🚀 Step-by-Step Setup

### Step 1: Database Setup

**Verify MySQL is running:**

```bash
# Windows
# Open Services and ensure MySQL80 (or your version) is running

# macOS
mysql.server status

# Linux
sudo systemctl status mysql
```

### Step 2: Create Database

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE IF NOT EXISTS farmsync_db;

# Verify creation
SHOW DATABASES;

# Exit
EXIT;
```

### Step 3: Environment Configuration

**Backend Configuration:**

```bash
# Copy and modify Backend/.env
# Update these values:
DB_HOST=localhost
DB_PORT=3306
DB_NAME=farmsync_db
DB_USER=root
DB_PASSWORD=123456
PORT=5174
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key
```

### Step 4: Initialize Database Schema

**Option A: Automatic Initialization (Recommended)**

The backend automatically initializes the database on startup using `initializeDatabase.ts`.

When you start the backend:
1. Schema is created automatically
2. Indexes are built
3. Initial data is seeded

**Option B: Manual Initialization**

```bash
# In Backend directory
npm run migrate
```

### Step 5: Verify Connection

**Check Backend is Running:**

```bash
curl http://localhost:5174/health
# Expected: {"status":"ok","timestamp":"..."}
```

**Check Database Connection:**

```bash
curl http://localhost:5174/health/database
# Expected: {"status":"✅ Connected","database":"farmsync_db",...}
```

**Check Tables:**

```bash
curl http://localhost:5174/health/tables
# Expected: List of all database tables
```

## 📊 Database Schema Overview

The FarmSync database includes these main tables:

### Authentication & Users
- **users** - User accounts
- **sessions** - Active sessions
- **password_reset_tokens** - Password reset tokens
- **two_factor_auth** - 2FA settings

### Farm Management
- **farms** - Farm records
- **fields** - Field information
- **soil_types** - Soil type definitions

### Crop Management
- **crop_types** - Crop type definitions
- **crops** - Individual crop records

### Operations Tracking
- **expenses** - Farm expenses
- **yields** - Crop yields
- **irrigations** - Irrigation records
- **fertilizers** - Fertilizer applications
- **pesticides** - Pesticide applications
- **stock_items** - Inventory items
- **monthly_stock_usage** - Monthly stock tracking

### Calendar & Alerts
- **calendar_events** - Scheduled events
- **crop_calendar** - Crop calendar events
- **weather_alerts** - Weather notifications
- **market_price_alerts** - Price alerts

### Administration
- **audit_logs** - System activity logs
- **push_subscriptions** - Push notification subscriptions
- **recommendations** - ML recommendations
- **disease_scans** - Disease scan records
- **user_settings** - User preferences

## 🔄 Data Relationships

```
users (1)
  ├── (N) farms
  │    ├── (N) fields
  │    ├── (N) crops
  │    │    ├── (N) fertilizers
  │    │    ├── (N) pesticides
  │    │    ├── (N) irrigations
  │    │    └── (N) yields
  │    └── (N) expenses
  ├── (N) calendar_events
  ├── (N) weather_alerts
  └── (N) audit_logs
```

## 🧪 Testing the Connection

### Test 1: Basic Health Check

```bash
curl -i http://localhost:5174/health
```

Expected Status: **200 OK**

### Test 2: Database Connection

```bash
curl -i http://localhost:5174/health/database
```

Expected Status: **200 OK** with database info

### Test 3: Get Tables

```bash
curl -i http://localhost:5174/health/tables
```

Expected Status: **200 OK** with list of tables

### Test 4: Authentication Test

```bash
# Register
curl -X POST http://localhost:5174/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!","role":"farmer"}'

# Should return token and user data
```

### Test 5: Authenticated Request

```bash
# Get profile (requires token from login/register)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5174/api/auth/profile
```

## 🐛 Troubleshooting

### Problem: "Cannot connect to MySQL"

**Solutions:**
1. Check if MySQL service is running
2. Verify credentials in `.env`
3. Try connecting manually: `mysql -u root -p`
4. Check MySQL port (default 3306)

### Problem: "Database does not exist"

**Solution:**
```bash
mysql -u root -p
CREATE DATABASE farmsync_db;
```

### Problem: "Tables not found"

**Solution:**
1. Stop the backend
2. Delete the database: `DROP DATABASE farmsync_db;`
3. Recreate: `CREATE DATABASE farmsync_db;`
4. Start the backend (auto-initialization will run)

### Problem: "CORS error in frontend"

**Solution:**
1. Ensure backend is running on `http://localhost:5174`
2. Frontend should be on `http://localhost:5173`
3. CORS is configured in `Backend/src/server.ts`

### Problem: "Timeout connecting to database"

**Solution:**
1. Increase timeout: `connectTimeout: 10000` in `database.ts`
2. Check network connection
3. Verify MySQL is accessible on the port

## 📈 Performance Optimization

The database includes optimized indexes for common queries:

```sql
-- User lookups
ALTER TABLE users ADD INDEX idx_email (email);
ALTER TABLE users ADD INDEX idx_role (role);

-- Farm queries
ALTER TABLE farms ADD INDEX idx_farmer_id (farmer_id);

-- Crop queries
ALTER TABLE crops ADD INDEX idx_farm_id (farm_id);
ALTER TABLE crops ADD INDEX idx_status (status);

-- Date range queries
ALTER TABLE expenses ADD INDEX idx_date (date);
ALTER TABLE calendar_events ADD INDEX idx_event_date (event_date);
```

## 🔐 Security Best Practices

1. **Never commit `.env`** - Use `.env.example` for template
2. **Change default credentials** - Update DB_PASSWORD in production
3. **Use strong JWT_SECRET** - Use random string in production
4. **Enable HTTPS** - Required for production
5. **Implement rate limiting** - Already configured
6. **Regular backups** - Set up automated backups

## 📱 Frontend Integration

The frontend connects to the backend through `Frontend/src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5174/api';

// Automatically includes JWT token in requests
// Handles authentication errors
// Manages timeouts and retries
```

## 🔍 Monitoring Database Health

### Check Database Size

```bash
mysql -u root -p -e "SELECT table_name, ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb FROM information_schema.TABLES WHERE table_schema = 'farmsync_db' ORDER BY (data_length + index_length) DESC;"
```

### Check Table Row Counts

```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5174/health/stats
```

### View Active Connections

```bash
mysql -u root -p -e "SHOW PROCESSLIST;"
```

## 📞 Support

If you encounter issues:

1. Check logs in `Backend/error.log`
2. Review this guide
3. Check GitHub Issues
4. Consult Database Structure documentation

---

**Last Updated:** January 2025
**Database Version:** MySQL 5.7+
**Connection Pool:** 10 concurrent connections
