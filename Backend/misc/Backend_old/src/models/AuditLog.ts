import { pool } from '../config/database';
import { query, queryOne, execute } from '../utils/dbHelper';

export interface AuditLog {
  id: string;
  user_id: string;
  action: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'view' | 'export' | 'admin_action';
  resource_type: string; // 'crop', 'expense', 'yield', 'stock', 'user', etc.
  resource_id?: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface CreateAuditLogData {
  user_id: string;
  action: AuditLog['action'];
  resource_type: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
}

export class AuditLogModel {
  /**
   * Create a new audit log entry
   */
  static async create(data: CreateAuditLogData): Promise<AuditLog> {
    await execute(
      pool,
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.user_id,
        data.action,
        data.resource_type,
        data.resource_id || null,
        data.details || null,
        data.ip_address || null,
        data.user_agent || null,
      ]
    );

    const log = await queryOne<AuditLog>(
      pool,
      'SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [data.user_id]
    );

    if (!log) throw new Error('Failed to create audit log');
    return log;
  }

  /**
   * Get audit logs for a specific user
   */
  static async findByUserId(userId: string, limit: number = 100): Promise<AuditLog[]> {
    return query<AuditLog>(
      pool,
      `SELECT * FROM audit_logs 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );
  }

  /**
   * Get all audit logs (admin only)
   */
  static async findAll(limit: number = 500, offset: number = 0): Promise<AuditLog[]> {
    return query<AuditLog>(
      pool,
      `SELECT al.*, u.name as user_name, u.email as user_email 
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
  }

  /**
   * Get audit logs by action type
   */
  static async findByAction(action: AuditLog['action'], limit: number = 100): Promise<AuditLog[]> {
    return query<AuditLog>(
      pool,
      `SELECT al.*, u.name as user_name, u.email as user_email 
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.action = ? 
       ORDER BY al.created_at DESC 
       LIMIT ?`,
      [action, limit]
    );
  }

  /**
   * Get login history (for admin dashboard)
   */
  static async getLoginHistory(limit: number = 100): Promise<AuditLog[]> {
    return query<AuditLog>(
      pool,
      `SELECT al.*, u.name as user_name, u.email as user_email, u.role
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.action = 'login'
       ORDER BY al.created_at DESC 
       LIMIT ?`,
      [limit]
    );
  }

  /**
   * Get system activity summary (for admin dashboard)
   */
  static async getActivitySummary(days: number = 7): Promise<{
    totalActions: number;
    logins: number;
    creates: number;
    updates: number;
    deletes: number;
    exports: number;
    adminActions: number;
  }> {
    const result = await queryOne<{
      total_actions: number;
      logins: number;
      creates: number;
      updates: number;
      deletes: number;
      exports: number;
      admin_actions: number;
    }>(
      pool,
      `SELECT 
        COUNT(*) as total_actions,
        SUM(CASE WHEN action = 'login' THEN 1 ELSE 0 END) as logins,
        SUM(CASE WHEN action = 'create' THEN 1 ELSE 0 END) as creates,
        SUM(CASE WHEN action = 'update' THEN 1 ELSE 0 END) as updates,
        SUM(CASE WHEN action = 'delete' THEN 1 ELSE 0 END) as deletes,
        SUM(CASE WHEN action = 'export' THEN 1 ELSE 0 END) as exports,
        SUM(CASE WHEN action = 'admin_action' THEN 1 ELSE 0 END) as admin_actions
       FROM audit_logs
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [days]
    );

    return {
      totalActions: result?.total_actions || 0,
      logins: result?.logins || 0,
      creates: result?.creates || 0,
      updates: result?.updates || 0,
      deletes: result?.deletes || 0,
      exports: result?.exports || 0,
      adminActions: result?.admin_actions || 0,
    };
  }
}
