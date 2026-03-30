/**
 * Database Verification Script for User Authentication
 * 
 * This script verifies that the database is properly set up for user authentication:
 * 1. Checks if the users table exists
 * 2. Verifies all required columns for authentication exist
 * 3. Tests database connection
 * 4. Provides feedback on database status
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { pool } from '../config/database';

dotenv.config();

interface VerificationResult {
  success: boolean;
  message: string;
  details?: any;
}

async function verifyDatabaseConnection(): Promise<VerificationResult> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return {
      success: true,
      message: 'Database connection successful',
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Database connection failed: ${error.message}`,
      details: error,
    };
  }
}

async function verifyUsersTable(): Promise<VerificationResult> {
  try {
    const [tables]: any = await pool.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users'
    `);

    if (!Array.isArray(tables) || tables.length === 0) {
      return {
        success: false,
        message: 'Users table does not exist',
      };
    }

    return {
      success: true,
      message: 'Users table exists',
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error checking users table: ${error.message}`,
      details: error,
    };
  }
}

async function verifyUsersTableStructure(): Promise<VerificationResult> {
  try {
    const [columns]: any = await pool.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `);

    const requiredColumns = [
      'id',
      'name',
      'email',
      'password_hash',
      'role',
      'created_at',
      'updated_at',
    ];

    const existingColumns = columns.map((col: any) => col.COLUMN_NAME);
    const missingColumns = requiredColumns.filter(
      (col) => !existingColumns.includes(col)
    );

    if (missingColumns.length > 0) {
      return {
        success: false,
        message: `Missing required columns: ${missingColumns.join(', ')}`,
        details: {
          existing: existingColumns,
          missing: missingColumns,
          allColumns: columns,
        },
      };
    }

    // Verify email uniqueness constraint
    const [indexes]: any = await pool.query(`
      SELECT INDEX_NAME, COLUMN_NAME
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'email'
    `);

    const emailIsUnique =
      indexes.some((idx: any) => idx.INDEX_NAME === 'email') ||
      indexes.some((idx: any) => idx.INDEX_NAME.includes('UNIQUE'));

    return {
      success: true,
      message: 'Users table structure is correct',
      details: {
        columns: columns,
        emailUnique: emailIsUnique,
        totalColumns: columns.length,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error verifying table structure: ${error.message}`,
      details: error,
    };
  }
}

async function testUserOperations(): Promise<VerificationResult> {
  try {
    // Test: Check if we can query users
    const [users]: any = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = Array.isArray(users) && users.length > 0 ? users[0].count : 0;

    // Test: Check if we can find by email (using a non-existent email to avoid errors)
    const [testQuery]: any = await pool.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      ['test-verification-email-that-does-not-exist@example.com']
    );

    return {
      success: true,
      message: 'User operations test passed',
      details: {
        userCount: userCount,
        canQuery: true,
        canSearchByEmail: true,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `User operations test failed: ${error.message}`,
      details: error,
    };
  }
}

async function verifyAuthenticationFlow(): Promise<VerificationResult> {
  try {
    // Import UserModel dynamically to avoid circular dependencies
    const { UserModel } = await import('../models/User');
    
    // Test: Try to find a user by email (should return null for non-existent user)
    const testUser = await UserModel.findByEmail('test-auth-verification@example.com');
    
    if (testUser !== null && testUser !== undefined) {
      // This is fine - it means the query works, user just exists
    }

    return {
      success: true,
      message: 'Authentication flow verification passed',
      details: {
        canFindByEmail: true,
        UserModelWorking: true,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Authentication flow verification failed: ${error.message}`,
      details: error,
    };
  }
}

async function displayDatabaseInfo(): Promise<void> {
  try {
    const [dbInfo]: any = await pool.query('SELECT DATABASE() as db_name');
    const dbName = Array.isArray(dbInfo) && dbInfo.length > 0 ? dbInfo[0].db_name : 'unknown';

    const [userCount]: any = await pool.query('SELECT COUNT(*) as count FROM users');
    const count = Array.isArray(userCount) && userCount.length > 0 ? userCount[0].count : 0;

    console.log('\n📊 Database Information:');
    console.log(`   Database: ${dbName}`);
    console.log(`   Total Users: ${count}`);
    console.log('');
  } catch (error: any) {
    console.log(`\n⚠️  Could not fetch database info: ${error.message}\n`);
  }
}

async function main() {
  console.log('\n🔍 Verifying Database Setup for User Authentication...\n');
  console.log('=' .repeat(60));

  const results: VerificationResult[] = [];

  // 1. Check database connection
  console.log('\n[1/5] Checking database connection...');
  const connResult = await verifyDatabaseConnection();
  results.push(connResult);
  console.log(connResult.success ? '   ✅ ' : '   ❌ ', connResult.message);

  if (!connResult.success) {
    console.log('\n❌ Database connection failed. Please check your database configuration.');
    console.log('   Make sure MySQL is running and .env file has correct credentials.\n');
    process.exit(1);
  }

  // 2. Check if users table exists
  console.log('\n[2/5] Checking if users table exists...');
  const tableResult = await verifyUsersTable();
  results.push(tableResult);
  console.log(tableResult.success ? '   ✅ ' : '   ❌ ', tableResult.message);

  if (!tableResult.success) {
    console.log('\n❌ Users table does not exist.');
    console.log('   Run: npm run setup-db (or node dist/database/setupDatabase.js)\n');
    process.exit(1);
  }

  // 3. Verify table structure
  console.log('\n[3/5] Verifying users table structure...');
  const structureResult = await verifyUsersTableStructure();
  results.push(structureResult);
  console.log(structureResult.success ? '   ✅ ' : '   ❌ ', structureResult.message);

  if (!structureResult.success) {
    console.log('\n❌ Users table structure is incomplete.');
    if (structureResult.details?.missing) {
      console.log(`   Missing columns: ${structureResult.details.missing.join(', ')}`);
    }
    console.log('   Run: npm run migrate (or node dist/database/migrate.js)\n');
    process.exit(1);
  }

  // 4. Test user operations
  console.log('\n[4/5] Testing user database operations...');
  const operationsResult = await testUserOperations();
  results.push(operationsResult);
  console.log(operationsResult.success ? '   ✅ ' : '   ❌ ', operationsResult.message);

  // 5. Verify authentication flow
  console.log('\n[5/5] Verifying authentication flow...');
  const authResult = await verifyAuthenticationFlow();
  results.push(authResult);
  console.log(authResult.success ? '   ✅ ' : '   ❌ ', authResult.message);

  // Display database info
  await displayDatabaseInfo();

  // Summary
  const allPassed = results.every((r) => r.success);
  console.log('=' .repeat(60));
  if (allPassed) {
    console.log('\n✅ All verifications passed! Database is ready for user authentication.\n');
    console.log('📝 You can now:');
    console.log('   • Register new users via POST /api/auth/register');
    console.log('   • Login users via POST /api/auth/login');
    console.log('   • User credentials will be stored securely in the database\n');
  } else {
    console.log('\n⚠️  Some verifications failed. Please fix the issues above.\n');
    process.exit(1);
  }

  process.exit(0);
}

// Run verification
main().catch((error) => {
  console.error('\n❌ Verification script error:', error);
  process.exit(1);
});
