import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { AuditLogModel } from '../models/AuditLog';

/**
 * Get all audit logs (Admin only)
 * GET /api/audit-logs
 */
export const getAllAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 500;
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = await AuditLogModel.findAll(limit, offset);

    res.json({
      message: 'Audit logs retrieved successfully',
      data: logs,
      pagination: {
        limit,
        offset,
        total: logs.length,
      },
    });
  } catch (error: any) {
    throw new AppError(error.message, 500);
  }
};

/**
 * Get audit logs for current user
 * GET /api/audit-logs/me
 */
export const getMyAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const limit = parseInt(req.query.limit as string) || 100;
    const logs = await AuditLogModel.findByUserId(req.user.id, limit);

    res.json({
      message: 'Audit logs retrieved successfully',
      data: logs,
    });
  } catch (error: any) {
    throw new AppError(error.message, 500);
  }
};

/**
 * Get login history (Admin only)
 * GET /api/audit-logs/login-history
 */
export const getLoginHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = await AuditLogModel.getLoginHistory(limit);

    res.json({
      message: 'Login history retrieved successfully',
      data: logs,
    });
  } catch (error: any) {
    throw new AppError(error.message, 500);
  }
};

/**
 * Get system activity summary (Admin only)
 * GET /api/audit-logs/activity-summary
 */
export const getActivitySummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const summary = await AuditLogModel.getActivitySummary(days);

    res.json({
      message: 'Activity summary retrieved successfully',
      data: summary,
    });
  } catch (error: any) {
    throw new AppError(error.message, 500);
  }
};
