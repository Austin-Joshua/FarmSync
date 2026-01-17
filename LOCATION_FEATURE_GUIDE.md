# FarmSync Location Feature Guide

## Overview

FarmSync uses the browser's Geolocation API to access your device's location. This enables weather forecasting, location-based recommendations, and map features.

---

## Quick Start

### Step 1: Open the App
1. Go to `http://localhost:5173/` (or your deployed URL)
2. Login with your credentials

### Step 2: Enable Location

You'll see one of these screens:

#### **Option A: From Dashboard**
1. Look for the **Weather Card** widget
2. Click **"Enable Location"** button
3. Grant permission when prompted

#### **Option B: From Weather Section**
1. Navigate to any weather-related page
2. Click **"Get Weather"** or **"Enable Location"**
3. Grant browser permission

#### **Option C: From Settings**
1. Go to **Settings** → **Preferences** tab
2. Look for location option
3. Click **"Request Location"** button

### Step 3: Grant Permission
1. Browser will ask for permission
2. Click **"Allow"** to grant location access
3. If you don't see the prompt, check your browser settings

### Step 4: Verify Success
- Location coordinates appear on screen
- Weather data loads automatically
- Map shows your location

---

## Error Messages & Solutions

### ❌ "Location information unavailable"

**Causes:**
- Location services disabled on device
- Browser doesn't have permission
- GPS signal weak/unavailable
- Location API not supported

**Solutions:**
1. **Enable Location Services:**
   - **Windows:** Settings → Privacy & Security → Location → On
   - **Mac:** System Preferences → Security & Privacy → Location Services → On
   - **Android:** Settings → Location → On
   - **iOS:** Settings → Privacy → Location Services → On

2. **Grant Browser Permission:**
   - Check browser settings
   - Allow location access for localhost:5173

3. **Check Browser Console:**
   - Open DevTools (F12 or Cmd+Option+I)
   - Go to Console tab
   - Look for error messages

4. **Try Different Browser:**
   - Chrome, Firefox, Safari, or Edge
   - Some browsers have better location support

5. **Disable VPN:**
   - VPN can block location detection
   - Temporarily disable if enabled

---

### ❌ "Location permission denied"

**Causes:**
- You clicked "Deny" instead of "Allow"
- Browser permission revoked previously

**Solutions:**
1. **Reset Browser Permission:**
   - **Chrome:** Settings → Privacy → Site settings → Location
   - **Firefox:** Preferences → Privacy → Permissions → Location
   - **Safari:** Preferences → Privacy
   
2. **Clear Site Data:**
   - Right-click page → "Inspect" (F12)
   - Application → Clear Storage → Clear All
   
3. **Allow Permission Again:**
   - Refresh page (F5)
   - Click "Enable Location" button
   - Click "Allow" in permission prompt

---

### ❌ "Location request timed out"

**Causes:**
- Slow internet connection
- GPS taking too long to acquire signal
- Server delays

**Solutions:**
1. **Check Internet Connection:**
   - Ensure you're connected to WiFi or mobile data
   - Try speedtest.net

2. **Try Again:**
   - Wait a few seconds
   - Click "Enable Location" again
   - Wait up to 15 seconds

3. **Move to Different Location:**
   - Go outside for better GPS signal
   - Move away from obstacles
   - Try near a window

---

### ❌ "Geolocation is not supported"

**Causes:**
- Using very old browser
- Browser doesn't support HTML5 Geolocation API

**Solutions:**
1. **Update Browser:**
   - Chrome: Latest version
   - Firefox: Latest version
   - Safari: Latest version
   - Edge: Latest version

2. **Use Modern Browser:**
   - Download Chrome, Firefox, or Edge
   - Ensure latest version installed

---

## How It Works

### 1. **GPS/Location Detection**
```
Browser Request → Device GPS/IP-based location → 
Browser returns coordinates (latitude, longitude)
```

### 2. **Weather Lookup**
```
Coordinates → Backend → OpenWeather API → 
Weather data (temperature, condition, etc.)
```

### 3. **Map Display**
```
Coordinates → Frontend Map Component → 
Shows your location with weather overlay
```

---

## Supported Browsers

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 50+ | ✅ Full support |
| Firefox | 42+ | ✅ Full support |
| Safari | 9+ | ✅ Full support |
| Edge | 12+ | ✅ Full support |
| Opera | 37+ | ✅ Full support |
| Internet Explorer | Any | ❌ Not supported |

---

## Device Requirements

### **Desktop/Laptop:**
- ✅ Supported (uses IP-based location)
- ✅ GPS dongle optional
- ✅ Requires internet connection

### **Mobile (iOS):**
- ✅ Full GPS support
- ✅ Battery efficient
- ✅ High accuracy

### **Mobile (Android):**
- ✅ Full GPS support
- ✅ Battery efficient
- ✅ High accuracy

### **Tablet:**
- ✅ Supported (depends on tablet GPS)
- ✅ iPad with GPS
- ✅ Android tablets with GPS

---

## Privacy & Security

### ✅ Your Privacy is Protected:
- Location data **never** stored permanently
- Only used for active session
- Data cached for 5 minutes only
- Can disable anytime

### ✅ Permissions Control:
- You grant permission explicitly
- Can revoke anytime in browser settings
- App respects "Do Not Track"
- HTTPS encrypted transmission

### ✅ Data Usage:
- Location sent only to backend
- Backend uses it for weather/map lookup
- No third-party tracking
- No ads using your location

---

## Features Enabled with Location

### 🌤️ Weather Features
- Current weather at your location
- Real-time temperature
- Humidity and wind data
- Climate alerts
- 5-day forecast (if available)

### 🗺️ Map Features
- Your location on map
- Nearby farms visualization
- Field mapping
- Area analytics

### 📍 Location Services
- Auto-fill farm location
- Nearby market prices
- Local crop recommendations
- Regional weather alerts

### 📊 Analytics
- Location-based reports
- Regional crop statistics
- Area-specific insights

---

## Permissions Flow

```
1. User clicks "Enable Location" button
   ↓
2. Browser shows permission prompt
   ↓
3. User clicks "Allow"
   ↓
4. Device GPS/IP looks up coordinates
   ↓
5. Coordinates sent to backend
   ↓
6. Backend calls OpenWeather API
   ↓
7. Weather data returned to frontend
   ↓
8. Map and weather card updated
```

---

## Manual Location Entry

If you can't enable location, you can **manually enter coordinates**:

1. Go to **Settings** → **Profile** tab
2. Enter your location details:
   - Location (text address)
   - Land size
   - Soil type

3. Or use coordinates:
   - Search "latitude longitude [your city]" on Google Maps
   - Enter coordinates manually

---

## Testing Location Locally

### Test in Browser Console:
```javascript
// Check if geolocation is supported
navigator.geolocation ? "Supported" : "Not supported"

// Get current position
navigator.geolocation.getCurrentPosition(
  pos => console.log(pos.coords.latitude, pos.coords.longitude),
  err => console.error(err.message)
)
```

### Test Endpoints:

```bash
# Test database
curl http://localhost:5000/api/db-test

# Test weather by city
curl http://localhost:5000/api/weather?city=London

# Test current weather (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  -X POST http://localhost:5000/api/weather/current \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060}'
```

---

## OpenWeather API Configuration

For full weather features, configure the OpenWeather API:

### 1. **Get API Key:**
- Go to https://openweathermap.org/api
- Sign up (free tier available)
- Create API key

### 2. **Add to Backend .env:**
```env
OPENWEATHER_API_KEY=your_key_here
```

### 3. **Restart Backend:**
```bash
npm run dev
```

### 4. **Test Weather Endpoint:**
```bash
curl http://localhost:5000/api/weather?city=London
```

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| **Permission prompt not showing** | Refresh page, check browser settings |
| **Location seems inaccurate** | IP-based location less accurate than GPS |
| **Weather won't load** | Check OpenWeather API key, internet connection |
| **Map not showing** | Check browser console for errors, enable JavaScript |
| **Mobile app shows no location** | Enable location services in device settings |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F12` | Open DevTools (for debugging) |
| `Ctrl+Shift+I` | Open DevTools (Windows) |
| `Cmd+Option+I` | Open DevTools (Mac) |
| `F5` | Refresh page |
| `Ctrl+Shift+Delete` | Clear browsing data |

---

## Performance Tips

✅ **For Faster Location Detection:**
- Use WiFi instead of mobile data
- Move near a window (for GPS)
- Disable VPN temporarily
- Close other apps requesting location

✅ **For Better Weather Updates:**
- Location cached for 5 minutes
- Manually refresh to get latest
- Check internet speed
- Verify API key is configured

---

## Troubleshooting Checklist

- [ ] Browser supports Geolocation API
- [ ] Location services enabled on device
- [ ] Browser permission granted
- [ ] Internet connection active
- [ ] Not using VPN
- [ ] Backend server running
- [ ] OpenWeather API key configured
- [ ] Tried different browser
- [ ] Cleared browser cache
- [ ] Checked browser console (F12)

---

## Getting Help

### Check These Resources:
1. **Browser Console (F12):** Look for error messages
2. **This Guide:** Common issues & solutions
3. **API Documentation:** http://localhost:5000/api/health
4. **Database Test:** http://localhost:5000/api/db-test

### Debug Commands:
```bash
# Check backend health
curl http://localhost:5000/health

# Check database
curl http://localhost:5000/api/db-test

# Test weather API
curl http://localhost:5000/api/weather?city=London
```

---

## Next Steps

After enabling location:
1. ✅ Check weather card updates with your location
2. ✅ Verify map shows your coordinates
3. ✅ Try different locations
4. ✅ Test weather forecast feature
5. ✅ Configure farm location

---

**Last Updated:** January 17, 2026
**FarmSync v1.0.0**
