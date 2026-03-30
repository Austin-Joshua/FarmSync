import { pool } from '../config/database';
import { query, queryOne, execute } from '../utils/dbHelper';

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
    return query<Crop>(
      pool,
      `SELECT c.*, ct.name as crop_type_name
       FROM crops c
       LEFT JOIN crop_types ct ON c.crop_type_id = ct.id
       WHERE c.farm_id = ?
       ORDER BY c.sowing_date DESC`,
      [farmId]
    );
  }

  static async findByFarmerId(farmerId: string): Promise<Crop[]> {
    return query<Crop>(
      pool,
      `SELECT c.*, ct.name as crop_type_name
       FROM crops c
       LEFT JOIN crop_types ct ON c.crop_type_id = ct.id
       JOIN farms f ON c.farm_id = f.id
       WHERE f.farmer_id = ?
       ORDER BY c.sowing_date DESC`,
      [farmerId]
    );
  }

  static async findById(id: string): Promise<Crop | null> {
    return queryOne<Crop>(
      pool,
      `SELECT c.*, ct.name as crop_type_name
       FROM crops c
       LEFT JOIN crop_types ct ON c.crop_type_id = ct.id
       WHERE c.id = ?`,
      [id]
    );
  }

  static async create(data: CreateCropData): Promise<Crop> {
    await execute(
      pool,
      `INSERT INTO crops (name, crop_type_id, season, sowing_date, harvest_date, status, farm_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
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

    const crop = await queryOne<Crop>(
      pool,
      `SELECT c.*, ct.name as crop_type_name
       FROM crops c
       LEFT JOIN crop_types ct ON c.crop_type_id = ct.id
       WHERE c.farm_id = ? AND c.name = ? AND c.sowing_date = ?
       ORDER BY c.created_at DESC
       LIMIT 1`,
      [data.farm_id, data.name, data.sowing_date]
    );
    if (!crop) throw new Error('Failed to create crop');
    return crop;
  }

  static async update(id: string, updates: Partial<CreateCropData>): Promise<Crop> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name) {
      fields.push(`name = ?`);
      values.push(updates.name);
    }
    if (updates.crop_type_id !== undefined) {
      fields.push(`crop_type_id = ?`);
      values.push(updates.crop_type_id);
    }
    if (updates.season !== undefined) {
      fields.push(`season = ?`);
      values.push(updates.season);
    }
    if (updates.sowing_date) {
      fields.push(`sowing_date = ?`);
      values.push(updates.sowing_date);
    }
    if (updates.harvest_date !== undefined) {
      fields.push(`harvest_date = ?`);
      values.push(updates.harvest_date);
    }
    if (updates.status) {
      fields.push(`status = ?`);
      values.push(updates.status);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await execute(
      pool,
      `UPDATE crops SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const crop = await this.findById(id);
    if (!crop) throw new Error('Crop not found');
    return crop;
  }

  static async delete(id: string): Promise<void> {
    await execute(pool, 'DELETE FROM crops WHERE id = ?', [id]);
  }

  // Crop Types (Master Data - Admin only)
  static async getAllCropTypes(): Promise<CropType[]> {
    return query<CropType>(pool, 'SELECT * FROM crop_types ORDER BY name', []);
  }

  static async getCropTypeById(id: string): Promise<CropType | null> {
    return queryOne<CropType>(pool, 'SELECT * FROM crop_types WHERE id = ?', [id]);
  }

  static async createCropType(data: CreateCropTypeData): Promise<CropType> {
    await execute(
      pool,
      `INSERT INTO crop_types (name, category, season, suitable_soil_types, average_yield, growth_period, water_requirement, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.category,
        data.season,
        JSON.stringify(data.suitable_soil_types || []),
        data.average_yield || null,
        data.growth_period || null,
        data.water_requirement || null,
        data.description || null,
        data.created_by,
      ]
    );

    const cropType = await queryOne<CropType>(
      pool,
      'SELECT * FROM crop_types WHERE name = ? AND created_by = ? ORDER BY created_at DESC LIMIT 1',
      [data.name, data.created_by]
    );
    if (!cropType) throw new Error('Failed to create crop type');
    
    // Parse JSON fields
    if (typeof cropType.suitable_soil_types === 'string') {
      cropType.suitable_soil_types = JSON.parse(cropType.suitable_soil_types);
    }
    
    return cropType;
  }

  static async updateCropType(id: string, updates: Partial<CreateCropTypeData>): Promise<CropType> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name) {
      fields.push(`name = ?`);
      values.push(updates.name);
    }
    if (updates.category) {
      fields.push(`category = ?`);
      values.push(updates.category);
    }
    if (updates.season) {
      fields.push(`season = ?`);
      values.push(updates.season);
    }
    if (updates.suitable_soil_types !== undefined) {
      fields.push(`suitable_soil_types = ?`);
      values.push(JSON.stringify(updates.suitable_soil_types));
    }
    if (updates.average_yield !== undefined) {
      fields.push(`average_yield = ?`);
      values.push(updates.average_yield);
    }
    if (updates.growth_period !== undefined) {
      fields.push(`growth_period = ?`);
      values.push(updates.growth_period);
    }
    if (updates.water_requirement) {
      fields.push(`water_requirement = ?`);
      values.push(updates.water_requirement);
    }
    if (updates.description !== undefined) {
      fields.push(`description = ?`);
      values.push(updates.description);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await execute(
      pool,
      `UPDATE crop_types SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const cropType = await this.getCropTypeById(id);
    if (!cropType) throw new Error('Crop type not found');
    
    // Parse JSON fields
    if (typeof cropType.suitable_soil_types === 'string') {
      cropType.suitable_soil_types = JSON.parse(cropType.suitable_soil_types);
    }
    
    return cropType;
  }

  static async deleteCropType(id: string): Promise<void> {
    await execute(pool, 'DELETE FROM crop_types WHERE id = ?', [id]);
  }
}
