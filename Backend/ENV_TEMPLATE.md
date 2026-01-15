# ===========================
# FarmSync Backend Configuration Template
# ===========================
# Copy this file to .env and fill in your actual values
# DO NOT commit .env to version control!

# Environment
NODE_ENV=development
PORT=5174

# Frontend Configuration
FRONTEND_URL=http://localhost:5173

# ===========================
# DATABASE CONFIGURATION
# ===========================
DB_HOST=localhost
DB_PORT=3306
DB_NAME=farmsync_db
DB_USER=root
DB_PASSWORD=123456

# ===========================
# JWT Configuration
# ===========================
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRY=7d

# ===========================
# OAuth Configuration
# ===========================
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5174/api/auth/google/callback

APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
APPLE_CALLBACK_URL=http://localhost:5174/api/auth/apple/callback

MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_CALLBACK_URL=http://localhost:5174/api/auth/microsoft/callback

# ===========================
# Email Configuration
# ===========================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@farmsync.com

# ===========================
# Two-Factor Authentication
# ===========================
TOTP_WINDOW=1

# ===========================
# Weather API
# ===========================
WEATHER_API_KEY=your-weather-api-key

# ===========================
# Notification Services
# ===========================
WHATSAPP_ACCESS_TOKEN=your-token
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# ===========================
# Session Configuration
# ===========================
SESSION_SECRET=your-session-secret-change-this

# ===========================
# Logging Configuration
# ===========================
LOG_LEVEL=info
