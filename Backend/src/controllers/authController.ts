import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AuthService } from '../services/authService';
import { AppError } from '../middleware/errorHandler';
import { body } from 'express-validator';
import { validatePassword } from '../utils/passwordValidator';
import { uploadProfilePicture, getProfilePictureUrl } from '../middleware/upload';
import { EmailService } from '../services/emailService';
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

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const result = await AuthService.login(email, password);

    // Log login action to audit log (don't block login if audit logging fails)
    const { logLogin } = await import('../middleware/auditLogger');
    logLogin(
      result.user.id,
      req.ip || req.socket.remoteAddress || undefined,
      req.headers['user-agent'] || undefined
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

