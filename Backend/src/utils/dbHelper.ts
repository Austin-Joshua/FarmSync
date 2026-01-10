// Helper functions for MySQL queries
import { Pool } from 'mysql2/promise';

export async function query<T = any>(
  pool: Pool,
  sql: string,
  params?: any[]
): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

export async function queryOne<T = any>(
  pool: Pool,
  sql: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(pool, sql, params);
  return rows[0] || null;
}

export async function execute(
  pool: Pool,
  sql: string,
  params?: any[]
): Promise<any> {
  const [result] = await pool.execute(sql, params);
  return result as any;
}
