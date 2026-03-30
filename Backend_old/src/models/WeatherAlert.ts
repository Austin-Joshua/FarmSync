import { pool } from '../config/database';
import { query, queryOne, execute } from '../utils/dbHelper';

export interface WeatherAlert {
  id: string;
  user_id: string;
  alert_type: 'frost' | 'drought' | 'heavy_rain' | 'storm' | 'extreme_heat' | 'flood' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  recommendation?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  alert_date: Date;
  is_read: boolean;
  is_active: boolean;
  created_at?: Date;
}

export interface CreateWeatherAlertData {
  user_id: string;
  alert_type: 'frost' | 'drought' | 'heavy_rain' | 'storm' | 'extreme_heat' | 'flood' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  recommendation?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  alert_date: Date;
}

export class WeatherAlertModel {
  static async findByUserId(userId: string, activeOnly: boolean = true): Promise<WeatherAlert[]> {
    let sql = 'SELECT * FROM weather_alerts WHERE user_id = ?';
    const params: any[] = [userId];

    if (activeOnly) {
      sql += ' AND is_active = TRUE';
    }

    sql += ' ORDER BY alert_date DESC, severity DESC';

    return query<WeatherAlert>(pool, sql, params);
  }

  static async findUnreadAlerts(userId: string): Promise<WeatherAlert[]> {
    return query<WeatherAlert>(
      pool,
      `SELECT * FROM weather_alerts 
       WHERE user_id = ? 
       AND is_read = FALSE 
       AND is_active = TRUE
       ORDER BY alert_date DESC, severity DESC`,
      [userId]
    );
  }

  static async findById(id: string): Promise<WeatherAlert | null> {
    return queryOne<WeatherAlert>(pool, 'SELECT * FROM weather_alerts WHERE id = ?', [id]);
  }

  static async create(data: CreateWeatherAlertData): Promise<WeatherAlert> {
    await execute(
      pool,
      `INSERT INTO weather_alerts (user_id, alert_type, severity, title, message, recommendation, location, latitude, longitude, alert_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.user_id,
        data.alert_type,
        data.severity,
        data.title,
        data.message,
        data.recommendation || null,
        data.location || null,
        data.latitude || null,
        data.longitude || null,
        data.alert_date,
      ]
    );

    const alert = await queryOne<WeatherAlert>(
      pool,
      'SELECT * FROM weather_alerts WHERE user_id = ? AND title = ? AND alert_date = ? ORDER BY created_at DESC LIMIT 1',
      [data.user_id, data.title, data.alert_date]
    );
    if (!alert) throw new Error('Failed to create weather alert');
    return alert;
  }

  static async markAsRead(id: string): Promise<WeatherAlert> {
    await execute(
      pool,
      'UPDATE weather_alerts SET is_read = TRUE WHERE id = ?',
      [id]
    );

    const alert = await queryOne<WeatherAlert>(pool, 'SELECT * FROM weather_alerts WHERE id = ?', [id]);
    if (!alert) throw new Error('Weather alert not found');
    return alert;
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await execute(
      pool,
      'UPDATE weather_alerts SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
  }

  static async deactivate(id: string): Promise<void> {
    await execute(
      pool,
      'UPDATE weather_alerts SET is_active = FALSE WHERE id = ?',
      [id]
    );
  }

  static async delete(id: string): Promise<void> {
    await execute(pool, 'DELETE FROM weather_alerts WHERE id = ?', [id]);
  }
}
