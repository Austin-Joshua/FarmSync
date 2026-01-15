import express, { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import logger from '../utils/logger';
import { auth } from '../middleware/auth';

const router = Router();

/**
 * GET /health/database
 * Check database connection and health status
 */
router.get('/database', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Test database connection
      await connection.ping();
      
      // Get connection pool stats
      const poolStats = {
        connectionLimit: 10,
        queueLimit: 0,
        waitForConnections: true
      };

      res.json({
        status: '✅ Connected',
        database: process.env.DB_NAME || 'farmsync_db',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '3306',
        poolStats,
        timestamp: new Date().toISOString()
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    logger.error('Database health check failed:', error);
    res.status(500).json({
      status: '❌ Connection Failed',
      error: error.message,
      database: process.env.DB_NAME || 'farmsync_db',
      host: process.env.DB_HOST || 'localhost',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /health/tables
 * Check if all required tables exist
 */
router.get('/tables', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      const dbName = process.env.DB_NAME || 'farmsync_db';
      const [tables]: any = await connection.execute(
        `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
        [dbName]
      );

      const tableNames = tables.map((t: any) => t.TABLE_NAME);
      
      res.json({
        status: '✅ Success',
        database: dbName,
        tableCount: tableNames.length,
        tables: tableNames,
        timestamp: new Date().toISOString()
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    logger.error('Table check failed:', error);
    res.status(500).json({
      status: '❌ Failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /health/stats
 * Get database statistics
 */
router.get('/stats', auth, async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      const stats: any = {};
      const tables = [
        'users', 'farms', 'fields', 'crops', 'expenses', 'yields',
        'irrigations', 'fertilizers', 'pesticides', 'weather_alerts',
        'audit_logs', 'calendar_events', 'stock_items'
      ];

      for (const table of tables) {
        const [result]: any = await connection.execute(
          `SELECT COUNT(*) as count FROM ${table}`
        );
        stats[table] = result[0].count;
      }

      res.json({
        status: '✅ Success',
        database: process.env.DB_NAME || 'farmsync_db',
        statistics: stats,
        timestamp: new Date().toISOString()
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    logger.error('Stats collection failed:', error);
    res.status(500).json({
      status: '❌ Failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /health/frontend-connection
 * Verify frontend-backend connection status
 */
router.get('/frontend-connection', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      await connection.ping();
      
      res.json({
        status: '✅ Frontend-Backend Connection OK',
        frontend: req.get('origin') || 'Unknown',
        backend: `http://localhost:${process.env.PORT || 5174}`,
        database: '✅ Connected',
        apiVersion: 'v1',
        timestamp: new Date().toISOString()
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    res.status(500).json({
      status: '❌ Connection Failed',
      error: error.message,
      frontend: req.get('origin') || 'Unknown',
      backend: `http://localhost:${process.env.PORT || 5174}`,
      database: '❌ Not Connected',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /health/test-query
 * Execute a test query
 */
router.post('/test-query', auth, async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      const [result]: any = await connection.execute('SELECT 1 as test');
      
      res.json({
        status: '✅ Query Successful',
        result: result,
        timestamp: new Date().toISOString()
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    logger.error('Test query failed:', error);
    res.status(500).json({
      status: '❌ Query Failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
