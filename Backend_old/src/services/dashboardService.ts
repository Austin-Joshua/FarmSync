import { FarmModel } from '../models/Farm';
import { ExpenseModel } from '../models/Expense';
import { YieldModel } from '../models/Yield';
import { StockModel } from '../models/Stock';
import { UserModel } from '../models/User';

export interface DashboardSummary {
  totalLandArea: number;
  totalFields: number;
  totalExpenses: number;
  totalIncome: number;
  totalProfit: number;
  totalYield: number;
  stockItems: Array<{
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
  }>;
  expenseByCategory: Array<{
    category: string;
    total: number;
  }>;
  farmerStats?: Array<{
    district: string;
    count: number;
  }>;
}

export class DashboardService {
  static async getFarmerDashboard(farmerId: string): Promise<DashboardSummary> {
    const farms = await FarmModel.findByFarmerId(farmerId);
    const totalLandArea = await FarmModel.getTotalLandArea(farmerId);
    const totalExpenses = await ExpenseModel.getTotalExpenses(farmerId);
    const totalYield = await YieldModel.getTotalYield(farmerId);
    const stockItems = await StockModel.findByUserId(farmerId);
    const expenseByCategory = await ExpenseModel.getTotalByCategory(farmerId);

    // Calculate income from yields (simplified - in real app, this would come from sales records)
    const totalIncome = totalYield * 20; // Assuming average price of 20 per kg
    const totalProfit = totalIncome - totalExpenses;

    return {
      totalLandArea,
      totalFields: farms.length,
      totalExpenses,
      totalIncome,
      totalProfit,
      totalYield,
      stockItems: stockItems.map((item) => ({
        id: item.id,
        name: item.item_name,
        category: item.item_type,
        quantity: item.quantity,
        unit: item.unit,
      })),
      expenseByCategory,
    };
  }

  static async getAdminDashboard(): Promise<DashboardSummary & { farmerStats: Array<{ district: string; count: number }> }> {
    const farmerStats = await UserModel.getFarmerCountByDistrict();

    return {
      totalLandArea: 0,
      totalFields: 0,
      totalExpenses: 0,
      totalIncome: 0,
      totalProfit: 0,
      totalYield: 0,
      stockItems: [],
      expenseByCategory: [],
      farmerStats,
    };
  }
}
