import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SettingsModel } from '../models/Settings';
import { AppError } from '../middleware/errorHandler';

export const getSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    let settings = await SettingsModel.findByUserId(req.user.id);

    if (!settings) {
      // Create default settings if they don't exist
      settings = await SettingsModel.createOrUpdate({
        user_id: req.user.id,
      });
    }

    res.json({
      message: 'Settings retrieved successfully',
      data: settings,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const {
      enable_history_saving,
      auto_save_stock_records,
      auto_save_income_records,
      notifications_enabled,
      theme,
    } = req.body;

    const updates: any = {};
    if (enable_history_saving !== undefined) updates.enable_history_saving = enable_history_saving;
    if (auto_save_stock_records !== undefined) updates.auto_save_stock_records = auto_save_stock_records;
    if (auto_save_income_records !== undefined) updates.auto_save_income_records = auto_save_income_records;
    if (notifications_enabled !== undefined) updates.notifications_enabled = notifications_enabled;
    if (theme) updates.theme = theme;

    const settings = await SettingsModel.createOrUpdate({
      user_id: req.user.id,
      ...updates,
    });

    res.json({
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};
