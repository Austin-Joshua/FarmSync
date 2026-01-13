// Script to view all stored user credentials
import { pool } from '../config/database';
import { query } from '../utils/dbHelper';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  location: string | null;
  land_size: number | null;
  soil_type: string | null;
  is_onboarded: boolean;
  created_at: Date;
}

async function viewUsers() {
  try {
    console.log('\n=== FarmSync User Credentials ===\n');
    
    // First check what columns exist
    const columns = await query<any>(
      pool,
      `SHOW COLUMNS FROM users`
    );
    
    const columnNames = columns.map((col: any) => col.Field);
    console.log('Available columns:', columnNames.join(', '));
    
    // Build query based on available columns
    const selectFields = ['id', 'name', 'email', 'role', 'location', 'is_onboarded', 'created_at']
      .filter(col => columnNames.includes(col))
      .join(', ');
    
    const users = await query<UserRecord>(
      pool,
      `SELECT ${selectFields} 
       FROM users 
       ORDER BY created_at DESC`
    );

    if (users.length === 0) {
      console.log('No users found in database.\n');
      return;
    }

    console.log(`Total Users: ${users.length}\n`);
    console.log('─'.repeat(80));
    
    users.forEach((user, index) => {
      console.log(`\nUser #${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role.toUpperCase()}`);
      console.log(`  Location: ${(user as any).location || 'Not set'}`);
      if ((user as any).land_size !== undefined) {
        console.log(`  Land Size: ${(user as any).land_size ? `${(user as any).land_size} acres` : 'Not set'}`);
      }
      if ((user as any).soil_type !== undefined) {
        console.log(`  Soil Type: ${(user as any).soil_type || 'Not set'}`);
      }
      console.log(`  Onboarded: ${user.is_onboarded ? 'Yes' : 'No'}`);
      console.log(`  Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log('─'.repeat(80));
    });

    console.log('\n✅ User list retrieved successfully!\n');
    console.log('Note: Passwords are securely hashed and cannot be displayed.');
    console.log('To reset a password, use the "Forgot Password" feature.\n');
    
  } catch (error: any) {
    console.error('\n❌ Error retrieving users:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Database connection failed. Make sure MySQL is running.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Database does not exist. Run: npm run setup-db');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Database access denied. Check your .env file credentials.');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
viewUsers();
