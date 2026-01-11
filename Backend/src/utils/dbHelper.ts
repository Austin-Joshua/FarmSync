// Helper functions for MySQL queries
import { Pool } from 'mysql2/promise';

// Add timeout wrapper to prevent hanging queries
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 7000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), timeoutMs)
    )
  ]);
}

export async function query<T = any>(
  pool: Pool,
  sql: string,
  params?: any[]
): Promise<T[]> {
  try {
    const [rows] = await withTimeout(pool.query(sql, params), 7000);
    return rows as T[];
  } catch (error: any) {
    console.error('Database query error:', error);
    if (error.message.includes('timeout')) {
      throw new Error('Database query timed out. Please check database connection.');
    }
    throw error;
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
  try {
    const [result] = await withTimeout(pool.execute(sql, params), 7000);
    return result as any;
  } catch (error: any) {
    console.error('Database execute error:', error);
    if (error.message.includes('timeout')) {
      throw new Error('Database operation timed out. Please check database connection.');
    }
    throw error;
  }
}
