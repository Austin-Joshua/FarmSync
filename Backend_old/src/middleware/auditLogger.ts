import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AuditLogModel } from '../models/AuditLog';

/**
 * Middleware to log user actions to audit log
 */
export const auditLogger = (action: 'create' | 'update' | 'delete' | 'view' | 'export', resourceType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // Execute the request first
    const originalSend = res.json;
    res.json = function (body: any) {
      // Log the action after successful response
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const resourceId = req.params.id || req.body?.id || undefined;
        const details = JSON.stringify({
          method: req.method,
          path: req.path,
          body: req.body ? Object.keys(req.body) : undefined,
        });

        AuditLogModel.create({
          user_id: req.user.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details,
          ip_address: req.ip || req.socket.remoteAddress || undefined,
          user_agent: req.headers['user-agent'] || undefined,
        }).catch((err) => {
          // Don't fail the request if audit logging fails
          console.error('Failed to create audit log:', err);
        });
      }

      // Call original send
      return originalSend.call(this, body);
    };

    next();
  };
};

/**
 * Middleware to log login attempts
 */
export const logLogin = async (userId: string, ipAddress?: string, userAgent?: string): Promise<void> => {
  try {
    await AuditLogModel.create({
      user_id: userId,
      action: 'login',
      resource_type: 'user',
      details: 'User login',
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (error) {
    console.error('Failed to log login:', error);
  }
};

/**
 * Middleware to log logout
 */
export const logLogout = async (userId: string, ipAddress?: string, userAgent?: string): Promise<void> => {
  try {
    await AuditLogModel.create({
      user_id: userId,
      action: 'logout',
      resource_type: 'user',
      details: 'User logout',
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (error) {
    console.error('Failed to log logout:', error);
  }
};
