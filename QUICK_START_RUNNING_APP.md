# FarmSync - Quick Start Guide

## 🎯 Getting Started with FarmSync

This guide helps you start the FarmSync application with frontend and backend running simultaneously.

## ⚡ Prerequisites

Before starting, ensure you have:

✅ Node.js 16+
✅ MySQL Server running and accessible
✅ Both Frontend and Backend packages installed (`npm install` in both folders)
✅ Environment file configured (`.env` in Backend folder)

## 📋 Pre-Startup Checklist

### 1. Database Setup

```bash
# Connect to MySQL and create database
mysql -u root -p

# In MySQL console:
CREATE DATABASE IF NOT EXISTS farmsync_db;
EXIT;
```

### 2. Backend Configuration

**Create `.env` file in `Backend` folder:**

```
NODE_ENV=development
PORT=5174
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=farmsync_db
DB_USER=root
DB_PASSWORD=123456

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=7d

# Session
SESSION_SECRET=your-session-secret-change-in-production
```

### 3. Verify Installation

```bash
# Check Node version
node --version
# Should be v16 or higher

# Check npm version  
npm --version
# Should be v7 or higher

# Verify MySQL is running
mysql -u root -p -e "SELECT 1;"
```

## 🚀 Starting the Application

### Option 1: Start Both Frontend and Backend (Windows - PowerShell)

```powershell
# From project root
cd FarmSync

# Start Backend (in background)
Start-Process powershell -ArgumentList {
    cd "Backend"
    npm run dev
}

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend (in background)
Start-Process powershell -ArgumentList {
    cd "Frontend"
    npm run dev
}

# Both should now be running!
```

### Option 2: Start Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

## ✅ Verify Both Are Running

### Check Backend

```bash
# Open browser or use curl
curl http://localhost:5174/health

# Should respond with:
# {"status":"ok","timestamp":"..."}
```

### Check Database Connection

```bash
curl http://localhost:5174/health/database

# Should respond with:
# {"status":"✅ Connected","database":"farmsync_db",...}
```

### Access Frontend

```
Open browser: http://localhost:5173

You should see the FarmSync login page
```

## 🔐 First Login

### Create Account

1. Click "Register" on the login page
2. Fill in the registration form:
   - Name: Your name
   - Email: your-email@example.com
   - Password: Strong password (8+ chars)
   - Role: Select "Farmer" or "Admin"
   - Location: Your location (optional)
3. Click "Register"
4. You'll be automatically logged in

### Alternative: Test Login

If you have an existing account:
1. Enter email and password
2. Click "Login"
3. You'll be redirected to the dashboard

## 📊 Dashboard Features

After login, you can:

✅ **View Dashboard** - Overall farm statistics
✅ **Manage Farms** - Add/edit/delete farms
✅ **Track Crops** - Manage crop records
✅ **Log Expenses** - Track farm expenses
✅ **Record Yields** - Log harvest yields
✅ **Plan Irrigation** - Schedule irrigation
✅ **Track Weather** - Get weather alerts
✅ **View Reports** - Generate reports
✅ **Manage Calendar** - Plan activities
✅ **Language Support** - Switch between 5 Indian languages

## 🌐 Language Support

FarmSync supports 5 Indian languages:

- 🇮🇳 English (Default)
- 🇮🇳 Malayalam
- 🇮🇳 Tamil  
- 🇮🇳 Hindi
- 🇮🇳 Telugu
- 🇮🇳 Kannada

**To switch languages:**
1. Click the language selector in the top-right corner
2. Choose your preferred language
3. UI updates immediately

## 🛠️ Troubleshooting

### Issue: "Cannot connect to backend"

**Solution:**
1. Verify backend is running: `curl http://localhost:5174/health`
2. Check console for errors
3. Ensure MySQL is running
4. Check firewall settings

### Issue: "Database connection failed"

**Solution:**
1. Verify MySQL is running
2. Check database credentials in `.env`
3. Create database: `CREATE DATABASE farmsync_db;`
4. Restart backend

### Issue: "Port 5173/5174 already in use"

**Solution:**
```bash
# Find process using port
netstat -ano | findstr :5174

# Kill process
taskkill /PID <PID> /F
```

### Issue: "Cannot find database tables"

**Solution:**
1. Backend will auto-create tables on first run
2. Check backend console for initialization logs
3. If still missing, restart backend
4. Check MySQL permissions for database user

## 📈 Performance Tips

1. **Use Modern Browser** - Chrome, Firefox, or Edge
2. **Clear Cache** - Ctrl+Shift+Delete to clear browser cache
3. **Monitor Backend Logs** - Watch for errors during use
4. **Check Database Size** - Monitor growing database
5. **Use Indexed Queries** - System is optimized

## 🔍 Monitoring During Use

### Watch Backend Logs

```
Watch for:
✅ Successful API requests
✅ Database queries executing
✅ Authentication tokens validated
❌ Errors or exceptions
❌ Database connection issues
```

### Check Health Endpoints

```bash
# Every 5 minutes
curl http://localhost:5174/health

# Check database stats (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5174/health/stats
```

## 📊 Create Test Data

After logging in:

1. **Add a Farm:**
   - Click "Manage Farms"
   - Click "Add Farm"
   - Fill in farm details
   - Save

2. **Add a Crop:**
   - Go to "Crop Management"
   - Click "Add Crop"
   - Select farm and crop type
   - Set sowing and harvest dates
   - Save

3. **Track Activity:**
   - Add expenses
   - Record yields
   - Log irrigations
   - Add fertilizers/pesticides

4. **View Reports:**
   - Go to "Reports"
   - View summary or custom reports
   - Export if needed

## 🎨 Customization

### Change Theme

**Dark Mode/Light Mode:**
1. Go to Settings (gear icon)
2. Toggle Theme preference
3. Refresh page

### Adjust Language

**Switch Language:**
1. Click language selector (top-right)
2. Choose language
3. UI updates instantly

## 🔐 Security Tips

1. **Use Strong Passwords** - 8+ characters, mixed case
2. **Keep Credentials Safe** - Don't share login info
3. **Enable 2FA** - Available in Settings
4. **Regular Backups** - Backend auto-backs up data
5. **Update Regularly** - Keep Node and npm updated

## 📚 Additional Resources

- `docs/FRONTEND_BACKEND_CONNECTION.md` - Connection details
- `docs/DATABASE_CONNECTION_GUIDE.md` - Database setup
- `docs/FEATURES_GUIDE.md` - Feature documentation
- `Backend/README.md` - Backend documentation
- `FRONTEND_BACKEND_VERIFICATION_REPORT.md` - Verification status

## 🆘 Need Help?

If you encounter issues:

1. **Check Logs** - Backend and Frontend console
2. **Restart Services** - Stop and start both
3. **Clear Cache** - Browser cache and localStorage
4. **Verify Database** - Check MySQL connection
5. **Review Docs** - Check relevant documentation

## ✨ Environment Variables

Key variables in `.env`:

```
NODE_ENV=development          # Development mode
PORT=5174                     # Backend port
FRONTEND_URL=http://localhost:5173  # Frontend URL
DB_HOST=localhost            # Database host
DB_PORT=3306                 # Database port
DB_NAME=farmsync_db          # Database name
DB_USER=root                 # Database user
DB_PASSWORD=123456           # Database password
JWT_SECRET=your-secret       # JWT secret
SESSION_SECRET=your-secret   # Session secret
```

## 🎯 Verification Steps

After starting:

✅ Backend running on http://localhost:5174
✅ Frontend running on http://localhost:5173  
✅ Database connected and initialized
✅ Can register new account
✅ Can login with credentials
✅ Can create farm and crop
✅ Can switch languages
✅ Can view dashboard

## 🚀 You're All Set!

Your FarmSync application is now running. 

**Access the app:** http://localhost:5173

**Next Steps:**
1. Register an account
2. Create a farm
3. Add crops
4. Track your activities
5. Generate reports

---

**Happy Farming! 🌾**

For detailed information, see the documentation files in the `docs/` directory.
