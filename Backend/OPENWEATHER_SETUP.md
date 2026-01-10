# OpenWeather API Key Setup Guide

## Quick Setup

The FarmSync application uses OpenWeatherMap API to provide real-time weather data. Without an API key, the app will use mock weather data.

## Step 1: Get Your Free API Key

1. **Visit OpenWeatherMap**: Go to [https://openweathermap.org/api](https://openweathermap.org/api)
2. **Sign Up**: Click "Sign Up" to create a free account
3. **Verify Email**: Check your email and verify your account
4. **Get API Key**: 
   - Log in to your account
   - Navigate to "API Keys" in your account dashboard
   - Copy your default API key (or create a new one)

## Step 2: Add API Key to Backend

1. **Open `.env` file**: Navigate to `Backend/.env`
2. **Add the key**: Find or add this line:
   ```env
   OPENWEATHER_API_KEY=your_actual_api_key_here
   ```
3. **Replace the placeholder**: Replace `your_actual_api_key_here` with your actual API key from OpenWeatherMap

## Step 3: Restart Backend Server

After adding the API key, restart your backend server:

```powershell
# Stop the current server (Ctrl+C in the terminal)
# Then restart:
cd Backend
npm run dev
```

## Example `.env` File

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=farmsync_db
DB_USER=root
DB_PASSWORD=123456

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# OpenWeatherMap API Key
OPENWEATHER_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

## Free Tier Limits

- **60 API calls per minute**
- **1,000,000 calls per month**
- **Current weather data**
- **5-day/3-hour forecast**

This is more than enough for development and small-scale use!

## Verification

After adding the API key and restarting the server, you should see:
- ✅ No warning about missing API key in the backend console
- ✅ Real weather data instead of mock data
- ✅ Accurate location names (district, state, country)
- ✅ Real-time climate alerts

## Troubleshooting

### "Invalid API key" Error
- Make sure you copied the entire key (no spaces)
- Verify the key is active in your OpenWeatherMap dashboard
- Wait a few minutes after creating the key (activation can take time)

### Still Seeing Mock Data
- Check that `.env` file is in the `Backend/` directory
- Verify the key name is exactly: `OPENWEATHER_API_KEY`
- Restart the backend server after adding the key
- Check backend console for any error messages

### Rate Limit Exceeded
- Free tier allows 60 calls/minute
- The app caches weather data for 10 minutes to reduce API calls
- If you exceed limits, wait a minute and try again

## Need Help?

- OpenWeatherMap Docs: [https://openweathermap.org/api](https://openweathermap.org/api)
- API Key Management: [https://home.openweathermap.org/api_keys](https://home.openweathermap.org/api_keys)
