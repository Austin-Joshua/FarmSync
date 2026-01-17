# Railway Database Setup Guide for FarmSync Backend

## Overview
Railway provides a simple, integrated way to deploy and manage MySQL databases. This guide will help you set up a MySQL database on Railway and connect it to the FarmSync backend.

---

## Step 1: Create Railway Account

1. **Visit Railway**: Go to https://railway.app
2. **Sign Up**: Click "Sign Up" and create an account
   - You can sign up with GitHub, Google, or email
   - GitHub signup is recommended for easier deployment later

---

## Step 2: Create a New Project

1. **Create Project**: Click "New Project" button
2. **Choose Template**: Select "Provision MySQL" or "MySQL"
3. **Project Name**: Enter a name like `farmsync-db`
4. **Region**: Select the region closest to your users

---

## Step 3: Configure MySQL Database

### Initial Setup
After selecting MySQL, Railway will:
- Create a new MySQL database instance
- Generate default credentials
- Provide connection details

### View Credentials

1. **Open your Railway project**
2. **Click on MySQL service** (should be listed on the left)
3. **Go to "Variables" tab**
4. **You'll see:**
   - `MYSQLHOST` - Database host
   - `MYSQLPORT` - Database port (usually 3306)
   - `MYSQLUSER` - Database user (usually `root`)
   - `MYSQLPASSWORD` - Database password
   - `MYSQLDATABASE` - Database name

### Copy Your Credentials

```
Host: (Copy MYSQLHOST value)
Port: (Copy MYSQLPORT value, usually 3306)
User: (Copy MYSQLUSER value)
Password: (Copy MYSQLPASSWORD value)
Database: (Copy MYSQLDATABASE value)
```

---

## Step 4: Update Backend Environment Variables

### Option A: Local Development (.env file)

1. **Navigate to Backend folder:**
   ```bash
   cd Backend
   ```

2. **Create or update `.env` file:**
   ```bash
   # Create file if it doesn't exist
   touch .env
   ```

3. **Add Railway database credentials:**
   ```env
   # Database Configuration (Railway)
   DB_HOST=your_railway_host_here
   DB_PORT=3306
   DB_USER=your_railway_user_here
   DB_PASSWORD=your_railway_password_here
   DB_NAME=your_railway_database_name_here
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRES_IN=7d
   
   # Optional: API Keys
   # OPENWEATHER_API_KEY=your_key_here
   # GOOGLE_CLIENT_ID=your_key_here
   # GOOGLE_CLIENT_SECRET=your_key_here
   ```

4. **Save the file** (do NOT commit this file - it's in .gitignore)

### Option B: Environment Variables Format

If using a different file format, use these variable names:
- `DB_HOST` - Railway MYSQLHOST
- `DB_PORT` - Railway MYSQLPORT
- `DB_USER` - Railway MYSQLUSER
- `DB_PASSWORD` - Railway MYSQLPASSWORD
- `DB_NAME` - Railway MYSQLDATABASE

---

## Step 5: Verify Connection Locally

### 1. **Start Backend Server:**
   ```bash
   npm run dev
   ```

### 2. **Test Database Connection:**
   
   Open your browser or use curl:
   ```bash
   curl http://localhost:5000/api/db-test
   ```

### 3. **Expected Success Response:**
   ```json
   {
     "status": "success",
     "message": "Database connection successful",
     "database": {
       "host": "your_railway_host",
       "port": "3306",
       "name": "your_database_name"
     },
     "query": "SELECT 1",
     "result": [{"test": 1}],
     "responseTime": "45ms",
     "timestamp": "2026-01-17T12:30:00.000Z"
   }
   ```

### 4. **If Connection Fails:**
   
   Check these error codes:
   - **401**: Wrong username or password
   - **404**: Database name doesn't exist
   - **503**: Cannot connect to host (check host/port)
   - **504**: Connection timeout

---

## Step 6: Initialize Database Schema

### Option A: Using Existing Migration Script

1. **Run setup script:**
   ```bash
   npm run setup-db
   ```

2. **Or run migrations:**
   ```bash
   npm run migrate
   ```

3. **Verify tables created:**
   ```bash
   npm run verify-db
   ```

### Option B: Manual SQL Execution

1. **Connect to Railway MySQL:**
   ```bash
   mysql -h your_railway_host -P 3306 -u your_user -p
   # Enter password when prompted
   ```

2. **Select database:**
   ```sql
   USE your_database_name;
   ```

3. **Run schema SQL:**
   - Open `Backend/src/database/schema.sql`
   - Copy all SQL commands
   - Paste in MySQL terminal

---

## Step 7: Test All Endpoints

### Test Health Endpoints

```bash
# Basic health check
curl http://localhost:5000/health

# Database test
curl http://localhost:5000/api/db-test

# Database health check
curl http://localhost:5000/api/health/database

# Check tables
curl http://localhost:5000/api/health/tables
```

### Test with Frontend

1. **Start Frontend:**
   ```bash
   cd Frontend
   npm run dev
   ```

2. **Open browser:** http://localhost:5173

3. **Try registering or logging in** to test full database integration

---

## Step 8: Production Deployment (Optional)

### Deploy Backend to Railway

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Connect to Railway database"
   git push origin main
   ```

2. **In Railway Dashboard:**
   - Click "New Service"
   - Select "GitHub Repo"
   - Select `FarmSync` repository
   - Select `Backend` as root directory

3. **Add Environment Variables in Railway:**
   - Go to Backend service → Variables
   - Add all DB credentials from step 3
   - Add other environment variables (JWT_SECRET, etc.)

4. **Railway will auto-deploy** whenever you push to main branch

---

## Troubleshooting

### Connection Issues

**Problem: "Connection refused"**
- Check if Railway database is running
- Verify host and port are correct
- Ensure IP whitelist allows your IP (Railway allows all by default)

**Problem: "Access denied for user"**
- Double-check username and password
- Ensure password doesn't have special characters needing escaping
- Try creating new database user in Railway

**Problem: "Unknown database"**
- Verify database name is correct
- Create database if it doesn't exist:
  ```sql
  CREATE DATABASE your_database_name;
  ```

**Problem: "Connection timeout"**
- Check network connectivity
- Try increasing connection timeout in code
- Railway might be having issues - check status page

### SSL/Certificate Errors

Railway requires SSL connections. The backend is configured with:
```typescript
ssl: {
  rejectUnauthorized: false,
}
```

This is safe for Railway as it's a managed service. For production, consider:
```typescript
ssl: {
  rejectUnauthorized: true,
}
```

---

## Database Credentials Checklist

Before testing, verify you have:
- [ ] Database Host (from Railway MYSQLHOST)
- [ ] Database Port (usually 3306)
- [ ] Database User (usually root)
- [ ] Database Password (from Railway MYSQLPASSWORD)
- [ ] Database Name (from Railway MYSQLDATABASE)
- [ ] All values added to `.env` file
- [ ] Backend restarted after updating `.env`

---

## File Structure Reference

```
Backend/
├── .env                      ← Add your Railway credentials here
├── config/
│   └── db.js                ← JavaScript connection file
├── src/
│   ├── config/
│   │   ├── database.ts      ← TypeScript connection file (UPDATED with SSL)
│   │   └── env.ts           ← Environment variable configuration
│   ├── database/
│   │   ├── schema.sql       ← Database schema
│   │   ├── setupDatabase.ts ← Initialize database
│   │   └── migrate.ts       ← Run migrations
│   ├── routes/
│   │   └── dbTestRoutes.ts  ← Test endpoint (GET /api/db-test)
│   └── server.ts            ← Main server file
└── package.json
```

---

## Environment Variables Summary

| Variable | Example | Source |
|----------|---------|--------|
| `DB_HOST` | `mysql.railway.internal` | Railway MYSQLHOST |
| `DB_PORT` | `3306` | Railway MYSQLPORT |
| `DB_USER` | `root` | Railway MYSQLUSER |
| `DB_PASSWORD` | `abc123xyz...` | Railway MYSQLPASSWORD |
| `DB_NAME` | `railway` | Railway MYSQLDATABASE |
| `PORT` | `5000` | Backend server port |
| `JWT_SECRET` | `your_secret_key` | Generate yourself |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend address |

---

## Next Steps

After successful connection:

1. **Run database initialization:**
   ```bash
   npm run setup-db
   ```

2. **Test all API endpoints** with your frontend

3. **Deploy to production** when ready (optional)

4. **Set up backups** in Railway dashboard for production databases

---

## Support

### Railway Documentation
- https://docs.railway.app/
- https://docs.railway.app/deploy/mysql

### FarmSync Endpoints to Test
- `GET /api/db-test` - Database connection test
- `GET /health` - Server health check
- `GET /api/health/database` - Database health
- `GET /api/health/tables` - List all tables

---

## Security Notes

✅ **Good Practices:**
- Keep `.env` file local (never commit)
- Use strong passwords
- Rotate passwords regularly
- Use environment variables for all secrets
- Enable database backups

⚠️ **Warning:**
- Don't share `.env` file
- Don't hardcode credentials
- Use SSL in production
- Regularly update dependencies

---

**Last Updated:** January 17, 2026
**FarmSync Backend v1.0.0**
