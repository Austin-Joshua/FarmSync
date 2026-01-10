import { pool } from '../config/database';
import fs from 'fs';
import path from 'path';

async function addRecommendationsTable() {
  try {
    console.log('Adding crop_recommendations table...');
    
    const sqlPath = path.join(__dirname, 'addRecommendationsTable.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Split SQL statements and execute separately
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed.length > 0) {
        try {
          await pool.query(trimmed);
        } catch (err: any) {
          // Ignore "already exists" errors
          if (!err.message.includes('already exists') && err.code !== 'ER_DUP_KEYNAME') {
            throw err;
          }
        }
      }
    }
    
    console.log('crop_recommendations table created successfully!');
    process.exit(0);
  } catch (error: any) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.message.includes('already exists')) {
      console.log('Table already exists, skipping...');
      process.exit(0);
    } else {
      console.error('Failed to add table:', error.message);
      console.error(error);
      process.exit(1);
    }
  }
}

addRecommendationsTable();
