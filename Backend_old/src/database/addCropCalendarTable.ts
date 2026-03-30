import { pool } from '../config/database';
import { execute } from '../utils/dbHelper';

export const addCropCalendarTable = async (): Promise<void> => {
  try {
    await execute(
      pool,
      `CREATE TABLE IF NOT EXISTS crop_calendar_events (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        crop_id VARCHAR(36),
        event_type ENUM('planting', 'harvest', 'fertilizer', 'pesticide', 'irrigation', 'other') NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        reminder_days INT DEFAULT 7,
        is_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_crop_id (crop_id),
        INDEX idx_event_date (event_date),
        INDEX idx_event_type (event_type),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );

    console.log('✓ crop_calendar_events table created successfully!');
  } catch (error: any) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.message.includes('already exists')) {
      console.log('✓ crop_calendar_events table already exists');
    } else {
      console.error('Error creating crop_calendar_events table:', error);
      throw error;
    }
  }
};
