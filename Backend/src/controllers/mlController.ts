import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MLService } from '../services/mlService';
import { AppError } from '../middleware/errorHandler';
import { body } from 'express-validator';
import { pool } from '../config/database';
import { query, execute } from '../utils/dbHelper';

export const getCropRecommendation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { N, P, K, temperature, humidity, ph, rainfall, farm_id } = req.body;

    if (!N || !P || !K || !temperature || !humidity || !ph || !rainfall) {
      throw new AppError('All parameters (N, P, K, temperature, humidity, ph, rainfall) are required', 400);
    }

    // Get crop recommendation from ML model
    const recommendation = await MLService.getCropRecommendation({
      N: parseFloat(N),
      P: parseFloat(P),
      K: parseFloat(K),
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      ph: parseFloat(ph),
      rainfall: parseFloat(rainfall),
    });

    if (!recommendation.success) {
      throw new AppError(recommendation.error || 'Failed to get recommendation', 500);
    }

    // Save recommendation to database if farm_id is provided
    if (farm_id && req.user) {
      try {
        await execute(
          pool,
          `INSERT INTO crop_recommendations 
           (user_id, farm_id, n_value, p_value, k_value, temperature, humidity, ph, rainfall, recommended_crop, confidence, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            req.user.id,
            farm_id,
            parseFloat(N),
            parseFloat(P),
            parseFloat(K),
            parseFloat(temperature),
            parseFloat(humidity),
            parseFloat(ph),
            parseFloat(rainfall),
            recommendation.recommended_crop,
            recommendation.recommendations?.[0]?.confidence || 0,
          ]
        );
      } catch (dbError) {
        // Don't fail if database save fails, just log it
        console.error('Failed to save recommendation to database:', dbError);
      }
    }

    res.json({
      message: 'Crop recommendation generated successfully',
      data: recommendation,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const getRecommendationHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const recommendations = await query(
      pool,
      `SELECT * FROM crop_recommendations 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [req.user.id]
    );

    res.json({
      message: 'Recommendation history retrieved successfully',
      data: recommendations,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const getModelInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const modelInfo = await MLService.getModelInfo();
    const isAvailable = await MLService.isModelAvailable();

    res.json({
      message: 'Model information retrieved successfully',
      data: {
        available: isAvailable,
        info: modelInfo,
      },
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const recommendationValidation = [
  body('N').isFloat({ min: 0, max: 150 }).withMessage('Nitrogen (N) must be between 0 and 150'),
  body('P').isFloat({ min: 0, max: 150 }).withMessage('Phosphorus (P) must be between 0 and 150'),
  body('K').isFloat({ min: 0, max: 150 }).withMessage('Potassium (K) must be between 0 and 150'),
  body('temperature').isFloat({ min: 0, max: 50 }).withMessage('Temperature must be between 0 and 50°C'),
  body('humidity').isFloat({ min: 0, max: 100 }).withMessage('Humidity must be between 0 and 100%'),
  body('ph').isFloat({ min: 0, max: 14 }).withMessage('pH must be between 0 and 14'),
  body('rainfall').isFloat({ min: 0, max: 500 }).withMessage('Rainfall must be between 0 and 500 mm'),
];
