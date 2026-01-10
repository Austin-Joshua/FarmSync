import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ExpenseModel } from '../models/Expense';
import { FarmModel } from '../models/Farm';
import { AppError } from '../middleware/errorHandler';
import { body } from 'express-validator';

export const getExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    let expenses;
    if (req.query.farmId) {
      const farm = await FarmModel.findById(req.query.farmId as string);
      if (!farm || (farm.farmer_id !== req.user.id && req.user.role !== 'admin')) {
        throw new AppError('Unauthorized access', 403);
      }
      expenses = await ExpenseModel.findByFarmId(req.query.farmId as string);
    } else {
      expenses = await ExpenseModel.findByFarmerId(req.user.id);
    }

    res.json({
      message: 'Expenses retrieved successfully',
      data: expenses,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const getExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await ExpenseModel.findById(id);

    if (!expense) {
      throw new AppError('Expense not found', 404);
    }

    const farm = await FarmModel.findById(expense.farm_id);
    if (req.user && farm && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized access', 403);
    }

    res.json({
      message: 'Expense retrieved successfully',
      data: expense,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const createExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { category, description, amount, date, farm_id } = req.body;

    if (!category || !description || !amount || !date || !farm_id) {
      throw new AppError('All fields are required', 400);
    }

    const farm = await FarmModel.findById(farm_id);
    if (!farm) {
      throw new AppError('Farm not found', 404);
    }

    if (farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized access', 403);
    }

    const expense = await ExpenseModel.create({
      category,
      description,
      amount: parseFloat(amount),
      date: new Date(date),
      farm_id,
    });

    res.status(201).json({
      message: 'Expense created successfully',
      data: expense,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const updateExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await ExpenseModel.findById(id);

    if (!expense) {
      throw new AppError('Expense not found', 404);
    }

    const farm = await FarmModel.findById(expense.farm_id);
    if (req.user && farm && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized access', 403);
    }

    const updates: any = {};
    if (req.body.category) updates.category = req.body.category;
    if (req.body.description) updates.description = req.body.description;
    if (req.body.amount !== undefined) updates.amount = parseFloat(req.body.amount);
    if (req.body.date) updates.date = new Date(req.body.date);
    if (req.body.farm_id) updates.farm_id = req.body.farm_id;

    const updatedExpense = await ExpenseModel.update(id, updates);

    res.json({
      message: 'Expense updated successfully',
      data: updatedExpense,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await ExpenseModel.findById(id);

    if (!expense) {
      throw new AppError('Expense not found', 404);
    }

    const farm = await FarmModel.findById(expense.farm_id);
    if (req.user && farm && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized access', 403);
    }

    await ExpenseModel.delete(id);

    res.json({
      message: 'Expense deleted successfully',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const expenseValidation = [
  body('category').isIn(['seeds', 'labor', 'fertilizers', 'pesticides', 'irrigation', 'other']).withMessage('Valid category is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('farm_id').isUUID().withMessage('Valid farm ID is required'),
];
