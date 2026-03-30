import { pool } from '../config/database';
import { execute } from '../utils/dbHelper';

export const addTwoFactorAuthTable = async (): Promise<void> => {
  try {
    // Add 2FA columns to users table
    await execute(
      pool,
      `ALTER TABLE users 
       ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
       ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255),
       ADD COLUMN IF NOT EXISTS two_factor_backup_codes TEXT`
    );

    console.log('✓ Two-factor authentication columns added to users table');
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME' || error.message.includes('Duplicate column')) {
      console.log('✓ Two-factor authentication columns already exist');
    } else {
      console.error('Error adding 2FA columns:', error);
      throw error;
    }
  }
};
