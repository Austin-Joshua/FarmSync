# How to Create a User Account in FarmSync

## Method 1: Using the Registration Page (EASIEST)

### Steps:
1. **Make sure the backend server is running** (it should be running on port 5000)
2. **Open your browser** and go to: `http://localhost:5173/register`
   - (Or whatever URL your frontend is running on)
3. **Fill in the registration form:**
   - **Full Name**: Enter your name (e.g., "John Doe")
   - **Email Address**: Enter a valid email (e.g., "john@example.com")
   - **Select Role**: Choose either "Farmer" or "Admin"
   - **Password**: Enter a strong password (must be at least 8 characters with uppercase, lowercase, number, and special character)
   - **Confirm Password**: Enter the same password again
4. **Click "Create Account"** or press **Enter**
5. **That's it!** Your account will be:
   - Created in the database
   - You'll be automatically logged in
   - Redirected to your dashboard (farmer) or admin page (admin)
   - A welcome email will be sent to your email address

### Example Registration:
- **Name**: John Doe
- **Email**: john@example.com
- **Role**: Farmer
- **Password**: MySecure123!
- **Confirm Password**: MySecure123!

---

## Method 2: Understanding How It Works (Database)

### How User Credentials are Stored:

1. **Password Hashing**: Passwords are **never stored in plain text**. They are:
   - Hashed using `bcrypt` (a secure hashing algorithm)
   - Stored as `password_hash` in the database
   - The original password cannot be recovered (one-way encryption)

2. **Database Structure**: Users are stored in the `users` table with these fields:
   - `id`: Unique identifier (UUID)
   - `name`: User's full name
   - `email`: Unique email address
   - `password_hash`: Hashed password (bcrypt)
   - `role`: Either "farmer" or "admin"
   - `location`: Optional location
   - `land_size`: Optional land size
   - `soil_type`: Optional soil type
   - `created_at`: Account creation timestamp

3. **Login Process**:
   - When you login, the system:
     1. Finds your user by email
     2. Compares your entered password with the stored hash
     3. If they match, creates a JWT token
     4. Returns the token and user data
     5. Frontend stores the token for authenticated requests

---

## Testing Your Account:

### After Registration:
1. You'll be automatically logged in and redirected
2. You can log out and log back in using:
   - **Email**: The email you registered with
   - **Password**: The password you created

### Login Page:
- Go to: `http://localhost:5173/login`
- Enter your email and password
- Click "Sign In" or press Enter

---

## Important Notes:

⚠️ **Password Requirements:**
- Minimum 8 characters
- Must contain uppercase letter (A-Z)
- Must contain lowercase letter (a-z)
- Must contain number (0-9)
- Must contain special character (!@#$%^&*, etc.)

✅ **Email Requirements:**
- Must be a valid email format
- Must be unique (cannot register with an email that already exists)

✅ **Security:**
- Passwords are hashed before storing
- Never stored in plain text
- Cannot be recovered (only reset)

---

## Troubleshooting:

**"User with this email already exists"**
- This email is already registered
- Try a different email or use the login page

**"Failed to connect to server"**
- Make sure the backend server is running on port 5000
- Check the backend terminal for errors

**Password validation errors**
- Make sure your password meets all requirements
- Check the password strength indicator on the form

---

## Quick Test Credentials:

After creating an account, you can use these credentials to login:

**Example Farmer Account:**
- Email: `farmer@test.com`
- Password: `Farmer123!`

**Example Admin Account:**
- Email: `admin@test.com`
- Password: `Admin123!`

*(Create these accounts using the registration page first!)*
