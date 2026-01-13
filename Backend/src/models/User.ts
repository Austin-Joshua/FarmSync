import { pool } from '../config/database';
import bcrypt from 'bcryptjs';
import { query, queryOne, execute } from '../utils/dbHelper';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  role: 'farmer' | 'admin';
  is_onboarded?: boolean;
  location?: string;
  land_size?: number;
  soil_type?: string;
  google_id?: string;
  apple_id?: string;
  microsoft_id?: string;
  picture_url?: string;
  two_factor_enabled?: boolean;
  two_factor_secret?: string;
  two_factor_backup_codes?: string;
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
  picture_url?: string;
}

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    return queryOne<User>(pool, 'SELECT * FROM users WHERE email = ?', [email]);
  }

  static async findById(id: string): Promise<User | null> {
    // Use SELECT * to get all columns, handling missing columns gracefully
    return queryOne<User>(pool, 'SELECT * FROM users WHERE id = ?', [id]);
  }

  static async findByIdWithPassword(id: string): Promise<User | null> {
    return queryOne<User>(pool, 'SELECT * FROM users WHERE id = ?', [id]);
  }

  static async findByIdWith2FA(id: string): Promise<User | null> {
    return queryOne<User>(pool, 'SELECT id, name, email, role, two_factor_enabled, two_factor_secret, two_factor_backup_codes FROM users WHERE id = ?', [id]);
  }


  static async create(data: CreateUserData): Promise<User> {
    let passwordHash = null;
    if (data.password) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    try {
      // Insert user with all required fields
      const insertResult = await execute(
        pool,
        `INSERT INTO users (name, email, password_hash, role, location, land_size, soil_type, picture_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name, 
          data.email, 
          passwordHash, 
          data.role, 
          data.location || null, 
          data.land_size || 0, 
          data.soil_type || null, 
          data.picture_url || null
        ]
      );

      // Check if insert was successful
      if (!insertResult || (insertResult.insertId === undefined && insertResult.affectedRows !== 1)) {
        console.error('Insert result:', insertResult);
        throw new Error('Failed to insert user into database');
      }

      // MySQL doesn't support RETURNING, so fetch the created user
      const user = await queryOne<User>(pool, 'SELECT * FROM users WHERE email = ?', [data.email]);
      if (!user) {
        console.error('User not found after insert. Email:', data.email);
        throw new Error('Failed to retrieve created user from database');
      }
      
      console.log('User created successfully:', user.email);
      return user;
    } catch (error: any) {
      console.error('Error creating user:', error);
      // Re-throw with more context
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('User with this email already exists');
      }
      if (error.message.includes('timeout')) {
        throw new Error('Database operation timed out. Please check database connection.');
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.password_hash) return false;
    return bcrypt.compare(password, user.password_hash);
  }

  static async update(id: string, updates: Partial<CreateUserData & {
    two_factor_enabled?: boolean;
    two_factor_secret?: string | null;
    two_factor_backup_codes?: string | null;
  }>): Promise<User> {
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
    if (updates.two_factor_enabled !== undefined) {
      fields.push(`two_factor_enabled = ?`);
      values.push(updates.two_factor_enabled);
    }
    if (updates.two_factor_secret !== undefined) {
      fields.push(`two_factor_secret = ?`);
      values.push(updates.two_factor_secret);
    }
    if (updates.two_factor_backup_codes !== undefined) {
      fields.push(`two_factor_backup_codes = ?`);
      values.push(updates.two_factor_backup_codes);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await execute(
      pool,
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated user - use SELECT * to handle missing columns
    const user = await queryOne<User>(pool, 'SELECT * FROM users WHERE id = ?', [id]);
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
