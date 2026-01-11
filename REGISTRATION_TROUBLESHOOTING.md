# Registration Troubleshooting Guide

## Issue: Cannot Register with Email austinjoshuamj@gmail.com

### Password Validation: ✅ PASSED
Your password `Austin2006*` meets all requirements:
- ✅ Length: 11 characters (8+ required)
- ✅ Uppercase letter: A
- ✅ Lowercase letters: u, s, t, i, n
- ✅ Numbers: 2, 0, 0, 6
- ✅ Special character: *

**The password is valid!**

---

## Most Likely Issues

### 1. Email Already Exists (Most Common)

**Error Message:** "User with this email already exists"

**Solution:**
- Try using a different email address
- OR login with the existing account at `/login`
- The email `austinjoshuamj@gmail.com` is already registered

### 2. Backend Server Not Running

**Error Message:** "Failed to connect to server. Please make sure the backend server is running on http://localhost:5000"

**Solution:**
- Make sure the backend server is running on port 5000
- Check the backend PowerShell window
- Restart the backend server if needed

### 3. Frontend Server Not Running

**Symptom:** Blank page or page not loading

**Solution:**
- Make sure the frontend server is running on port 5173
- Check the frontend PowerShell window
- Restart the frontend server if needed

---

## How to Register Successfully

### Step 1: Make Sure Both Servers Are Running

1. **Backend Server** (port 5000):
   - PowerShell window showing backend logs
   - Should say "Server running on port 5000"

2. **Frontend Server** (port 5173):
   - PowerShell window showing Vite/frontend logs
   - Should say "Local: http://localhost:5173"

### Step 2: Go to Registration Page

- URL: `http://localhost:5173/register`

### Step 3: Fill in the Form

**If email exists, use a different email:**
- Name: Your name (e.g., "Austin Joshua")
- Email: **Use a NEW email** (e.g., "austin.joshua@gmail.com" or "austin2@gmail.com")
- Password: Austin2006* (this password is valid!)
- Confirm Password: Austin2006*
- Role: Farmer

**Or use the same password with a variation:**
- Password: Austin2006@
- Password: Austin2006!
- Password: MySecure2006*

### Step 4: Check for Error Messages

- Look at the red error box at the top of the registration form
- The error message will tell you exactly what's wrong:
  - "User with this email already exists" → Use different email
  - "Password validation failed" → Check password requirements
  - "Failed to connect to server" → Backend not running

---

## Alternative: Login with Existing Account

If the email `austinjoshuamj@gmail.com` already exists:

1. Go to: `http://localhost:5173/login`
2. Email: austinjoshuamj@gmail.com
3. Password: Austin2006* (or whatever password you used)
4. Click "Sign In"

---

## Password Requirements (Reference)

Your password must have:
- ✅ At least 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ At least one special character (!@#$%^&*()_+-=[]{};':"|,.<>/?)

**Your password `Austin2006*` meets all requirements!**

---

## Quick Test

Try registering with:
- **Name**: Austin Joshua
- **Email**: austin.joshua@gmail.com (different from the one you tried)
- **Password**: Austin2006*
- **Confirm Password**: Austin2006*
- **Role**: Farmer

This should work if the email is different!

---

## Still Having Issues?

1. **Check the browser console** (F12 → Console tab) for errors
2. **Check the backend PowerShell window** for error messages
3. **Check the frontend PowerShell window** for compilation errors
4. **Look at the error message** on the registration page itself

The error message will tell you exactly what's wrong!
