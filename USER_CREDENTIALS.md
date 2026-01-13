# 🔐 FarmSync - Stored User Credentials

## ⚠️ IMPORTANT SECURITY NOTE

**Passwords are securely hashed using bcrypt** and cannot be displayed or retrieved in plain text. This is a security feature to protect user accounts.

---

## 📋 Current Users in Database

### User #1: System Admin
- **Email:** `admin@farmsync.com`
- **Role:** ADMIN
- **Name:** System Admin
- **Location:** Not set
- **Onboarded:** No
- **Created:** January 8, 2026, 11:30:15 PM
- **Password:** Securely hashed (cannot be displayed)

### User #2: Test Farmer
- **Email:** `farmer@test.com`
- **Role:** FARMER
- **Name:** Test Farmer
- **Location:** Coimbatore, Tamil Nadu
- **Onboarded:** No
- **Created:** January 8, 2026, 11:30:15 PM
- **Password:** Securely hashed (cannot be displayed)

---

## 🔑 How to Login

### If You Know the Password:
1. Go to login page: `http://localhost:5173/login`
2. Enter email and password
3. Click "Login"

### If You Forgot the Password:
1. Go to login page
2. Click "Forgot Password?"
3. Enter your email
4. Check email for reset link
5. Follow instructions to set new password

---

## 🆕 Creating New Accounts

To create a new account:

1. Go to: `http://localhost:5173/register`
2. Fill in:
   - **Full Name:** Your name
   - **Email:** Your email address
   - **Password:** Must meet requirements:
     - At least 8 characters
     - At least one uppercase letter (A-Z)
     - At least one lowercase letter (a-z)
     - At least one number (0-9)
     - At least one special character (!@#$%^&*()_+-=[]{};':|,.<>/?~)
   - **Confirm Password:** Same as password
   - **Role:** Select Farmer or Admin
3. Click "Register"
4. You'll be redirected to Dashboard

---

## 🔍 View All Users

To view all users in the database:

```powershell
cd Backend
npm run view-users
```

This will display:
- All user emails
- User roles
- Registration dates
- Onboarding status

**Note:** Passwords are never displayed for security reasons.

---

## 🔒 Password Security

- Passwords are hashed using **bcrypt** (industry standard)
- Original passwords cannot be retrieved
- Password reset requires email verification
- This is a security feature, not a bug

---

## 📝 Test Accounts

If you need test accounts, you can:

1. **Register new accounts** using the registration page
2. **Use existing accounts** if you know the passwords
3. **Reset passwords** using the "Forgot Password" feature

---

## ⚠️ Important Notes

1. **Passwords are hashed** - Cannot be displayed or retrieved
2. **Email verification** - Required for password reset
3. **Secure storage** - All passwords are encrypted
4. **No plain text** - Passwords are never stored in readable format

---

**Last Updated:** January 2026
