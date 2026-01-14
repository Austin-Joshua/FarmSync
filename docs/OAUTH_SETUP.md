# FarmSync Phase 1 - OAuth & Integration Setup Guide

## Environment Configuration

### Google OAuth Setup

1. **Create Google OAuth Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable Google+ API

2. **Get Credentials**
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (development)
     - `http://localhost:5173/auth/google/callback` (frontend)
     - `https://yourdomain.com/api/auth/google/callback` (production)

3. **Backend .env**
   ```
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

4. **Frontend .env**
   ```
   VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   ```

### Microsoft OAuth Setup

1. **Create Azure AD App**
   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to "Azure Active Directory" → "App registrations" → "New registration"
   - Name: "FarmSync"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"

2. **Get Credentials**
   - Go to "Certificates & secrets" → "New client secret"
   - Copy the value (you won't see it again)

3. **Configure Redirect URIs**
   - Go to "Authentication" → "Add a platform" → "Web"
   - Add redirect URIs:
     - `http://localhost:5000/api/auth/microsoft/callback` (dev)
     - `https://yourdomain.com/api/auth/microsoft/callback` (prod)

4. **Backend .env**
   ```
   AZURE_TENANT_ID=your_tenant_id
   AZURE_CLIENT_ID=your_client_id
   AZURE_CLIENT_SECRET=your_client_secret
   AZURE_CALLBACK_URL=http://localhost:5000/api/auth/microsoft/callback
   ```

### Apple Sign-In Setup

1. **Apple Developer Account**
   - Sign in at [developer.apple.com](https://developer.apple.com)
   - Go to "Certificates, Identifiers & Profiles"

2. **Create Service ID**
   - Register a new Service ID (e.g., "com.farmsync.web")
   - Enable "Sign In with Apple"

3. **Configure Web Return URLs**
   - Add return URLs:
     - `http://localhost:5173` (dev)
     - `https://yourdomain.com` (prod)

4. **Create Private Key**
   - In "Keys" section, create new key
   - Enable "Sign in with Apple"
   - Download the key file

5. **Frontend .env**
   ```
   VITE_APPLE_CLIENT_ID=com.farmsync.web
   VITE_APPLE_TEAM_ID=your_team_id
   ```

6. **Backend .env**
   ```
   APPLE_KEY_ID=your_key_id
   APPLE_TEAM_ID=your_team_id
   APPLE_SERVICE_ID=com.farmsync.web
   ```

### Twilio SMS Setup

1. **Create Twilio Account**
   - Go to [twilio.com](https://www.twilio.com)
   - Sign up and verify phone number
   - Get free trial credits ($15)

2. **Get Credentials**
   - Account SID (in Dashboard)
   - Auth Token (in Dashboard)
   - Buy a Twilio phone number (US: $1/month, India: $0.50/month)

3. **Backend .env**
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### WhatsApp Business API Setup

1. **Meta Developer Account**
   - Go to [developers.facebook.com](https://developers.facebook.com)
   - Create developer account
   - Create new app (type: Business)

2. **Add WhatsApp Product**
   - Select WhatsApp from products
   - Set up WhatsApp Business Account
   - Add phone number (verify with code)

3. **Get Access Token**
   - Go to "WhatsApp" → "API Setup"
   - Generate permanent access token
   - Copy Phone Number ID

4. **Backend .env**
   ```
   WHATSAPP_TOKEN=your_permanent_access_token
   WHATSAPP_PHONE_ID=your_phone_number_id
   WHATSAPP_API_URL=https://graph.instagram.com/v18.0
   ```

### Database Schema Updates

Run these migrations to add OAuth fields:

```sql
-- Add OAuth columns to users table
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN microsoft_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN apple_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN photo_url VARCHAR(500);
ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(50);

-- Create notifications table
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('sms', 'whatsapp', 'email', 'in_app'),
  title VARCHAR(255),
  message TEXT,
  status ENUM('sent', 'pending', 'failed'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create SMS logs table
CREATE TABLE sms_logs (
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
CREATE TABLE whatsapp_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  phone_number VARCHAR(20),
  message TEXT,
  status VARCHAR(50),
  message_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Implementation Steps

### 1. Backend Setup

```bash
cd Backend
npm install passport passport-google-oauth20 passport-azure-ad twilio axios
```

Add OAuth routes to `server.ts`:

```typescript
import passport from 'passport';
import oauthRoutes from './src/routes/oauthRoutes';
import { initializeOAuth } from './src/services/oauthService';

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
initializeOAuth();

// OAuth Routes
app.use('/api/auth', oauthRoutes);
```

### 2. Frontend Setup

```bash
cd Frontend
npm install @react-oauth/google react-apple-login axios
```

Add OAuth component to Login page:

```typescript
import OAuthSignIn from '@/components/OAuthSignIn';

export const LoginPage = () => {
  return (
    <div>
      {/* Existing login form */}
      <OAuthSignIn />
    </div>
  );
};
```

## Testing

### Test Google Sign-In
```bash
# Visit in browser
http://localhost:5173/login
# Click "Sign in with Google"
# Should redirect and create user
```

### Test SMS
```bash
# Backend endpoint
POST /api/notifications/send-sms
{
  "userId": 1,
  "message": "Test message",
  "phoneNumber": "+1234567890"
}
```

### Test WhatsApp
```bash
# Backend endpoint
POST /api/notifications/send-whatsapp
{
  "userId": 1,
  "message": "Test message",
  "phoneNumber": "919876543210"  # Indian format
}
```

## Production Deployment

See DEPLOYMENT_GUIDE.md for complete hosting instructions.
