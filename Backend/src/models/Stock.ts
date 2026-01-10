import { pool } from '../config/database';

export interface StockItem {
  id: string;
  user_id: string;
  item_name: string;
  item_type: 'seeds' | 'fertilizer' | 'pesticide';
  quantity: number;
  unit: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateStockItemData {
  user_id: string;
  item_name: string;
  item_type: 'seeds' | 'fertilizer' | 'pesticide';
  quantity: number;
  unit: string;
}

export interface MonthlyStockUsage {
  id: string;
  user_id: string;
  item_name: string;
  item_type: 'seeds' | 'fertilizer' | 'pesticide';
  quantity_used: number;
  remaining_stock: number;
  unit: string;
  month: number;
  year: number;
  date_recorded: Date;
  created_at?: Date;
}

export interface CreateMonthlyStockUsageData {
  user_id: string;
  item_name: string;
  item_type: 'seeds' | 'fertilizer' | 'pesticide';
  quantity_used: number;
  remaining_stock: number;
  unit: string;
  month: number;
  year: number;
  date_recorded: Date;
}

export class StockModel {
  static async findByUserId(userId: string): Promise<StockItem[]> {
    const result = await pool.query(
      'SELECT * FROM stock_items WHERE user_id = $1 ORDER BY item_type, item_name',
      [userId]
    );
    return result.rows;
  }

  static async findById(id: string): Promise<StockItem | null> {
    const result = await pool.query('SELECT * FROM stock_items WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(data: CreateStockItemData): Promise<StockItem> {
    const result = await pool.query(
      `INSERT INTO stock_items (user_id, item_name, item_type, quantity, unit)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.user_id, data.item_name, data.item_type, data.quantity, data.unit]
    );
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<CreateStockItemData>): Promise<StockItem> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.item_name) {
      fields.push(`item_name = $${paramCount++}`);
      values.push(updates.item_name);
    }
    if (updates.item_type) {
      fields.push(`item_type = $${paramCount++}`);
      values.push(updates.item_type);
    }
    if (updates.quantity !== undefined) {
      fields.push(`quantity = $${paramCount++}`);
      values.push(updates.quantity);
    }
    if (updates.unit) {
      fields.push(`unit = $${paramCount++}`);
      values.push(updates.unit);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE stock_items SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM stock_items WHERE id = $1', [id]);
  }

  // Monthly Stock Usage History
  static async getMonthlyStockUsage(userId: string, month?: number, year?: number): Promise<MonthlyStockUsage[]> {
    let query = 'SELECT * FROM monthly_stock_usage WHERE user_id = $1';
    const params: any[] = [userId];

    if (month && year) {
      query += ' AND month = $2 AND year = $3';
      params.push(month, year);
    } else if (year) {
      query += ' AND year = $2';
      params.push(year);
    }

    query += ' ORDER BY year DESC, month DESC, date_recorded DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async createMonthlyStockUsage(data: CreateMonthlyStockUsageData): Promise<MonthlyStockUsage> {
    const result = await pool.query(
      `INSERT INTO monthly_stock_usage (user_id, item_name, item_type, quantity_used, remaining_stock, unit, month, year, date_recorded)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.user_id,
        data.item_name,
        data.item_type,
        data.quantity_used,
        data.remaining_stock,
        data.unit,
        data.month,
        data.year,
        data.date_recorded,
      ]
    );
    return result.rows[0];
  }
}
