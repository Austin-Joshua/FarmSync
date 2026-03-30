import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'farmsync_db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Connection timeout (valid MySQL2 option)
  connectTimeout: 5000, // 5 seconds
};

export const pool = mysql.createPool(poolConfig);

// Test database connection (non-blocking, with timeout)
const testConnection = async () => {
  try {
    const connection = await Promise.race([
      pool.getConnection(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection test timeout')), 5000)
      )
    ]) as any;
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (err: any) {
    console.error('⚠️ Database connection test failed:', err.message);
    console.error('   The server will continue, but database operations may fail.');
  }
};

// Run test in background (don't block server startup)
testConnection();

export default pool;
