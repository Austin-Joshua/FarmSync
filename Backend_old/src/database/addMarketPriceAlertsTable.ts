import { pool } from '../config/database';
import { execute } from '../utils/dbHelper';

export const addMarketPriceAlertsTable = async (): Promise<void> => {
  try {
    await execute(
      pool,
      `CREATE TABLE IF NOT EXISTS market_price_alerts (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        crop VARCHAR(255) NOT NULL,
        target_price DECIMAL(10, 2) NOT NULL,
        condition_type ENUM('above', 'below') NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        notified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_crop (crop),
        INDEX idx_is_active (is_active),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );

    console.log('✓ market_price_alerts table created successfully!');
  } catch (error: any) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.message.includes('already exists')) {
      console.log('✓ market_price_alerts table already exists');
    } else {
      console.error('Error creating market_price_alerts table:', error);
      throw error;
    }
  }
};
