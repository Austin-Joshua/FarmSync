import { pool } from '../config/database';

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
    const result = await pool.query(
      'SELECT * FROM yields WHERE crop_id = $1 ORDER BY date DESC',
      [cropId]
    );
    return result.rows;
  }

  static async findByFarmerId(farmerId: string): Promise<Yield[]> {
    const result = await pool.query(
      `SELECT y.* FROM yields y
       JOIN crops c ON y.crop_id = c.id
       JOIN farms f ON c.farm_id = f.id
       WHERE f.farmer_id = $1
       ORDER BY y.date DESC`,
      [farmerId]
    );
    return result.rows;
  }

  static async findById(id: string): Promise<Yield | null> {
    const result = await pool.query('SELECT * FROM yields WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(data: CreateYieldData): Promise<Yield> {
    const result = await pool.query(
      `INSERT INTO yields (crop_id, quantity, date, quality)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.crop_id, data.quantity, data.date, data.quality]
    );
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<CreateYieldData>): Promise<Yield> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.crop_id) {
      fields.push(`crop_id = $${paramCount++}`);
      values.push(updates.crop_id);
    }
    if (updates.quantity !== undefined) {
      fields.push(`quantity = $${paramCount++}`);
      values.push(updates.quantity);
    }
    if (updates.date) {
      fields.push(`date = $${paramCount++}`);
      values.push(updates.date);
    }
    if (updates.quality) {
      fields.push(`quality = $${paramCount++}`);
      values.push(updates.quality);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE yields SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM yields WHERE id = $1', [id]);
  }

  static async getTotalYield(farmerId: string): Promise<number> {
    const result = await pool.query(
      `SELECT COALESCE(SUM(y.quantity), 0) as total
       FROM yields y
       JOIN crops c ON y.crop_id = c.id
       JOIN farms f ON c.farm_id = f.id
       WHERE f.farmer_id = $1`,
      [farmerId]
    );
    return parseFloat(result.rows[0].total);
  }
}
