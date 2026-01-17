import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /api/db-test
 * Test database connection by running "SELECT 1"
 * No authentication required
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();

  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    try {
      // Execute simple test query
      const [result]: any = await connection.execute('SELECT 1 as test');

      const duration = Date.now() - startTime;

      // Connection successful
      res.status(200).json({
        status: 'success',
        message: 'Database connection successful',
        database: {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || '3306',
          name: process.env.DB_NAME || 'farmsync_db',
        },
        query: 'SELECT 1',
        result: result,
        responseTime: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });

      logger.info('Database test successful', { duration });
    } finally {
      // Always release the connection
      connection.release();
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Log the error
    logger.error('Database test failed', {
      error: error.message,
      duration,
      code: error.code,
    });

    // Handle specific database errors
    let statusCode = 500;
    let errorMessage = 'Database connection failed';

    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      errorMessage = 'Database connection was lost';
      statusCode = 503;
    } else if (error.code === 'ER_ACCESS_DENIED_FOR_USER') {
      errorMessage = 'Invalid database credentials';
      statusCode = 401;
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      errorMessage = 'Database does not exist';
      statusCode = 404;
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused - database server not running';
      statusCode = 503;
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Database host not found';
      statusCode = 503;
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection timeout';
      statusCode = 504;
    }

    res.status(statusCode).json({
      status: 'error',
      message: errorMessage,
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '3306',
        name: process.env.DB_NAME || 'farmsync_db',
      },
      error: {
        message: error.message,
        code: error.code,
      },
      responseTime: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
