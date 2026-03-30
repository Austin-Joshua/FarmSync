// Migration script to add disease_scans table
import { pool } from '../config/database';
import { execute } from '../utils/dbHelper';
import fs from 'fs';
import path from 'path';

async function addDiseaseScansTable() {
  try {
    console.log('Creating disease_scans table...');

    const sqlPath = path.join(__dirname, 'addDiseaseScansTable.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Check if table already exists
    const [tables]: any = await pool.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'disease_scans'
    `);

    if (tables.length > 0) {
      console.log('✓ disease_scans table already exists');
      process.exit(0);
    }

    // Execute SQL
    await execute(pool, sql);

    console.log('✓ disease_scans table created successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

addDiseaseScansTable();
