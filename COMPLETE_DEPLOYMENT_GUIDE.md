# 🚀 FarmSync Complete Deployment Guide - AIVEN + VERCEL

## Complete Step-by-Step Process to Deploy Everything

---

# 📋 TABLE OF CONTENTS
1. [Step 1: Setup AIVEN MySQL Database](#step-1-setup-aiven-mysql-database)
2. [Step 2: Create Tables in AIVEN](#step-2-create-tables-in-aiven)
3. [Step 3: Deploy Backend to Vercel](#step-3-deploy-backend-to-vercel)
4. [Step 4: Deploy Frontend to Vercel](#step-4-deploy-frontend-to-vercel)
5. [Step 5: Connect Frontend to Backend](#step-5-connect-frontend-to-backend)
6. [Step 6: Final Testing](#step-6-final-testing)

**Total Time: ~45 minutes**

---

# STEP 1: Setup AIVEN MySQL Database

## ⏱️ Time: 10 minutes

### 1.1 Create AIVEN Account

1. Open: https://aiven.io
2. Click **"Sign Up"** (top right)
3. Enter email and password
4. Click **"Sign Up"**
5. **Check your email** → Click verification link

### 1.2 Create MySQL Service

1. After logging in, click **"+ New service"** button (top right)
2. Select **"MySQL"** from the list
3. Choose **FREE plan** (already selected by default)
4. **Select Region:** Choose closest to you
   - USA: `US East (N. Virginia)`
   - India: `Asia Pacific (Mumbai)`
   - Europe: `Europe (Frankfurt)`
5. **Service Name:** `farmsync-db`
6. Click **"Create service"**
7. **Wait 2-3 minutes** for database to initialize...

### 1.3 Get Your Database Credentials

1. Click your `farmsync-db` service
2. Left sidebar → Click **"Connection Information"**
3. You'll see:
   ```
   Host: [mysql-xxxx.aivencloud.com]
   Port: [3306]
   User: [avnadmin]
   Password: [XXXXXXXXXXXX]
   Database: defaultdb
   ```

**📝 SAVE THESE VALUES - You'll need them soon!**

```
DB_HOST: mysql-xxxx.aivencloud.com
DB_PORT: 3306
DB_USER: avnadmin
DB_PASSWORD: XXXXXXXXXXXX
DB_NAME: defaultdb (or create: farmsync_db)
```

---

# STEP 2: Create Tables in AIVEN

## ⏱️ Time: 5 minutes

### 2.1 Open Database Console

1. In AIVEN dashboard, click your `farmsync-db` service
2. Click **"Database"** tab (top menu)
3. Click **"Connect"** → **"MySQL Command Line"** or use **"Web Console"**

### 2.2 Create Database

If your database is `defaultdb`, create a new one:

```sql
CREATE DATABASE farmsync_db;
USE farmsync_db;
```

### 2.3 Create All Tables

Paste this entire SQL (all at once):

```sql
-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crops table
CREATE TABLE crops (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  variety VARCHAR(255),
  area_planted DECIMAL(10,2),
  planting_date DATE,
  expected_harvest DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Weather table
CREATE TABLE weather (
  id INT PRIMARY KEY AUTO_INCREMENT,
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  rainfall DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category VARCHAR(255),
  amount DECIMAL(10,2),
  date DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Income table
CREATE TABLE income (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  crop_id INT,
  amount DECIMAL(10,2),
  sale_date DATE,
  buyer_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (crop_id) REFERENCES crops(id)
);

-- Market Prices table
CREATE TABLE market_prices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  crop_name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2),
  market_location VARCHAR(255),
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Yield Tracking table
CREATE TABLE yield_tracking (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  crop_id INT,
  yield_amount DECIMAL(10,2),
  unit VARCHAR(50),
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (crop_id) REFERENCES crops(id)
);
```

Click **"Execute"** or press Enter to run all SQL

**✅ Tables created successfully!**

---

# STEP 3: Deploy Backend to Vercel

## ⏱️ Time: 10 minutes

### 3.1 Go to Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Sign in with GitHub

### 3.2 Create New Backend Project

1. Click **"Add New"** → **"Project"**
2. Click **"Import Git Repository"**
3. Find and select your **"FarmSync"** repository
4. Click **"Import"**

### 3.3 Configure Backend Project

**Project Settings:**

1. **Project Name:** `farmsync-api` (or `farm-sync-backend`)
2. **Root Directory:** Select **"Backend"** folder
3. **Framework Preset:** Select **"Node.js"**
4. **Build Command:** Keep default or use: `npm install`
5. **Start Command:** Keep default or use: `npm run dev`

### 3.4 Add Environment Variables

Click **"Add More"** to add each variable:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `JWT_SECRET` | `your-secret-key-12345-change-this` |
| `FRONTEND_URL` | `https://farm-sync.vercel.app` |
| `DB_HOST` | `mysql-xxxx.aivencloud.com` |
| `DB_PORT` | `3306` |
| `DB_USER` | `avnadmin` |
| `DB_PASSWORD` | Your AIVEN password |
| `DB_NAME` | `farmsync_db` |

### 3.5 Deploy Backend

1. Click **"Deploy"** button (bottom right)
2. **Wait 3-5 minutes** for deployment...
3. You'll see: **"Congratulations! Your project has been successfully deployed"**

### 3.6 Get Backend URL

1. Click **"Visit"** button
2. Copy your backend URL: `https://farmsync-api.vercel.app`

**Test it:**
- Open: `https://farmsync-api.vercel.app/api/health`
- Should show: `{"status":"ok",...}`

---

# STEP 4: Deploy Frontend to Vercel

## ⏱️ Time: 10 minutes

### 4.1 Create New Frontend Project

1. Go to: https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Select **"FarmSync"** repository again
4. Click **"Import"**

### 4.2 Configure Frontend Project

**Project Settings:**

1. **Project Name:** `farm-sync` (or `farmsync-frontend`)
2. **Root Directory:** Select **"Frontend"** folder
3. **Framework Preset:** Select **"Vite"**
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`

### 4.3 Add Environment Variables

1. **Add these variables:**

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://farmsync-api.vercel.app/api` |
| `VITE_API_BASE_URL` | `https://farmsync-api.vercel.app/api` |

### 4.4 Deploy Frontend

1. Click **"Deploy"** button
2. **Wait 3-5 minutes**...
3. Success! 🎉

### 4.5 Get Frontend URL

Your frontend is now live at:
- `https://farm-sync.vercel.app`

---

# STEP 5: Connect Frontend to Backend

## ⏱️ Time: 5 minutes

### 5.1 Update Frontend Environment

1. Go to Vercel Dashboard
2. Click **"farm-sync"** project
3. Click **"Settings"** → **"Environment Variables"**
4. Update:
   ```
   VITE_API_URL = https://farmsync-api.vercel.app/api
   ```
5. Click **"Save"**

### 5.2 Redeploy Frontend

1. Click **"Deployments"** tab
2. Click latest deployment
3. Click **"Redeploy"** button
4. Wait for redeploy to complete

---

# STEP 6: Final Testing

## ⏱️ Time: 5 minutes

### 6.1 Test Backend

```
URL: https://farmsync-api.vercel.app/api/health

Expected Response:
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:45.123Z"
}
```

### 6.2 Test Frontend

1. Open: `https://farm-sync.vercel.app`
2. Should see FarmSync login page ✅
3. Check browser console (F12) for any errors

### 6.3 Test Database Connection

In Vercel backend logs:
1. Go to `farmsync-api` project
2. Click **"Deployments"** → Latest deployment
3. Click **"View logs"**
4. Should show: **"Database connected successfully"** ✅

### 6.4 Test Full Integration

1. **Sign up/Login** on frontend
2. Navigate to Dashboard
3. Try adding a crop
4. Check if data saves ✅

---

# ✅ DEPLOYMENT CHECKLIST

- [ ] AIVEN database created
- [ ] AIVEN credentials saved
- [ ] Tables created in AIVEN
- [ ] Backend deployed to Vercel
- [ ] Backend environment variables set
- [ ] Backend health check works (✅ /api/health)
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables set
- [ ] Frontend can access backend URL
- [ ] Frontend displays correctly
- [ ] Database connection working
- [ ] Full app integration tested

---

# 🆘 TROUBLESHOOTING

## Backend Deploy Failed

**Check logs:**
1. Vercel Dashboard → farmsync-api project
2. Deployments → Latest → View logs
3. Look for errors

**Common issues:**
- `npm install` failed → Check package.json syntax
- Port error → Check PORT env var
- Database error → Check DB credentials

## Frontend Shows 404

**Fix:**
1. Check `Frontend/vercel.json` exists
2. In Vercel project settings:
   - Root Directory: `Frontend`
   - Build: `npm run build`
   - Output: `dist`
3. Redeploy

## Can't Connect to Backend

**Check:**
1. Backend URL is correct: `https://farmsync-api.vercel.app/api`
2. Health check works: `https://farmsync-api.vercel.app/api/health`
3. Frontend env var: `VITE_API_URL=https://farmsync-api.vercel.app/api`
4. Check browser console (F12) for errors

## Database Connection Error

**Check AIVEN credentials:**
1. DB_HOST is correct (from AIVEN Connection Information)
2. DB_USER is correct (`avnadmin` usually)
3. DB_PASSWORD is correct
4. DB_NAME is correct (`farmsync_db`)
5. All in Vercel backend environment variables

---

# 📊 FINAL URLS

```
Frontend:  https://farm-sync.vercel.app
Backend:   https://farmsync-api.vercel.app/api
Database:  AIVEN Cloud MySQL
```

---

# 🎉 DEPLOYMENT COMPLETE!

Your FarmSync app is now live on the internet! 🚀

**Next steps:**
- Share your app URL with others
- Monitor logs for errors
- Add more features
- Scale as needed

---

## 💡 Important Notes

1. **Database Backups:** AIVEN provides automatic backups on FREE tier
2. **Scalability:** Can upgrade Vercel projects as traffic increases
3. **SSL/HTTPS:** Automatic on both Vercel and AIVEN
4. **Uptime:** 99.9% SLA on both platforms
5. **Support:** Both platforms have great documentation

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **AIVEN Docs:** https://aiven.io/docs
- **Node.js:** https://nodejs.org/docs
- **React:** https://react.dev

Good luck! 🚀
