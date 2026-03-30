import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PesticideModel } from '../models/Pesticide';
import { CropModel } from '../models/Crop';
import { FarmModel } from '../models/Farm';
import { AppError } from '../middleware/errorHandler';
import { body } from 'express-validator';

export const getPesticides = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const pesticides = await PesticideModel.findByCropId(cropId as string);

    res.json({
      message: 'Pesticides retrieved successfully',
      data: pesticides,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const createPesticide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { type, quantity, date_of_usage, crop_id } = req.body;

    if (!type || !quantity || !date_of_usage || !crop_id) {
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

    const pesticide = await PesticideModel.create({
      type,
      quantity: parseFloat(quantity),
      date_of_usage: new Date(date_of_usage),
      crop_id,
    });

    res.status(201).json({
      message: 'Pesticide record created successfully',
      data: pesticide,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const updatePesticide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const pesticide = await PesticideModel.findById(id);

    if (!pesticide) {
      throw new AppError('Pesticide record not found', 404);
    }

    const crop = await CropModel.findById(pesticide.crop_id);
    if (crop) {
      const farm = await FarmModel.findById(crop.farm_id);
      if (req.user && farm && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }
    }

    const updates: any = {};
    if (req.body.type) updates.type = req.body.type;
    if (req.body.quantity !== undefined) updates.quantity = parseFloat(req.body.quantity);
    if (req.body.date_of_usage) updates.date_of_usage = new Date(req.body.date_of_usage);
    if (req.body.crop_id) updates.crop_id = req.body.crop_id;

    const updatedPesticide = await PesticideModel.update(id, updates);

    res.json({
      message: 'Pesticide record updated successfully',
      data: updatedPesticide,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const deletePesticide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const pesticide = await PesticideModel.findById(id);

    if (!pesticide) {
      throw new AppError('Pesticide record not found', 404);
    }

    const crop = await CropModel.findById(pesticide.crop_id);
    if (crop) {
      const farm = await FarmModel.findById(crop.farm_id);
      if (req.user && farm && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }
    }

    await PesticideModel.delete(id);

    res.json({
      message: 'Pesticide record deleted successfully',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const pesticideValidation = [
  body('type').trim().notEmpty().withMessage('Pesticide type is required'),
  body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('date_of_usage').isISO8601().withMessage('Valid date is required'),
  body('crop_id').isUUID().withMessage('Valid crop ID is required'),
];
