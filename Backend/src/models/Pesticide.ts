import { pool } from '../config/database';

export interface Pesticide {
  id: string;
  type: string;
  quantity: number;
  date_of_usage: Date;
  crop_id: string;
  created_at?: Date;
}

export interface CreatePesticideData {
  type: string;
  quantity: number;
  date_of_usage: Date;
  crop_id: string;
}

export class PesticideModel {
  static async findByCropId(cropId: string): Promise<Pesticide[]> {
    const result = await pool.query(
      'SELECT * FROM pesticides WHERE crop_id = $1 ORDER BY date_of_usage DESC',
      [cropId]
    );
    return result.rows;
  }

  static async findById(id: string): Promise<Pesticide | null> {
    const result = await pool.query('SELECT * FROM pesticides WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(data: CreatePesticideData): Promise<Pesticide> {
    const result = await pool.query(
      `INSERT INTO pesticides (type, quantity, date_of_usage, crop_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.type, data.quantity, data.date_of_usage, data.crop_id]
    );
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<CreatePesticideData>): Promise<Pesticide> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.type) {
      fields.push(`type = $${paramCount++}`);
      values.push(updates.type);
    }
    if (updates.quantity !== undefined) {
      fields.push(`quantity = $${paramCount++}`);
      values.push(updates.quantity);
    }
    if (updates.date_of_usage) {
      fields.push(`date_of_usage = $${paramCount++}`);
      values.push(updates.date_of_usage);
    }
    if (updates.crop_id) {
      fields.push(`crop_id = $${paramCount++}`);
      values.push(updates.crop_id);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE pesticides SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM pesticides WHERE id = $1', [id]);
  }
}
