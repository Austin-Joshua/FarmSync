import { Response } from 'express';
import { SoilModel } from '../models/Soil';

export const getSoilTypes = async (req: any, res: Response): Promise<void> => {
  try {
    const soilTypes = await SoilModel.getAll();

    res.json({
      message: 'Soil types retrieved successfully',
      data: soilTypes,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
