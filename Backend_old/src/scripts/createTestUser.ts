// Script to create a test user for login
import { pool } from '../config/database';
import bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    console.log('\n=== Creating Test User ===\n');
    
    const connection = await pool.getConnection();
    
    try {
      // Create test farmer user
      const farmerPassword = await bcrypt.hash('farmer123', 10);
      const [farmerResult] = await connection.query(
        `INSERT INTO users (id, name, email, password_hash, role, location) 
         VALUES (UUID(), ?, ?, ?, ?, ?)`,
        ['Test Farmer', 'farmer@test.com', farmerPassword, 'farmer', 'Test Location']
      ) as any[];
      
      console.log('✅ Farmer user created:');
      console.log('   Email: farmer@test.com');
      console.log('   Password: farmer123');
      console.log('   Role: farmer\n');
      
      // Create test admin user
      const adminPassword = await bcrypt.hash('admin123', 10);
      const [adminResult] = await connection.query(
        `INSERT INTO users (id, name, email, password_hash, role) 
         VALUES (UUID(), ?, ?, ?, ?)`,
        ['System Admin', 'admin@farmsync.com', adminPassword, 'admin']
      ) as any[];
      
      console.log('✅ Admin user created:');
      console.log('   Email: admin@farmsync.com');
      console.log('   Password: admin123');
      console.log('   Role: admin\n');
      
      console.log('✅ Test users created successfully!\n');
      
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('⚠️  Users already exist. Showing existing users...\n');
      } else {
        throw error;
      }
    } finally {
      connection.release();
    }
    
  } catch (error: any) {
    console.error('\n❌ Error creating users:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createTestUser();
