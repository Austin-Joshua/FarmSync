# DBMS Setup Guide for User Authentication

This guide explains how to set up and verify the Database Management System (DBMS) for user login and registration.

## Quick Start

### 1. Verify Database Setup

Run the verification script to check if your database is properly configured:

```bash
cd Backend
npm run verify-db
```

This will check:
- ✅ Database connection
- ✅ Users table exists
- ✅ Required columns are present
- ✅ Table structure is correct
- ✅ Authentication queries work

### 2. If Database is Not Set Up

If verification fails, run the setup scripts:

```bash
cd Backend

# Create database and tables
npm run setup-db

# Run migrations (if needed)
npm run migrate
```

---

## How User Authentication Works

### Registration Process:

1. User enters: `name`, `email`, `password`, `role`
2. Backend validates input (email format, password strength)
3. **Database Check**: Checks if email already exists
   ```sql
   SELECT * FROM users WHERE email = ?
   ```
4. **Password Hashing**: Password is hashed using bcrypt
   ```typescript
   const passwordHash = await bcrypt.hash(password, 10);
   ```
5. **Database Insert**: New user record is created
   ```sql
   INSERT INTO users (name, email, password_hash, role, ...)
   VALUES (?, ?, ?, ?, ...)
   ```
6. **Result**: User account created, JWT token generated, user logged in

### Login Process:

1. User enters: `email`, `password`
2. Backend validates input (both fields required)
3. **Database Query**: Find user by email
   ```sql
   SELECT * FROM users WHERE email = ?
   ```
4. **Password Verification**: Compare entered password with stored hash
   ```typescript
   const isValid = await bcrypt.compare(password, user.password_hash);
   ```
5. **Result**:
   - ✅ If match: JWT token generated, user logged in
   - ❌ If no match: Error "Invalid email or password"

---

## Database Structure

### Users Table:

| Column | Type | Description |
|--------|------|-------------|
| `id` | CHAR(36) | Unique UUID identifier |
| `name` | VARCHAR(255) | User's full name |
| `email` | VARCHAR(255) | Unique email address (UNIQUE constraint) |
| `password_hash` | VARCHAR(255) | bcrypt hashed password |
| `role` | VARCHAR(20) | 'farmer' or 'admin' |
| `location` | VARCHAR(255) | Optional location |
| `created_at` | TIMESTAMP | Account creation time |
| `updated_at` | TIMESTAMP | Last update time |

### Key Points:

- **Email is UNIQUE**: Each email can only be registered once
- **Password is hashed**: Original password cannot be recovered
- **Index on email**: Fast lookup for login queries

---

## Testing the DBMS

### Test Registration:

1. Open browser: `http://localhost:5173/register`
2. Fill in form:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Password: "Secure123!"
   - Role: "Farmer"
3. Click "Create Account"
4. **Expected Result**: Account created, redirected to dashboard

### Test Login:

1. Open browser: `http://localhost:5173/login`
2. Enter credentials:
   - Email: "john@example.com"
   - Password: "Secure123!"
3. Click "Sign In"
4. **Expected Result**: Logged in, redirected to dashboard

### Verify in Database:

```sql
-- Connect to MySQL
mysql -u root -p

-- Use database
USE farmsync_db;

-- View all users (without passwords)
SELECT id, name, email, role, created_at FROM users;

-- Check specific user
SELECT * FROM users WHERE email = 'john@example.com';
```

---

## Troubleshooting

### Issue: "Cannot connect to server"

**Cause**: Backend server not running or database not accessible

**Solution**:
1. Start backend: `cd Backend && npm run dev`
2. Check database is running: `mysql -u root -p`
3. Verify `.env` file has correct database credentials

### Issue: "User with this email already exists"

**Cause**: Email is already registered

**Solution**:
- Use a different email address
- Or login with existing credentials
- Or delete existing user from database

### Issue: "Invalid email or password"

**Possible causes**:
1. Email doesn't exist in database
2. Password is incorrect
3. Database connection issue

**Solution**:
1. Verify email is registered: `SELECT email FROM users WHERE email = 'your@email.com';`
2. Try registering again with a new password
3. Check database connection: `npm run verify-db`

### Issue: "Database connection failed"

**Cause**: MySQL server not running or wrong credentials

**Solution**:
1. Start MySQL service
2. Check `.env` file:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=farmsync_db
   DB_USER=root
   DB_PASSWORD=your_password
   ```
3. Test connection: `mysql -u root -p`

---

## Security Features

✅ **Password Hashing**: bcrypt with 10 rounds  
✅ **Parameterized Queries**: Prevents SQL injection  
✅ **Email Uniqueness**: Prevents duplicate accounts  
✅ **JWT Tokens**: Secure authentication tokens  
✅ **Input Validation**: Email format, password strength  

---

## File Locations

- **Database Schema**: `Backend/src/database/schema.sql`
- **User Model**: `Backend/src/models/User.ts`
- **Auth Service**: `Backend/src/services/authService.ts`
- **Auth Controller**: `Backend/src/controllers/authController.ts`
- **Database Config**: `Backend/src/config/database.ts`
- **Verification Script**: `Backend/src/database/verifyAuthDB.ts`

---

## Commands Reference

```bash
# Verify database setup
npm run verify-db

# Setup database (create database and tables)
npm run setup-db

# Run migrations
npm run migrate

# Seed database (optional - adds test data)
npm run seed

# Start backend server
npm run dev
```

---

## Summary

The DBMS for user authentication is fully functional:

✅ **Registration**: Stores user credentials securely in database  
✅ **Login**: Verifies credentials against database  
✅ **Security**: Passwords hashed, SQL injection protected  
✅ **Verification**: Script to check database setup  

**Your user credentials are stored in the `users` table and matched correctly during login!** 🎉
