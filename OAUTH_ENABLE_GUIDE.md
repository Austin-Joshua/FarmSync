# How to Enable OAuth (Google, Microsoft, Apple) in the Future

The OAuth buttons are currently **disabled** but the code is preserved for future installation.

## Current Status

- ✅ OAuth code is preserved and ready to use
- ❌ OAuth buttons are hidden from the Login page
- ✅ Email/password login is the only visible option

---

## To Enable OAuth in the Future

### Step 1: Enable OAuth in Login.tsx

Open `Frontend/src/pages/Login.tsx` and find this line:

```typescript
const enableOAuth = false; // Set to true to enable OAuth buttons
```

Change it to:

```typescript
const enableOAuth = true; // Set to true to enable OAuth buttons
```

### Step 2: Add OAuth Client IDs to .env

Create or update `Frontend/.env` file with your OAuth credentials:

```env
# Google OAuth (optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# Microsoft OAuth (optional)
VITE_MICROSOFT_CLIENT_ID=your-microsoft-client-id-here

# Apple OAuth (optional)
VITE_APPLE_CLIENT_ID=your-apple-client-id-here
```

### Step 3: Configure Backend OAuth (if needed)

Update `Backend/.env` with OAuth secrets:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT_ID=common

# Apple OAuth
APPLE_CLIENT_ID=your-apple-client-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY=your-apple-private-key
APPLE_REDIRECT_URI=your-redirect-uri
```

### Step 4: Restart the Application

1. Restart the frontend dev server
2. Restart the backend server
3. The OAuth buttons will now appear on the Login page

---

## OAuth Provider Setup Guides

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Configure consent screen
6. Add authorized JavaScript origins: `http://localhost:5173`
7. Add authorized redirect URIs: `http://localhost:5173/auth/google/callback`
8. Copy Client ID and Client Secret

### Microsoft OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory → App registrations
3. Click "New registration"
4. Configure redirect URI: `http://localhost:5173/auth/microsoft/callback`
5. Add API permissions (User.Read)
6. Copy Application (client) ID and create a client secret

### Apple OAuth Setup

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create an App ID with Sign in with Apple capability
3. Create a Services ID
4. Configure domains and redirect URLs
5. Create a Key with Sign in with Apple enabled
6. Download the private key (.p8 file)
7. Copy Team ID, Key ID, and Client ID

---

## What's Already Implemented

All the OAuth functionality is already coded and ready:

- ✅ Google Sign-In integration
- ✅ Microsoft Sign-In integration (MSAL)
- ✅ Apple Sign-In integration
- ✅ OAuth button UI components
- ✅ OAuth handlers and callbacks
- ✅ Backend OAuth endpoints
- ✅ Token validation and user creation

**You just need to:**
1. Set `enableOAuth = true`
2. Add Client IDs to `.env` files
3. Restart servers

---

## Testing OAuth

Once enabled:

1. Go to `/login` page
2. OAuth buttons will be visible
3. Click any OAuth button
4. Complete OAuth flow
5. User will be logged in automatically

---

## Notes

- You can enable one, two, or all three OAuth providers
- The buttons only show if the corresponding Client ID is configured
- Email/password login will always work regardless of OAuth status
- All OAuth code is production-ready and secure
