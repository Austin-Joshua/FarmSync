# User Credentials Guide - FarmSync

## How Credentials Work

### ✅ **Use REAL User Credentials - No Dummy Accounts Needed!**

You **DO NOT** need any dummy/test credentials or additional APIs. Here's how it works:

---

## 🔐 **Registration & Login Flow**

### **1. Create Account (Registration)**
- Go to: `http://localhost:5173/register`
- Fill in the registration form:
  - **Name**: Your full name
  - **Email**: Your email address (must be unique)
  - **Password**: Strong password (8+ chars, uppercase, lowercase, number, special char)
  - **Confirm Password**: Same password
  - **Role**: Select "Farmer" or "Admin"
- Click "Create Account"

**What Happens:**
1. ✅ Your credentials are **saved to the database** (password is securely hashed)
2. ✅ Account is **created in MySQL database** (`users` table)
3. ✅ You are **automatically logged in**
4. ✅ You are **redirected** to dashboard (farmer) or admin page (admin)
5. ✅ Welcome email is sent to your email

### **2. Login with Your Account**
- Go to: `http://localhost:5173/login`
- Enter:
  - **Email**: The email you registered with
  - **Password**: The password you created
- Click "Sign In"

**Your credentials are stored in the database and work immediately!**

---

## 🗄️ **Database Storage**

Your credentials are stored in the `users` table:
- `email`: Your email address (unique)
- `password_hash`: Your password (encrypted with bcrypt - cannot be recovered)
- `name`: Your name
- `role`: "farmer" or "admin"
- `created_at`: When you registered

**Database Location:**
- MySQL database: `farmsync_db` (or whatever is in your `.env`)
- Table: `users`
- Password is **hashed** - never stored in plain text

---

## 🚫 **No Test/Dummy Credentials**

- ❌ **No** dummy accounts needed
- ❌ **No** test credentials required
- ❌ **No** additional APIs needed
- ✅ **Just register** and use your own credentials!

---

## 📝 **Example: Creating Your First Account**

### **Farmer Account:**
1. Go to `/register`
2. Fill in:
   - Name: `John Farmer`
   - Email: `john@example.com`
   - Password: `MySecure123!`
   - Role: `Farmer`
3. Click "Create Account"
4. You're logged in and redirected to dashboard!

### **Admin Account:**
1. Go to `/register`
2. Fill in:
   - Name: `Admin User`
   - Email: `admin@example.com`
   - Password: `AdminSecure123!`
   - Role: `Admin`
3. Click "Create Account"
4. You're logged in and redirected to admin page!

---

## 🔍 **Verifying Your Account**

After registration, you can verify your account exists:

1. **Login Test:**
   - Go to `/login`
   - Use the email and password you registered with
   - You should be logged in successfully

2. **Database Check (Optional):**
   - Connect to MySQL database
   - Query: `SELECT id, name, email, role, created_at FROM users;`
   - You'll see your registered account

---

## 🎯 **Key Points**

✅ **Registration creates REAL accounts** - stored in database
✅ **Login uses your registered credentials** - no dummy data
✅ **Each user has their own account** - unique email required
✅ **Passwords are secure** - hashed with bcrypt
✅ **Auto-login after registration** - no manual login needed

---

## 🛠️ **Troubleshooting**

**"User with this email already exists"**
- This email is already registered
- Use a different email or login with existing account

**"Cannot connect to server"**
- Make sure backend is running on port 5000
- Check backend terminal for errors

**"Invalid email or password"**
- Double-check your email and password
- Make sure you registered first
- Password is case-sensitive

---

## 📚 **API Endpoints Used**

Your app uses these backend APIs:

1. **POST `/api/auth/register`**
   - Creates new user account
   - Returns: `{ user, token }`

2. **POST `/api/auth/login`**
   - Authenticates user
   - Returns: `{ user, token }`

3. **GET `/api/auth/profile`**
   - Gets user profile (requires authentication)

**No additional APIs needed!** These are all built into the backend.

---

## 🎉 **Summary**

**You don't need dummy credentials or test accounts!**

1. **Register** → Creates account in database
2. **Auto-login** → You're logged in immediately
3. **Use your credentials** → Login anytime with your email/password
4. **That's it!** → No dummy data, no test accounts needed

Just register and use your real credentials! 🚀
