import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { HistoryModel } from '../models/History';
import { AppError } from '../middleware/errorHandler';
import { body } from 'express-validator';

export const getMonthlyIncome = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    const monthlyIncome = await HistoryModel.getMonthlyIncome(req.user.id, month, year);

    res.json({
      message: 'Monthly income history retrieved successfully',
      data: monthlyIncome,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const createOrUpdateMonthlyIncome = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { month, year, total_income, crops_sold, average_price } = req.body;

    if (!month || !year || total_income === undefined || crops_sold === undefined) {
      throw new AppError('Month, year, total_income, and crops_sold are required', 400);
    }

    const monthlyIncome = await HistoryModel.createOrUpdateMonthlyIncome({
      user_id: req.user.id,
      month: parseInt(month),
      year: parseInt(year),
      total_income: parseFloat(total_income),
      crops_sold: parseInt(crops_sold),
      average_price: average_price ? parseFloat(average_price) : undefined,
    });

    res.json({
      message: 'Monthly income saved successfully',
      data: monthlyIncome,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const monthlyIncomeValidation = [
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2000 }).withMessage('Valid year is required'),
  body('total_income').isFloat({ min: 0 }).withMessage('Total income must be a positive number'),
  body('crops_sold').isInt({ min: 0 }).withMessage('Crops sold must be a non-negative integer'),
];
