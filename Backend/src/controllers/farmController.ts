import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FarmModel } from '../models/Farm';
import { AppError } from '../middleware/errorHandler';
import { body } from 'express-validator';

export const getFarms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const farms = await FarmModel.findByFarmerId(req.user.id);

    res.json({
      message: 'Farms retrieved successfully',
      data: farms,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const getFarm = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const farm = await FarmModel.findById(id);

    if (!farm) {
      throw new AppError('Farm not found', 404);
    }

    if (req.user && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized access', 403);
    }

    res.json({
      message: 'Farm retrieved successfully',
      data: farm,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const createFarm = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { name, location, land_size, soil_type_id } = req.body;

    if (!name || !location || !land_size) {
      throw new AppError('Name, location, and land_size are required', 400);
    }

    const farm = await FarmModel.create({
      name,
      location,
      land_size: parseFloat(land_size),
      soil_type_id,
      farmer_id: req.user.id,
    });

    res.status(201).json({
      message: 'Farm created successfully',
      data: farm,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const updateFarm = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const farm = await FarmModel.findById(id);

    if (!farm) {
      throw new AppError('Farm not found', 404);
    }

    if (req.user && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized access', 403);
    }

    const updates: any = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.location) updates.location = req.body.location;
    if (req.body.land_size !== undefined) updates.land_size = parseFloat(req.body.land_size);
    if (req.body.soil_type_id !== undefined) updates.soil_type_id = req.body.soil_type_id;

    const updatedFarm = await FarmModel.update(id, updates);

    res.json({
      message: 'Farm updated successfully',
      data: updatedFarm,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const deleteFarm = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const farm = await FarmModel.findById(id);

    if (!farm) {
      throw new AppError('Farm not found', 404);
    }

    if (req.user && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized access', 403);
    }

    await FarmModel.delete(id);

    res.json({
      message: 'Farm deleted successfully',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const farmValidation = [
  body('name').trim().notEmpty().withMessage('Farm name is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('land_size').isFloat({ min: 0 }).withMessage('Land size must be a positive number'),
];
