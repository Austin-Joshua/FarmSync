# Database Management System (DBMS) for User Authentication

This document explains how the DBMS handles user registration and login in FarmSync.

## Overview

The authentication system uses **MySQL** database to store and verify user credentials. Passwords are securely hashed using `bcrypt` before storage.

---

## Database Schema

### Users Table Structure

```sql
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),        -- bcrypt hashed password
    role VARCHAR(20) NOT NULL CHECK (role IN ('farmer', 'admin')),
    location VARCHAR(255),
    land_size DECIMAL(10, 2) DEFAULT 0,
    soil_type VARCHAR(100),
    google_id VARCHAR(255) UNIQUE,
    apple_id VARCHAR(255) UNIQUE,
    microsoft_id VARCHAR(255) UNIQUE,
    picture_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Key Fields for Authentication:
- **`email`**: Unique identifier for users (UNIQUE constraint)
- **`password_hash`**: Securely hashed password (using bcrypt with 10 rounds)
- **`role`**: User role ('farmer' or 'admin')

---

## Registration Flow

### How User Registration Works:

1. **User submits registration form** (`POST /api/auth/register`)
   - Fields: `name`, `email`, `password`, `role`, `location` (optional)

2. **Backend validates input:**
   - Checks if all required fields are present
   - Validates email format
   - Validates password strength (8+ chars, uppercase, lowercase, number, special char)

3. **Database operations:**
   ```typescript
   // Check if user already exists
   const existingUser = await UserModel.findByEmail(email);
   if (existingUser) {
     throw new Error('User with this email already exists');
   }

   // Hash password before storing
   const passwordHash = await bcrypt.hash(password, 10);

   // Insert new user into database
   INSERT INTO users (name, email, password_hash, role, location, ...)
   VALUES (?, ?, ?, ?, ?, ...)
   ```

4. **Result:**
   - User record created in database
   - Password stored as hash (original password cannot be recovered)
   - JWT token generated and returned
   - User automatically logged in

### Code Location:
- **Controller**: `Backend/src/controllers/authController.ts` → `register()`
- **Service**: `Backend/src/services/authService.ts` → `AuthService.register()`
- **Model**: `Backend/src/models/User.ts` → `UserModel.create()`

---

## Login Flow

### How User Login Works:

1. **User submits login form** (`POST /api/auth/login`)
   - Fields: `email`, `password`

2. **Backend validates input:**
   - Checks if email and password are provided

3. **Database operations:**
   ```typescript
   // Find user by email
   const user = await UserModel.findByEmail(email);
   if (!user) {
     throw new Error('Invalid email or password');
   }

   // Verify password (compare with hash)
   const isValid = await bcrypt.compare(password, user.password_hash);
   if (!isValid) {
     throw new Error('Invalid email or password');
   }

   // Generate JWT token
   const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secret);
   ```

4. **Result:**
   - If credentials match: JWT token generated and returned
   - If credentials don't match: Error "Invalid email or password"
   - User data returned (without password_hash)

### Code Location:
- **Controller**: `Backend/src/controllers/authController.ts` → `login()`
- **Service**: `Backend/src/services/authService.ts` → `AuthService.login()`
- **Model**: `Backend/src/models/User.ts` → `UserModel.findByEmail()`, `UserModel.verifyPassword()`

---

## Password Security

### Password Hashing:
- **Algorithm**: bcrypt (industry standard)
- **Rounds**: 10 (configurable, higher = more secure but slower)
- **Storage**: Only hash is stored, never plain text
- **Verification**: `bcrypt.compare(plainPassword, hashedPassword)` returns boolean

### Example:
```typescript
// During Registration
const plainPassword = "MySecure123!";
const hash = await bcrypt.hash(plainPassword, 10);
// hash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"

// During Login
const isValid = await bcrypt.compare(plainPassword, hash);
// isValid = true (if password matches)
```

---

## Database Verification

### Verify Database Setup:

Run the verification script to ensure the database is properly configured:

```bash
cd Backend
npm run verify-db
```

This script checks:
1. ✅ Database connection
2. ✅ Users table exists
3. ✅ Required columns exist
4. ✅ Table structure is correct
5. ✅ Authentication queries work

### Manual Verification:

```sql
-- Check if users table exists
SHOW TABLES LIKE 'users';

-- Check table structure
DESCRIBE users;

-- Check if email is unique
SHOW INDEXES FROM users WHERE Column_name = 'email';

-- View all users (without passwords)
SELECT id, name, email, role, created_at FROM users;

-- Test query by email
SELECT * FROM users WHERE email = 'test@example.com';
```

---

## Common Issues & Solutions

### Issue 1: "User with this email already exists"
**Solution**: Email is already registered. Use a different email or login instead.

### Issue 2: "Invalid email or password"
**Possible causes:**
- Email doesn't exist in database
- Password is incorrect
- Password hash mismatch (rare, indicates database corruption)

**Solution**: Verify credentials or reset password.

### Issue 3: "Database connection failed"
**Possible causes:**
- MySQL server not running
- Wrong database credentials in `.env`
- Database doesn't exist

**Solution**: 
1. Check MySQL service: `mysql -u root -p`
2. Verify `.env` file has correct `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
3. Run `npm run setup-db` to create database

### Issue 4: "Users table does not exist"
**Solution**: Run database setup:
```bash
cd Backend
npm run setup-db    # Creates database and tables
npm run migrate     # Runs migrations
```

---

## Testing Authentication

### Test Registration:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!@#",
    "role": "farmer"
  }'
```

### Test Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

---

## Database Configuration

### Environment Variables (`.env`):

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=farmsync_db
DB_USER=root
DB_PASSWORD=your_password_here
```

### Connection Pool Settings:

Located in `Backend/src/config/database.ts`:
- `connectionLimit`: 10 (max concurrent connections)
- `connectTimeout`: 10000ms (10 seconds)
- `enableKeepAlive`: true (maintain connections)

---

## Best Practices

1. **Never store plain text passwords** - Always use bcrypt hashing
2. **Use parameterized queries** - Prevents SQL injection (already implemented)
3. **Validate input** - Check email format and password strength
4. **Handle errors gracefully** - Don't reveal if email exists during login
5. **Use transactions** - For complex operations (future enhancement)
6. **Index email column** - Improves query performance (already indexed)

---

## API Endpoints

### Registration:
- **Endpoint**: `POST /api/auth/register`
- **Body**: `{ name, email, password, role, location? }`
- **Returns**: `{ token, user: { id, name, email, role, ... } }`

### Login:
- **Endpoint**: `POST /api/auth/login`
- **Body**: `{ email, password }`
- **Returns**: `{ token, user: { id, name, email, role, ... } }`

### Get Profile (Protected):
- **Endpoint**: `GET /api/auth/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `{ user: { id, name, email, role, ... } }`

---

## Summary

✅ **Registration**: User credentials → Password hashed → Stored in `users` table  
✅ **Login**: Email + Password → Find user by email → Verify password hash → Generate JWT token  
✅ **Security**: bcrypt hashing, parameterized queries, JWT tokens  
✅ **Database**: MySQL with proper indexes and constraints  

The DBMS is fully functional and ready for user authentication! 🚀
