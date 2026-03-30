import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { StockModel } from '../models/Stock';
import { AppError } from '../middleware/errorHandler';
import { body } from 'express-validator';

export const getStockItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const stockItems = await StockModel.findByUserId(req.user.id);

    res.json({
      message: 'Stock items retrieved successfully',
      data: stockItems,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const getStockItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const stockItem = await StockModel.findById(id);

    if (!stockItem) {
      throw new AppError('Stock item not found', 404);
    }

    if (req.user && stockItem.user_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized access', 403);
    }

    res.json({
      message: 'Stock item retrieved successfully',
      data: stockItem,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const createStockItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { item_name, item_type, quantity, unit, threshold } = req.body;

    if (!item_name || !item_type || !quantity || !unit) {
      throw new AppError('All fields are required', 400);
    }

    const stockItem = await StockModel.create({
      user_id: req.user.id,
      item_name,
      item_type,
      quantity: parseFloat(quantity),
      unit,
      threshold: threshold !== undefined ? parseFloat(threshold) : undefined,
    });

    // Check if stock is low and send alert
    await checkAndSendLowStockAlert(req.user.id, stockItem);

    res.status(201).json({
      message: 'Stock item created successfully',
      data: stockItem,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const updateStockItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const stockItem = await StockModel.findById(id);

    if (!stockItem) {
      throw new AppError('Stock item not found', 404);
    }

    if (req.user && stockItem.user_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized access', 403);
    }

    const updates: any = {};
    if (req.body.item_name) updates.item_name = req.body.item_name;
    if (req.body.item_type) updates.item_type = req.body.item_type;
    if (req.body.quantity !== undefined) updates.quantity = parseFloat(req.body.quantity);
    if (req.body.threshold !== undefined) updates.threshold = parseFloat(req.body.threshold);
    if (req.body.unit) updates.unit = req.body.unit;

    const updatedStockItem = await StockModel.update(id, updates);

    // Check if stock is low and send alert
    if (req.user) {
      await checkAndSendLowStockAlert(req.user.id, updatedStockItem);
    }

    res.json({
      message: 'Stock item updated successfully',
      data: updatedStockItem,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * Get low stock items for current user
 * GET /api/stock/low-stock
 */
export const getLowStockItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const lowStockItems = await StockModel.findLowStockItems(req.user.id);

    res.json({
      message: 'Low stock items retrieved successfully',
      data: lowStockItems,
      count: lowStockItems.length,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * Helper function to check and send low stock alerts
 */
async function checkAndSendLowStockAlert(userId: string, stockItem: any): Promise<void> {
  try {
    const threshold = stockItem.threshold || 10.0;
    if (stockItem.quantity <= threshold) {
      // Get user email
      const { UserModel } = await import('../models/User');
      const user = await UserModel.findById(userId);
      
      if (user && user.email) {
        const { EmailService } = await import('../services/emailService');
        await EmailService.sendLowStockAlert(user.email, {
          name: stockItem.item_name,
          category: stockItem.item_type,
          quantity: stockItem.quantity,
          unit: stockItem.unit,
          threshold: threshold,
        }).catch((err) => {
          console.error('Failed to send low stock alert email:', err);
        });
      }
    }
  } catch (error) {
    console.error('Error checking low stock alert:', error);
    // Don't throw - this shouldn't break the main flow
  }
}

export const deleteStockItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const stockItem = await StockModel.findById(id);

    if (!stockItem) {
      throw new AppError('Stock item not found', 404);
    }

    if (req.user && stockItem.user_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized access', 403);
    }

    await StockModel.delete(id);

    res.json({
      message: 'Stock item deleted successfully',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Monthly Stock Usage History
export const getMonthlyStockUsage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    const stockUsage = await StockModel.getMonthlyStockUsage(req.user.id, month, year);

    res.json({
      message: 'Monthly stock usage retrieved successfully',
      data: stockUsage,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const createMonthlyStockUsage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { item_name, item_type, quantity_used, remaining_stock, unit, month, year, date_recorded } = req.body;

    if (!item_name || !item_type || !quantity_used || !remaining_stock || !unit || !month || !year || !date_recorded) {
      throw new AppError('All fields are required', 400);
    }

    const stockUsage = await StockModel.createMonthlyStockUsage({
      user_id: req.user.id,
      item_name,
      item_type,
      quantity_used: parseFloat(quantity_used),
      remaining_stock: parseFloat(remaining_stock),
      unit,
      month: parseInt(month),
      year: parseInt(year),
      date_recorded: new Date(date_recorded),
    });

    res.status(201).json({
      message: 'Monthly stock usage recorded successfully',
      data: stockUsage,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const stockValidation = [
  body('item_name').trim().notEmpty().withMessage('Item name is required'),
  body('item_type').isIn(['seeds', 'fertilizer', 'pesticide']).withMessage('Valid item type is required'),
  body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('unit').trim().notEmpty().withMessage('Unit is required'),
];
