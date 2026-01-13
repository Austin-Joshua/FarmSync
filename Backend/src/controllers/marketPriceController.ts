import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import marketPriceService from '../services/marketPriceService';
import { AppError } from '../middleware/errorHandler';

/**
 * GET /api/market-prices/:crop
 * Get current market price for a crop
 */
export const getCurrentPrice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { crop } = req.params;
    const { market } = req.query;

    const priceData = await marketPriceService.getCurrentPrice(crop, market as string);

    res.json({
      message: 'Market price retrieved successfully',
      data: priceData,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * GET /api/market-prices/:crop/history
 * Get price history for a crop
 */
export const getPriceHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { crop } = req.params;
    const days = req.query.days ? parseInt(req.query.days as string) : 30;

    const history = await marketPriceService.getPriceHistory(crop, days);

    res.json({
      message: 'Price history retrieved successfully',
      data: history,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * GET /api/market-prices/:crop/best-time
 * Get best time to sell recommendation
 */
export const getBestTimeToSell = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { crop } = req.params;

    const recommendation = await marketPriceService.getBestTimeToSell(crop);

    res.json({
      message: 'Recommendation generated successfully',
      data: recommendation,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * POST /api/market-prices/:crop/alert
 * Set price alert
 */
export const setPriceAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { crop } = req.params;
    const { targetPrice, condition } = req.body;

    if (!targetPrice || !condition) {
      throw new AppError('Target price and condition are required', 400);
    }

    await marketPriceService.setPriceAlert(req.user.id, crop, targetPrice, condition);

    res.json({
      message: 'Price alert set successfully',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};
