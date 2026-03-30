import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FertilizerModel } from '../models/Fertilizer';
import { CropModel } from '../models/Crop';
import { FarmModel } from '../models/Farm';
import { AppError } from '../middleware/errorHandler';
import { body } from 'express-validator';

export const getFertilizers = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const fertilizers = await FertilizerModel.findByCropId(cropId as string);

    res.json({
      message: 'Fertilizers retrieved successfully',
      data: fertilizers,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const createFertilizer = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const fertilizer = await FertilizerModel.create({
      type,
      quantity: parseFloat(quantity),
      date_of_usage: new Date(date_of_usage),
      crop_id,
    });

    res.status(201).json({
      message: 'Fertilizer record created successfully',
      data: fertilizer,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const updateFertilizer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const fertilizer = await FertilizerModel.findById(id);

    if (!fertilizer) {
      throw new AppError('Fertilizer record not found', 404);
    }

    const crop = await CropModel.findById(fertilizer.crop_id);
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

    const updatedFertilizer = await FertilizerModel.update(id, updates);

    res.json({
      message: 'Fertilizer record updated successfully',
      data: updatedFertilizer,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const deleteFertilizer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const fertilizer = await FertilizerModel.findById(id);

    if (!fertilizer) {
      throw new AppError('Fertilizer record not found', 404);
    }

    const crop = await CropModel.findById(fertilizer.crop_id);
    if (crop) {
      const farm = await FarmModel.findById(crop.farm_id);
      if (req.user && farm && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }
    }

    await FertilizerModel.delete(id);

    res.json({
      message: 'Fertilizer record deleted successfully',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const fertilizerValidation = [
  body('type').trim().notEmpty().withMessage('Fertilizer type is required'),
  body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('date_of_usage').isISO8601().withMessage('Valid date is required'),
  body('crop_id').isUUID().withMessage('Valid crop ID is required'),
];
