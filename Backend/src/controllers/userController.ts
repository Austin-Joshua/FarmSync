import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { pool } from '../config/database';

/**
 * GET /api/user/status
 * Get current user status including onboarding status
 */
export const getUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

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
        is_onboarded: user.is_onboarded || false,
        location: user.location || null,
        land_size: user.land_size || null,
        soil_type: user.soil_type || null,
        picture_url: user.picture_url || null,
      },
    });
  } catch (error: any) {
    // Provide detailed error information
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      throw new AppError('Database connection failed. Please check database server.', 500);
    }
    if (error.message.includes('timeout')) {
      throw new AppError('Database query timed out. Please check database connection.', 500);
    }
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * GET /api/user/profile
 * Get user profile with database connectivity status
 */
export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    // Test database connection
    let dbStatus = 'connected';
    let dbError = null;
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
    } catch (error: any) {
      dbStatus = 'disconnected';
      dbError = error.message;
    }

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
        is_onboarded: user.is_onboarded || false,
        location: user.location || null,
        land_size: user.land_size || null,
        soil_type: user.soil_type || null,
        picture_url: user.picture_url || null,
        created_at: user.created_at || null,
      },
      database: {
        status: dbStatus,
        error: dbError,
      },
    });
  } catch (error: any) {
    // Provide detailed error information
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      throw new AppError('Database connection failed. Please check database server.', 500);
    }
    if (error.message.includes('timeout')) {
      throw new AppError('Database query timed out. Please check database connection.', 500);
    }
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * GET /api/user/db-status
 * Get database connectivity status
 */
export const getDatabaseStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    let status = 'connected';
    let error = null;
    let responseTime = 0;

    try {
      const startTime = Date.now();
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      responseTime = Date.now() - startTime;
    } catch (err: any) {
      status = 'disconnected';
      error = err.message;
    }

    res.json({
      status,
      error,
      responseTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};
