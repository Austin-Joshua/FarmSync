// Migration script to add land_size and soil_type columns to users table
import { pool } from '../config/database';
import { execute } from '../utils/dbHelper';

async function addUserSettingsColumns() {
  try {
    console.log('Adding land_size and soil_type columns to users table...');

    // Check if columns exist
    const [columns]: any = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME IN ('land_size', 'soil_type')
    `);

    const existingColumns = columns.map((col: any) => col.COLUMN_NAME);

    if (!existingColumns.includes('land_size')) {
      await execute(
        pool,
        `ALTER TABLE users ADD COLUMN land_size DECIMAL(10, 2) DEFAULT 0 AFTER location`
      );
      console.log('✓ Added land_size column');
    } else {
      console.log('✓ land_size column already exists');
    }

    if (!existingColumns.includes('soil_type')) {
      await execute(
        pool,
        `ALTER TABLE users ADD COLUMN soil_type VARCHAR(100) AFTER land_size`
      );
      console.log('✓ Added soil_type column');
    } else {
      console.log('✓ soil_type column already exists');
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

addUserSettingsColumns();
