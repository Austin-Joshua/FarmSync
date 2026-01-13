import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';
import { addAuditLogsTable } from './addAuditLogsTable';
import { addPushSubscriptionsTable } from './addPushSubscriptionsTable';
import { addPasswordResetTable } from './addPasswordResetTable';
import { addSessionsTable } from './addSessionsTable';
import { addStockThreshold } from './addStockThreshold';
import { addCropCalendarTable } from './addCropCalendarTable';
import { addWeatherAlertsTable } from './addWeatherAlertsTable';
import { addTwoFactorAuthTable } from './addTwoFactorAuthTable';
import { addMarketPriceAlertsTable } from './addMarketPriceAlertsTable';
import { addFieldsTable } from './addFieldsTable';

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

    // Add password reset tokens table
    await addPasswordResetTable();

    // Add sessions table
    await addSessionsTable();

    // Add stock threshold column
    await addStockThreshold();

    // Add crop calendar events table
    await addCropCalendarTable();

    // Add weather alerts table
    await addWeatherAlertsTable();

    // Add two-factor authentication columns
    await addTwoFactorAuthTable();

    // Add market price alerts table
    await addMarketPriceAlertsTable();

    // Add fields table
    await addFieldsTable();
    
    console.log('Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
