import { Response, Request } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import weatherService from '../services/weatherService';
import axios from 'axios';

/**
 * Get current weather data for user's location
 * POST /api/weather/current
 * Body: { latitude: number, longitude: number }
 */
export const getCurrentWeather = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      throw new AppError('Latitude and longitude are required', 400);
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new AppError('Latitude and longitude must be numbers', 400);
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new AppError('Invalid coordinates', 400);
    }

    const weatherData = await weatherService.getWeatherData(latitude, longitude);

    res.json({
      message: 'Weather data retrieved successfully',
      data: weatherData,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * Get climate alerts for current weather conditions
 * POST /api/weather/alerts
 * Body: { latitude: number, longitude: number }
 */
export const getClimateAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      throw new AppError('Latitude and longitude are required', 400);
    }

    const weatherData = await weatherService.getWeatherData(latitude, longitude);
    const alerts = weatherService.detectClimateAlerts(weatherData);

    // Send email notifications for critical/high severity alerts if user is authenticated
    if (req.user && alerts.length > 0) {
      const criticalAlerts = alerts.filter(
        alert => alert.severity === 'critical' || alert.severity === 'high'
      );

      if (criticalAlerts.length > 0 && req.user.email) {
        // Send email asynchronously (don't block response)
        Promise.all(
          criticalAlerts.map(async (alert) => {
            try {
              const { EmailService } = await import('../services/emailService');
              return EmailService.sendClimateAlert(req.user!.email!, alert).catch(
                (err: any) => console.error('Failed to send email alert:', err)
              );
            } catch (err) {
              console.error('Failed to import email service:', err);
            }
          })
        ).catch(console.error);
      }
    }

    res.json({
      message: 'Climate alerts retrieved successfully',
      data: {
        alerts,
        weather: weatherData,
      },
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * Get location information from coordinates
 * POST /api/location/current
 * Body: { latitude: number, longitude: number }
 */
export const getCurrentLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      throw new AppError('Latitude and longitude are required', 400);
    }

    const locationData = await weatherService.reverseGeocode(latitude, longitude);

    res.json({
      message: 'Location data retrieved successfully',
      data: locationData,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * Get weather by city name using OpenWeather API
 * GET /api/weather?city=cityname
 * Query: city (string, required)
 */
export const getWeatherByCity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city } = req.query;

    // Validate city parameter
    if (!city || typeof city !== 'string') {
      throw new AppError('City parameter is required and must be a string', 400);
    }

    // Check for API key
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new AppError('OpenWeather API key is not configured', 500);
    }

    // Fetch weather data from OpenWeather API
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: city.trim(),
        appid: apiKey,
        units: 'metric', // Use Celsius
      },
      timeout: 10000, // 10 second timeout
    });

    const weatherData = response.data;

    // Transform and return weather data
    res.json({
      message: 'Weather data retrieved successfully',
      data: {
        city: weatherData.name,
        country: weatherData.sys?.country,
        coordinates: {
          latitude: weatherData.coord.lat,
          longitude: weatherData.coord.lon,
        },
        temperature: {
          current: weatherData.main.temp,
          feelsLike: weatherData.main.feels_like,
          min: weatherData.main.temp_min,
          max: weatherData.main.temp_max,
        },
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility,
        windSpeed: weatherData.wind.speed,
        windDegree: weatherData.wind.deg,
        cloudiness: weatherData.clouds.all,
        weather: {
          main: weatherData.weather[0].main,
          description: weatherData.weather[0].description,
          icon: weatherData.weather[0].icon,
        },
        sunrise: new Date(weatherData.sys.sunrise * 1000).toISOString(),
        sunset: new Date(weatherData.sys.sunset * 1000).toISOString(),
        timestamp: new Date(weatherData.dt * 1000).toISOString(),
      },
    });
  } catch (error: any) {
    // Handle specific axios errors
    if (error.response?.status === 404) {
      throw new AppError(`City "${error.config?.params?.q}" not found`, 404);
    }
    if (error.response?.status === 401) {
      throw new AppError('Invalid OpenWeather API key', 401);
    }
    if (error.code === 'ECONNABORTED') {
      throw new AppError('Request to OpenWeather API timed out', 504);
    }
    if (error.message.includes('Network')) {
      throw new AppError('Failed to connect to OpenWeather API', 503);
    }

    // Generic error handling
    throw new AppError(error.message || 'Failed to fetch weather data', error.response?.status || 500);
  }
};
