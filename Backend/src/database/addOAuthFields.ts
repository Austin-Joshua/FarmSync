// Migration script to add Apple and Microsoft OAuth fields to users table
import { pool } from '../config/database';
import { execute, query } from '../utils/dbHelper';

export const addOAuthFields = async (): Promise<void> => {
  try {
    // Check if columns already exist
    const checkColumns = await query<any>(
      pool,
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'users' 
       AND COLUMN_NAME IN ('apple_id', 'microsoft_id')`
    );

    const existingColumns = Array.isArray(checkColumns) ? checkColumns.map((col: any) => col.COLUMN_NAME) : [];

    // Add apple_id column if it doesn't exist
    if (!existingColumns.includes('apple_id')) {
      await execute(
        pool,
        `ALTER TABLE users 
         ADD COLUMN apple_id VARCHAR(255) UNIQUE AFTER google_id`
      );
      console.log('✅ Added apple_id column to users table');
    }

    // Add microsoft_id column if it doesn't exist
    if (!existingColumns.includes('microsoft_id')) {
      await execute(
        pool,
        `ALTER TABLE users 
         ADD COLUMN microsoft_id VARCHAR(255) UNIQUE AFTER apple_id`
      );
      console.log('✅ Added microsoft_id column to users table');
    }

    console.log('✅ OAuth fields migration completed');
  } catch (error: any) {
    console.error('❌ Error adding OAuth fields:', error);
    throw error;
  }
};

// Run migration if called directly
if (require.main === module) {
  addOAuthFields()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
