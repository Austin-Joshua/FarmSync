# Deploy Both Frontend & Backend to Vercel - Complete Guide

**Date:** January 15, 2026  
**Platform:** Vercel  
**Status:** Complete Step-by-Step Guide

---

## 🎯 **What We're Doing**

Deploy your ENTIRE FarmSync app (Frontend + Backend) on Vercel using a **monorepo setup**.

---

## ✅ **Prerequisites**

- ✅ GitHub account (have it)
- ✅ Vercel account (free at vercel.com)
- ✅ FarmSync code pushed to GitHub (done)
- ✅ Both Frontend and Backend folders in repo (have it)

---

## 📁 **Your Repository Structure**

```
FarmSync/
├── Frontend/          (React + Vite app)
│   ├── package.json
│   ├── vercel.json    (already created ✅)
│   └── src/
├── Backend/           (Node.js + Express)
│   ├── package.json
│   ├── src/
│   └── tsconfig.json
└── .github/
```

This is a **monorepo** - both apps in one GitHub repo.

---

## 🚀 **Step 1: Deploy Frontend to Vercel**

### **1.1 Connect to Vercel**

1. Go to **https://vercel.com**
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Find and select **"FarmSync"**
5. Click **"Import"**

### **1.2 Configure Frontend Project**

On the configuration page:

**Framework Preset:**
```
Select: Vite
```

**Project Name:**
```
farm-sync
```

**Root Directory:**
```
Frontend
```

**Build Command:**
```
npm run build
```

**Output Directory:**
```
dist
```

**Environment Variables:**

Add this FIRST (before deploying):
```
Name: VITE_API_URL
Value: https://farmsync-api.vercel.app/api
```

(We'll deploy backend to `farmsync-api` project)

### **1.3 Deploy Frontend**

1. Click **"Deploy"**
2. Wait 2-5 minutes
3. You'll get a URL like: `https://farm-sync.vercel.app`

**✅ Frontend is live!**

---

## 🖥️ **Step 2: Deploy Backend to Vercel**

### **2.1 Create New Project for Backend**

1. Go to **https://vercel.com/dashboard**
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Select **"FarmSync"** again (same repo)
5. Click **"Import"**

### **2.2 Configure Backend Project**

On the configuration page:

**Project Name:**
```
farmsync-api
```

**Root Directory:**
```
Backend
```

**Framework Preset:**
```
Other (or Node.js if available)
```

**Build Command:**
```
npm install
```

**Start Command:**
```
npm run dev
```

### **2.3 Add Environment Variables for Backend**

Click **"Environment Variables"** and add these:

```
Name: NODE_ENV
Value: production
```

```
Name: PORT
Value: 3000
```

```
Name: JWT_SECRET
Value: your-super-secret-jwt-key-change-this
```

```
Name: FRONTEND_URL
Value: https://farm-sync.vercel.app
```

**Database Variables:**

⚠️ **IMPORTANT:** You need a **cloud database** because Vercel runs in the cloud.

Options:
1. **PlanetScale** (MySQL in cloud) - RECOMMENDED, FREE
2. **MongoDB Atlas** (NoSQL, FREE tier available)
3. **AWS RDS** (has free tier)
4. **Google Cloud SQL**

#### **Using PlanetScale (Recommended):**

1. Go to **https://planetscale.com**
2. Sign up for free
3. Create a database
4. Get connection string
5. Add to Vercel:

```
Name: DB_HOST
Value: [from PlanetScale]
```

```
Name: DB_USER
Value: [from PlanetScale]
```

```
Name: DB_PASSWORD
Value: [from PlanetScale]
```

```
Name: DB_NAME
Value: farmsync_db
```

**OR use this single variable:**

```
Name: DATABASE_URL
Value: mysql://user:password@host/farmsync_db
```

### **2.4 Deploy Backend**

1. Click **"Deploy"**
2. Wait 2-5 minutes
3. Backend will be at: `https://farmsync-api.vercel.app`

**✅ Backend is live!**

---

## 🔗 **Step 3: Connect Frontend to Backend**

### **3.1 Update Frontend Environment Variable**

Your frontend is already set to use `https://farmsync-api.vercel.app/api`, so it should work!

But verify:

1. Go to **farm-sync** project on Vercel
2. Settings → Environment Variables
3. Check that `VITE_API_URL` is set to:
   ```
   https://farmsync-api.vercel.app/api
   ```

### **3.2 Redeploy Frontend (if needed)**

1. Go to **farm-sync** project
2. Click **"Deployments"**
3. Click the 3-dot menu on latest deployment
4. Select **"Redeploy"**

---

## 🧪 **Step 4: Test Everything**

### **Test Backend**

Open in browser:
```
https://farmsync-api.vercel.app/api/health
```

Should show:
```json
{
  "status": "ok",
  "timestamp": "2026-01-15T..."
}
```

### **Test Frontend**

Open in browser:
```
https://farm-sync.vercel.app
```

Should show:
- ✅ Login page loads
- ✅ No 404 errors
- ✅ CSS and JS loaded correctly

### **Test Login**

1. Try to login with test credentials
2. Open DevTools → Network tab
3. Look for API calls to backend
4. Should see requests to `https://farmsync-api.vercel.app/api/...`

---

## 📋 **Your Final Setup**

```
Frontend Project (Vercel):
- Project Name: farm-sync
- Root Directory: Frontend
- URL: https://farm-sync.vercel.app
- VITE_API_URL: https://farmsync-api.vercel.app/api

Backend Project (Vercel):
- Project Name: farmsync-api
- Root Directory: Backend
- URL: https://farmsync-api.vercel.app
- Database: PlanetScale (cloud MySQL)

Data Flow:
Browser → farm-sync.vercel.app → farmsync-api.vercel.app → PlanetScale DB
```

---

## ⚠️ **Important: Database Setup FIRST**

**Before deploying backend to Vercel:**

### **Choose & Setup Cloud Database**

#### **Option 1: PlanetScale (EASIEST)**

1. Go to **https://planetscale.com**
2. Sign up (free tier available)
3. Create database
4. Get connection details:
   - Host
   - Username
   - Password
5. Add to Vercel environment variables

#### **Option 2: MongoDB Atlas**

1. Go to **https://www.mongodb.com/cloud/atlas**
2. Create free account
3. Create cluster
4. Get connection string
5. Update your backend code for MongoDB

#### **Option 3: Supabase (PostgreSQL)**

1. Go to **https://supabase.io**
2. Sign up
3. Create project
4. Get connection details
5. Update backend configuration

---

## 🔧 **Backend Configuration for Vercel**

### **Update Backend Code (if needed)**

Your backend needs to work with environment variables.

Check `Backend/src/config/database.ts`:

```typescript
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'farmsync_db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  // ...
};
```

**This should already be correct** ✅

---

## 📝 **Vercel Configuration Files (if needed)**

### **Frontend/vercel.json** (Already Created ✅)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### **Backend/vercel.json** (Create New)

Create: `Backend/vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## 📊 **Deployment Summary**

| Component | Platform | URL | Status |
|-----------|----------|-----|--------|
| Frontend | Vercel | https://farm-sync.vercel.app | ✅ Deploy first |
| Backend | Vercel | https://farmsync-api.vercel.app | ✅ Deploy second |
| Database | PlanetScale | Cloud MySQL | ✅ Setup first |
| Connection | Environment Variable | VITE_API_URL | ✅ Already set |

---

## ⏱️ **Timeline**

- ⏱️ **5 min** - Create/verify Vercel account
- ⏱️ **10 min** - Setup cloud database (PlanetScale)
- ⏱️ **5 min** - Deploy frontend project
- ⏱️ **5 min** - Deploy backend project
- ⏱️ **5 min** - Test both projects
- ⏱️ **5 min** - Verify API connection

**Total: ~35-40 minutes**

---

## ✅ **Final Deployment Checklist**

### **Preparation**
- [ ] Both Frontend and Backend pushed to GitHub
- [ ] Cloud database created (PlanetScale)
- [ ] Database credentials obtained
- [ ] Frontend/vercel.json created ✅

### **Frontend Deployment**
- [ ] Create farm-sync project on Vercel
- [ ] Set root to Frontend
- [ ] Deploy successfully
- [ ] Frontend URL: https://farm-sync.vercel.app

### **Backend Deployment**
- [ ] Create farmsync-api project on Vercel
- [ ] Set root to Backend
- [ ] Add database environment variables
- [ ] Deploy successfully
- [ ] Backend URL: https://farmsync-api.vercel.app

### **Testing**
- [ ] Backend /health endpoint works
- [ ] Frontend loads without 404
- [ ] Login page appears
- [ ] API calls reach backend
- [ ] Data flows correctly

---

## 🆘 **Troubleshooting**

### **Frontend Shows 404**
- Check that `vercel.json` exists in Frontend folder
- Verify VITE_API_URL is set
- Redeploy frontend

### **Backend Won't Start**
- Check deployment logs for errors
- Verify environment variables are set
- Check database connection
- Verify database is running

### **API Calls Fail**
- Check that VITE_API_URL is correct
- Test backend /health endpoint
- Verify CORS is enabled in backend
- Check Network tab in DevTools

### **Database Connection Fails**
- Verify connection string is correct
- Check database is running
- Verify IP whitelist (PlanetScale)
- Test connection locally first

---

## 🎯 **Next Action**

### **Immediate Steps:**

1. **Setup Cloud Database FIRST:**
   - Go to https://planetscale.com
   - Create free account
   - Create database
   - Get connection details

2. **Create Backend/vercel.json:**
   - Copy the JSON above
   - Save in Backend folder
   - Commit to GitHub

3. **Deploy Frontend:**
   - Go to https://vercel.com
   - New Project
   - Select FarmSync
   - Set root to Frontend
   - Deploy

4. **Deploy Backend:**
   - Go to https://vercel.com
   - New Project
   - Select FarmSync again
   - Set root to Backend
   - Add environment variables
   - Deploy

5. **Test & Verify:**
   - Test backend /health
   - Test frontend loading
   - Test login
   - Check API calls

---

## 💡 **Key Differences from Render**

| Aspect | Render | Vercel |
|--------|--------|--------|
| Frontend | Separate project | Separate project |
| Backend | Separate project | Separate project |
| Database | On same server | Must be cloud-based |
| Setup | Simpler | Slightly more config |
| Free Tier | 750 hours/month | Generous |
| Best for | Node.js backend | Full-stack apps |

---

## 🎉 **What You'll Have**

After following this guide:

✅ Frontend deployed globally on Vercel
✅ Backend deployed globally on Vercel
✅ Database in cloud (PlanetScale)
✅ Frontend & Backend communicating
✅ Full FarmSync app live and accessible
✅ Auto-deploys on GitHub push
✅ Scalable and production-ready

---

**You're all set! Let me know when you're ready to start deploying!** 🚀

