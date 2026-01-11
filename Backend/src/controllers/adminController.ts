import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { AuditLogModel } from '../models/AuditLog';
import { UserModel } from '../models/User';
import { ExpenseModel } from '../models/Expense';
import { YieldModel } from '../models/Yield';
import { CropModel } from '../models/Crop';
import { pool } from '../config/database';
import { query, queryOne } from '../utils/dbHelper';

/**
 * Get comprehensive admin statistics
 * GET /api/admin/statistics
 */
export const getAdminStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new AppError('Admin access required', 403);
    }

    // Get farmer login statistics by district
    const farmerLoginsByDistrict = await query<{
      district: string;
      total_logins: number;
      unique_farmers: number;
    }>(
      pool,
      `SELECT 
        COALESCE(u.location, 'Unknown') as district,
        COUNT(al.id) as total_logins,
        COUNT(DISTINCT al.user_id) as unique_farmers
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
      WHERE al.action = 'login' AND u.role = 'farmer'
      GROUP BY COALESCE(u.location, 'Unknown')
      ORDER BY total_logins DESC`,
      []
    );

    // Get revenue by district (from yields - assuming average price of 20 per kg)
    const revenueByDistrict = await query<{
      district: string;
      total_revenue: string;
      total_yield: string;
      total_expenses: string;
      net_profit: string;
    }>(
      pool,
      `SELECT 
        COALESCE(u.location, 'Unknown') as district,
        COALESCE(SUM(y.quantity) * 20, 0) as total_revenue,
        COALESCE(SUM(y.quantity), 0) as total_yield,
        COALESCE(SUM(e.amount), 0) as total_expenses,
        COALESCE(SUM(y.quantity) * 20, 0) - COALESCE(SUM(e.amount), 0) as net_profit
      FROM users u
      LEFT JOIN farms f ON f.farmer_id = u.id
      LEFT JOIN crops c ON c.farm_id = f.id
      LEFT JOIN yields y ON y.crop_id = c.id
      LEFT JOIN expenses e ON e.farm_id = f.id
      WHERE u.role = 'farmer'
      GROUP BY COALESCE(u.location, 'Unknown')
      ORDER BY total_revenue DESC`,
      []
    );

    // Get total crops count
    const totalCropsResult = await queryOne<{ total_crops: number }>(
      pool,
      'SELECT COUNT(*) as total_crops FROM crops',
      []
    );

    // Get total goods delivered (yields)
    const totalGoodsDeliveredResult = await queryOne<{
      total_quantity: string;
      total_deliveries: number;
    }>(
      pool,
      `SELECT 
        COALESCE(SUM(quantity), 0) as total_quantity,
        COUNT(*) as total_deliveries
      FROM yields`,
      []
    );

    // Get total farmer logins (all time)
    const totalFarmerLoginsResult = await queryOne<{ total_logins: number }>(
      pool,
      `SELECT COUNT(*) as total_logins
       FROM audit_logs al
       JOIN users u ON al.user_id = u.id
       WHERE al.action = 'login' AND u.role = 'farmer'`,
      []
    );

    // Get recent login activity (last 30 days)
    const recentLogins = await query<{
      date: string;
      login_count: number;
    }>(
      pool,
      `SELECT 
        DATE(al.created_at) as date,
        COUNT(*) as login_count
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
      WHERE al.action = 'login' 
        AND u.role = 'farmer'
        AND al.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(al.created_at)
      ORDER BY date DESC`,
      []
    );

    res.json({
      message: 'Admin statistics retrieved successfully',
      data: {
        farmerLoginsByDistrict: farmerLoginsByDistrict.map(row => ({
          district: row.district,
          totalLogins: parseInt(row.total_logins.toString()),
          uniqueFarmers: parseInt(row.unique_farmers.toString()),
        })),
        revenueByDistrict: revenueByDistrict.map(row => ({
          district: row.district,
          totalRevenue: parseFloat(row.total_revenue),
          totalYield: parseFloat(row.total_yield),
          totalExpenses: parseFloat(row.total_expenses),
          netProfit: parseFloat(row.net_profit),
        })),
        totalCrops: parseInt(totalCropsResult?.total_crops?.toString() || '0'),
        totalGoodsDelivered: {
          totalQuantity: parseFloat(totalGoodsDeliveredResult?.total_quantity || '0'),
          totalDeliveries: parseInt(totalGoodsDeliveredResult?.total_deliveries?.toString() || '0'),
        },
        totalFarmerLogins: parseInt(totalFarmerLoginsResult?.total_logins?.toString() || '0'),
        recentLogins: recentLogins.map(row => ({
          date: row.date,
          loginCount: parseInt(row.login_count.toString()),
        })),
      },
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};
