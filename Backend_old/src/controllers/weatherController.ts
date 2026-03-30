import { Response, Request } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import weatherService from '../services/weatherService';

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
 * Get weather by city name using mock data
 * GET /api/weather?city=cityname
 * Query: city (string, required)
 * NOTE: Uses mock data - no external API key required
 */
export const getWeatherByCity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city } = req.query;

    // Validate city parameter
    if (!city || typeof city !== 'string') {
      throw new AppError('City parameter is required and must be a string', 400);
    }

    const cityName = city.trim().toLowerCase();

    // Mock weather data for different cities
    const mockWeatherData: Record<string, any> = {
      'london': {
        name: 'London',
        country: 'GB',
        latitude: 51.5074,
        longitude: -0.1278,
        temperature: 15,
        feelsLike: 14,
        min: 12,
        max: 18,
        humidity: 72,
        pressure: 1013,
        visibility: 10000,
        windSpeed: 4.5,
        windDegree: 230,
        cloudiness: 45,
        main: 'Clouds',
        description: 'overcast clouds',
        icon: '04d',
      },
      'new york': {
        name: 'New York',
        country: 'US',
        latitude: 40.7128,
        longitude: -74.0060,
        temperature: 8,
        feelsLike: 5,
        min: 5,
        max: 12,
        humidity: 65,
        pressure: 1015,
        visibility: 10000,
        windSpeed: 6.2,
        windDegree: 280,
        cloudiness: 60,
        main: 'Clouds',
        description: 'scattered clouds',
        icon: '03d',
      },
      'bangalore': {
        name: 'Bangalore',
        country: 'IN',
        latitude: 12.9716,
        longitude: 77.5946,
        temperature: 28,
        feelsLike: 30,
        min: 22,
        max: 32,
        humidity: 65,
        pressure: 1010,
        visibility: 8000,
        windSpeed: 3.5,
        windDegree: 180,
        cloudiness: 40,
        main: 'Partly Cloudy',
        description: 'partly cloudy',
        icon: '02d',
      },
      'mumbai': {
        name: 'Mumbai',
        country: 'IN',
        latitude: 19.0760,
        longitude: 72.8777,
        temperature: 32,
        feelsLike: 35,
        min: 26,
        max: 36,
        humidity: 75,
        pressure: 1008,
        visibility: 7000,
        windSpeed: 5.1,
        windDegree: 200,
        cloudiness: 50,
        main: 'Humid',
        description: 'humid and warm',
        icon: '04d',
      },
      'delhi': {
        name: 'Delhi',
        country: 'IN',
        latitude: 28.7041,
        longitude: 77.1025,
        temperature: 20,
        feelsLike: 18,
        min: 12,
        max: 28,
        humidity: 55,
        pressure: 1012,
        visibility: 6000,
        windSpeed: 4.0,
        windDegree: 270,
        cloudiness: 30,
        main: 'Clear',
        description: 'clear sky',
        icon: '01d',
      },
      'tokyo': {
        name: 'Tokyo',
        country: 'JP',
        latitude: 35.6762,
        longitude: 139.6503,
        temperature: 10,
        feelsLike: 8,
        min: 6,
        max: 14,
        humidity: 60,
        pressure: 1018,
        visibility: 10000,
        windSpeed: 3.5,
        windDegree: 90,
        cloudiness: 20,
        main: 'Clear',
        description: 'clear sky',
        icon: '01d',
      },
      'sydney': {
        name: 'Sydney',
        country: 'AU',
        latitude: -33.8688,
        longitude: 151.2093,
        temperature: 25,
        feelsLike: 24,
        min: 18,
        max: 28,
        humidity: 55,
        pressure: 1020,
        visibility: 10000,
        windSpeed: 8.2,
        windDegree: 45,
        cloudiness: 15,
        main: 'Sunny',
        description: 'clear sky',
        icon: '01d',
      },
    };

    // Get mock data for the city, or return default mock data
    let data = mockWeatherData[cityName];
    
    // If city not found in mock data, return a generic response with random variation
    if (!data) {
      data = {
        name: city.trim(),
        country: 'Unknown',
        latitude: 20 + Math.random() * 30,
        longitude: 70 + Math.random() * 30,
        temperature: 15 + Math.random() * 15,
        feelsLike: 14 + Math.random() * 15,
        min: 10 + Math.random() * 10,
        max: 25 + Math.random() * 15,
        humidity: 50 + Math.random() * 30,
        pressure: 1010 + Math.random() * 10,
        visibility: 8000 + Math.random() * 2000,
        windSpeed: 2 + Math.random() * 8,
        windDegree: Math.random() * 360,
        cloudiness: Math.random() * 100,
        main: 'Partly Cloudy',
        description: 'weather data from mock service',
        icon: '02d',
      };
    }

    const now = new Date();
    const sunrise = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    const sunset = new Date(now.getTime() + 12 * 60 * 60 * 1000);

    // Return mock weather data
    res.json({
      message: 'Weather data retrieved successfully (Mock Data)',
      data: {
        city: data.name,
        country: data.country,
        coordinates: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
        temperature: {
          current: Math.round(data.temperature * 10) / 10,
          feelsLike: Math.round(data.feelsLike * 10) / 10,
          min: Math.round(data.min * 10) / 10,
          max: Math.round(data.max * 10) / 10,
        },
        humidity: Math.round(data.humidity),
        pressure: Math.round(data.pressure),
        visibility: Math.round(data.visibility),
        windSpeed: Math.round(data.windSpeed * 10) / 10,
        windDegree: Math.round(data.windDegree),
        cloudiness: Math.round(data.cloudiness),
        weather: {
          main: data.main,
          description: data.description,
          icon: data.icon,
        },
        sunrise: sunrise.toISOString(),
        sunset: sunset.toISOString(),
        timestamp: now.toISOString(),
      },
    });
  } catch (error: any) {
    // Generic error handling
    throw new AppError(error.message || 'Failed to fetch weather data', error.response?.status || 500);
  }
};
