import { pool } from '../config/database';
import { query, queryOne, execute } from '../utils/dbHelper';

export interface Field {
  id: string;
  farm_id: string;
  name: string;
  area: number;
  boundary_coordinates?: any; // JSON data for GPS coordinates
  latitude?: number;
  longitude?: number;
  soil_type_id?: string;
  soil_type_name?: string;
  soil_test_date?: Date;
  soil_test_results?: any; // JSON data
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateFieldData {
  farm_id: string;
  name: string;
  area: number;
  boundary_coordinates?: any;
  latitude?: number;
  longitude?: number;
  soil_type_id?: string;
  soil_test_date?: Date;
  soil_test_results?: any;
}

export class FieldModel {
  static async findByFarmId(farmId: string): Promise<Field[]> {
    return query<Field>(
      pool,
      `SELECT f.*, st.name as soil_type_name
       FROM fields f
       LEFT JOIN soil_types st ON f.soil_type_id = st.id
       WHERE f.farm_id = ?
       ORDER BY f.created_at DESC`,
      [farmId]
    );
  }

  static async findById(id: string): Promise<Field | null> {
    return queryOne<Field>(
      pool,
      `SELECT f.*, st.name as soil_type_name
       FROM fields f
       LEFT JOIN soil_types st ON f.soil_type_id = st.id
       WHERE f.id = ?`,
      [id]
    );
  }

  static async create(data: CreateFieldData): Promise<Field> {
    await execute(
      pool,
      `INSERT INTO fields (farm_id, name, area, boundary_coordinates, latitude, longitude, soil_type_id, soil_test_date, soil_test_results)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.farm_id,
        data.name,
        data.area,
        data.boundary_coordinates ? JSON.stringify(data.boundary_coordinates) : null,
        data.latitude || null,
        data.longitude || null,
        data.soil_type_id || null,
        data.soil_test_date || null,
        data.soil_test_results ? JSON.stringify(data.soil_test_results) : null,
      ]
    );

    const field = await queryOne<Field>(
      pool,
      `SELECT f.*, st.name as soil_type_name
       FROM fields f
       LEFT JOIN soil_types st ON f.soil_type_id = st.id
       WHERE f.farm_id = ? AND f.name = ?
       ORDER BY f.created_at DESC
       LIMIT 1`,
      [data.farm_id, data.name]
    );
    if (!field) throw new Error('Failed to create field');
    
    // Parse JSON fields
    if (typeof field.boundary_coordinates === 'string') {
      field.boundary_coordinates = JSON.parse(field.boundary_coordinates);
    }
    if (typeof field.soil_test_results === 'string') {
      field.soil_test_results = JSON.parse(field.soil_test_results);
    }
    
    return field;
  }

  static async update(id: string, updates: Partial<CreateFieldData>): Promise<Field> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name) {
      fields.push(`name = ?`);
      values.push(updates.name);
    }
    if (updates.area !== undefined) {
      fields.push(`area = ?`);
      values.push(updates.area);
    }
    if (updates.boundary_coordinates !== undefined) {
      fields.push(`boundary_coordinates = ?`);
      values.push(JSON.stringify(updates.boundary_coordinates));
    }
    if (updates.latitude !== undefined) {
      fields.push(`latitude = ?`);
      values.push(updates.latitude);
    }
    if (updates.longitude !== undefined) {
      fields.push(`longitude = ?`);
      values.push(updates.longitude);
    }
    if (updates.soil_type_id !== undefined) {
      fields.push(`soil_type_id = ?`);
      values.push(updates.soil_type_id);
    }
    if (updates.soil_test_date !== undefined) {
      fields.push(`soil_test_date = ?`);
      values.push(updates.soil_test_date);
    }
    if (updates.soil_test_results !== undefined) {
      fields.push(`soil_test_results = ?`);
      values.push(JSON.stringify(updates.soil_test_results));
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await execute(
      pool,
      `UPDATE fields SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const field = await this.findById(id);
    if (!field) throw new Error('Field not found');
    
    // Parse JSON fields
    if (field && typeof field.boundary_coordinates === 'string') {
      field.boundary_coordinates = JSON.parse(field.boundary_coordinates);
    }
    if (field && typeof field.soil_test_results === 'string') {
      field.soil_test_results = JSON.parse(field.soil_test_results);
    }
    
    return field;
  }

  static async delete(id: string): Promise<void> {
    await execute(pool, 'DELETE FROM fields WHERE id = ?', [id]);
  }
}
