# How to Keep Backend Server Running

## Why Backend Keeps Stopping

The backend server might stop due to:
1. **Manual closure** - You or the system closed the PowerShell window
2. **Errors/Crashes** - Unhandled errors cause the server to exit
3. **Database connection failures** - If database is not accessible
4. **Port conflicts** - Another process using port 5000
5. **System shutdown/restart** - Windows restart or sleep mode

## Solution: Use the Startup Scripts

I've created startup scripts to make it easier to keep the backend running:

### Option 1: Use PowerShell Script (Recommended)

1. **Double-click:** `Backend/start-backend.ps1`
   - This opens a PowerShell window with the backend server
   - Shows clear messages about keeping the window open
   - Easier to see if there are errors

### Option 2: Use Batch File

1. **Double-click:** `Backend/start-backend.bat`
   - Opens a command prompt window
   - Starts the backend server
   - Shows messages about keeping window open

### Option 3: Manual Start (Current Method)

1. Open PowerShell
2. Navigate to: `cd Backend`
3. Run: `npm run dev`
4. **Keep the window open!**

## Important: Keep the Window Open!

**All methods require you to keep the window open!**

- ✅ **DO:** Keep the PowerShell/Command window open
- ✅ **DO:** Minimize it if you need (but don't close)
- ❌ **DON'T:** Close the window (server will stop)
- ❌ **DON'T:** Stop the process (Ctrl+C)

## Quick Start Guide

### To Start Backend:

**Easiest way:**
1. Double-click `Backend/start-backend.ps1`
2. Wait for "Server running on port 5000" message
3. Keep the window open!

**Or manually:**
1. Open PowerShell
2. Go to Backend folder
3. Run `npm run dev`
4. Keep window open!

### To Verify Backend is Running:

- Check the PowerShell window - should show "Server running on port 5000"
- Check if port 5000 is listening
- Try accessing http://localhost:5000/health in browser

### If Backend Stops:

1. **Check the window** - Look for error messages
2. **Common errors:**
   - Database connection errors → Check database is running
   - Port already in use → Close other process using port 5000
   - Missing dependencies → Run `npm install` in Backend folder
3. **Restart** - Use one of the startup methods above

## Best Practices

1. **Start backend FIRST** before using the app
2. **Check both servers are running:**
   - Backend (port 5000)
   - Frontend (port 5173)
3. **Keep both windows visible** or minimized (not closed)
4. **Check for errors** in the console windows
5. **Restart if needed** when you see errors

## Troubleshooting

### "Port 5000 already in use"
- Another process is using port 5000
- Close other backend servers or change port in .env

### "Database connection error"
- MySQL database is not running
- Check database credentials in .env
- Start MySQL server

### "Cannot find module"
- Dependencies not installed
- Run `npm install` in Backend folder

### Server starts then immediately stops
- Check for errors in the console
- Verify .env file exists and has correct settings
- Check database is accessible

## Summary

- Backend server must ALWAYS be running for the app to work
- Use the startup scripts for easier management
- Keep the PowerShell/Command window open
- Check for errors if the server stops
- Restart when needed

The backend server is just a program that needs to keep running. Keep the window open, and it will keep running! 🚀
