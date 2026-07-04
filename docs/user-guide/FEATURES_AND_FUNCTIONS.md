# FarmSync - Feature Inventory & Core Workflows Functional Report

This document details the functional specifications, page-by-page features, user benefits, and core workflow configurations of the FarmSync Platform.

---

## 📋 Feature Inventory Directory

### 1. Interactive Geofencing & Boundary Editor
* **Purpose**: Allows farmers to define the coordinates and polygonal boundary coordinates of their fields.
* **Functionality**: Integrates with Leaflet. Maps coordinates automatically via GPS detection or supports manual overrides (Latitude, Longitude, State, District, Village). Toggling "Boundary Mode" allows users to click the map to place vertices and draw a boundary polygon on the landscape.
* **User Benefit**: Establishes precise geofences for soil analysis and satellite climate readings. Prevents coordinate errors.

### 2. Live Weather Intelligence
* **Purpose**: Provides real-time and 7-day weather telemetry.
* **Functionality**: Keyless integration with Open-Meteo as the default and fallback provider, and OpenWeatherMap as a key-configured option. Displays temperature, wind speed, relative humidity, precipitation metrics, and active weather warnings.
* **User Benefit**: Farmers receive local weather advisories such as "Optimal window for fertilizer spraying today" or "Heavy rain forecast: delay sowing."

### 3. Active Crop Growth Lifecycle Tracker
* **Purpose**: Tracks crop growth phases and projects harvest timelines.
* **Functionality**: Calculates progress dynamically based on current date, sowing date, and expected harvest date. Displays a visual progress bar indicating specific stages (Sowing $\rightarrow$ Germination $\rightarrow$ Vegetative Growth $\rightarrow$ Flowering/Yield $\rightarrow$ Harvesting) with remaining days countdown.
* **User Benefit**: Provides visual, at-a-glance monitoring of all active crops, helping coordinates logistics and labor scheduling.

### 4. Resilient AI/ML Disease Diagnostics
* **Purpose**: Diagnoses crop disease lesions using leaf photography scans.
* **Functionality**: Supports file upload and camera capture. Submits photos to the Java backend. If the Python ML microservice (port 8000) is unreachable, the system triggers client-side heuristics that analyze filenames/metadata, identifying symptoms (e.g. Rice Brown Spot, Tomato Late Blight, Wheat Leaf Rust) and displaying remedies.
* **User Benefit**: Immediate disease identification and actionable remedy instructions without external dependencies, preventing crop failure.

### 5. Input Cost Ledger & Profit Analytics
* **Purpose**: Monitors input investment costs against projected yield value.
* **Functionality**: Standard transaction ledger to record seeds, granular fertilizers, pesticides, fuel, and labor. Dynamically displays cost distribution charts (Recharts) and calculates net profit (Total Revenue minus Total Investment).
* **User Benefit**: Ensures full visibility of the farm's financial balance sheet, showing where capital is spent and identifying cost-saving areas.

### 6. Interactive Market Price Intelligence
* **Purpose**: Compares real-time agricultural crop prices across nearby district markets.
* **Functionality**: Displays current district-wise market prices (e.g., Rice, Wheat, Cotton, Sugar) with historical price indicators. Renders advice on the optimal date to sell based on peak price forecasts.
* **User Benefit**: Empowers farmers to make data-driven sales decisions, avoiding low middle-man bids and maximizing revenues.

---

## 🔄 Core Workflows Mappings

### Workflow 1: Registration & Onboarding Flow
```
[Visitor Page] 
  ──> Click "Get Started" 
  ──> Fill Step 1 (Account Details: Name, Email, Password, Phone)
  ──> Fill Step 2 (Location Selection: State, District, Village, Soil Type, Preferred Language)
  ──> Persist User & Seed Initial Farm Profile
  ──> Redirect to [Onboarding Form / Dashboard]
```

### Workflow 2: Farm & Field Creation Flow
```
[Dashboard / Fields Page]
  ──> Click "Add Field" / "Edit Location"
  ──> Toggle Map Editor Modes (Pin Mode or Boundary drawing)
  ──> Click vertices on Leaflet Map to draw Farm Polygon
  ──> Input manual State, District, Village details
  ──> Click "Save Location & Boundary"
  ──> PUT API updates Farm entity `/api/farms/{id}`
  ──> Database saves boundary coordinate JSON and address records
```

### Workflow 3: Crop Sowing & Lifecycle Tracking Flow
```
[Fields Page / Crop Tracker]
  ──> Select Field
  ──> Input Crop Name, Sowing Date, expected Harvest date, and Crop Season
  ──> POST API creates `/api/crops`
  ──> Dashboard computes progress % based on dates
  ──> Displays horizontal progress line & growth stage badge
```

### Workflow 4: Disease Scan & Diagnosis Flow
```
[Disease Detection Page]
  ──> Upload leaf photo
  ──> Post to `/api/ai/disease-detect`
  ──> Backend calls ML microservice ──> [If offline] ──> Catch connection error ──> Local Fallback
  ──> Returns diagnosis name, severity level, confidence score, and remedy steps
  ──> Saves scan to historical ledger
  ──> Push notification triggered
```

### Workflow 5: Weather Warning & Advisory Flow
```
[Dashboard Page]
  ──> GPS geolocates coordinates (or reads farm village coordinates)
  ──> Get weather forecast payload from Open-Meteo or OpenWeather
  ──> Display dashboard WeatherCard
  ──> Display Climate Alerts widget if high wind/rain threshold is met
```

### Workflow 6: District Market Price Analytics Flow
```
[Market Intel Page]
  ──> Select crop name (e.g., Wheat)
  ──> Select target state & district
  ──> Displays comparative market list (Recharts)
  ──> Displays "AI Recommendation Panel" specifying best price window
```

---

## 🔒 Security, Session & Isolation Constraints
* **Token Rotation**: Every login returns an Access Token (stored in memory/state) and a Refresh Token (stored securely in local storage). If the Access Token expires, a 401 interceptor silently requests `/api/auth/refresh` to rotate tokens.
* **Role-based Isolation**: Farmers, citizens, and administrators are guarded by server-side Spring Security filters. A farmer is isolated and can only view, edit, or delete farms matching their `farmer_id`.
