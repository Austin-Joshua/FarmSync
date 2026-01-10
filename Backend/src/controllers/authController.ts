import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AuthService } from '../services/authService';
import { AppError } from '../middleware/errorHandler';
import { body } from 'express-validator';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, location } = req.body;

    if (!name || !email || !password || !role) {
      throw new AppError('Name, email, password, and role are required', 400);
    }

    if (role !== 'farmer' && role !== 'admin') {
      throw new AppError('Role must be either farmer or admin', 400);
    }

    const result = await AuthService.register(name, email, password, role, location);

    res.status(201).json({
      message: 'User registered successfully',
      ...result,
    });
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const result = await AuthService.login(email, password);

    res.json({
      message: 'Login successful',
      ...result,
    });
  } catch (error: any) {
    throw new AppError(error.message, 401);
  }
};

export const googleLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      throw new AppError('Google ID token is required', 400);
    }

    const result = await AuthService.googleLogin(idToken);

    res.json({
      message: 'Google login successful',
      ...result,
    });
  } catch (error: any) {
    throw new AppError(error.message, 401);
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

    const { name, location, land_size, soil_type } = req.body;
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

// Validation rules - Allow any email format
export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().notEmpty().withMessage('Email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['farmer', 'admin']).withMessage('Role must be farmer or admin'),
];

export const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const googleLoginValidation = [
  body('idToken').notEmpty().withMessage('Google ID token is required'),
];
