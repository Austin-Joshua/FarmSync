# Troubleshooting Guide - FarmSync

Common issues and their fixes for the Digital Farm Management System.

---

## Connection Issues

### Problem: "Cannot connect to server" or "Failed to connect to server"

If you're getting connection errors, check the following:

| Problem | Fix |
|---------|-----|
| **Backend not started** | Run `npm run dev` in the Backend directory |
| **Wrong port** | Match frontend + backend ports (Frontend: 5173, Backend: 5000) |
| **.env not loaded** | Restart frontend server after updating .env file |
| **CORS missing** | Add `cors()` middleware (already configured) |
| **Axios baseURL wrong** | Fix API config in `Frontend/src/services/api.ts` |
| **Using HTTPS** | Use HTTP locally (http://localhost, not https://) |

---

## Detailed Fixes

### 1. Backend Not Started

**Symptoms:**
- "Cannot connect to server"
- "Failed to connect to server"
- Network errors in browser console

**Fix:**
```bash
# Navigate to Backend directory
cd Backend

# Start the backend server
npm run dev
```

**Verify:**
- Check terminal for "✅ Backend server is running on http://localhost:5000"
- Test: `curl http://localhost:5000/` should return "Backend is running"

---

### 2. Wrong Port

**Symptoms:**
- Connection timeout
- Port mismatch errors

**Fix:**
- **Backend:** Should run on port `5000` (default)
- **Frontend:** Should run on port `5173` (default)
- **API URL:** Should be `http://localhost:5000/api`

**Check Configuration:**
- `Backend/.env`: `PORT=5000`
- `Frontend/.env`: `VITE_API_URL=http://localhost:5000/api`
- `Backend/src/server.ts`: Port configuration
- `Frontend/src/services/api.ts`: API_BASE_URL

---

### 3. .env Not Loaded

**Symptoms:**
- API calls fail with wrong URLs
- Environment variables not working
- Default values being used

**Fix:**
1. **Update .env file:**
   ```env
   # Backend/.env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=farmsync_db
   DB_USER=root
   DB_PASSWORD=your_password

   # Frontend/.env
   VITE_API_URL=http://localhost:5000/api
   ```

2. **Restart the server:**
   - Stop the server (Ctrl+C)
   - Start again: `npm run dev`

**Important:** Environment variables are loaded at startup. You MUST restart the server after changing .env files.

---

### 4. CORS Missing

**Symptoms:**
- "CORS policy" errors in browser console
- "Access-Control-Allow-Origin" errors
- Requests blocked by browser

**Fix:**
CORS is already configured in `Backend/src/server.ts`:
```typescript
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      // ... other origins
    ];
    callback(null, true);
  },
  credentials: true,
}));
```

**If still having issues:**
- Check browser console for specific CORS errors
- Verify frontend URL is in allowedOrigins
- Check if credentials are being sent (withCredentials: true)

---

### 5. Axios baseURL Wrong

**Symptoms:**
- API calls going to wrong URL
- 404 errors on API endpoints
- Connection errors

**Current Implementation:**
The project uses `fetch()` API, not axios. Configuration is in:
- `Frontend/src/services/api.ts`: `const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';`

**Fix:**
- Update `Frontend/.env`: `VITE_API_URL=http://localhost:5000/api`
- Restart frontend server
- Verify in browser DevTools Network tab that requests go to correct URL

**If using axios:**
```typescript
// In api.ts (if using axios)
axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
});
```

---

### 6. Using HTTPS Locally

**Symptoms:**
- Mixed content errors
- SSL certificate errors
- Connection refused

**Fix:**
- **Use HTTP for local development:**
  - ✅ `http://localhost:5000` (Backend)
  - ✅ `http://localhost:5173` (Frontend)
  - ❌ `https://localhost:5000` (Don't use HTTPS locally)

**Note:** HTTPS should only be used in production with proper SSL certificates.

---

## Authentication Issues

### Problem: "Invalid email or password"

**Possible Causes:**
1. Wrong credentials
2. User doesn't exist in database
3. Password hash mismatch
4. Database connection issue

**Fix:**
1. Verify user exists: Check database or register new account
2. Check password: Ensure correct password (case-sensitive)
3. Check database: Verify database is running and connected
4. Reset password: Register new account if needed

---

### Problem: "User with this email already exists"

**Fix:**
- Use a different email address
- Or login with existing account
- Check database for duplicate emails

---

### Problem: Registration fails

**Possible Causes:**
1. Database connection issue
2. Validation errors
3. Password doesn't meet requirements

**Fix:**
1. Check database connection: `npm run verify-db` in Backend
2. Check password requirements:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character
3. Check browser console for validation errors

---

## Database Issues

### Problem: Database connection failed

**Fix:**
1. **Check MySQL is running:**
   ```bash
   mysql -u root -p
   ```

2. **Verify .env configuration:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=farmsync_db
   DB_USER=root
   DB_PASSWORD=your_password
   ```

3. **Create database if missing:**
   ```bash
   cd Backend
   npm run setup-db
   ```

4. **Test connection:**
   ```bash
   npm run verify-db
   ```

---

### Problem: Tables don't exist

**Fix:**
```bash
cd Backend
npm run setup-db    # Create database and tables
npm run migrate     # Run migrations
```

---

## Server Issues

### Problem: Port already in use (EADDRINUSE)

**Symptoms:**
- "address already in use 0.0.0.0:5000"
- Server won't start

**Fix:**
1. **Find process using port:**
   ```powershell
   Get-NetTCPConnection -LocalPort 5000
   ```

2. **Stop the process:**
   ```powershell
   Stop-Process -Id <PID> -Force
   ```

3. **Or use the startup script:**
   ```powershell
   .\Backend\start-backend.ps1
   ```
   (This script checks for port conflicts automatically)

---

### Problem: Server crashes on startup

**Possible Causes:**
1. Database not running
2. Wrong environment variables
3. Missing dependencies

**Fix:**
1. Check database is running
2. Verify .env file exists and has correct values
3. Install dependencies: `npm install`
4. Check error logs for specific error messages

---

## Frontend Issues

### Problem: Frontend won't start

**Fix:**
1. **Check Node.js version:**
   - Requires Node.js 16+ and npm 8+

2. **Install dependencies:**
   ```bash
   cd Frontend
   npm install
   ```

3. **Clear cache and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Check for port conflicts:**
   - Default port: 5173
   - Change in `vite.config.ts` if needed

---

### Problem: Changes not reflecting

**Fix:**
1. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear cache in browser settings

2. **Restart dev server:**
   - Stop server (Ctrl+C)
   - Start again: `npm run dev`

3. **Check file was saved:**
   - Ensure file is saved before refresh

---

## Quick Checklist

When troubleshooting, check these in order:

1. ✅ **Backend server running?**
   - Check: `curl http://localhost:5000/`
   - Should return: "Backend is running"

2. ✅ **Frontend server running?**
   - Check: Open http://localhost:5173 in browser

3. ✅ **Database running?**
   - Check: `mysql -u root -p`
   - Or: `npm run verify-db` in Backend

4. ✅ **.env files configured?**
   - Backend/.env exists and has correct values
   - Frontend/.env exists with VITE_API_URL

5. ✅ **Ports available?**
   - Port 5000 (backend)
   - Port 5173 (frontend)

6. ✅ **Dependencies installed?**
   - Run `npm install` in both Backend and Frontend

7. ✅ **Browser cache cleared?**
   - Hard refresh or clear cache

---

## Still Having Issues?

1. **Check error logs:**
   - Backend: Check terminal output
   - Frontend: Check browser console (F12)
   - Database: Check MySQL logs

2. **Verify configuration:**
   - Compare your .env files with documentation
   - Check port numbers match

3. **Test endpoints manually:**
   ```bash
   # Test backend root
   curl http://localhost:5000/
   
   # Test health check
   curl http://localhost:5000/health
   
   # Test database health
   curl http://localhost:5000/health/db
   ```

4. **Check network connectivity:**
   - Ensure no firewall blocking ports
   - Check if antivirus is blocking connections

---

## Getting Help

If you're still experiencing issues:

1. Check the error message carefully
2. Check browser console (F12) for detailed errors
3. Check backend terminal for server errors
4. Verify all steps in the Quick Checklist above
5. Review the relevant documentation files:
   - `HOW_TO_CREATE_USER_ACCOUNT.md`
   - `DATABASE_READY.md`
   - `AUTHENTICATION_UPGRADE_COMPLETE.md`

---

## Summary

Most connection issues are caused by:
- Backend server not running
- Wrong port configuration
- .env file not loaded (need to restart)
- Database not running

**Quick fix for most issues:**
1. Stop all servers (Ctrl+C)
2. Start backend: `cd Backend && npm run dev`
3. Start frontend: `cd Frontend && npm run dev`
4. Hard refresh browser (Ctrl+Shift+R)
