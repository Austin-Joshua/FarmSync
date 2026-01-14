# OAuth & SMS Setup Checklist - Step by Step

## 🎯 Objective
Get all OAuth credentials in 45 minutes. This is the **critical path** to launch Phase 1.

---

## Part 1: Google OAuth (10 minutes)

### 1.1 Create Google Cloud Project
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com)
- [ ] Sign in with your Google account
- [ ] Click "Select a Project" → "New Project"
- [ ] Name: `FarmSync` → Create
- [ ] Wait 1-2 minutes for project creation

### 1.2 Enable OAuth API
- [ ] Click "APIs & Services" → "Library"
- [ ] Search for `Google+ API` → Click it
- [ ] Click "Enable"
- [ ] Back to "APIs & Services" → "Credentials"

### 1.3 Create OAuth Credentials
- [ ] Click "Create Credentials" → "OAuth 2.0 Client ID"
- [ ] If asked, configure consent screen first:
  - [ ] Select "External" → Create
  - [ ] App name: `FarmSync`
  - [ ] User support email: (your email)
  - [ ] Developer contact: (your email)
  - [ ] Save and continue
- [ ] Back to credentials
- [ ] Click "Create Credentials" → "OAuth 2.0 Client ID"
- [ ] Application type: `Web application`
- [ ] Name: `FarmSync Web`
- [ ] Authorized JavaScript origins:
  ```
  http://localhost:5173
  http://localhost:5174
  ```
- [ ] Authorized redirect URIs:
  ```
  http://localhost:5000/api/auth/oauth/google/callback
  ```
- [ ] Click "Create"
- [ ] Copy **Client ID** and **Client Secret** (save somewhere safe!)

### 1.4 Update Backend .env
```bash
GOOGLE_CLIENT_ID=your-copied-client-id
GOOGLE_CLIENT_SECRET=your-copied-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/oauth/google/callback
```

**✅ Google OAuth: DONE!**

---

## Part 2: Microsoft OAuth (10 minutes)

### 2.1 Go to Azure Portal
- [ ] Go to [Azure Portal](https://portal.azure.com)
- [ ] Sign in with your Microsoft account
- [ ] Search for "Azure AD" or "Microsoft Entra ID"
- [ ] Click on it

### 2.2 Register Application
- [ ] Click "App registrations" → "New registration"
- [ ] Application name: `FarmSync`
- [ ] Supported account types: `Accounts in any organizational directory and personal Microsoft accounts`
- [ ] Redirect URI (Web): 
  ```
  http://localhost:5000/api/auth/oauth/microsoft/callback
  ```
- [ ] Click "Register"

### 2.3 Get Credentials
- [ ] You're now in app overview
- [ ] Copy **Application (client) ID** (save this!)
- [ ] Copy **Directory (tenant) ID** (save this!)
- [ ] Click "Certificates & secrets"
- [ ] Click "New client secret"
- [ ] Description: `FarmSync Backend`
- [ ] Expires: `24 months`
- [ ] Click "Add"
- [ ] Copy the **Value** of the secret (only shows once!)

### 2.4 Update Backend .env
```bash
AZURE_CLIENT_ID=your-application-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id
AZURE_CALLBACK_URL=http://localhost:5000/api/auth/oauth/microsoft/callback
```

**✅ Microsoft OAuth: DONE!**

---

## Part 3: Apple Sign-In (15 minutes)

### 3.1 Get Apple Developer Account
- [ ] Go to [Apple Developer](https://developer.apple.com)
- [ ] Sign in with your Apple ID (create one if needed)
- [ ] Agree to terms

### 3.2 Create Service ID
- [ ] Go to "Certificates, IDs & Profiles"
- [ ] Click "Identifiers" in left menu
- [ ] Click "+" button
- [ ] Select "Service IDs" → Continue
- [ ] Description: `FarmSync Web Service`
- [ ] Identifier: `com.farmsync.web` (IMPORTANT: Must start with com.)
- [ ] Check "Sign In with Apple"
- [ ] Click "Configure"
- [ ] Primary Web Domain: `localhost`
- [ ] Return URLs:
  ```
  http://localhost:5000/api/auth/oauth/apple
  ```
- [ ] Click "Save" → "Continue" → "Register"

### 3.3 Create Private Key
- [ ] Go to "Keys" in left menu
- [ ] Click "+" button
- [ ] Key name: `FarmSync Key`
- [ ] Check "Sign in with Apple"
- [ ] Click "Configure" → Click "Save" under "Web Services"
- [ ] Click "Continue" → "Register"
- [ ] Click "Download" (save this file securely!)
- [ ] You'll get a file named `AuthKey_XXXXXXXXXX.p8`

### 3.4 Get Your Apple IDs
- [ ] Find your **Team ID** (top right corner, small menu)
- [ ] Find your **Key ID** (look at the AuthKey file name: `AuthKey_XXXXXXXX.p8` - the 8 characters after AuthKey_)
- [ ] Service ID: `com.farmsync.web` (what you created above)

### 3.5 Update Frontend .env
```bash
VITE_APPLE_CLIENT_ID=com.farmsync.web
VITE_APPLE_TEAM_ID=your-team-id
VITE_APPLE_KEY_ID=your-key-id
```

### 3.6 Save Apple Key File
- [ ] Take the `AuthKey_XXXXXXXXXX.p8` file you downloaded
- [ ] Save it in: `Backend/config/apple-key.p8`
- [ ] Update Backend .env:
```bash
APPLE_KEY_ID=your-key-id
APPLE_TEAM_ID=your-team-id
APPLE_SERVICE_ID=com.farmsync.web
APPLE_KEY_PATH=./config/apple-key.p8
```

**✅ Apple Sign-In: DONE!**

---

## Part 4: SMS Setup - Twilio (5 minutes) - OPTIONAL

### 4.1 Create Twilio Account
- [ ] Go to [Twilio](https://www.twilio.com/try-twilio)
- [ ] Sign up (free trial gives $15 credit)
- [ ] Verify your phone number
- [ ] Get your **Account SID** and **Auth Token** from dashboard

### 4.2 Buy a Phone Number
- [ ] Go to "Phone Numbers" → "Buy a Number"
- [ ] Select country and search
- [ ] Pick any number (cost: $1/month)
- [ ] Copy the **phone number**

### 4.3 Update Backend .env
```bash
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**✅ Twilio SMS: DONE!** (Cost: ~$1/month)

---

## Part 5: WhatsApp Setup - Meta (5 minutes) - OPTIONAL

### 5.1 Create Meta Business Account
- [ ] Go to [Meta Developers](https://developers.facebook.com)
- [ ] Sign in with Facebook
- [ ] Go to "My Apps" → "Create App"
- [ ] Type: Business
- [ ] Fill in details
- [ ] Add product: "WhatsApp"

### 5.2 Get WhatsApp Token
- [ ] Go to WhatsApp → Settings
- [ ] Copy **Phone Number ID** and **Access Token**

### 5.3 Update Backend .env
```bash
WHATSAPP_PHONE_ID=your-phone-id
WHATSAPP_TOKEN=your-access-token
```

**✅ WhatsApp: DONE!** (Cost: ~$1/month for messages)

---

## Part 6: Database Setup (5 minutes)

### 6.1 Run Migrations
- [ ] Open your MySQL client (MySQL Workbench or command line)
- [ ] Connect to your FarmSync database
- [ ] Run these SQL commands:

```sql
-- Add OAuth columns to users table
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN microsoft_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN apple_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN photo_url VARCHAR(500);
ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(50);
```

- [ ] Verify columns were added (no errors)

**✅ Database: DONE!**

---

## ✅ Checklist Summary

| Component | Status | Time |
|-----------|--------|------|
| Google OAuth | ☐ | 10 min |
| Microsoft OAuth | ☐ | 10 min |
| Apple Sign-In | ☐ | 15 min |
| Twilio SMS | ☐ | 5 min |
| WhatsApp | ☐ | 5 min |
| Database | ☐ | 5 min |
| **TOTAL** | | **50 min** |

---

## 🚀 After Setup: Test It

### Step 1: Start the app
```bash
# PowerShell in project root
.\START_PHASE1.ps1
```

### Step 2: Test Google Sign-In
- [ ] Go to http://localhost:5173/login
- [ ] Click "Sign in with Google"
- [ ] Select your Google account
- [ ] Should see "Success!" message
- [ ] Check database for new user

### Step 3: Test Microsoft Sign-In
- [ ] Click "Sign in with Microsoft"
- [ ] Sign in with your Microsoft account
- [ ] Should redirect to dashboard

### Step 4: Test SMS (if you set up Twilio)
- [ ] Copy a JWT token from browser console (login first)
- [ ] Run this command:
```bash
curl -X POST http://localhost:5000/api/notifications/send-sms \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "message": "Test SMS from FarmSync"
  }'
```
- [ ] Check your phone (SMS arrives within 30 seconds)

---

## 🆘 Troubleshooting

### "Google OAuth not working"
- [ ] Check GOOGLE_CLIENT_ID in Backend .env
- [ ] Check VITE_GOOGLE_CLIENT_ID in Frontend .env
- [ ] Restart both servers
- [ ] Check browser console for errors

### "Redirect URL mismatch"
- [ ] Google Cloud: Add localhost:5173 to authorized origins
- [ ] Azure: Check redirect URL exactly matches
- [ ] Restart backend

### "Can't find Apple key file"
- [ ] File should be in `Backend/config/apple-key.p8`
- [ ] Check APPLE_KEY_PATH in .env

### "Database columns error"
- [ ] Run SQL commands one by one
- [ ] Check if columns already exist
- [ ] Verify database connection

---

## 📊 Cost Summary

| Service | Monthly Cost | Notes |
|---------|--------------|-------|
| Google OAuth | Free | Unlimited |
| Microsoft OAuth | Free | Unlimited |
| Apple Sign-In | Free | Unlimited |
| Twilio SMS | $1 | 1000 SMS included |
| WhatsApp | $1 | 1000 messages included |
| **Total** | **$2/month** | Free to start! |

---

## 🎉 What's Next?

Once credentials are set up:
1. Run `START_PHASE1.ps1`
2. Test all sign-in methods
3. Follow DEPLOYMENT_GUIDE.md to deploy
4. Share app with users
5. Monitor and collect feedback

---

**Status:** Ready to start setup
**Time Estimate:** 45-60 minutes
**Difficulty:** Easy (copy-paste steps)
**No coding required!**

---

## Quick Copy-Paste Template

Create a text file with this template and fill in your values:

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_TENANT_ID=

APPLE_KEY_ID=
APPLE_TEAM_ID=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

WHATSAPP_PHONE_ID=
WHATSAPP_TOKEN=
```

Save this file, then copy values into Backend/.env

---

**Created:** January 14, 2026
**Last Updated:** January 14, 2026
