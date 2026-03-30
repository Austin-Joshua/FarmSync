import { pool } from '../config/database';

export interface Irrigation {
  id: string;
  method: 'drip' | 'manual' | 'sprinkler';
  date: Date;
  duration: number;
  crop_id: string;
  created_at?: Date;
}

export interface CreateIrrigationData {
  method: 'drip' | 'manual' | 'sprinkler';
  date: Date;
  duration: number;
  crop_id: string;
}

export class IrrigationModel {
  static async findByCropId(cropId: string): Promise<Irrigation[]> {
    const result = await pool.query(
      'SELECT * FROM irrigations WHERE crop_id = $1 ORDER BY date DESC',
      [cropId]
    );
    return result.rows;
  }

  static async findById(id: string): Promise<Irrigation | null> {
    const result = await pool.query('SELECT * FROM irrigations WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(data: CreateIrrigationData): Promise<Irrigation> {
    const result = await pool.query(
      `INSERT INTO irrigations (method, date, duration, crop_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.method, data.date, data.duration, data.crop_id]
    );
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<CreateIrrigationData>): Promise<Irrigation> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.method) {
      fields.push(`method = $${paramCount++}`);
      values.push(updates.method);
    }
    if (updates.date) {
      fields.push(`date = $${paramCount++}`);
      values.push(updates.date);
    }
    if (updates.duration !== undefined) {
      fields.push(`duration = $${paramCount++}`);
      values.push(updates.duration);
    }
    if (updates.crop_id) {
      fields.push(`crop_id = $${paramCount++}`);
      values.push(updates.crop_id);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE irrigations SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM irrigations WHERE id = $1', [id]);
  }
}
