import { pool } from '../config/database';
import { query, queryOne } from '../utils/dbHelper';

export interface SoilType {
  id: string;
  name: string;
  description?: string;
  created_at?: Date;
}

export class SoilModel {
  static async getAll(): Promise<SoilType[]> {
    return query<SoilType>(pool, 'SELECT * FROM soil_types ORDER BY name');
  }

  static async findById(id: string): Promise<SoilType | null> {
    return queryOne<SoilType>(pool, 'SELECT * FROM soil_types WHERE id = ?', [id]);
  }
}
