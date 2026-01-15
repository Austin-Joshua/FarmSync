# Deploy FarmSync Backend to Render - Complete Guide

**Date:** January 15, 2026  
**Platform:** Render.com  
**Status:** Step-by-Step Guide

---

## 🎯 **What We're Doing**

1. Deploy your Node.js backend to Render
2. Get the public URL
3. Configure it in Vercel
4. Connect frontend to backend

---

## ✅ **Prerequisites**

Before starting, make sure you have:
- ✅ GitHub account (already have it)
- ✅ FarmSync repository pushed to GitHub (done)
- ✅ Render account (free at render.com)
- ✅ Backend code in `Backend/` folder (have it)

---

## 🚀 **Step 1: Create Render Account**

1. Go to **https://render.com**
2. Click **"Sign Up"**
3. Choose **"Sign up with GitHub"** (easiest)
4. Authorize Render to access your GitHub
5. Complete signup

---

## 📋 **Step 2: Create New Web Service on Render**

1. Log in to **https://dashboard.render.com**
2. Click **"New +"** button (top right)
3. Select **"Web Service"**
4. Connect your GitHub repository:
   - Click **"Connect GitHub Account"** if not already done
   - Search for **"FarmSync"**
   - Click to connect

---

## ⚙️ **Step 3: Configure Web Service**

### **Name**
```
farmsync-backend
```

### **Environment**
```
Node
```

### **Build Command**
```
npm install
```

### **Start Command**
```
npm run dev
```

### **Root Directory**
```
Backend
```

**This is important!** Your backend code is in the `Backend` folder.

---

## 🔐 **Step 4: Add Environment Variables**

Scroll down to **"Environment Variables"** section.

Click **"Add Environment Variable"** and add these:

### **Variable 1: Database Connection**
```
Name: DB_HOST
Value: localhost
```

### **Variable 2: Database Port**
```
Name: DB_PORT
Value: 3306
```

### **Variable 3: Database Name**
```
Name: DB_NAME
Value: farmsync_db
```

### **Variable 4: Database User**
```
Name: DB_USER
Value: root
```

### **Variable 5: Database Password**
```
Name: DB_PASSWORD
Value: 123456
```

### **Variable 6: JWT Secret**
```
Name: JWT_SECRET
Value: your-secret-key-change-in-production
```

### **Variable 7: Node Environment**
```
Name: NODE_ENV
Value: production
```

### **Variable 8: Frontend URL**
```
Name: FRONTEND_URL
Value: https://farm-sync.vercel.app
```

Replace `farm-sync` with your actual Vercel project name.

---

## 💾 **Step 5: Configure Plan**

1. Scroll down to **"Plan"** section
2. Select **"Free"** (good for testing)
3. Or **"Starter"** if you want more resources

---

## 🚀 **Step 6: Deploy**

1. Click **"Create Web Service"** button at bottom
2. Render starts building and deploying
3. Watch the deployment logs
4. Takes 2-5 minutes typically

---

## ✅ **Step 7: Get Your Backend URL**

### **After deployment is complete:**

1. Go to your service dashboard
2. Look for **"Service URL"** at the top
3. It will look like:
   ```
   https://farmsync-backend.onrender.com
   ```

**Copy this URL** - you'll need it for Vercel!

---

## 🧪 **Step 8: Test Your Backend URL**

Before adding to Vercel, verify it works:

### **Test in Browser:**
```
https://farmsync-backend.onrender.com/api/health
```

Should show:
```json
{
  "status": "ok",
  "timestamp": "2026-01-15T..."
}
```

### **Test from Terminal:**
```bash
curl https://farmsync-backend.onrender.com/api/health
```

### **If you get a response:** ✅ Your backend is working!
### **If you get 404 or error:** ❌ Check deployment logs

---

## ⚠️ **Common Issues & Fixes**

### **Issue 1: Deployment Failed**
- Check **"Logs"** tab for errors
- Usually missing environment variables
- Add missing DB credentials

### **Issue 2: Cannot Connect to Database**
- Local database (MySQL) won't be accessible from cloud
- You need to set up **MySQL on cloud** (see below)
- Or use a cloud database service

### **Issue 3: 502 Bad Gateway**
- Backend crashed
- Check logs for error
- Verify environment variables

### **Issue 4: Stuck on "Deploying"**
- Wait longer (can take 5-10 mins first time)
- Check logs for issues
- If takes >15 mins, might have failed silently

---

## 🗄️ **Important: Database Setup**

### **Current Problem:**
Your backend on Render can't access MySQL on your local machine.

### **Solution Options:**

#### **Option A: Use MySQL on Cloud (Recommended)**

**PlanetScale (Free MySQL in cloud):**
1. Go to **https://planetscale.com**
2. Sign up for free
3. Create a database
4. Get connection string
5. Update Render environment variables with cloud DB credentials

#### **Option B: Keep Local MySQL**

**Only works if:**
- You run backend locally
- You're testing locally with frontend
- Not for Vercel deployment

#### **Option C: Use Cloud-Based MySQL Service**

Options:
- **AWS RDS** (has free tier)
- **Google Cloud SQL** (has free tier)
- **DigitalOcean Databases**
- **Linode**

---

## 🔗 **Step 9: Add Backend URL to Vercel**

Once you have your Render URL working:

1. Go to **https://vercel.com**
2. Select your **"farm-sync"** project
3. Go to **Settings → Environment Variables**
4. Click **"Add New"**
5. Fill in:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://farmsync-backend.onrender.com/api`
6. Select all environments (Production, Preview, Development)
7. Click **"Save"**
8. Redeploy your frontend

---

## 🎯 **Step 10: Connect Frontend to Backend**

### **In Vercel Dashboard:**
1. Click the **3-dot menu**
2. Select **"Redeploy"** or **"Deployments"** → **"Redeploy"**
3. Frontend rebuilds with new backend URL
4. Takes 2-3 minutes

### **Test Connection:**
1. Visit your Vercel URL: `https://farm-sync.vercel.app`
2. Should show login page (not 404!)
3. Try logging in
4. Open DevTools → Network tab
5. Look for API calls to Render backend
6. Should see requests like: `https://farmsync-backend.onrender.com/api/auth/login`

---

## 📝 **Summary: Your URLs**

After following this guide:

```
Frontend URL (Vercel):
https://farm-sync.vercel.app

Backend URL (Render):
https://farmsync-backend.onrender.com

API Base URL (for frontend):
https://farmsync-backend.onrender.com/api

Environment Variable (in Vercel):
VITE_API_URL=https://farmsync-backend.onrender.com/api
```

---

## ⏱️ **Timeline**

- ⏱️ **5 min** - Create Render account
- ⏱️ **5 min** - Connect GitHub repo
- ⏱️ **3 min** - Configure environment
- ⏱️ **5-10 min** - Deploy backend
- ⏱️ **5 min** - Test backend URL
- ⏱️ **5 min** - Add to Vercel
- ⏱️ **3 min** - Redeploy frontend

**Total: ~30-35 minutes**

---

## ✅ **Final Checklist**

- [ ] Render account created
- [ ] GitHub connected to Render
- [ ] Web Service created
- [ ] Root Directory set to `Backend`
- [ ] Environment variables added
- [ ] Deployment complete (shows green checkmark)
- [ ] Backend URL tested in browser (/api/health)
- [ ] Backend URL added to Vercel as VITE_API_URL
- [ ] Frontend redeployed on Vercel
- [ ] Frontend loads without 404
- [ ] Login page appears
- [ ] API calls reach backend

---

## 🆘 **Need Help?**

If you get stuck:

1. **Check Render logs:** Dashboard → Logs tab
2. **Verify environment variables:** Are they all set?
3. **Test backend URL:** Can you reach `/api/health`?
4. **Check Vercel logs:** Deployments tab → View logs
5. **Verify VITE_API_URL:** Is it in Vercel environment variables?

---

## 🎉 **What Happens After**

Once everything is connected:

1. ✅ Frontend on Vercel can reach backend on Render
2. ✅ Users can login and use the app
3. ✅ Database is accessible from Render
4. ✅ Full app works end-to-end
5. ✅ Scalable and production-ready

---

## 🚀 **Next Action**

1. Go to **https://render.com**
2. Sign up with GitHub
3. Create a Web Service
4. Follow the steps above
5. Come back when you have your Render backend URL!

---

**Tell me when you have your Render backend URL and I'll help you connect it to Vercel!** 🎯

