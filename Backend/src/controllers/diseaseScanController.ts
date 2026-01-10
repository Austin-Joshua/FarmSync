import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DiseaseScanModel, CreateDiseaseScanData } from '../models/DiseaseScan';
import { AppError } from '../middleware/errorHandler';
import { body, query } from 'express-validator';
import { validate } from '../middleware/validation';

export const createDiseaseScan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { crop_name, disease_name, severity, confidence, latitude, longitude, location_name, image_url, notes } = req.body;

    if (!crop_name || !disease_name || !severity || latitude === undefined || longitude === undefined) {
      throw new AppError('crop_name, disease_name, severity, latitude, and longitude are required', 400);
    }

    if (!['low', 'medium', 'high', 'critical'].includes(severity)) {
      throw new AppError('severity must be one of: low, medium, high, critical', 400);
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new AppError('Invalid latitude or longitude values', 400);
    }

    const scanData: CreateDiseaseScanData = {
      user_id: req.user.id,
      crop_name,
      disease_name,
      severity,
      confidence: confidence || 0,
      latitude,
      longitude,
      location_name: location_name || null,
      image_url: image_url || null,
      notes: notes || null,
    };

    const scan = await DiseaseScanModel.create(scanData);

    res.status(201).json({
      message: 'Disease scan recorded successfully',
      scan,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const getDiseaseScans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const scans = await DiseaseScanModel.findByUserId(req.user.id);

    res.json({
      message: 'Disease scans retrieved successfully',
      scans,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const getDiseaseHeatmap = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const minLat = req.query.minLat ? parseFloat(req.query.minLat as string) : undefined;
    const maxLat = req.query.maxLat ? parseFloat(req.query.maxLat as string) : undefined;
    const minLon = req.query.minLon ? parseFloat(req.query.minLon as string) : undefined;
    const maxLon = req.query.maxLon ? parseFloat(req.query.maxLon as string) : undefined;
    const days = req.query.days ? parseInt(req.query.days as string) : 30;

    const heatmapData = await DiseaseScanModel.getHeatmapData(minLat, maxLat, minLon, maxLon, days);

    res.json({
      message: 'Disease heatmap data retrieved successfully',
      data: heatmapData,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const getDiseaseStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const days = req.query.days ? parseInt(req.query.days as string) : 30;

    const stats = await DiseaseScanModel.getDiseaseStats(days);

    res.json({
      message: 'Disease statistics retrieved successfully',
      stats,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const diseaseScanValidation = [
  body('crop_name').notEmpty().withMessage('Crop name is required'),
  body('disease_name').notEmpty().withMessage('Disease name is required'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Severity must be one of: low, medium, high, critical'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  body('confidence').optional().isFloat({ min: 0, max: 1 }).withMessage('Confidence must be between 0 and 1'),
];
