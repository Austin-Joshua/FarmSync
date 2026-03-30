import { pool } from '../config/database';
import { execute } from '../utils/dbHelper';

export const addWeatherAlertsTable = async (): Promise<void> => {
  try {
    await execute(
      pool,
      `CREATE TABLE IF NOT EXISTS weather_alerts (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        alert_type ENUM('frost', 'drought', 'heavy_rain', 'storm', 'extreme_heat', 'flood', 'other') NOT NULL,
        severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        recommendation TEXT,
        location VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        alert_date DATE NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_alert_date (alert_date),
        INDEX idx_is_active (is_active),
        INDEX idx_is_read (is_read),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );

    console.log('✓ weather_alerts table created successfully!');
  } catch (error: any) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.message.includes('already exists')) {
      console.log('✓ weather_alerts table already exists');
    } else {
      console.error('Error creating weather_alerts table:', error);
      throw error;
    }
  }
};
