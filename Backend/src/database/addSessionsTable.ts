import { pool } from '../config/database';
import { execute } from '../utils/dbHelper';

export const addSessionsTable = async (): Promise<void> => {
  try {
    await execute(
      pool,
      `CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        token VARCHAR(500) NOT NULL,
        device_info VARCHAR(255),
        browser VARCHAR(100),
        ip_address VARCHAR(45),
        user_agent TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_token (token(255)),
        INDEX idx_is_active (is_active),
        INDEX idx_expires_at (expires_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );

    console.log('✓ sessions table created successfully!');
  } catch (error: any) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.message.includes('already exists')) {
      console.log('✓ sessions table already exists');
    } else {
      console.error('Error creating sessions table:', error);
      throw error;
    }
  }
};
