import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import smsService from '../services/smsService';
import { AppError } from '../middleware/errorHandler';

/**
 * POST /api/sms/send
 * Send SMS message
 */
export const sendSMS = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { to, message } = req.body;

    if (!to || !message) {
      throw new AppError('Phone number and message are required', 400);
    }

    await smsService.sendSMS(to, message);

    res.json({
      message: 'SMS sent successfully',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * POST /api/sms/test
 * Send test SMS to user's phone
 */
export const sendTestSMS = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    // In production, get phone from user profile
    const testMessage = 'This is a test SMS from FarmSync. Your SMS notifications are working!';
    
    // await smsService.sendSMS(userPhone, testMessage);

    res.json({
      message: 'Test SMS would be sent (SMS service needs phone number configuration)',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};
