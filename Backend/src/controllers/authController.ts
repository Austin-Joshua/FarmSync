import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AuthService } from '../services/authService';
import { AppError } from '../middleware/errorHandler';
import { body } from 'express-validator';
import { validatePassword } from '../utils/passwordValidator';
import { uploadProfilePicture, getProfilePictureUrl } from '../middleware/upload';
import { EmailService } from '../services/emailService';
import { pool } from '../config/database';
import { query, queryOne, execute } from '../utils/dbHelper';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, location } = req.body;

    if (!name || !email || !password || !role) {
      throw new AppError('Name, email, password, and role are required', 400);
    }

    if (role !== 'farmer' && role !== 'admin') {
      throw new AppError('Role must be either farmer or admin', 400);
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new AppError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400);
    }

    // Add timeout to registration process
    const registrationPromise = AuthService.register(name, email, password, role, location);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Registration timeout: Database operation took too long')), 8000)
    );

    const result = await Promise.race([registrationPromise, timeoutPromise]) as Awaited<ReturnType<typeof AuthService.register>>;

    // Send welcome email (don't block registration if email fails)
    EmailService.sendWelcomeEmail(email, name, role).catch((emailError) => {
      console.error('Failed to send welcome email:', emailError);
      // Don't throw error - registration should succeed even if email fails
    });

    res.status(201).json({
      message: 'User registered successfully',
      ...result,
    });
  } catch (error: any) {
    // Provide more specific error messages
    if (error.message.includes('timeout')) {
      throw new AppError('Registration timed out. Please check database connection and try again.', 500);
    }
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      throw new AppError('Database connection failed. Please check database server.', 500);
    }
    throw new AppError(error.message, error.statusCode || 400);
  }
};

// Helper function to parse user agent
function parseUserAgent(userAgent: string | undefined): { device: string; browser: string } {
  if (!userAgent) {
    return { device: 'Unknown Device', browser: 'Unknown Browser' };
  }

  let device = 'Desktop';
  let browser = 'Unknown Browser';

  // Detect device
  if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) {
    device = 'Mobile';
  } else if (/tablet|ipad/i.test(userAgent)) {
    device = 'Tablet';
  }

  // Detect browser
  if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/firefox/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/edg/i.test(userAgent)) {
    browser = 'Edge';
  } else if (/opera|opr/i.test(userAgent)) {
    browser = 'Opera';
  }

  return { device, browser };
}

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const result = await AuthService.login(email, password);

    // Track session
    const userAgent = req.headers['user-agent'] || '';
    const { device, browser } = parseUserAgent(userAgent);
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    
    // Calculate expiration (7 days from now, matching JWT expiration)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save session to database (don't block login if this fails)
    execute(
      pool,
      `INSERT INTO sessions (user_id, token, device_info, browser, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [result.user.id, result.token, device, browser, ipAddress, userAgent, expiresAt]
    ).catch((err) => {
      console.error('Failed to save session:', err);
      // Don't throw error - login should succeed even if session tracking fails
    });

    // Log login action to audit log (don't block login if audit logging fails)
    const { logLogin } = await import('../middleware/auditLogger');
    logLogin(
      result.user.id,
      ipAddress,
      userAgent
    ).catch((err) => {
      console.error('Failed to log login:', err);
      // Don't throw error - login should succeed even if audit logging fails
    });

    res.json({
      message: 'Login successful',
      ...result,
    });
  } catch (error: any) {
    // Ensure error is properly handled
    const errorMessage = error?.message || 'Login failed';
    const statusCode = error instanceof AppError ? error.statusCode : 401;
    throw new AppError(errorMessage, statusCode);
  }
};


export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { UserModel } = await import('../models/User');
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location || null,
        land_size: user.land_size || null,
        soil_type: user.soil_type || null,
        picture_url: user.picture_url,
      },
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { name, location, land_size, soil_type, picture_url } = req.body;
    const updates: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        throw new AppError('Name is required and must be a non-empty string', 400);
      }
      updates.name = name.trim();
    }

    if (location !== undefined) {
      updates.location = location || null;
    }

    if (land_size !== undefined) {
      const landSize = parseFloat(land_size);
      if (isNaN(landSize) || landSize < 0) {
        throw new AppError('Land size must be a non-negative number', 400);
      }
      updates.land_size = landSize;
    }

    if (soil_type !== undefined) {
      updates.soil_type = soil_type || null;
    }

    if (picture_url !== undefined) {
      updates.picture_url = picture_url || null;
    }

    if (Object.keys(updates).length === 0) {
      throw new AppError('No valid fields to update', 400);
    }

    const { UserModel } = await import('../models/User');
    const user = await UserModel.update(req.user.id, updates);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location || null,
        land_size: user.land_size || null,
        soil_type: user.soil_type || null,
        picture_url: user.picture_url,
      },
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * Upload profile picture
 * POST /api/auth/profile/picture
 */
export const uploadProfilePictureHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    // Get the uploaded file
    const filename = req.file.filename;
    const pictureUrl = getProfilePictureUrl(filename);

    // Get current user to check for old picture
    const { UserModel } = await import('../models/User');
    const currentUser = await UserModel.findById(req.user.id);
    
    // Delete old profile picture if it exists
    if (currentUser?.picture_url) {
      const oldPicturePath = path.join(__dirname, '../../uploads/profiles', path.basename(currentUser.picture_url));
      if (fs.existsSync(oldPicturePath)) {
        try {
          fs.unlinkSync(oldPicturePath);
        } catch (error) {
          console.error('Error deleting old profile picture:', error);
        }
      }
    }

    // Update user's picture_url
    const user = await UserModel.update(req.user.id, { picture_url: pictureUrl });

    res.json({
      message: 'Profile picture uploaded successfully',
      picture_url: user.picture_url,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location || null,
        land_size: user.land_size || null,
        soil_type: user.soil_type || null,
        picture_url: user.picture_url,
      },
    });
  } catch (error: any) {
    // Delete the uploaded file if there was an error
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads/profiles', req.file.filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (deleteError) {
          console.error('Error deleting uploaded file:', deleteError);
        }
      }
    }
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Validation rules - Allow any email format, but enforce strong password
export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().notEmpty().withMessage('Email is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/).withMessage('Password must contain at least one special character'),
  body('role').isIn(['farmer', 'admin']).withMessage('Role must be farmer or admin'),
];

export const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Forgot Password - Request password reset
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    // Find user by email
    const { UserModel } = await import('../models/User');
    const user = await UserModel.findByEmail(email);

    // Don't reveal if email exists (security best practice)
    if (!user) {
      // Still return success to prevent email enumeration
      res.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
      return;
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Token expires in 30 minutes

    // Save reset token to database
    await execute(
      pool,
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES (?, ?, ?)`,
      [user.id, resetToken, expiresAt]
    );

    // Generate reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send password reset email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .warning { background: #fef3c7; padding: 15px; border-left: 4px solid #d97706; margin: 15px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.name}!</h2>
              <p>You requested to reset your password. Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 30 minutes. If you didn't request this, please ignore this email.
              </div>
              <div class="footer">
                <p><strong>FarmSync</strong> - Digital Farm Record Management System</p>
                <p>This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await EmailService.sendEmail({
      to: email,
      subject: '🔐 Reset Your FarmSync Password',
      html: emailHtml,
    });

    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error: any) {
    // Don't reveal errors to prevent email enumeration
    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  }
};

/**
 * Reset Password - Set new password using reset token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new AppError('Token and password are required', 400);
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new AppError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400);
    }

    // Find valid reset token
    const resetToken = await queryOne<{
      id: string;
      user_id: string;
      expires_at: Date;
      used: boolean;
    }>(
      pool,
      `SELECT * FROM password_reset_tokens 
       WHERE token = ? AND used = FALSE AND expires_at > NOW()`,
      [token]
    );

    if (!resetToken) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Update user password
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

    const { UserModel } = await import('../models/User');
    await execute(
      pool,
      `UPDATE users SET password_hash = ? WHERE id = ?`,
      [passwordHash, resetToken.user_id]
    );

    // Mark token as used
    await execute(
      pool,
      `UPDATE password_reset_tokens SET used = TRUE WHERE id = ?`,
      [resetToken.id]
    );

    // Invalidate all user sessions (force re-login)
    await execute(
      pool,
      `UPDATE sessions SET is_active = FALSE WHERE user_id = ?`,
      [resetToken.user_id]
    );

    res.json({
      message: 'Password reset successfully. Please login with your new password.',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 400);
  }
};

/**
 * Get active sessions for current user
 * GET /api/auth/sessions
 */
export const getActiveSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    // Get current token from request
    const authHeader = req.headers.authorization;
    const currentToken = authHeader?.replace('Bearer ', '');

    // Get all active sessions for user
    const sessions = await query<{
      id: string;
      token: string;
      device_info: string;
      browser: string;
      ip_address: string;
      user_agent: string;
      last_activity: Date;
      created_at: Date;
      expires_at: Date;
    }>(
      pool,
      `SELECT id, token, device_info, browser, ip_address, user_agent, 
              last_activity, created_at, expires_at
       FROM sessions 
       WHERE user_id = ? AND is_active = TRUE AND expires_at > NOW()
       ORDER BY last_activity DESC`,
      [req.user.id]
    );

    // Format sessions (don't expose full token)
    const formattedSessions = sessions.map((session) => ({
      id: session.id,
      isCurrent: session.token === currentToken,
      device: session.device_info || 'Unknown Device',
      browser: session.browser || 'Unknown Browser',
      ipAddress: session.ip_address,
      lastActivity: session.last_activity,
      createdAt: session.created_at,
    }));

    res.json({
      sessions: formattedSessions,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * Logout from all devices
 * POST /api/auth/logout-all
 */
export const logoutAllDevices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    // Deactivate all sessions except current one
    const authHeader = req.headers.authorization;
    const currentToken = authHeader?.replace('Bearer ', '');

    await execute(
      pool,
      `UPDATE sessions 
       SET is_active = FALSE 
       WHERE user_id = ? AND token != ?`,
      [req.user.id, currentToken]
    );

    res.json({
      message: 'Logged out from all other devices successfully',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Validation rules
export const forgotPasswordValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
];

export const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/).withMessage('Password must contain at least one special character'),
];

