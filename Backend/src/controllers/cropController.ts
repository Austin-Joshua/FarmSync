import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CropModel } from '../models/Crop';
import { FarmModel } from '../models/Farm';
import { AppError } from '../middleware/errorHandler';
import { body } from 'express-validator';

export const getCrops = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    let crops;
    if (req.query.farmId) {
      const farm = await FarmModel.findById(req.query.farmId as string);
      if (!farm || (farm.farmer_id !== req.user.id && req.user.role !== 'admin')) {
        throw new AppError('Unauthorized access', 403);
      }
      crops = await CropModel.findByFarmId(req.query.farmId as string);
    } else {
      crops = await CropModel.findByFarmerId(req.user.id);
    }

    res.json({
      message: 'Crops retrieved successfully',
      data: crops,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const getCrop = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const crop = await CropModel.findById(id);

    if (!crop) {
      throw new AppError('Crop not found', 404);
    }

    const farm = await FarmModel.findById(crop.farm_id);
    if (req.user && farm && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized access', 403);
    }

    res.json({
      message: 'Crop retrieved successfully',
      data: crop,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const createCrop = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { name, crop_type_id, season, sowing_date, harvest_date, status, farm_id } = req.body;

    if (!name || !sowing_date || !status || !farm_id) {
      throw new AppError('Name, sowing_date, status, and farm_id are required', 400);
    }

    const farm = await FarmModel.findById(farm_id);
    if (!farm) {
      throw new AppError('Farm not found', 404);
    }

    if (farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized access', 403);
    }

    const crop = await CropModel.create({
      name,
      crop_type_id,
      season,
      sowing_date: new Date(sowing_date),
      harvest_date: harvest_date ? new Date(harvest_date) : undefined,
      status,
      farm_id,
    });

    res.status(201).json({
      message: 'Crop created successfully',
      data: crop,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const updateCrop = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const crop = await CropModel.findById(id);

    if (!crop) {
      throw new AppError('Crop not found', 404);
    }

    const farm = await FarmModel.findById(crop.farm_id);
    if (req.user && farm && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized access', 403);
    }

    const updates: any = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.crop_type_id !== undefined) updates.crop_type_id = req.body.crop_type_id;
    if (req.body.season !== undefined) updates.season = req.body.season;
    if (req.body.sowing_date) updates.sowing_date = new Date(req.body.sowing_date);
    if (req.body.harvest_date !== undefined) {
      updates.harvest_date = req.body.harvest_date ? new Date(req.body.harvest_date) : null;
    }
    if (req.body.status) updates.status = req.body.status;

    const updatedCrop = await CropModel.update(id, updates);

    res.json({
      message: 'Crop updated successfully',
      data: updatedCrop,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const deleteCrop = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const crop = await CropModel.findById(id);

    if (!crop) {
      throw new AppError('Crop not found', 404);
    }

    const farm = await FarmModel.findById(crop.farm_id);
    if (req.user && farm && farm.farmer_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized access', 403);
    }

    await CropModel.delete(id);

    res.json({
      message: 'Crop deleted successfully',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

// Crop Types (Admin only)
export const getCropTypes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cropTypes = await CropModel.getAllCropTypes();

    res.json({
      message: 'Crop types retrieved successfully',
      data: cropTypes,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const createCropType = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { name, category, season, suitable_soil_types, average_yield, growth_period, water_requirement, description } = req.body;

    if (!name || !category || !season) {
      throw new AppError('Name, category, and season are required', 400);
    }

    const cropType = await CropModel.createCropType({
      name,
      category,
      season,
      suitable_soil_types,
      average_yield,
      growth_period,
      water_requirement,
      description,
      created_by: req.user.id,
    });

    res.status(201).json({
      message: 'Crop type created successfully',
      data: cropType,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const updateCropType = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const updates: any = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.category) updates.category = req.body.category;
    if (req.body.season) updates.season = req.body.season;
    if (req.body.suitable_soil_types !== undefined) updates.suitable_soil_types = req.body.suitable_soil_types;
    if (req.body.average_yield !== undefined) updates.average_yield = req.body.average_yield;
    if (req.body.growth_period !== undefined) updates.growth_period = req.body.growth_period;
    if (req.body.water_requirement) updates.water_requirement = req.body.water_requirement;
    if (req.body.description !== undefined) updates.description = req.body.description;

    const updatedCropType = await CropModel.updateCropType(id, updates);

    res.json({
      message: 'Crop type updated successfully',
      data: updatedCropType,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const deleteCropType = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await CropModel.deleteCropType(id);

    res.json({
      message: 'Crop type deleted successfully',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const cropValidation = [
  body('name').trim().notEmpty().withMessage('Crop name is required'),
  body('sowing_date').isISO8601().withMessage('Valid sowing date is required'),
  body('status').isIn(['active', 'harvested', 'planned']).withMessage('Status must be active, harvested, or planned'),
  body('farm_id').isUUID().withMessage('Valid farm ID is required'),
];

export const cropTypeValidation = [
  body('name').trim().notEmpty().withMessage('Crop type name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('season').isIn(['kharif', 'rabi', 'zaid', 'year-round']).withMessage('Valid season is required'),
];
