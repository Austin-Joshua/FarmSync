import { Response } from 'express';
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
