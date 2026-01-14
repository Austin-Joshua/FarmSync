# FarmSync Phase 1 - Quick Start Implementation

## What's Included in Phase 1

✅ **OAuth Authentication**
- Google Sign-In
- Microsoft OAuth (Azure AD)
- Apple Sign-In
- Automatic user creation on first login

✅ **SMS Notifications** (Twilio)
- Weather alerts
- Irrigation reminders
- Market price updates
- Crop calendar notifications

✅ **WhatsApp Integration**
- Real-time alerts
- Crop calendar updates
- Market prices
- Expense reports

---

## Implementation Checklist

### Backend Setup (30 minutes)

```bash
# 1. Navigate to Backend folder
cd Backend

# 2. Install OAuth packages (already done)
# npm install passport passport-google-oauth20 passport-azure-ad twilio dotenv

# 3. Create .env file with credentials
cat > .env << 'EOF'
# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Microsoft Azure
AZURE_TENANT_ID=your_tenant_id
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret

# Apple
APPLE_KEY_ID=your_apple_key_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_SERVICE_ID=com.farmsync.web

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# WhatsApp
WHATSAPP_API_KEY=your_whatsapp_api_key
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Frontend
FRONTEND_URL=http://localhost:5173
EOF

# 4. Update server.ts to include OAuth routes
# See OAUTH_SETUP.md for details

# 5. Run database migrations
npm run setup-db

# 6. Start backend
npm run dev
```

### Frontend Setup (20 minutes)

```bash
# 1. Navigate to Frontend folder
cd Frontend

# 2. Install OAuth packages (already done)
# npm install @react-oauth/google react-apple-login

# 3. Create .env file
cat > .env << 'EOF'
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_MICROSOFT_CLIENT_ID=your_microsoft_client_id
VITE_APPLE_CLIENT_ID=com.farmsync.web
VITE_APPLE_TEAM_ID=your_apple_team_id
EOF

# 4. Update Login.tsx to use OAuthSignIn component
# See OAuthSignIn.tsx component in src/components/

# 5. Start frontend
npm run dev
```

---

## Configuration Instructions

### Get Google OAuth Credentials (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "FarmSync"
3. Go to APIs & Services → Credentials
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Choose "Web application"
6. Add Authorized JavaScript origins:
   - `http://localhost:5173`
   - `http://localhost:5000`
7. Add Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
   - `http://localhost:5173/login`
8. Copy Client ID and Client Secret → paste in .env

### Get Microsoft OAuth Credentials (5 minutes)

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for "App registrations" → "New registration"
3. Name: "FarmSync" → Register
4. Go to Certificates & secrets → "New client secret"
5. Copy the secret value → paste in .env
6. Go to Authentication → "Add a platform" → "Web"
7. Add Redirect URIs:
   - `http://localhost:5000/api/auth/microsoft/callback`
8. Copy Application ID and Tenant ID → paste in .env

### Get Apple Sign-In Credentials (5 minutes)

1. Go to [Apple Developer](https://developer.apple.com)
2. Go to "Certificates, Identifiers & Profiles"
3. Create new Service ID: "com.farmsync.web"
4. Enable "Sign In with Apple"
5. Add domain: `localhost:5173`, your domain
6. Go to Keys → Create new key
7. Enable "Sign In with Apple"
8. Download key → save locally
9. Copy Key ID, Team ID → paste in .env

### Get Twilio SMS Credentials (5 minutes)

1. Sign up at [Twilio.com](https://www.twilio.com)
2. Verify phone number
3. Buy Twilio number (from Dashboard → Phone Numbers)
4. Go to Account → API Keys
5. Copy Account SID and Auth Token → paste in .env
6. Add your Twilio phone number to .env

### Get WhatsApp API Credentials (10 minutes)

1. Go to [Meta Developers](https://developers.facebook.com)
2. Create app → Type: Business
3. Add WhatsApp product
4. Set up WhatsApp Business Account
5. Verify phone number
6. Go to API Setup → Generate access token
7. Copy Token and Phone Number ID → paste in .env

---

## Testing Phase 1 Features

### Test Google Sign-In
```bash
# 1. Start both backend and frontend
# Backend: cd Backend && npm run dev
# Frontend: cd Frontend && npm run dev

# 2. Go to http://localhost:5173/login
# 3. Click "Sign in with Google"
# 4. Select Google account
# 5. Should redirect to dashboard with user profile
```

### Test SMS
```bash
# Using API client (Postman/Insomnia):

POST http://localhost:5000/api/notifications/send-sms
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "phoneNumber": "+919876543210",
  "message": "Hello from FarmSync!",
  "type": "notification"
}

# Should receive SMS within 30 seconds
```

### Test WhatsApp
```bash
POST http://localhost:5000/api/notifications/send-whatsapp
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "phoneNumber": "919876543210",
  "message": "Hello from FarmSync!",
  "type": "text"
}

# Should receive WhatsApp message within 2 seconds
```

### Test Weather Alert
```bash
POST http://localhost:5000/api/notifications/weather-alert-sms
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "phoneNumber": "+919876543210",
  "cropName": "Rice",
  "alertMessage": "Heavy rain expected tomorrow. Prepare for drainage."
}
```

---

## Database Schema

Run these SQL commands to set up tables:

```sql
-- Add OAuth columns to users table
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN microsoft_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN apple_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN photo_url VARCHAR(500);

-- Create SMS logs table
CREATE TABLE IF NOT EXISTS sms_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  phone_number VARCHAR(20),
  message TEXT,
  status VARCHAR(50),
  twilio_sid VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create WhatsApp logs table
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  phone_number VARCHAR(20),
  message TEXT,
  status VARCHAR(50),
  message_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  sms_enabled BOOLEAN DEFAULT TRUE,
  whatsapp_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Troubleshooting

### OAuth not working?
```
Error: "Callback URL mismatch"
→ Make sure callback URL in provider matches .env

Error: "Invalid client ID"
→ Check that client ID is correct and active in console
```

### SMS not sending?
```
Error: "Invalid Twilio credentials"
→ Check Account SID and Auth Token in .env

Error: "Invalid phone number"
→ Phone must include country code: +919876543210
```

### WhatsApp not working?
```
Error: "Invalid API token"
→ Token may be expired, regenerate in Meta Developers

Error: "Phone number not verified"
→ Phone must be verified in WhatsApp Business Account
```

---

## Next Steps

1. ✅ Implement OAuth sign-in (Google, Microsoft, Apple)
2. ✅ Set up SMS notifications (Twilio)
3. ✅ Set up WhatsApp integration
4. 🔄 **Next**: Add advanced field management with satellite imagery
5. 🔄 **Next**: Implement real-time market prices
6. 🔄 **Next**: Create agricultural marketplace
7. 🔄 **Next**: Build mobile app with React Native

---

## Deployment

When ready to go live:

1. Deploy to AWS (see DEPLOYMENT_GUIDE.md)
2. Update OAuth callback URLs to production domain
3. Get production API keys for Twilio and WhatsApp
4. Enable HTTPS (free with Let's Encrypt)
5. Set up monitoring and alerts

---

## Support

For detailed setup, see:
- `docs/OAUTH_SETUP.md` - Detailed OAuth configuration
- `docs/DEPLOYMENT_GUIDE.md` - Hosting and deployment
- `docs/FEATURES_GUIDE.md` - All features documentation
