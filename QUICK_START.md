# 🚀 FarmSync V1.0 - Quick Start Guide

**Version:** V1.0 (Base Version)  
**Status:** ✅ Ready to Run

---

## 🛠️ Tech Stack Summary

### Frontend (What You See)
- **React 18.3** - Modern UI framework
- **TypeScript** - Type-safe code
- **Vite** - Fast build tool
- **Tailwind CSS** - Beautiful styling
- **React Router** - Page navigation
- **Recharts** - Data visualization
- **i18next** - Multi-language support

### Backend (The Brain)
- **Node.js 18+** - Server runtime
- **Express 4.18** - Web framework
- **TypeScript** - Type safety
- **MySQL 8.0** - Database
- **JWT** - Authentication
- **bcryptjs** - Password security

### Machine Learning
- **Python 3.7+** - ML runtime
- **Scikit-learn** - ML algorithms
- **99.55% Accuracy** - Crop recommendations

**See [TECH_STACK.md](TECH_STACK.md) for complete details.**

---

## ⚡ Running the App (3 Simple Steps)

### Step 1: Start Backend Server

Open **Terminal 1** (PowerShell or Command Prompt):

```powershell
cd Backend
npm run dev
```

**Expected Output:**
```
✅ Backend server is running on http://localhost:5174
✅ Frontend URL: http://localhost:5173
Database connected successfully
```

**If you see errors:**
- Make sure MySQL is running
- Check database credentials in `Backend/.env`
- Run `npm run setup-db` if database doesn't exist

### Step 2: Start Frontend Server

Open **Terminal 2** (New PowerShell or Command Prompt):

```powershell
cd Frontend
npm run dev
```

**Expected Output:**
```
VITE v5.4.2  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 3: Open in Browser

Open your web browser and go to:

**http://localhost:5173**

You should see the FarmSync login page!

---

## 🎯 First Time Setup

### 1. Create Account
1. Click **"Register"** button
2. Fill in:
   - Name
   - Email
   - Password (min 8 chars, with uppercase, lowercase, number, symbol)
   - Role (Farmer or Admin)
   - Location
3. Click **"Create Account"**
4. You'll be automatically logged in!

### 2. Explore Features
Once logged in, you can:
- ✅ View Dashboard
- ✅ Create Farms
- ✅ Add Crops
- ✅ Track Expenses
- ✅ Record Yields
- ✅ View Weather
- ✅ Get AI Recommendations
- ✅ Generate Reports
- ✅ Switch Languages

---

## 🔧 Troubleshooting

### Backend Won't Start

**Error: "Cannot connect to database"**
```powershell
# Check MySQL is running
mysql -u root -p

# If MySQL not running, start it:
# Windows: net start MySQL80
# Or check Services app

# Verify database exists
mysql -u root -p
SHOW DATABASES;  # Should see farmsync_db

# If database doesn't exist:
cd Backend
npm run setup-db
```

**Error: "Port 5174 already in use"**
```powershell
# Find process using port
netstat -ano | findstr :5174

# Kill the process (replace <PID> with actual number)
taskkill /PID <PID> /F

# Or change port in Backend/.env
PORT=5000
```

### Frontend Won't Start

**Error: "Port 5173 already in use"**
- Frontend will automatically use next available port (5174, 5175, etc.)
- Check terminal output for actual port
- Or change port in `Frontend/vite.config.ts`

**Error: "Cannot connect to backend"**
- Make sure backend is running on port 5174
- Check `Frontend/.env` has: `VITE_API_URL=http://localhost:5174/api`
- Restart frontend after changing .env

### Database Issues

**Database doesn't exist:**
```powershell
cd Backend
npm run setup-db
```

**Tables missing:**
```powershell
cd Backend
npm run migrate
```

**Need to reset database:**
```powershell
# WARNING: This deletes all data!
cd Backend
npm run setup-db
```

---

## ✅ Verification Checklist

Before using the app, verify:

- [ ] MySQL is running
- [ ] Database `farmsync_db` exists
- [ ] Backend server running on http://localhost:5174
- [ ] Frontend server running on http://localhost:5173
- [ ] Can access http://localhost:5173 in browser
- [ ] Can register a new account
- [ ] Can login with registered account

---

## 📊 Default Configuration

### Backend
- **Port:** 5174 (or from .env)
- **Database:** farmsync_db
- **Database User:** root
- **Database Password:** 123456 (change in production!)

### Frontend
- **Port:** 5173 (auto-assigned if busy)
- **API URL:** http://localhost:5174/api

---

## 🎉 You're All Set!

Once both servers are running:

1. ✅ Open http://localhost:5173
2. ✅ Register your account
3. ✅ Start managing your farm!

**Happy Farming! 🌾**

---

## 📚 Next Steps

- Read [DOCUMENTATION.md](DOCUMENTATION.md) for complete guide
- See [TECH_STACK.md](TECH_STACK.md) for technology details
- Check features in the app dashboard

---

**Version:** V1.0  
**Last Updated:** January 2026
