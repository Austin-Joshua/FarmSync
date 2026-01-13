import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { CropModel } from '../models/Crop';
import { ExpenseModel } from '../models/Expense';
import { YieldModel } from '../models/Yield';
import { StockModel } from '../models/Stock';
import { FarmModel } from '../models/Farm';

// Helper to get farmer ID from user
async function getFarmerIdFromUser(userId: string): Promise<string> {
  return userId; // In this system, user_id is the farmer_id
}

/**
 * GET /api/reports/summary
 * Get summary report data
 */
export const getSummaryReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    // Get all farms for user (user_id is farmer_id in this system)
    const farms = await FarmModel.findByFarmerId(req.user.id);
    const farmIds = farms.map(f => f.id);

    // Get crops
    const allCrops = [];
    for (const farm of farms) {
      const crops = await CropModel.findByFarmId(farm.id);
      allCrops.push(...crops);
    }

    // Get expenses
    const expenses = await ExpenseModel.findByFarmerId(req.user.id);
    const filteredExpenses = expenses.filter(exp => {
      if (startDate && endDate) {
        const expDate = new Date(exp.date);
        return expDate >= startDate && expDate <= endDate;
      }
      return true;
    });

    // Get yields
    const yields = await YieldModel.findByFarmerId(req.user.id);
    const filteredYields = yields.filter(y => {
      if (startDate && endDate) {
        const yieldDate = new Date(y.date);
        return yieldDate >= startDate && yieldDate <= endDate;
      }
      return true;
    });

    // Get stock items
    const stockItems = await StockModel.findByUserId(req.user.id);

    // Calculate summary
    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalYield = filteredYields.reduce((sum, y) => sum + y.quantity, 0);
    const activeCrops = allCrops.filter(c => c.status === 'active').length;
    const totalFarms = farms.length;

    // Expense by category
    const expensesByCategory = filteredExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    // Monthly expenses
    const monthlyExpenses: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      const month = new Date(exp.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + exp.amount;
    });

    res.json({
      message: 'Summary report retrieved successfully',
      data: {
        summary: {
          totalFarms,
          activeCrops,
          totalYield,
          totalExpenses,
          netProfit: (totalYield * 20) - totalExpenses, // Estimated income calculation
        },
        expensesByCategory,
        monthlyExpenses: Object.entries(monthlyExpenses).map(([month, amount]) => ({ month, amount })),
        cropStatus: {
          active: allCrops.filter(c => c.status === 'active').length,
          harvested: allCrops.filter(c => c.status === 'harvested').length,
          planned: allCrops.filter(c => c.status === 'planned').length,
        },
        stockSummary: {
          totalItems: stockItems.length,
          lowStockItems: stockItems.filter(item => {
            const threshold = item.threshold || 10;
            return item.quantity <= threshold;
          }).length,
        },
      },
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * GET /api/reports/custom
 * Generate custom report based on filters
 */
export const getCustomReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const {
      startDate,
      endDate,
      categories,
      cropIds,
      reportType,
    } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    const categoryList = categories ? (categories as string).split(',') : undefined;
    const cropIdList = cropIds ? (cropIds as string).split(',') : undefined;

    let reportData: any = {};

    switch (reportType) {
      case 'financial':
        reportData = await generateFinancialReport(req.user.id, start, end);
        break;
      case 'crop':
        reportData = await generateCropReport(req.user.id, start, end, cropIdList);
        break;
      case 'expense':
        reportData = await generateExpenseReport(req.user.id, start, end, categoryList);
        break;
      case 'yield':
        reportData = await generateYieldReport(req.user.id, start, end, cropIdList);
        break;
      default:
        throw new AppError('Invalid report type', 400);
    }

    res.json({
      message: 'Custom report generated successfully',
      data: reportData,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

async function generateFinancialReport(userId: string, startDate?: Date, endDate?: Date): Promise<any> {
  const farms = await FarmModel.findByFarmerId(userId);
  const expenses = await ExpenseModel.findByFarmerId(userId);
  const yields = await YieldModel.findByFarmerId(userId);

  const filteredExpenses = expenses.filter(exp => {
    if (startDate && endDate) {
      const expDate = new Date(exp.date);
      return expDate >= startDate && expDate <= endDate;
    }
    return true;
  });

  const filteredYields = yields.filter(y => {
    if (startDate && endDate) {
      const yieldDate = new Date(y.date);
      return yieldDate >= startDate && yieldDate <= endDate;
    }
    return true;
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalYield = filteredYields.reduce((sum, y) => sum + y.quantity, 0);
  const estimatedIncome = totalYield * 20; // Assuming ₹20 per kg
  const netProfit = estimatedIncome - totalExpenses;

  return {
    totalExpenses,
    totalYield,
    estimatedIncome,
    netProfit,
    profitMargin: totalExpenses > 0 ? ((netProfit / totalExpenses) * 100).toFixed(2) : 0,
    expensesByCategory: filteredExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>),
  };
}

async function generateCropReport(userId: string, startDate?: Date, endDate?: Date, cropIds?: string[]): Promise<any> {
  const farms = await FarmModel.findByFarmerId(userId);
  const allCrops = [];
  for (const farm of farms) {
    const crops = await CropModel.findByFarmId(farm.id);
    allCrops.push(...crops);
  }

  let filteredCrops = allCrops;
  if (cropIds && cropIds.length > 0) {
    filteredCrops = allCrops.filter(c => cropIds.includes(c.id));
  }

  if (startDate && endDate) {
    filteredCrops = filteredCrops.filter(c => {
      const sowingDate = new Date(c.sowing_date);
      return sowingDate >= startDate && sowingDate <= endDate;
    });
  }

  return {
    crops: filteredCrops,
    totalCrops: filteredCrops.length,
    byStatus: {
      active: filteredCrops.filter(c => c.status === 'active').length,
      harvested: filteredCrops.filter(c => c.status === 'harvested').length,
      planned: filteredCrops.filter(c => c.status === 'planned').length,
    },
  };
}

async function generateExpenseReport(userId: string, startDate?: Date, endDate?: Date, categories?: string[]): Promise<any> {
  const expenses = await ExpenseModel.findByFarmerId(userId);

  let filteredExpenses = expenses;
  if (startDate && endDate) {
    filteredExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= startDate && expDate <= endDate;
    });
  }

  if (categories && categories.length > 0) {
    filteredExpenses = filteredExpenses.filter(exp => categories.includes(exp.category));
  }

  return {
    expenses: filteredExpenses,
    total: filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    byCategory: filteredExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>),
  };
}

async function generateYieldReport(userId: string, startDate?: Date, endDate?: Date, cropIds?: string[]): Promise<any> {
  const yields = await YieldModel.findByFarmerId(userId);

  let filteredYields = yields;
  if (startDate && endDate) {
    filteredYields = yields.filter(y => {
      const yieldDate = new Date(y.date);
      return yieldDate >= startDate && yieldDate <= endDate;
    });
  }

  if (cropIds && cropIds.length > 0) {
    filteredYields = filteredYields.filter(y => cropIds.includes(y.crop_id));
  }

  return {
    yields: filteredYields,
    totalYield: filteredYields.reduce((sum, y) => sum + y.quantity, 0),
    byQuality: filteredYields.reduce((acc, y) => {
      acc[y.quality] = (acc[y.quality] || 0) + y.quantity;
      return acc;
    }, {} as Record<string, number>),
  };
}
