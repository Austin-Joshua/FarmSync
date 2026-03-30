import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { WeatherAlertModel } from '../models/WeatherAlert';
import { AppError } from '../middleware/errorHandler';

/**
 * GET /api/weather/alerts
 * Get weather alerts for current user
 */
export const getWeatherAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const activeOnly = req.query.activeOnly !== 'false';
    const alerts = await WeatherAlertModel.findByUserId(req.user.id, activeOnly);

    res.json({
      message: 'Weather alerts retrieved successfully',
      data: alerts,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * GET /api/weather/alerts/unread
 * Get unread weather alerts
 */
export const getUnreadAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const alerts = await WeatherAlertModel.findUnreadAlerts(req.user.id);

    res.json({
      message: 'Unread alerts retrieved successfully',
      data: alerts,
      count: alerts.length,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * POST /api/weather/alerts/:id/read
 * Mark alert as read
 */
export const markAlertAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const alert = await WeatherAlertModel.findById(id);

    if (!alert) {
      throw new AppError('Weather alert not found', 404);
    }

    if (alert.user_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized access', 403);
    }

    const updatedAlert = await WeatherAlertModel.markAsRead(id);

    res.json({
      message: 'Alert marked as read',
      data: updatedAlert,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * POST /api/weather/alerts/read-all
 * Mark all alerts as read
 */
export const markAllAlertsAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    await WeatherAlertModel.markAllAsRead(req.user.id);

    res.json({
      message: 'All alerts marked as read',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};
