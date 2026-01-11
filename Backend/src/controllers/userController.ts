import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';

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
    throw new AppError(error.message, error.statusCode || 500);
  }
};
