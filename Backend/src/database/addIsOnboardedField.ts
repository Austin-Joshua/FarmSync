/**
 * Migration script to add isOnboarded field to users table
 */
import { pool } from '../config/database';
import { execute } from '../utils/dbHelper';

async function addIsOnboardedField() {
  try {
    console.log('Adding isOnboarded field to users table...');

    // Check if column already exists
    const [columns]: any = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'is_onboarded'
    `);

    if (Array.isArray(columns) && columns.length > 0) {
      console.log('✓ is_onboarded column already exists');
      process.exit(0);
    }

    // Add the column
    await execute(
      pool,
      `ALTER TABLE users ADD COLUMN is_onboarded BOOLEAN DEFAULT FALSE AFTER role`
    );

    console.log('✓ is_onboarded column added successfully');

    // Set is_onboarded to TRUE for users who have completed onboarding
    // Check if columns exist before updating
    const [columnCheck]: any = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME IN ('location', 'land_size', 'soil_type')
    `);

    const existingColumns = Array.isArray(columnCheck) ? columnCheck.map((col: any) => col.COLUMN_NAME) : [];
    
    if (existingColumns.includes('location') && existingColumns.includes('land_size') && existingColumns.includes('soil_type')) {
      try {
        await execute(
          pool,
          `UPDATE users 
           SET is_onboarded = TRUE 
           WHERE location IS NOT NULL 
           AND land_size IS NOT NULL 
           AND land_size > 0 
           AND soil_type IS NOT NULL 
           AND role = 'farmer'`
        );
        console.log('✓ Updated existing users with onboarding status');
      } catch (error: any) {
        console.log('⚠️  Could not update existing users (this is okay for new installations)');
      }
    } else {
      console.log('⚠️  Location columns not found, skipping user update');
    }
    process.exit(0);
  } catch (error: any) {
    console.error('Migration failed:', error.message);
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists, skipping...');
      process.exit(0);
    }
    process.exit(1);
  }
}

addIsOnboardedField();
