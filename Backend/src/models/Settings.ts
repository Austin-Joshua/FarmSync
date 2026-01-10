import { pool } from '../config/database';

export interface UserSettings {
  id: string;
  user_id: string;
  enable_history_saving: boolean;
  auto_save_stock_records: boolean;
  auto_save_income_records: boolean;
  notifications_enabled: boolean;
  theme: 'light' | 'dark';
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUserSettingsData {
  user_id: string;
  enable_history_saving?: boolean;
  auto_save_stock_records?: boolean;
  auto_save_income_records?: boolean;
  notifications_enabled?: boolean;
  theme?: 'light' | 'dark';
}

export class SettingsModel {
  static async findByUserId(userId: string): Promise<UserSettings | null> {
    const result = await pool.query('SELECT * FROM user_settings WHERE user_id = $1', [userId]);
    return result.rows[0] || null;
  }

  static async createOrUpdate(data: CreateUserSettingsData): Promise<UserSettings> {
    const existing = await this.findByUserId(data.user_id);

    if (existing) {
      // Update existing settings
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (data.enable_history_saving !== undefined) {
        fields.push(`enable_history_saving = $${paramCount++}`);
        values.push(data.enable_history_saving);
      }
      if (data.auto_save_stock_records !== undefined) {
        fields.push(`auto_save_stock_records = $${paramCount++}`);
        values.push(data.auto_save_stock_records);
      }
      if (data.auto_save_income_records !== undefined) {
        fields.push(`auto_save_income_records = $${paramCount++}`);
        values.push(data.auto_save_income_records);
      }
      if (data.notifications_enabled !== undefined) {
        fields.push(`notifications_enabled = $${paramCount++}`);
        values.push(data.notifications_enabled);
      }
      if (data.theme) {
        fields.push(`theme = $${paramCount++}`);
        values.push(data.theme);
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(data.user_id);

      const result = await pool.query(
        `UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = $${paramCount} RETURNING *`,
        values
      );

      return result.rows[0];
    } else {
      // Create new settings
      const result = await pool.query(
        `INSERT INTO user_settings (user_id, enable_history_saving, auto_save_stock_records, auto_save_income_records, notifications_enabled, theme)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          data.user_id,
          data.enable_history_saving ?? true,
          data.auto_save_stock_records ?? true,
          data.auto_save_income_records ?? true,
          data.notifications_enabled ?? true,
          data.theme ?? 'light',
        ]
      );
      return result.rows[0];
    }
  }
}
