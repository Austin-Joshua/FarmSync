import { pool } from '../config/database';
import { query, queryOne, execute } from '../utils/dbHelper';

export interface Farm {
  id: string;
  name: string;
  location: string;
  land_size: number;
  soil_type_id?: string;
  soil_type_name?: string;
  farmer_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateFarmData {
  name: string;
  location: string;
  land_size: number;
  soil_type_id?: string;
  farmer_id: string;
}

export class FarmModel {
  static async findByFarmerId(farmerId: string): Promise<Farm[]> {
    return query<Farm>(
      pool,
      `SELECT f.*, st.name as soil_type_name
       FROM farms f
       LEFT JOIN soil_types st ON f.soil_type_id = st.id
       WHERE f.farmer_id = ?
       ORDER BY f.created_at DESC`,
      [farmerId]
    );
  }

  static async findById(id: string): Promise<Farm | null> {
    return queryOne<Farm>(
      pool,
      `SELECT f.*, st.name as soil_type_name
       FROM farms f
       LEFT JOIN soil_types st ON f.soil_type_id = st.id
       WHERE f.id = ?`,
      [id]
    );
  }

  static async create(data: CreateFarmData): Promise<Farm> {
    await execute(
      pool,
      `INSERT INTO farms (name, location, land_size, soil_type_id, farmer_id)
       VALUES (?, ?, ?, ?, ?)`,
      [data.name, data.location, data.land_size, data.soil_type_id || null, data.farmer_id]
    );

    // Fetch created farm
    const farm = await queryOne<Farm>(
      pool,
      `SELECT f.*, st.name as soil_type_name
       FROM farms f
       LEFT JOIN soil_types st ON f.soil_type_id = st.id
       WHERE f.name = ? AND f.farmer_id = ?
       ORDER BY f.created_at DESC
       LIMIT 1`,
      [data.name, data.farmer_id]
    );
    if (!farm) throw new Error('Failed to create farm');
    return farm;
  }

  static async update(id: string, updates: Partial<CreateFarmData>): Promise<Farm> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name) {
      fields.push(`name = ?`);
      values.push(updates.name);
    }
    if (updates.location) {
      fields.push(`location = ?`);
      values.push(updates.location);
    }
    if (updates.land_size !== undefined) {
      fields.push(`land_size = ?`);
      values.push(updates.land_size);
    }
    if (updates.soil_type_id !== undefined) {
      fields.push(`soil_type_id = ?`);
      values.push(updates.soil_type_id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await execute(
      pool,
      `UPDATE farms SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated farm
    const farm = await this.findById(id);
    if (!farm) throw new Error('Farm not found');
    return farm;
  }

  static async delete(id: string): Promise<void> {
    await execute(pool, 'DELETE FROM farms WHERE id = ?', [id]);
  }

  static async getTotalLandArea(farmerId: string): Promise<number> {
    const result = await queryOne<{ total: string }>(
      pool,
      'SELECT COALESCE(SUM(land_size), 0) as total FROM farms WHERE farmer_id = ?',
      [farmerId]
    );
    return parseFloat(result?.total || '0');
  }
}
