import { pool } from '../config/database';
import bcrypt from 'bcryptjs';
import { query, queryOne, execute } from '../utils/dbHelper';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  role: 'farmer' | 'admin';
  location?: string;
  land_size?: number;
  soil_type?: string;
  google_id?: string;
  apple_id?: string;
  microsoft_id?: string;
  picture_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  role: 'farmer' | 'admin';
  location?: string;
  land_size?: number;
  soil_type?: string;
  google_id?: string;
  apple_id?: string;
  microsoft_id?: string;
  picture_url?: string;
}

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    return queryOne<User>(pool, 'SELECT * FROM users WHERE email = ?', [email]);
  }

  static async findById(id: string): Promise<User | null> {
    return queryOne<User>(pool, 'SELECT id, name, email, role, location, land_size, soil_type, picture_url, created_at FROM users WHERE id = ?', [id]);
  }

  static async findByGoogleId(googleId: string): Promise<User | null> {
    return queryOne<User>(pool, 'SELECT * FROM users WHERE google_id = ?', [googleId]);
  }

  static async findByAppleId(appleId: string): Promise<User | null> {
    return queryOne<User>(pool, 'SELECT * FROM users WHERE apple_id = ?', [appleId]);
  }

  static async findByMicrosoftId(microsoftId: string): Promise<User | null> {
    return queryOne<User>(pool, 'SELECT * FROM users WHERE microsoft_id = ?', [microsoftId]);
  }

  static async create(data: CreateUserData): Promise<User> {
    let passwordHash = null;
    if (data.password) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    await execute(
      pool,
      `INSERT INTO users (name, email, password_hash, role, location, land_size, soil_type, google_id, apple_id, microsoft_id, picture_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name, 
        data.email, 
        passwordHash, 
        data.role, 
        data.location || null, 
        data.land_size || 0, 
        data.soil_type || null, 
        data.google_id || null,
        data.apple_id || null,
        data.microsoft_id || null,
        data.picture_url || null
      ]
    );

    // MySQL doesn't support RETURNING, so fetch the created user
    const user = await queryOne<User>(pool, 'SELECT id, name, email, role, location, land_size, soil_type, picture_url, created_at FROM users WHERE email = ?', [data.email]);
    if (!user) throw new Error('Failed to create user');
    return user;
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.password_hash) return false;
    return bcrypt.compare(password, user.password_hash);
  }

  static async update(id: string, updates: Partial<CreateUserData>): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name) {
      fields.push(`name = ?`);
      values.push(updates.name);
    }
    if (updates.location !== undefined) {
      fields.push(`location = ?`);
      values.push(updates.location);
    }
    if (updates.land_size !== undefined) {
      fields.push(`land_size = ?`);
      values.push(updates.land_size);
    }
    if (updates.soil_type !== undefined) {
      fields.push(`soil_type = ?`);
      values.push(updates.soil_type);
    }
    if (updates.picture_url !== undefined) {
      fields.push(`picture_url = ?`);
      values.push(updates.picture_url);
    }
    if (updates.google_id !== undefined) {
      fields.push(`google_id = ?`);
      values.push(updates.google_id);
    }
    if (updates.apple_id !== undefined) {
      fields.push(`apple_id = ?`);
      values.push(updates.apple_id);
    }
    if (updates.microsoft_id !== undefined) {
      fields.push(`microsoft_id = ?`);
      values.push(updates.microsoft_id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await execute(
      pool,
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated user
    const user = await queryOne<User>(pool, 'SELECT id, name, email, role, location, land_size, soil_type, picture_url, created_at FROM users WHERE id = ?', [id]);
    if (!user) throw new Error('User not found');
    return user;
  }

  static async getFarmerCountByDistrict(): Promise<Array<{ district: string; count: number }>> {
    return query<{ district: string; count: number }>(
      pool,
      `SELECT 
        CASE 
          WHEN location LIKE '%Coimbatore%' THEN 'Coimbatore'
          WHEN location LIKE '%Chennai%' THEN 'Chennai'
          WHEN location LIKE '%Madurai%' THEN 'Madurai'
          WHEN location LIKE '%Tirunelveli%' THEN 'Tirunelveli'
          WHEN location LIKE '%Salem%' THEN 'Salem'
          WHEN location LIKE '%Erode%' THEN 'Erode'
          ELSE 'Other'
        END as district,
        COUNT(*) as count
       FROM users
       WHERE role = 'farmer'
       GROUP BY district
       ORDER BY count DESC`
    );
  }
}
