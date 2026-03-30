import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DashboardService } from '../services/dashboardService';
import { AppError } from '../middleware/errorHandler';

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    let dashboard;

    if (req.user.role === 'admin') {
      dashboard = await DashboardService.getAdminDashboard();
    } else {
      dashboard = await DashboardService.getFarmerDashboard(req.user.id);
    }

    res.json({
      message: 'Dashboard data retrieved successfully',
      data: dashboard,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};
