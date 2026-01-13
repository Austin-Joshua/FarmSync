import { pool } from '../config/database';
import { execute } from '../utils/dbHelper';

export const addPasswordResetTable = async (): Promise<void> => {
  try {
    await execute(
      pool,
      `CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token (token),
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );

    console.log('✓ password_reset_tokens table created successfully!');
  } catch (error: any) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.message.includes('already exists')) {
      console.log('✓ password_reset_tokens table already exists');
    } else {
      console.error('Error creating password_reset_tokens table:', error);
      throw error;
    }
  }
};
