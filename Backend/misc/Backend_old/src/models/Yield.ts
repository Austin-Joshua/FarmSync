import { pool } from '../config/database';
import { query, queryOne, execute } from '../utils/dbHelper';

export interface Yield {
  id: string;
  crop_id: string;
  quantity: number;
  date: Date;
  quality: 'excellent' | 'good' | 'average';
  created_at?: Date;
}

export interface CreateYieldData {
  crop_id: string;
  quantity: number;
  date: Date;
  quality: 'excellent' | 'good' | 'average';
}

export class YieldModel {
  static async findByCropId(cropId: string): Promise<Yield[]> {
    return query<Yield>(
      pool,
      'SELECT * FROM yields WHERE crop_id = ? ORDER BY date DESC',
      [cropId]
    );
  }

  static async findByFarmerId(farmerId: string): Promise<Yield[]> {
    return query<Yield>(
      pool,
      `SELECT y.* FROM yields y
       JOIN crops c ON y.crop_id = c.id
       JOIN farms f ON c.farm_id = f.id
       WHERE f.farmer_id = ?
       ORDER BY y.date DESC`,
      [farmerId]
    );
  }

  static async findById(id: string): Promise<Yield | null> {
    return queryOne<Yield>(pool, 'SELECT * FROM yields WHERE id = ?', [id]);
  }

  static async create(data: CreateYieldData): Promise<Yield> {
    await execute(
      pool,
      `INSERT INTO yields (crop_id, quantity, date, quality)
       VALUES (?, ?, ?, ?)`,
      [data.crop_id, data.quantity, data.date, data.quality]
    );

    const yield_ = await queryOne<Yield>(
      pool,
      'SELECT * FROM yields WHERE crop_id = ? AND date = ? ORDER BY created_at DESC LIMIT 1',
      [data.crop_id, data.date]
    );
    if (!yield_) throw new Error('Failed to create yield');
    return yield_;
  }

  static async update(id: string, updates: Partial<CreateYieldData>): Promise<Yield> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.crop_id) {
      fields.push(`crop_id = ?`);
      values.push(updates.crop_id);
    }
    if (updates.quantity !== undefined) {
      fields.push(`quantity = ?`);
      values.push(updates.quantity);
    }
    if (updates.date) {
      fields.push(`date = ?`);
      values.push(updates.date);
    }
    if (updates.quality) {
      fields.push(`quality = ?`);
      values.push(updates.quality);
    }

    values.push(id);

    await execute(
      pool,
      `UPDATE yields SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const yield_ = await queryOne<Yield>(pool, 'SELECT * FROM yields WHERE id = ?', [id]);
    if (!yield_) throw new Error('Yield not found');
    return yield_;
  }

  static async delete(id: string): Promise<void> {
    await execute(pool, 'DELETE FROM yields WHERE id = ?', [id]);
  }

  static async getTotalYield(farmerId: string): Promise<number> {
    const result = await queryOne<{ total: string }>(
      pool,
      `SELECT COALESCE(SUM(y.quantity), 0) as total
       FROM yields y
       JOIN crops c ON y.crop_id = c.id
       JOIN farms f ON c.farm_id = f.id
       WHERE f.farmer_id = ?`,
      [farmerId]
    );
    return parseFloat(result?.total || '0');
  }
}
