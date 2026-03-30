import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { EmailService } from '../services/emailService';
import { UserModel } from '../models/User';
import { pool } from '../config/database';
import { execute, query } from '../utils/dbHelper';

/**
 * Save push notification subscription
 * POST /api/notifications/push/subscribe
 */
export const subscribePushNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { endpoint, keys } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      throw new AppError('Invalid push subscription data', 400);
    }

    // Save or update push subscription
    await execute(
      pool,
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh_key, auth_key, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         endpoint = VALUES(endpoint),
         p256dh_key = VALUES(p256dh_key),
         auth_key = VALUES(auth_key),
         updated_at = NOW()`,
      [req.user.id, endpoint, keys.p256dh, keys.auth]
    );

    res.json({
      message: 'Push subscription saved successfully',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * Unsubscribe from push notifications
 * DELETE /api/notifications/push/unsubscribe
 */
export const unsubscribePushNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { endpoint } = req.body;

    if (endpoint) {
      await execute(
        pool,
        'DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?',
        [req.user.id, endpoint]
      );
    } else {
      // Delete all subscriptions for user
      await execute(
        pool,
        'DELETE FROM push_subscriptions WHERE user_id = ?',
        [req.user.id]
      );
    }

    res.json({
      message: 'Push subscription removed successfully',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * Send test email notification
 * POST /api/notifications/email/test
 */
export const sendTestEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.email) {
      throw new AppError('User email not found', 400);
    }

    const result = await EmailService.sendEmail({
      to: req.user.email,
      subject: 'FarmSync Test Email',
      html: `
        <h2>Test Email from FarmSync</h2>
        <p>This is a test email to verify your email notifications are working correctly.</p>
        <p>If you received this email, your email configuration is set up properly.</p>
      `,
    });

    res.json({
      message: 'Test email sent successfully',
      data: result,
    });
  } catch (error: any) {
    throw new AppError(error.message || 'Failed to send test email', error.statusCode || 500);
  }
};
