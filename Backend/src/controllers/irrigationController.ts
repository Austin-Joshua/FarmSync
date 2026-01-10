import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { IrrigationModel } from '../models/Irrigation';
import { CropModel } from '../models/Crop';
import { FarmModel } from '../models/Farm';
import { AppError } from '../middleware/errorHandler';
import { body } from 'express-validator';

export const getIrrigations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { cropId } = req.query;
    if (!cropId) {
      throw new AppError('Crop ID is required', 400);
    }

    const crop = await CropModel.findById(cropId as string);
    if (!crop) {
      throw new AppError('Crop not found', 404);
    }

    const farm = await FarmModel.findById(crop.farm_id);
    if (farm && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized access', 403);
    }

    const irrigations = await IrrigationModel.findByCropId(cropId as string);

    res.json({
      message: 'Irrigation records retrieved successfully',
      data: irrigations,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const createIrrigation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { method, date, duration, crop_id } = req.body;

    if (!method || !date || !duration || !crop_id) {
      throw new AppError('All fields are required', 400);
    }

    const crop = await CropModel.findById(crop_id);
    if (!crop) {
      throw new AppError('Crop not found', 404);
    }

    const farm = await FarmModel.findById(crop.farm_id);
    if (farm && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized access', 403);
    }

    const irrigation = await IrrigationModel.create({
      method,
      date: new Date(date),
      duration: parseFloat(duration),
      crop_id,
    });

    res.status(201).json({
      message: 'Irrigation record created successfully',
      data: irrigation,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const updateIrrigation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const irrigation = await IrrigationModel.findById(id);

    if (!irrigation) {
      throw new AppError('Irrigation record not found', 404);
    }

    const crop = await CropModel.findById(irrigation.crop_id);
    if (crop) {
      const farm = await FarmModel.findById(crop.farm_id);
      if (req.user && farm && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }
    }

    const updates: any = {};
    if (req.body.method) updates.method = req.body.method;
    if (req.body.date) updates.date = new Date(req.body.date);
    if (req.body.duration !== undefined) updates.duration = parseFloat(req.body.duration);
    if (req.body.crop_id) updates.crop_id = req.body.crop_id;

    const updatedIrrigation = await IrrigationModel.update(id, updates);

    res.json({
      message: 'Irrigation record updated successfully',
      data: updatedIrrigation,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const deleteIrrigation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const irrigation = await IrrigationModel.findById(id);

    if (!irrigation) {
      throw new AppError('Irrigation record not found', 404);
    }

    const crop = await CropModel.findById(irrigation.crop_id);
    if (crop) {
      const farm = await FarmModel.findById(crop.farm_id);
      if (req.user && farm && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }
    }

    await IrrigationModel.delete(id);

    res.json({
      message: 'Irrigation record deleted successfully',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const irrigationValidation = [
  body('method').isIn(['drip', 'manual', 'sprinkler']).withMessage('Valid irrigation method is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('duration').isFloat({ min: 0 }).withMessage('Duration must be a positive number'),
  body('crop_id').isUUID().withMessage('Valid crop ID is required'),
];
