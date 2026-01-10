import { pool } from '../config/database';

export interface Crop {
  id: string;
  name: string;
  crop_type_id?: string;
  crop_type_name?: string;
  season?: string;
  sowing_date: Date;
  harvest_date?: Date;
  status: 'active' | 'harvested' | 'planned';
  farm_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CropType {
  id: string;
  name: string;
  category: string;
  season: string;
  suitable_soil_types?: string[];
  average_yield?: number;
  growth_period?: number;
  water_requirement?: string;
  description?: string;
}

export interface CreateCropData {
  name: string;
  crop_type_id?: string;
  season?: string;
  sowing_date: Date;
  harvest_date?: Date;
  status: 'active' | 'harvested' | 'planned';
  farm_id: string;
}

export interface CreateCropTypeData {
  name: string;
  category: string;
  season: 'kharif' | 'rabi' | 'zaid' | 'year-round';
  suitable_soil_types?: string[];
  average_yield?: number;
  growth_period?: number;
  water_requirement?: 'low' | 'medium' | 'high';
  description?: string;
  created_by: string;
}

export class CropModel {
  static async findByFarmId(farmId: string): Promise<Crop[]> {
    const result = await pool.query(
      `SELECT c.*, ct.name as crop_type_name
       FROM crops c
       LEFT JOIN crop_types ct ON c.crop_type_id = ct.id
       WHERE c.farm_id = $1
       ORDER BY c.sowing_date DESC`,
      [farmId]
    );
    return result.rows;
  }

  static async findByFarmerId(farmerId: string): Promise<Crop[]> {
    const result = await pool.query(
      `SELECT c.*, ct.name as crop_type_name
       FROM crops c
       LEFT JOIN crop_types ct ON c.crop_type_id = ct.id
       JOIN farms f ON c.farm_id = f.id
       WHERE f.farmer_id = $1
       ORDER BY c.sowing_date DESC`,
      [farmerId]
    );
    return result.rows;
  }

  static async findById(id: string): Promise<Crop | null> {
    const result = await pool.query(
      `SELECT c.*, ct.name as crop_type_name
       FROM crops c
       LEFT JOIN crop_types ct ON c.crop_type_id = ct.id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(data: CreateCropData): Promise<Crop> {
    const result = await pool.query(
      `INSERT INTO crops (name, crop_type_id, season, sowing_date, harvest_date, status, farm_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.name,
        data.crop_type_id || null,
        data.season || null,
        data.sowing_date,
        data.harvest_date || null,
        data.status,
        data.farm_id,
      ]
    );
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<CreateCropData>): Promise<Crop> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.crop_type_id !== undefined) {
      fields.push(`crop_type_id = $${paramCount++}`);
      values.push(updates.crop_type_id);
    }
    if (updates.season !== undefined) {
      fields.push(`season = $${paramCount++}`);
      values.push(updates.season);
    }
    if (updates.sowing_date) {
      fields.push(`sowing_date = $${paramCount++}`);
      values.push(updates.sowing_date);
    }
    if (updates.harvest_date !== undefined) {
      fields.push(`harvest_date = $${paramCount++}`);
      values.push(updates.harvest_date);
    }
    if (updates.status) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE crops SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM crops WHERE id = $1', [id]);
  }

  // Crop Types (Master Data - Admin only)
  static async getAllCropTypes(): Promise<CropType[]> {
    const result = await pool.query('SELECT * FROM crop_types ORDER BY name');
    return result.rows;
  }

  static async getCropTypeById(id: string): Promise<CropType | null> {
    const result = await pool.query('SELECT * FROM crop_types WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async createCropType(data: CreateCropTypeData): Promise<CropType> {
    const result = await pool.query(
      `INSERT INTO crop_types (name, category, season, suitable_soil_types, average_yield, growth_period, water_requirement, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.name,
        data.category,
        data.season,
        data.suitable_soil_types || [],
        data.average_yield || null,
        data.growth_period || null,
        data.water_requirement || null,
        data.description || null,
        data.created_by,
      ]
    );
    return result.rows[0];
  }

  static async updateCropType(id: string, updates: Partial<CreateCropTypeData>): Promise<CropType> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.category) {
      fields.push(`category = $${paramCount++}`);
      values.push(updates.category);
    }
    if (updates.season) {
      fields.push(`season = $${paramCount++}`);
      values.push(updates.season);
    }
    if (updates.suitable_soil_types !== undefined) {
      fields.push(`suitable_soil_types = $${paramCount++}`);
      values.push(updates.suitable_soil_types);
    }
    if (updates.average_yield !== undefined) {
      fields.push(`average_yield = $${paramCount++}`);
      values.push(updates.average_yield);
    }
    if (updates.growth_period !== undefined) {
      fields.push(`growth_period = $${paramCount++}`);
      values.push(updates.growth_period);
    }
    if (updates.water_requirement) {
      fields.push(`water_requirement = $${paramCount++}`);
      values.push(updates.water_requirement);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE crop_types SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async deleteCropType(id: string): Promise<void> {
    await pool.query('DELETE FROM crop_types WHERE id = $1', [id]);
  }
}
