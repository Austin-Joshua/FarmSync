import { pool } from '../config/database';
import { query, queryOne, execute } from '../utils/dbHelper';

export interface StockItem {
  id: string;
  user_id: string;
  item_name: string;
  item_type: 'seeds' | 'fertilizer' | 'pesticide';
  quantity: number;
  threshold?: number;
  unit: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateStockItemData {
  user_id: string;
  item_name: string;
  item_type: 'seeds' | 'fertilizer' | 'pesticide';
  quantity: number;
  threshold?: number;
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
    return query<StockItem>(
      pool,
      'SELECT * FROM stock_items WHERE user_id = ? ORDER BY item_type, item_name',
      [userId]
    );
  }

  static async findById(id: string): Promise<StockItem | null> {
    return queryOne<StockItem>(pool, 'SELECT * FROM stock_items WHERE id = ?', [id]);
  }

  static async findLowStockItems(userId: string): Promise<StockItem[]> {
    return query<StockItem>(
      pool,
      `SELECT * FROM stock_items 
       WHERE user_id = ? 
       AND (threshold IS NULL OR quantity <= threshold)
       ORDER BY item_type, item_name`,
      [userId]
    );
  }

  static async create(data: CreateStockItemData): Promise<StockItem> {
    await execute(
      pool,
      `INSERT INTO stock_items (user_id, item_name, item_type, quantity, threshold, unit)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.user_id,
        data.item_name,
        data.item_type,
        data.quantity,
        data.threshold || 10.0,
        data.unit,
      ]
    );

    // MySQL doesn't support RETURNING, so fetch the created item
    const item = await queryOne<StockItem>(
      pool,
      'SELECT * FROM stock_items WHERE user_id = ? AND item_name = ? AND item_type = ? ORDER BY created_at DESC LIMIT 1',
      [data.user_id, data.item_name, data.item_type]
    );
    if (!item) throw new Error('Failed to create stock item');
    return item;
  }

  static async update(id: string, updates: Partial<CreateStockItemData>): Promise<StockItem> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.item_name) {
      fields.push(`item_name = ?`);
      values.push(updates.item_name);
    }
    if (updates.item_type) {
      fields.push(`item_type = ?`);
      values.push(updates.item_type);
    }
    if (updates.quantity !== undefined) {
      fields.push(`quantity = ?`);
      values.push(updates.quantity);
    }
    if (updates.threshold !== undefined) {
      fields.push(`threshold = ?`);
      values.push(updates.threshold);
    }
    if (updates.unit) {
      fields.push(`unit = ?`);
      values.push(updates.unit);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await execute(
      pool,
      `UPDATE stock_items SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const item = await queryOne<StockItem>(pool, 'SELECT * FROM stock_items WHERE id = ?', [id]);
    if (!item) throw new Error('Stock item not found');
    return item;
  }

  static async delete(id: string): Promise<void> {
    await execute(pool, 'DELETE FROM stock_items WHERE id = ?', [id]);
  }

  // Monthly Stock Usage History
  static async getMonthlyStockUsage(userId: string, month?: number, year?: number): Promise<MonthlyStockUsage[]> {
    let sql = 'SELECT * FROM monthly_stock_usage WHERE user_id = ?';
    const params: any[] = [userId];

    if (month && year) {
      sql += ' AND month = ? AND year = ?';
      params.push(month, year);
    } else if (year) {
      sql += ' AND year = ?';
      params.push(year);
    }

    sql += ' ORDER BY year DESC, month DESC, date_recorded DESC';

    return query<MonthlyStockUsage>(pool, sql, params);
  }

  static async createMonthlyStockUsage(data: CreateMonthlyStockUsageData): Promise<MonthlyStockUsage> {
    await execute(
      pool,
      `INSERT INTO monthly_stock_usage (user_id, item_name, item_type, quantity_used, remaining_stock, unit, month, year, date_recorded)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

    const usage = await queryOne<MonthlyStockUsage>(
      pool,
      'SELECT * FROM monthly_stock_usage WHERE user_id = ? AND item_name = ? AND month = ? AND year = ? ORDER BY created_at DESC LIMIT 1',
      [data.user_id, data.item_name, data.month, data.year]
    );
    if (!usage) throw new Error('Failed to create monthly stock usage');
    return usage;
  }
}
