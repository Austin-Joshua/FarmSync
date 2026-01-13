import { pool } from '../config/database';
import { execute } from '../utils/dbHelper';

export const addFieldsTable = async (): Promise<void> => {
  try {
    await execute(
      pool,
      `CREATE TABLE IF NOT EXISTS fields (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        farm_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        area DECIMAL(10, 2) NOT NULL,
        boundary_coordinates JSON,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        soil_type_id VARCHAR(36),
        soil_test_date DATE,
        soil_test_results JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_farm_id (farm_id),
        INDEX idx_soil_type_id (soil_type_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );

    console.log('✓ fields table created successfully!');
  } catch (error: any) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.message.includes('already exists')) {
      console.log('✓ fields table already exists');
    } else {
      console.error('Error creating fields table:', error);
      throw error;
    }
  }
};
