# Weather & GPS Integration Setup

## Overview
The FarmSync application now includes GPS-based location tracking and real-time weather data integration with climate alert detection.

## Features
- **GPS Location**: Requests user permission to access device GPS coordinates
- **Weather Data**: Fetches real-time weather from OpenWeatherMap API
- **Climate Alerts**: Detects unusual conditions (high temperature, heavy rainfall, drought, storms)
- **Location Display**: Shows district, state, and country based on coordinates

## Backend Setup

### 1. Install Dependencies
```bash
cd Backend
npm install
```

The `axios` package is required for making HTTP requests to the weather API.

### 2. Get OpenWeatherMap API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to API Keys section
4. Generate a new API key (free tier allows 60 calls/minute)

### 3. Configure Environment Variables

Add the following to your `Backend/.env` file:

```env
# OpenWeatherMap API Key
OPENWEATHER_API_KEY=your_api_key_here
```

**Note**: The application will work without the API key, but weather features will be limited. You'll see a warning in the console.

## Frontend Setup

No additional setup required! The frontend automatically:
- Requests GPS permission when user clicks "Enable Location"
- Fetches weather data using the backend API
- Displays alerts when unusual conditions are detected

## API Endpoints

### POST /api/weather/current
Get current weather data for coordinates.

**Request Body:**
```json
{
  "latitude": 11.0168,
  "longitude": 76.9558
}
```

**Response:**
```json
{
  "message": "Weather data retrieved successfully",
  "data": {
    "temperature": 28.5,
    "humidity": 65,
    "rainfall": 0,
    "windSpeed": 3.2,
    "condition": "clear sky",
    "icon": "01d",
    "pressure": 1013,
    "visibility": 10,
    "feelsLike": 30.2,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### POST /api/weather/alerts
Get climate alerts for current weather conditions.

**Request Body:**
```json
{
  "latitude": 11.0168,
  "longitude": 76.9558
}
```

**Response:**
```json
{
  "message": "Climate alerts retrieved successfully",
  "data": {
    "alerts": [
      {
        "type": "high_temperature",
        "severity": "medium",
        "message": "High temperature: 35.5°C",
        "recommendation": "Increase irrigation frequency..."
      }
    ],
    "weather": { ... }
  }
}
```

### POST /api/weather/location/current
Get location information from coordinates (reverse geocoding).

**Request Body:**
```json
{
  "latitude": 11.0168,
  "longitude": 76.9558
}
```

**Response:**
```json
{
  "message": "Location data retrieved successfully",
  "data": {
    "latitude": 11.0168,
    "longitude": 76.9558,
    "district": "Coimbatore",
    "state": "Tamil Nadu",
    "country": "IN",
    "address": "Coimbatore, Tamil Nadu, IN"
  }
}
```

## Climate Alert Thresholds

The system detects the following conditions:

1. **High Temperature**
   - Medium: > 35°C
   - High: > 40°C
   - Critical: > 45°C

2. **Heavy Rainfall**
   - High: > 50mm in 3 hours
   - Critical: > 100mm in 3 hours

3. **Drought Conditions**
   - High: Humidity < 30% + No rainfall + Temperature > 30°C

4. **Extreme Wind**
   - High: > 15 m/s
   - Critical: > 25 m/s (Storm)

5. **Low Temperature**
   - Medium: < 5°C
   - Critical: < 0°C (Frost)

## Caching

Weather data is cached for 10 minutes to reduce API calls. The cache is automatically cleared when new data is requested.

## Security & Privacy

- GPS coordinates are only sent to the backend when user explicitly enables location
- Coordinates are not stored permanently unless user allows
- Weather API key is stored securely in environment variables
- All API requests require authentication

## Troubleshooting

### Weather data not loading
1. Check if OpenWeather API key is set in `.env`
2. Verify API key is valid at [OpenWeatherMap](https://openweathermap.org/api)
3. Check backend logs for error messages
4. Ensure backend server is running

### Location permission denied
- User must explicitly allow location access in browser
- Some browsers require HTTPS for geolocation
- Check browser console for permission errors

### API rate limit exceeded
- Free tier allows 60 calls/minute
- Weather data is cached for 10 minutes to reduce calls
- Consider upgrading to paid tier for higher limits

## Testing

To test without GPS:
1. Use browser developer tools to simulate location
2. Or manually provide coordinates in the API request

Example test coordinates (Coimbatore, India):
- Latitude: 11.0168
- Longitude: 76.9558
