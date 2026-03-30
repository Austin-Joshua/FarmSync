import axios from 'axios';
import { AppError } from '../middleware/errorHandler';

export interface WeatherData {
  temperature: number; // Celsius
  humidity: number; // Percentage
  rainfall: number; // mm (from rain volume)
  windSpeed: number; // m/s
  condition: string; // Weather description
  icon: string; // Weather icon code
  pressure: number; // hPa
  visibility: number; // meters
  feelsLike: number; // Celsius
  timestamp: Date;
}

export interface ClimateAlert {
  type: 'high_temperature' | 'heavy_rainfall' | 'drought' | 'storm' | 'extreme_wind' | 'fungal_growth';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  district?: string;
  state?: string;
  country?: string;
  address?: string;
}

class WeatherService {
  private apiKey: string;
  private cache: Map<string, { data: WeatherData; timestamp: number }> = new Map();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenWeather API key not found. Weather features will be limited.');
    }
  }

  /**
   * Fetch weather data from OpenWeatherMap API
   * Returns mock data if API key is not configured
   */
  async getWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
    const cacheKey = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
    const cached = this.cache.get(cacheKey);

    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // If no API key, return mock data based on coordinates
    if (!this.apiKey) {
      console.warn('OpenWeather API key not configured. Using mock weather data.');
      const mockWeather: WeatherData = {
        temperature: 25 + Math.sin(latitude) * 10, // Varied by location
        humidity: 60 + Math.cos(longitude) * 20,
        rainfall: Math.random() * 50,
        windSpeed: 5 + Math.random() * 10,
        condition: 'partly cloudy',
        icon: '02d',
        pressure: 1013,
        visibility: 10,
        feelsLike: 26,
        timestamp: new Date(),
      };
      this.cache.set(cacheKey, { data: mockWeather, timestamp: Date.now() });
      return mockWeather;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`;
      const response = await axios.get(url);

      const data = response.data;
      const weatherData: WeatherData = {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        rainfall: data.rain?.['1h'] || data.rain?.['3h'] || 0, // mm
        windSpeed: data.wind?.speed || 0, // m/s
        condition: data.weather[0].description,
        icon: data.weather[0].icon,
        pressure: data.main.pressure,
        visibility: data.visibility ? data.visibility / 1000 : 0, // Convert to km
        feelsLike: data.main.feels_like,
        timestamp: new Date(),
      };

      // Cache the result
      this.cache.set(cacheKey, { data: weatherData, timestamp: Date.now() });

      return weatherData;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new AppError('Invalid weather API key', 500);
      }
      if (error.response?.status === 429) {
        throw new AppError('Weather API rate limit exceeded', 429);
      }
      throw new AppError(`Failed to fetch weather data: ${error.message}`, 500);
    }
  }

  /**
   * Reverse geocode coordinates to get location name
   * Returns approximate location if API key is not configured
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<LocationData> {
    // If no API key, return approximate location based on coordinates
    if (!this.apiKey) {
      console.warn('OpenWeather API key not configured. Using approximate location.');
      // Approximate location based on India coordinates
      let district = 'Unknown';
      let state = 'Unknown';
      let country = 'IN';

      // Rough approximation for India
      if (latitude >= 8 && latitude <= 37 && longitude >= 68 && longitude <= 97) {
        country = 'India';
        // Approximate district/state based on coordinates
        if (latitude >= 10 && latitude <= 13 && longitude >= 76 && longitude <= 78) {
          district = 'Coimbatore';
          state = 'Tamil Nadu';
        } else if (latitude >= 12 && latitude <= 14 && longitude >= 79 && longitude <= 81) {
          district = 'Chennai';
          state = 'Tamil Nadu';
        } else if (latitude >= 19 && latitude <= 20 && longitude >= 72 && longitude <= 73) {
          district = 'Mumbai';
          state = 'Maharashtra';
        } else if (latitude >= 28 && latitude <= 29 && longitude >= 76 && longitude <= 78) {
          district = 'Delhi';
          state = 'Delhi';
        } else {
          district = `Lat: ${latitude.toFixed(2)}`;
          state = `Lon: ${longitude.toFixed(2)}`;
        }
      }

      return {
        latitude,
        longitude,
        district,
        state,
        country,
        address: `${district}, ${state}, ${country}`,
      };
    }

    try {
      const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${this.apiKey}`;
      const response = await axios.get(url);

      if (response.data && response.data.length > 0) {
        const location = response.data[0];
        return {
          latitude,
          longitude,
          district: location.name,
          state: location.state,
          country: location.country,
          address: `${location.name}, ${location.state}, ${location.country}`,
        };
      }

      // Fallback if no location data
      return {
        latitude,
        longitude,
        district: 'Unknown',
        state: 'Unknown',
        country: 'Unknown',
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      };
    } catch (error: any) {
      console.error('Reverse geocoding failed:', error.message);
      // Return fallback location data even on error
      return {
        latitude,
        longitude,
        district: 'Unknown',
        state: 'Unknown',
        country: 'Unknown',
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      };
    }
  }

  /**
   * Detect unusual climate conditions
   */
  detectClimateAlerts(weatherData: WeatherData): ClimateAlert[] {
    const alerts: ClimateAlert[] = [];

    // High temperature alert (> 40°C)
    if (weatherData.temperature > 40) {
      alerts.push({
        type: 'high_temperature',
        severity: weatherData.temperature > 45 ? 'critical' : 'high',
        message: `Extremely high temperature: ${weatherData.temperature.toFixed(1)}°C`,
        recommendation: 'Ensure adequate irrigation and shade for crops. Monitor soil moisture closely.',
      });
    } else if (weatherData.temperature > 35) {
      alerts.push({
        type: 'high_temperature',
        severity: 'medium',
        message: `High temperature: ${weatherData.temperature.toFixed(1)}°C`,
        recommendation: 'Increase irrigation frequency. Consider providing shade for sensitive crops.',
      });
    }

    // Heavy rainfall alert (> 50mm in 3 hours)
    if (weatherData.rainfall > 50) {
      alerts.push({
        type: 'heavy_rainfall',
        severity: weatherData.rainfall > 100 ? 'critical' : 'high',
        message: `Heavy rainfall detected: ${weatherData.rainfall.toFixed(1)}mm`,
        recommendation: 'Check drainage systems. Protect crops from waterlogging. Monitor for flooding.',
      });
    }

    // Drought conditions (low humidity + no rainfall + high temperature)
    if (weatherData.humidity < 30 && weatherData.rainfall === 0 && weatherData.temperature > 30) {
      alerts.push({
        type: 'drought',
        severity: 'high',
        message: 'Drought-like conditions detected',
        recommendation: 'Increase irrigation immediately. Consider mulching to retain soil moisture.',
      });
    }

    // Storm/Extreme wind alert (> 15 m/s)
    if (weatherData.windSpeed > 15) {
      alerts.push({
        type: weatherData.windSpeed > 25 ? 'storm' : 'extreme_wind',
        severity: weatherData.windSpeed > 25 ? 'critical' : 'high',
        message: `Extreme wind conditions: ${weatherData.windSpeed.toFixed(1)} m/s`,
        recommendation: 'Secure farm structures. Protect crops from wind damage. Consider temporary covers.',
      });
    }

    // Low temperature alert (< 5°C)
    if (weatherData.temperature < 5) {
      alerts.push({
        type: 'high_temperature', // Reusing type for cold
        severity: weatherData.temperature < 0 ? 'critical' : 'medium',
        message: `Low temperature: ${weatherData.temperature.toFixed(1)}°C`,
        recommendation: 'Protect sensitive crops from frost. Consider covering or moving potted plants indoors.',
      });
    }

    // Fungal growth risk detection
    const fungalRisk = this.detectFungalGrowthRisk(weatherData);
    if (fungalRisk.risk > 0) {
      alerts.push({
        type: 'fungal_growth',
        severity: fungalRisk.risk >= 0.8 ? 'critical' : fungalRisk.risk >= 0.6 ? 'high' : 'medium',
        message: `High fungal growth risk detected: ${(fungalRisk.risk * 100).toFixed(0)}%`,
        recommendation: fungalRisk.recommendation,
      });
    }

    return alerts;
  }

  /**
   * Detect fungal growth risk based on temperature and humidity
   * Fungal growth is favored by:
   * - Temperature: 20-30°C (optimal range)
   * - Humidity: >70% (high risk), 60-70% (moderate risk)
   * - Rain: Recent rainfall increases risk
   */
  detectFungalGrowthRisk(weatherData: WeatherData): {
    risk: number; // 0-1 scale
    recommendation: string;
  } {
    let risk = 0;
    const recommendations: string[] = [];

    // Temperature factor (optimal: 20-30°C)
    const tempRisk = this.calculateTemperatureRisk(weatherData.temperature);
    risk += tempRisk * 0.4;

    // Humidity factor (high risk: >70%)
    let humidityRisk = 0;
    if (weatherData.humidity >= 80) {
      humidityRisk = 1.0;
      recommendations.push('Very high humidity detected. Increase ventilation immediately.');
    } else if (weatherData.humidity >= 70) {
      humidityRisk = 0.8;
      recommendations.push('High humidity detected. Monitor crops closely for fungal signs.');
    } else if (weatherData.humidity >= 60) {
      humidityRisk = 0.5;
      recommendations.push('Moderate humidity. Consider preventive fungicide application.');
    }
    risk += humidityRisk * 0.4;

    // Rainfall factor (recent rain increases risk)
    let rainfallRisk = 0;
    if (weatherData.rainfall > 10) {
      rainfallRisk = 0.8;
      recommendations.push('Recent heavy rainfall. Ensure proper drainage to prevent waterlogging.');
    } else if (weatherData.rainfall > 5) {
      rainfallRisk = 0.5;
      recommendations.push('Recent rainfall detected. Monitor crops for fungal development.');
    }
    risk += rainfallRisk * 0.2;

    // Cap risk at 1.0
    risk = Math.min(risk, 1.0);

    const defaultRecommendation = risk >= 0.7
      ? 'Apply preventive fungicide immediately. Ensure proper spacing between plants for air circulation. Remove any infected plant parts.'
      : risk >= 0.5
      ? 'Apply preventive fungicide. Monitor crops daily for early signs of fungal infection.'
      : 'Conditions are favorable for fungal growth. Monitor crops regularly.';

    return {
      risk,
      recommendation: recommendations.length > 0
        ? recommendations.join(' ') + ' ' + defaultRecommendation
        : defaultRecommendation,
    };
  }

  private calculateTemperatureRisk(temperature: number): number {
    // Optimal fungal growth temperature: 20-30°C
    if (temperature >= 20 && temperature <= 30) {
      // Peak at 25°C
      const distanceFromOptimal = Math.abs(temperature - 25);
      return Math.max(0, 1 - distanceFromOptimal / 10);
    } else if (temperature >= 15 && temperature < 20) {
      return 0.6 - ((20 - temperature) / 5) * 0.3;
    } else if (temperature > 30 && temperature <= 35) {
      return 0.6 - ((temperature - 30) / 5) * 0.3;
    } else {
      return 0; // Too cold or too hot for most fungi
    }
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export default new WeatherService();
