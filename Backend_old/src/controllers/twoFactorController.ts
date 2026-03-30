import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { TwoFactorService } from '../services/twoFactorService';
import { UserModel } from '../models/User';
import { body } from 'express-validator';

/**
 * GET /api/auth/2fa/setup
 * Generate 2FA secret and QR code
 */
export const setup2FA = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const secret = TwoFactorService.generateSecret(req.user.email);
    const qrCode = await TwoFactorService.generateQRCode(secret, req.user.email);

    res.json({
      message: '2FA setup initiated',
      data: {
        secret,
        qrCode,
        manualEntryKey: secret, // For manual entry if QR code doesn't work
      },
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * POST /api/auth/2fa/verify-setup
 * Verify token and enable 2FA
 */
export const verifyAndEnable2FA = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { secret, token } = req.body;

    if (!secret || !token) {
      throw new AppError('Secret and token are required', 400);
    }

    // Verify the token
    const isValid = TwoFactorService.verifyToken(secret, token);
    if (!isValid) {
      throw new AppError('Invalid verification code', 400);
    }

    // Generate backup codes
    const backupCodes = TwoFactorService.generateBackupCodes();

    // Enable 2FA
    await TwoFactorService.enable2FA(req.user.id, secret, backupCodes);

    res.json({
      message: 'Two-factor authentication enabled successfully',
      data: {
        backupCodes, // Show these to user - they won't be shown again
      },
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * POST /api/auth/2fa/verify
 * Verify 2FA token during login
 */
export const verify2FAToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { token } = req.body;

    if (!token) {
      throw new AppError('Token is required', 400);
    }

    const isValid = await TwoFactorService.verify2FAToken(req.user.id, token);
    if (!isValid) {
      throw new AppError('Invalid verification code', 400);
    }

    res.json({
      message: 'Two-factor authentication verified',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA (requires password verification)
 */
export const disable2FA = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { password } = req.body;

    if (!password) {
      throw new AppError('Password is required to disable 2FA', 400);
    }

    // Verify password
    const user = await UserModel.findByIdWithPassword(req.user.id);
    if (!user || !user.password_hash) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await UserModel.verifyPassword(user, password);
    if (!isPasswordValid) {
      throw new AppError('Invalid password', 401);
    }

    // Disable 2FA
    await TwoFactorService.disable2FA(req.user.id);

    res.json({
      message: 'Two-factor authentication disabled successfully',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * GET /api/auth/2fa/backup-codes
 * Regenerate backup codes
 */
export const regenerateBackupCodes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const user = await UserModel.findByIdWith2FA(req.user.id);
    if (!user || !user.two_factor_enabled || !user.two_factor_secret) {
      throw new AppError('2FA is not enabled', 400);
    }

    const backupCodes = TwoFactorService.generateBackupCodes();
    await TwoFactorService.enable2FA(req.user.id, user.two_factor_secret, backupCodes);

    res.json({
      message: 'Backup codes regenerated',
      data: {
        backupCodes,
      },
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const twoFactorValidation = [
  body('token').trim().notEmpty().withMessage('Token is required'),
  body('secret').optional().trim().notEmpty().withMessage('Secret is required when setting up'),
];
