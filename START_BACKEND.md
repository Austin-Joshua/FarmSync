# 🚀 How to Start Backend Server

## Quick Start

### Method 1: Double-Click Script (Easiest)
1. Navigate to `Backend` folder
2. **Double-click:** `start-backend.ps1`
3. Keep the window that opens **OPEN** (don't close it!)

### Method 2: PowerShell Command
1. Open PowerShell
2. Run:
   ```powershell
   cd C:\Users\austi\OneDrive\Desktop\FarmSync\Backend
   npm run dev
   ```
3. Keep the window **OPEN**

---

## Verify Backend is Running

### Check 1: Look at the PowerShell Window
You should see:
```
✅ Backend server is running on http://localhost:5000
```

### Check 2: Open Browser
Go to: `http://localhost:5000/health`

Should show: `{"status":"ok"}`

### Check 3: Check Port
```powershell
Get-NetTCPConnection -LocalPort 5000
```
Should show port 5000 is LISTENING

---

## Common Errors & Fixes

### Error: "Port 5000 already in use"
**Fix:**
```powershell
# Find what's using port 5000
Get-NetTCPConnection -LocalPort 5000

# Kill the process (replace PID with actual number)
Stop-Process -Id <PID> -Force
```

### Error: "Database connection failed"
**Fix:**
1. Make sure MySQL is running
2. Check `.env` file has correct database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=farmsync_db
   DB_USER=root
   DB_PASSWORD=your_password
   ```

### Error: ".env file not found"
**Fix:**
```powershell
cd Backend
Copy-Item .env.example .env
# Then edit .env with your database credentials
```

### Error: "Cannot find module"
**Fix:**
```powershell
cd Backend
npm install
```

---

## Important Notes

⚠️ **KEEP THE WINDOW OPEN!**
- Closing the PowerShell window stops the backend
- Minimize it if needed, but don't close it
- The backend must run continuously

✅ **Backend Must Run First**
- Start backend BEFORE opening the frontend
- Frontend needs backend to work

---

## Step-by-Step Startup

1. **Open PowerShell** (as Administrator if possible)

2. **Navigate to Backend:**
   ```powershell
   cd C:\Users\austi\OneDrive\Desktop\FarmSync\Backend
   ```

3. **Start Server:**
   ```powershell
   npm run dev
   ```

4. **Wait for this message:**
   ```
   ✅ Backend server is running on http://localhost:5000
   ```

5. **Keep window open!**

6. **Open another PowerShell** for frontend:
   ```powershell
   cd C:\Users\austi\OneDrive\Desktop\FarmSync\Frontend
   npm run dev
   ```

7. **Access app:** `http://localhost:5173`

---

**Last Updated:** January 2026
