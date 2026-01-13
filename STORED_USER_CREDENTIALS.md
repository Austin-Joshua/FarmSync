# 🔐 FarmSync - Stored User Credentials

## Current Users in Database

### User #1: System Admin
- **Email:** `admin@farmsync.com`
- **Role:** ADMIN
- **Name:** System Admin
- **Location:** Not set
- **Onboarded:** No
- **Created:** January 8, 2026, 11:30:15 PM

### User #2: Test Farmer
- **Email:** `farmer@test.com`
- **Role:** FARMER
- **Name:** Test Farmer
- **Location:** Coimbatore, Tamil Nadu
- **Onboarded:** No
- **Created:** January 8, 2026, 11:30:15 PM

---

## ⚠️ Important Notes

1. **Passwords are securely hashed** and cannot be displayed for security reasons.
2. **To login**, you need to know the original password that was used during registration.
3. **If you forgot the password**, use the "Forgot Password" feature on the login page.

---

## 🔑 How to View All Users

Run this command in the Backend folder:

```powershell
cd Backend
npm run view-users
```

This will display all users currently stored in the database.

---

## 📝 Creating New Accounts

To create a new account:

1. Go to the registration page: `http://localhost:5173/register`
2. Fill in:
   - Full Name
   - Email Address
   - Password (must meet requirements)
   - Confirm Password
   - Role (Farmer or Admin)
3. Click "Register"

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

## 🛠️ Troubleshooting Registration

If you're getting "Cannot connect to server" error:

1. **Make sure backend server is running:**
   ```powershell
   cd Backend
   npm run dev
   ```

2. **Check backend is accessible:**
   - Open browser: `http://localhost:5000/health`
   - Should return: `{"status":"ok"}`

3. **Check database connection:**
   ```powershell
   cd Backend
   npm run verify-db
   ```

4. **Common issues:**
   - Backend server not started → Start it
   - Database not running → Start MySQL
   - Port 5000 in use → Kill process using port 5000
   - Wrong database credentials → Check `.env` file

---

## 🔄 Reset Password

If you need to reset a password:

1. Go to login page
2. Click "Forgot Password?"
3. Enter your email
4. Check email for reset link
5. Follow instructions to set new password

---

**Last Updated:** January 2026
