# Vercel Deployment Guide - FarmSync Frontend

**Status:** 404 Error Fix Guide  
**Date:** January 15, 2026

---

## 🔴 **Problem: 404 NOT_FOUND Error**

### Common Causes:
1. ❌ Missing or incorrect `vercel.json` configuration
2. ❌ Build directory not set correctly
3. ❌ Environment variables not configured
4. ❌ Backend API URL not configured
5. ❌ Routing issues (SPA needs fallback to index.html)

---

## ✅ **Solution: Complete Deployment Setup**

### Step 1: Create vercel.json

Create a file: `Frontend/vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "env": {
    "VITE_API_URL": "@vite-api-url"
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Why:** Vercel needs to know:
- How to build your project
- Where the output is (`dist` folder)
- How to handle client-side routing (all routes → index.html)

### Step 2: Configure Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

```
Name: VITE_API_URL
Value: https://your-backend-url.com/api
Environment: Production, Preview, Development
```

Replace `https://your-backend-url.com` with your actual backend URL.

### Step 3: Update vite.config.ts (if needed)

Current file is already correct. It should look like:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

### Step 4: Verify package.json Build Script

Your `Frontend/package.json` already has the correct build script:

```json
{
  "scripts": {
    "build": "vite build",
    "dev": "vite"
  }
}
```

---

## 📝 **Complete Deployment Checklist**

### Pre-Deployment
- [ ] Create `Frontend/vercel.json` with rewrites configuration
- [ ] Ensure `Frontend/package.json` has correct build script
- [ ] Test locally: `npm run build && npm run preview`
- [ ] All code committed to GitHub
- [ ] No build errors locally

### Vercel Configuration
- [ ] Connect GitHub repository to Vercel
- [ ] Set project root: `Frontend`
- [ ] Build command: `npm run build` (auto-detected)
- [ ] Output directory: `dist` (auto-detected)
- [ ] Install command: `npm install` (auto-detected)

### Environment Variables
- [ ] Set `VITE_API_URL` in Vercel dashboard
- [ ] Point to your backend server
- [ ] Verify for all environments (Production, Preview, Development)

### After Deployment
- [ ] Visit your Vercel URL
- [ ] Check that page loads (not 404)
- [ ] Test navigation (refresh on different routes)
- [ ] Open DevTools → Console (check for errors)
- [ ] Verify API calls work (check Network tab)

---

## 🚀 **Step-by-Step Vercel Deployment**

### Method 1: Automatic Deployment (Recommended)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Fix: Add Vercel configuration"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Select `FarmSync` project

3. **Configure Project**
   - Framework Preset: `Vite`
   - Project root: `Frontend` (IMPORTANT!)
   - Build command: `npm run build`
   - Output directory: `dist`

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add `VITE_API_URL`: `https://your-backend-url.com/api`

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your site is live!

### Method 2: Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from Frontend directory
cd Frontend
vercel

# Add environment variables when prompted
# VITE_API_URL: https://your-backend-url.com/api
```

---

## 🔧 **Troubleshooting**

### Issue: Still Getting 404

**Solution:**
1. Check that `Frontend/vercel.json` exists
2. Verify `rewrites` section redirects all routes to `index.html`
3. Check build output: should have `dist/index.html`

```bash
# Local test
npm run build
npm run preview
# Should work at http://localhost:4173
```

### Issue: API Calls Not Working

**Solution:**
1. Verify `VITE_API_URL` is set in Vercel dashboard
2. Check backend server is running and accessible
3. Open DevTools → Network tab → check API requests
4. Backend URL should be: `https://your-backend-url.com/api`

### Issue: Build Fails

**Solution:**
1. Check Node version: Vercel uses Node 18+
2. Check for TypeScript errors: `npm run typecheck`
3. Check for linting errors: `npm run lint`
4. Test build locally: `npm run build`

### Issue: Routing Not Working

**Solution:**
1. Ensure `vercel.json` has `rewrites` configuration
2. This redirects all routes to `index.html` (required for SPA)
3. React Router handles routing on client-side

---

## 📋 **Final vercel.json Reference**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "env": {
    "VITE_API_URL": "@vite-api-url"
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Key Parts:**
- `buildCommand`: Tells Vercel how to build
- `outputDirectory`: Where built files go
- `env`: Environment variables
- `rewrites`: Routes all requests to index.html (critical for SPA)

---

## 🌐 **Backend URL Configuration**

### For Production

**Option 1: If backend is on Heroku**
```
VITE_API_URL=https://your-app-name.herokuapp.com/api
```

**Option 2: If backend is on your own server**
```
VITE_API_URL=https://api.yourdomainname.com/api
```

**Option 3: If backend is on Railway/Render**
```
VITE_API_URL=https://your-service-name.onrender.com/api
```

### How to Set in Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Click "Add New"
5. Name: `VITE_API_URL`
6. Value: Your backend URL
7. Select all environments (Production, Preview, Development)
8. Click "Save"
9. Redeploy for changes to take effect

---

## ✅ **Quick Test After Deployment**

1. **Visit your Vercel URL**
   - Should NOT show 404
   - Should show FarmSync login page

2. **Check Console (DevTools F12)**
   - No 404 errors for CSS/JS
   - No CORS errors from API

3. **Test Navigation**
   - Refresh on different pages
   - Should not show 404

4. **Test API Connection**
   - Try to login
   - Check Network tab → API calls
   - Verify they reach your backend

---

## 📊 **Deployment Comparison**

| Aspect | Status |
|--------|--------|
| Frontend Framework | Vite + React ✅ |
| Package.json Scripts | Correct ✅ |
| Build Output | dist folder ✅ |
| SPA Routing | Needs vercel.json ❌ |
| Environment Vars | Need Vercel config ❌ |
| Backend Connection | Needs VITE_API_URL ❌ |

---

## 🎯 **Summary**

### What to Do Now:

1. ✅ **Create `Frontend/vercel.json`** - Already done
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "devCommand": "npm run dev",
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

2. ✅ **Commit to GitHub**
   ```bash
   git add Frontend/vercel.json
   git commit -m "Add Vercel configuration for frontend deployment"
   git push origin main
   ```

3. ✅ **Set Environment Variables in Vercel**
   - Dashboard → Settings → Environment Variables
   - Add: `VITE_API_URL=https://your-backend-url.com/api`

4. ✅ **Redeploy**
   - Vercel auto-deploys on push
   - Or manually click "Redeploy" in dashboard

5. ✅ **Test**
   - Visit your site
   - Should show login page (not 404)
   - Try logging in

---

**Your 404 error should be fixed! 🎉**

If issues persist, check:
1. Build output has files in `dist/`
2. `vercel.json` is in `Frontend/` directory
3. Environment variables are set in Vercel dashboard
4. Backend URL is correct and accessible

