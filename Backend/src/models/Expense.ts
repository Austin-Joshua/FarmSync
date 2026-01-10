import { pool } from '../config/database';
import { query, queryOne, execute } from '../utils/dbHelper';

export interface Expense {
  id: string;
  category: 'seeds' | 'labor' | 'fertilizers' | 'pesticides' | 'irrigation' | 'other';
  description: string;
  amount: number;
  date: Date;
  farm_id: string;
  created_at?: Date;
}

export interface CreateExpenseData {
  category: 'seeds' | 'labor' | 'fertilizers' | 'pesticides' | 'irrigation' | 'other';
  description: string;
  amount: number;
  date: Date;
  farm_id: string;
}

export class ExpenseModel {
  static async findByFarmId(farmId: string): Promise<Expense[]> {
    return query<Expense>(
      pool,
      'SELECT * FROM expenses WHERE farm_id = ? ORDER BY date DESC',
      [farmId]
    );
  }

  static async findByFarmerId(farmerId: string): Promise<Expense[]> {
    return query<Expense>(
      pool,
      `SELECT e.* FROM expenses e
       JOIN farms f ON e.farm_id = f.id
       WHERE f.farmer_id = ?
       ORDER BY e.date DESC`,
      [farmerId]
    );
  }

  static async findById(id: string): Promise<Expense | null> {
    return queryOne<Expense>(pool, 'SELECT * FROM expenses WHERE id = ?', [id]);
  }

  static async create(data: CreateExpenseData): Promise<Expense> {
    await execute(
      pool,
      `INSERT INTO expenses (category, description, amount, date, farm_id)
       VALUES (?, ?, ?, ?, ?)`,
      [data.category, data.description, data.amount, data.date, data.farm_id]
    );

    const expense = await queryOne<Expense>(
      pool,
      'SELECT * FROM expenses WHERE farm_id = ? AND description = ? AND date = ? ORDER BY created_at DESC LIMIT 1',
      [data.farm_id, data.description, data.date]
    );
    if (!expense) throw new Error('Failed to create expense');
    return expense;
  }

  static async update(id: string, updates: Partial<CreateExpenseData>): Promise<Expense> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.category) {
      fields.push(`category = ?`);
      values.push(updates.category);
    }
    if (updates.description) {
      fields.push(`description = ?`);
      values.push(updates.description);
    }
    if (updates.amount !== undefined) {
      fields.push(`amount = ?`);
      values.push(updates.amount);
    }
    if (updates.date) {
      fields.push(`date = ?`);
      values.push(updates.date);
    }
    if (updates.farm_id) {
      fields.push(`farm_id = ?`);
      values.push(updates.farm_id);
    }

    values.push(id);

    await execute(
      pool,
      `UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const expense = await this.findById(id);
    if (!expense) throw new Error('Expense not found');
    return expense;
  }

  static async delete(id: string): Promise<void> {
    await execute(pool, 'DELETE FROM expenses WHERE id = ?', [id]);
  }

  static async getTotalByCategory(farmerId: string): Promise<Array<{ category: string; total: number }>> {
    return query<{ category: string; total: string }>(
      pool,
      `SELECT e.category, COALESCE(SUM(e.amount), 0) as total
       FROM expenses e
       JOIN farms f ON e.farm_id = f.id
       WHERE f.farmer_id = ?
       GROUP BY e.category`,
      [farmerId]
    ).then(rows => rows.map(row => ({ category: row.category, total: parseFloat(row.total) })));
  }

  static async getTotalExpenses(farmerId: string): Promise<number> {
    const result = await queryOne<{ total: string }>(
      pool,
      `SELECT COALESCE(SUM(e.amount), 0) as total
       FROM expenses e
       JOIN farms f ON e.farm_id = f.id
       WHERE f.farmer_id = ?`,
      [farmerId]
    );
    return parseFloat(result?.total || '0');
  }

  static async getMonthlyExpenses(farmerId: string, month: number, year: number): Promise<number> {
    const result = await queryOne<{ total: string }>(
      pool,
      `SELECT COALESCE(SUM(e.amount), 0) as total
       FROM expenses e
       JOIN farms f ON e.farm_id = f.id
       WHERE f.farmer_id = ?
       AND MONTH(e.date) = ?
       AND YEAR(e.date) = ?`,
      [farmerId, month, year]
    );
    return parseFloat(result?.total || '0');
  }
}
