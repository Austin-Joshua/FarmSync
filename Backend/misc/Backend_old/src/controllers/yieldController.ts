import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { YieldModel } from '../models/Yield';
import { CropModel } from '../models/Crop';
import { FarmModel } from '../models/Farm';
import { AppError } from '../middleware/errorHandler';
import { body } from 'express-validator';

export const getYields = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    let yields;
    if (req.query.cropId) {
      const crop = await CropModel.findById(req.query.cropId as string);
      if (!crop) {
        throw new AppError('Crop not found', 404);
      }
      const farm = await FarmModel.findById(crop.farm_id);
      if (farm && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }
      yields = await YieldModel.findByCropId(req.query.cropId as string);
    } else {
      yields = await YieldModel.findByFarmerId(req.user.id);
    }

    res.json({
      message: 'Yields retrieved successfully',
      data: yields,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const getYield = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const yieldRecord = await YieldModel.findById(id);

    if (!yieldRecord) {
      throw new AppError('Yield record not found', 404);
    }

    const crop = await CropModel.findById(yieldRecord.crop_id);
    if (crop) {
      const farm = await FarmModel.findById(crop.farm_id);
      if (req.user && farm && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }
    }

    res.json({
      message: 'Yield retrieved successfully',
      data: yieldRecord,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const createYield = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { crop_id, quantity, date, quality } = req.body;

    if (!crop_id || !quantity || !date || !quality) {
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

    const yieldRecord = await YieldModel.create({
      crop_id,
      quantity: parseFloat(quantity),
      date: new Date(date),
      quality,
    });

    res.status(201).json({
      message: 'Yield record created successfully',
      data: yieldRecord,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const updateYield = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const yieldRecord = await YieldModel.findById(id);

    if (!yieldRecord) {
      throw new AppError('Yield record not found', 404);
    }

    const crop = await CropModel.findById(yieldRecord.crop_id);
    if (crop) {
      const farm = await FarmModel.findById(crop.farm_id);
      if (req.user && farm && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }
    }

    const updates: any = {};
    if (req.body.crop_id) updates.crop_id = req.body.crop_id;
    if (req.body.quantity !== undefined) updates.quantity = parseFloat(req.body.quantity);
    if (req.body.date) updates.date = new Date(req.body.date);
    if (req.body.quality) updates.quality = req.body.quality;

    const updatedYield = await YieldModel.update(id, updates);

    res.json({
      message: 'Yield record updated successfully',
      data: updatedYield,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const deleteYield = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const yieldRecord = await YieldModel.findById(id);

    if (!yieldRecord) {
      throw new AppError('Yield record not found', 404);
    }

    const crop = await CropModel.findById(yieldRecord.crop_id);
    if (crop) {
      const farm = await FarmModel.findById(crop.farm_id);
      if (req.user && farm && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }
    }

    await YieldModel.delete(id);

    res.json({
      message: 'Yield record deleted successfully',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const yieldValidation = [
  body('crop_id').isUUID().withMessage('Valid crop ID is required'),
  body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('quality').isIn(['excellent', 'good', 'average']).withMessage('Quality must be excellent, good, or average'),
];
