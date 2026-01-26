// Helper functions for MySQL queries
import { Pool } from 'mysql2/promise';

// Add timeout wrapper to prevent hanging queries
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), timeoutMs)
    )
  ]);
}

// Helper to get connection with timeout
async function getConnectionWithTimeout(pool: Pool, timeoutMs: number = 5000): Promise<any> {
  return withTimeout(pool.getConnection(), timeoutMs);
}

export async function query<T = any>(
  pool: Pool,
  sql: string,
  params?: any[]
): Promise<T[]> {
  let connection;
  try {
    // Get connection with timeout
    connection = await getConnectionWithTimeout(pool, 5000);
    const [rows] = await withTimeout(connection.query(sql, params), 5000);
    return rows as T[];
  } catch (error: any) {
    console.error('Database query error:', error);
    if (error.message.includes('timeout')) {
      throw new Error('Database query timed out. Please check database connection.');
    }
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      throw new Error('Cannot connect to database. Please check if MySQL is running.');
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function queryOne<T = any>(
  pool: Pool,
  sql: string,
  params?: any[]
): Promise<T | null> {
  try {
    const rows = await query<T>(pool, sql, params);
    return rows[0] || null;
  } catch (error: any) {
    if (error.message.includes('timeout')) {
      throw error; // Re-throw timeout errors
    }
    throw error;
  }
}

export async function execute(
  pool: Pool,
  sql: string,
  params?: any[]
): Promise<any> {
  let connection;
  try {
    // Get connection with timeout
    connection = await getConnectionWithTimeout(pool, 5000);
    console.log('Executing SQL:', sql.substring(0, 100) + '...');
    console.log('Params:', params ? params.map(p => p === null ? 'NULL' : (typeof p === 'string' ? p.substring(0, 20) : p)) : 'none');
    const [result] = await withTimeout(connection.execute(sql, params), 5000);
    console.log('Execute result:', {
      affectedRows: (result as any)?.affectedRows,
      insertId: (result as any)?.insertId,
    });
    return result as any;
  } catch (error: any) {
    console.error('Database execute error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    if (error.message.includes('timeout')) {
      throw new Error('Database operation timed out. Please check database connection.');
    }
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      throw new Error('Cannot connect to database. Please check if MySQL is running.');
    }
    // Re-throw with original error for better debugging
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
