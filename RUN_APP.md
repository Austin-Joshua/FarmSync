# 🚀 How to Run FarmSync V1.0

## Quick Start (2 Steps)

### Step 1: Start Backend Server

Open **PowerShell** or **Command Prompt**:

```powershell
cd Backend
npm run dev
```

**Wait for this message:**
```
✅ Backend server is running on http://localhost:5174
Database connected successfully
```

**If you see database errors:**
```powershell
# Make sure MySQL is running, then:
npm run setup-db
```

### Step 2: Start Frontend Server

Open a **NEW PowerShell** or **Command Prompt** window:

```powershell
cd Frontend
npm run dev
```

**Wait for this message:**
```
VITE v5.4.2  ready in 500 ms

➜  Local:   http://localhost:5173/
```

### Step 3: Open Browser

Open your browser and go to:

**👉 http://localhost:5173**

---

## ✅ Verification

### Check Backend is Running:
Open browser and go to: **http://localhost:5174/health**

Should see: `{"status":"ok","timestamp":"..."}`

### Check Frontend is Running:
Open browser and go to: **http://localhost:5173**

Should see: FarmSync login page

---

## 🔧 Common Issues & Fixes

### Issue: "Cannot connect to database"

**Fix:**
1. Make sure MySQL is running:
   ```powershell
   # Check MySQL service
   Get-Service MySQL*
   
   # Start MySQL if stopped
   net start MySQL80
   ```

2. Create database:
   ```powershell
   cd Backend
   npm run setup-db
   ```

### Issue: "Port already in use"

**Fix:**
```powershell
# Find process using port 5174
netstat -ano | findstr :5174

# Kill process (replace <PID> with number from above)
taskkill /PID <PID> /F

# Or change port in Backend/.env
PORT=5000
```

### Issue: Frontend shows "Connection Refused"

**Fix:**
1. Make sure backend is running first
2. Check Frontend/.env has: `VITE_API_URL=http://localhost:5174/api`
3. Restart frontend after changing .env

### Issue: "npm run dev" doesn't work

**Fix:**
```powershell
# Install dependencies first
cd Backend
npm install

cd ../Frontend
npm install

# Then try again
npm run dev
```

---

## 📋 Prerequisites Checklist

Before running, make sure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] MySQL 8.0+ installed and running
- [ ] npm installed (`npm --version`)
- [ ] Dependencies installed (`npm install` in both folders)

---

## 🎯 Expected Behavior

### Backend Terminal Should Show:
```
✅ Backend server is running on http://localhost:5174
✅ Frontend URL: http://localhost:5173
Database connected successfully
```

### Frontend Terminal Should Show:
```
VITE v5.4.2  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Browser Should Show:
- FarmSync login/register page
- No connection errors
- Can register and login

---

## 🆘 Still Having Issues?

1. **Check both terminals** for error messages
2. **Verify MySQL is running**: `mysql -u root -p`
3. **Check ports are free**: `netstat -ano | findstr ":5173 :5174"`
4. **Restart both servers** (Ctrl+C to stop, then `npm run dev` again)
5. **Clear browser cache** and try again

---

**Version:** V1.0  
**Last Updated:** January 2026
