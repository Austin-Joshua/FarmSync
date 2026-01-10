# How to Run FarmSync Web App - Step by Step Terminal Guide

## Prerequisites
- Node.js installed (v18 or higher)
- MySQL installed and running
- npm installed

## Step-by-Step Instructions

### Step 1: Start MySQL Service

**Windows (PowerShell):**
```powershell
net start MySQL80
```

**Linux/Mac:**
```bash
sudo systemctl start mysql
# or
sudo service mysql start
```

---

### Step 2: Open First Terminal - Backend Server

Open a new terminal/PowerShell window and navigate to the Backend folder:

**Windows (PowerShell):**
```powershell
cd C:\Users\austi\OneDrive\Desktop\FarmSync\Backend
```

**Linux/Mac:**
```bash
cd ~/Desktop/FarmSync/Backend
```

---

### Step 3: Install Backend Dependencies (First Time Only)

If you haven't installed dependencies yet:
```bash
npm install
```

---

### Step 4: Start Backend Server

In the Backend terminal, run:
```bash
npm run dev
```

**Expected Output:**
```
Server running on port 5000
Database connected successfully
```

**⚠️ Keep this terminal window open!** The backend server must keep running.

---

### Step 5: Open Second Terminal - Frontend Server

Open a **NEW** terminal/PowerShell window (don't close the backend terminal) and navigate to the Frontend folder:

**Windows (PowerShell):**
```powershell
cd C:\Users\austi\OneDrive\Desktop\FarmSync\Frontend
```

**Linux/Mac:**
```bash
cd ~/Desktop/FarmSync/Frontend
```

---

### Step 6: Install Frontend Dependencies (First Time Only)

If you haven't installed dependencies yet:
```bash
npm install
```

---

### Step 7: Start Frontend Server

In the Frontend terminal, run:
```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**⚠️ Keep this terminal window open too!** The frontend server must keep running.

---

### Step 8: Open in Browser

Open your web browser and navigate to:
```
http://localhost:5173
```

---

### Step 9: Login

Use one of these credentials:

**Admin Account:**
- Email: `admin@farmsync.com`
- Password: `admin123`

**Farmer Account:**
- Email: `farmer@test.com`
- Password: `farmer123`

---

## Quick Start (Copy-Paste Commands)

### Terminal 1 - Backend:
```powershell
cd C:\Users\austi\OneDrive\Desktop\FarmSync\Backend
npm install
npm run dev
```

### Terminal 2 - Frontend (NEW WINDOW):
```powershell
cd C:\Users\austi\OneDrive\Desktop\FarmSync\Frontend
npm install
npm run dev
```

Then open: **http://localhost:5173**

---

## Troubleshooting

### Backend won't start:
- ✅ Check MySQL is running: `net start MySQL80`
- ✅ Verify `.env` file exists in Backend folder
- ✅ Check if port 5000 is available
- ✅ Look for errors in the terminal

### Frontend won't start:
- ✅ Check if port 5173 is available
- ✅ Verify `Frontend/.env` file exists
- ✅ Make sure backend is running first
- ✅ Try: `npm install` again

### Can't connect to database:
- ✅ MySQL service must be running
- ✅ Check database password in `Backend/.env` (should be `123456`)
- ✅ Verify database exists: Run `npm run setup-db` in Backend folder

### Port already in use:
- ✅ Stop any other applications using ports 5000 or 5173
- ✅ Or change ports in `.env` files

---

## First-Time Setup (If Database Not Created)

If this is your first time running the app:

```powershell
cd Backend
npm install
npm run setup-db    # Creates database and tables
npm run seed        # Creates default users
npm run dev         # Start server
```

---

## Stopping the Servers

To stop the servers:
- Press `Ctrl + C` in each terminal window
- Or close the terminal windows

---

## Summary

1. **Terminal 1:** `cd Backend` → `npm run dev` (port 5000)
2. **Terminal 2:** `cd Frontend` → `npm run dev` (port 5173)
3. **Browser:** Open `http://localhost:5173`
4. **Login:** Use provided credentials

That's it! Your web app should be running. 🚀
