import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';
import { addAuditLogsTable } from './addAuditLogsTable';
import { addPushSubscriptionsTable } from './addPushSubscriptionsTable';
import { addOAuthFields } from './addOAuthFields';

async function migrate() {
  try {
    console.log('Starting database migration...');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    await pool.query(schema);
    
    // Add audit logs table
    await addAuditLogsTable();
    
    // Add push subscriptions table
    await addPushSubscriptionsTable();

    // Add OAuth fields (Apple and Microsoft)
    await addOAuthFields();
    
    console.log('Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
