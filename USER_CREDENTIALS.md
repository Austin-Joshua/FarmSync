# 🔐 FarmSync - User Credentials

## ⚠️ IMPORTANT: Password Security

**Passwords are securely hashed using bcrypt** and **CANNOT be displayed** in plain text. This is a security feature to protect user accounts.

---

## 📋 Stored User Accounts

### User #1: System Admin
- **Email:** `admin@farmsync.com`
- **Role:** ADMIN
- **Name:** System Admin
- **Location:** Not set
- **Created:** January 8, 2026, 11:30:15 PM
- **Password:** 🔒 Securely hashed (cannot be displayed)

### User #2: Test Farmer
- **Email:** `farmer@test.com`
- **Role:** FARMER
- **Name:** Test Farmer
- **Location:** Coimbatore, Tamil Nadu
- **Created:** January 8, 2026, 11:30:15 PM
- **Password:** 🔒 Securely hashed (cannot be displayed)

---

## 🔑 How to Login

### If You Know the Password:
1. Go to: `http://localhost:5173/login`
2. Enter email: `admin@farmsync.com` or `farmer@test.com`
3. Enter the password you used when creating the account
4. Click "Login"
5. You'll be redirected to Dashboard

### If You Don't Know the Password:
**Option 1: Reset Password**
1. Go to login page
2. Click "Forgot Password?"
3. Enter your email
4. Check email for reset link
5. Set new password

**Option 2: Create New Account**
1. Go to: `http://localhost:5173/register`
2. Fill in your details
3. Choose a password (remember it!)
4. Click "Register"
5. You'll be redirected to Dashboard

---

## 🆕 Creating New Account

### Registration Steps:
1. **Go to:** `http://localhost:5173/register`
2. **Fill in:**
   - Full Name: Your name
   - Email: Your email address
   - Password: Must meet requirements:
     - ✅ At least 8 characters
     - ✅ At least one uppercase letter (A-Z)
     - ✅ At least one lowercase letter (a-z)
     - ✅ At least one number (0-9)
     - ✅ At least one special character (!@#$%^&*()_+-=[]{};':|,.<>/?~)
   - Confirm Password: Same as password
   - Role: Select 👨‍🌾 Farmer or 👨‍💼 Admin
3. **Click:** "Register"
4. **After registration:** You'll be redirected to Dashboard (main page)

---

## 🔍 View All Users

To see all users in the database:

```powershell
cd Backend
npm run view-users
```

This shows:
- All user emails
- User roles
- Registration dates
- Onboarding status

**Note:** Passwords are never displayed (security feature).

---

## 🔒 Why Passwords Can't Be Shown

- **Security:** Passwords are hashed using bcrypt (industry standard)
- **Protection:** Even administrators cannot see passwords
- **Privacy:** Protects user accounts from unauthorized access
- **Best Practice:** This is how all secure systems work

---

## 📝 Test Accounts

The database currently has 2 test accounts:
1. **Admin:** `admin@farmsync.com`
2. **Farmer:** `farmer@test.com`

**To use these accounts:**
- You need to know the original password used during account creation
- If you don't know it, use "Forgot Password" to reset it
- Or create a new account with your own email

---

## ✅ After Login/Registration

- **Farmers** → Redirected to Dashboard (main page)
- **Admins** → Redirected to Admin Dashboard
- **All users** → Can access all features

---

**Last Updated:** January 2026
