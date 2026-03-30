import { pool } from '../config/database';
import { execute } from '../utils/dbHelper';

export const addStockThreshold = async (): Promise<void> => {
  try {
    // Check if column already exists
    const [columns]: any = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'stock_items' 
      AND COLUMN_NAME = 'threshold'
    `);

    if (Array.isArray(columns) && columns.length > 0) {
      console.log('✓ threshold column already exists in stock_items table');
      return;
    }

    // Add threshold column
    await execute(
      pool,
      `ALTER TABLE stock_items 
       ADD COLUMN threshold DECIMAL(10, 2) DEFAULT 10.00 AFTER quantity`
    );

    console.log('✓ threshold column added to stock_items table successfully!');
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME' || error.message.includes('Duplicate column')) {
      console.log('✓ threshold column already exists');
    } else {
      console.error('Error adding threshold column:', error);
      throw error;
    }
  }
};
