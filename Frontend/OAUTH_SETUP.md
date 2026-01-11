# OAuth Setup Guide

This guide explains how to set up OAuth authentication (Google, Microsoft, Apple) for FarmSync.

## Quick Start

OAuth is **optional**. You can use the application with email/password login without any OAuth configuration.

If you want to enable OAuth sign-in options, follow the setup instructions below.

## Required: Basic Configuration

First, create a `.env` file in the `Frontend` directory:

```env
# Required - API URL
VITE_API_URL=http://localhost:5000/api

# Optional - OAuth Configuration (leave empty to disable)
VITE_GOOGLE_CLIENT_ID=
VITE_MICROSOFT_CLIENT_ID=
VITE_APPLE_CLIENT_ID=
```

After creating or modifying the `.env` file, **restart the frontend development server**.

## Google Sign-In Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: **Web application**
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Your production domain (e.g., `https://yourdomain.com`)
   - Authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - Your production domain
   - Copy the **Client ID**

### Step 2: Configure Frontend

Add to `Frontend/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Step 3: Configure Backend

Add to `Backend/.env`:
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

**Important**: Restart both frontend and backend servers after updating `.env` files.

## Microsoft Sign-In Setup

### Step 1: Register App in Azure AD

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Fill in:
   - Name: FarmSync (or your preferred name)
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI:
     - Platform: **Single-page application (SPA)**
     - URL: `http://localhost:5173` (for development)
5. After registration, copy the **Application (client) ID**

### Step 2: Configure Frontend

Add to `Frontend/.env`:
```env
VITE_MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
```

### Step 3: Configure Backend (Optional)

If you want backend validation, add to `Backend/.env`:
```env
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here
MICROSOFT_TENANT_ID=common
```

**Important**: Restart both frontend and backend servers after updating `.env` files.

## Apple Sign-In Setup

**Note**: Apple Sign-In requires an Apple Developer account ($99/year).

### Step 1: Create Service ID in Apple Developer Portal

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to "Certificates, Identifiers & Profiles" > "Identifiers"
3. Create a new **Services ID**
4. Enable "Sign in with Apple"
5. Configure domains and redirect URLs
6. Create a **Key** for Sign in with Apple
7. Copy the **Services ID** (this is your Client ID)

### Step 2: Configure Frontend

Add to `Frontend/.env`:
```env
VITE_APPLE_CLIENT_ID=your_apple_service_id_here
```

### Step 3: Configure Backend

Add to `Backend/.env`:
```env
APPLE_CLIENT_ID=your_apple_service_id_here
APPLE_TEAM_ID=your_team_id_here
APPLE_KEY_ID=your_key_id_here
APPLE_PRIVATE_KEY=your_private_key_content_here
APPLE_REDIRECT_URI=http://localhost:5173/auth/apple/callback
```

**Important**: Restart both frontend and backend servers after updating `.env` files.

## Troubleshooting

### "Failed to fetch" Error

This usually means the backend server is not running. Make sure:
1. The backend server is running on `http://localhost:5000`
2. You have the correct `VITE_API_URL` in `Frontend/.env`
3. There are no firewall or network issues blocking the connection

### OAuth Button Shows Error

If an OAuth button shows a configuration error:
1. Check that you've added the client ID to `Frontend/.env`
2. Restart the frontend development server
3. Check the browser console for detailed error messages
4. Verify your OAuth credentials are correct

### Google Sign-In Not Working

- Make sure `VITE_GOOGLE_CLIENT_ID` is set in `Frontend/.env`
- Verify authorized origins and redirect URIs in Google Cloud Console
- Check browser console for errors
- Try clearing browser cache

### Microsoft Sign-In Not Working

- Make sure `VITE_MICROSOFT_CLIENT_ID` is set in `Frontend/.env`
- Verify redirect URI is correctly configured in Azure Portal
- Check that MSAL is initialized (wait a moment after page load)
- Try clearing browser cache

### Apple Sign-In Not Working

- Requires Apple Developer account
- Verify Service ID is correctly configured
- Check backend configuration (private key, team ID, etc.)
- Ensure redirect URI matches configuration

## Testing Without OAuth

You can test the application without OAuth using these default credentials:

- **Admin**: `admin@farmsync.com` / `admin123`
- **Farmer**: `farmer@test.com` / `farmer123`

Simply leave the OAuth environment variables empty in `.env`, and the OAuth buttons will show helpful messages if clicked, but email/password login will work normally.
