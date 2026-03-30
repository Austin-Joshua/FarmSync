import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FieldModel } from '../models/Field';
import { FarmModel } from '../models/Farm';
import { AppError } from '../middleware/errorHandler';
import { body } from 'express-validator';

/**
 * GET /api/fields
 * Get all fields for user's farms
 */
export const getFields = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const farms = await FarmModel.findByFarmerId(req.user.id);
    const allFields = [];

    for (const farm of farms) {
      const fields = await FieldModel.findByFarmId(farm.id);
      allFields.push(...fields);
    }

    res.json({
      message: 'Fields retrieved successfully',
      data: allFields,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * GET /api/fields/:farmId
 * Get fields for a specific farm
 */
export const getFieldsByFarm = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { farmId } = req.params;
    const farm = await FarmModel.findById(farmId);

    if (!farm || farm.farmer_id !== req.user.id) {
      throw new AppError('Farm not found or unauthorized', 404);
    }

    const fields = await FieldModel.findByFarmId(farmId);

    res.json({
      message: 'Fields retrieved successfully',
      data: fields,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * POST /api/fields
 * Create a new field
 */
export const createField = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { farm_id, name, area, boundary_coordinates, latitude, longitude, soil_type_id, soil_test_date, soil_test_results } = req.body;

    if (!farm_id || !name || !area) {
      throw new AppError('Farm ID, name, and area are required', 400);
    }

    // Verify farm belongs to user
    const farm = await FarmModel.findById(farm_id);
    if (!farm || farm.farmer_id !== req.user.id) {
      throw new AppError('Farm not found or unauthorized', 404);
    }

    const field = await FieldModel.create({
      farm_id,
      name,
      area,
      boundary_coordinates,
      latitude,
      longitude,
      soil_type_id,
      soil_test_date,
      soil_test_results,
    });

    res.status(201).json({
      message: 'Field created successfully',
      data: field,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * PUT /api/fields/:id
 * Update a field
 */
export const updateField = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const field = await FieldModel.findById(id);

    if (!field) {
      throw new AppError('Field not found', 404);
    }

    // Verify farm belongs to user
    const farm = await FarmModel.findById(field.farm_id);
    if (!farm || farm.farmer_id !== req.user.id) {
      throw new AppError('Unauthorized access', 403);
    }

    const updates: any = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.area !== undefined) updates.area = req.body.area;
    if (req.body.boundary_coordinates !== undefined) updates.boundary_coordinates = req.body.boundary_coordinates;
    if (req.body.latitude !== undefined) updates.latitude = req.body.latitude;
    if (req.body.longitude !== undefined) updates.longitude = req.body.longitude;
    if (req.body.soil_type_id !== undefined) updates.soil_type_id = req.body.soil_type_id;
    if (req.body.soil_test_date !== undefined) updates.soil_test_date = req.body.soil_test_date;
    if (req.body.soil_test_results !== undefined) updates.soil_test_results = req.body.soil_test_results;

    const updatedField = await FieldModel.update(id, updates);

    res.json({
      message: 'Field updated successfully',
      data: updatedField,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * DELETE /api/fields/:id
 * Delete a field
 */
export const deleteField = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const field = await FieldModel.findById(id);

    if (!field) {
      throw new AppError('Field not found', 404);
    }

    // Verify farm belongs to user
    const farm = await FarmModel.findById(field.farm_id);
    if (!farm || farm.farmer_id !== req.user.id) {
      throw new AppError('Unauthorized access', 403);
    }

    await FieldModel.delete(id);

    res.json({
      message: 'Field deleted successfully',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const fieldValidation = [
  body('name').trim().notEmpty().withMessage('Field name is required'),
  body('area').isFloat({ min: 0 }).withMessage('Area must be a positive number'),
  body('farm_id').notEmpty().withMessage('Farm ID is required'),
];
