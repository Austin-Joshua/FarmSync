import { pool } from '../config/database';

export interface MonthlyIncome {
  id: string;
  user_id: string;
  month: number;
  year: number;
  total_income: number;
  crops_sold: number;
  average_price?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateMonthlyIncomeData {
  user_id: string;
  month: number;
  year: number;
  total_income: number;
  crops_sold: number;
  average_price?: number;
}

export class HistoryModel {
  static async getMonthlyIncome(userId: string, month?: number, year?: number): Promise<MonthlyIncome[]> {
    let query = 'SELECT * FROM monthly_income WHERE user_id = $1';
    const params: any[] = [userId];

    if (month && year) {
      query += ' AND month = $2 AND year = $3';
      params.push(month, year);
    } else if (year) {
      query += ' AND year = $2';
      params.push(year);
    }

    query += ' ORDER BY year DESC, month DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async createOrUpdateMonthlyIncome(data: CreateMonthlyIncomeData): Promise<MonthlyIncome> {
    const result = await pool.query(
      `INSERT INTO monthly_income (user_id, month, year, total_income, crops_sold, average_price)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, month, year)
       DO UPDATE SET
         total_income = EXCLUDED.total_income,
         crops_sold = EXCLUDED.crops_sold,
         average_price = EXCLUDED.average_price,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        data.user_id,
        data.month,
        data.year,
        data.total_income,
        data.crops_sold,
        data.average_price || null,
      ]
    );
    return result.rows[0];
  }
}
