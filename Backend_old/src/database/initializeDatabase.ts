import { pool } from '../config/database';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';

/**
 * Comprehensive Database Initialization & Verification Script
 * This script ensures all required tables are properly created and indexed
 */

const REQUIRED_TABLES = [
  'users',
  'farms',
  'fields',
  'crop_types',
  'crops',
  'fertilizers',
  'pesticides',
  'irrigations',
  'expenses',
  'yields',
  'soil_types',
  'stock_items',
  'monthly_stock_usage',
  'monthly_income',
  'weather_alerts',
  'push_subscriptions',
  'sessions',
  'password_reset_tokens',
  'two_factor_auth',
  'audit_logs',
  'calendar_events',
  'crop_calendar',
  'recommendations',
  'user_settings',
  'market_price_alerts',
  'disease_scans'
];

export class DatabaseInitializer {
  /**
   * Read SQL schema file and execute all queries
   */
  static async initializeSchema(): Promise<void> {
    try {
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
      
      // Split by semicolon and filter empty statements
      const statements = schemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      const connection = await pool.getConnection();
      
      try {
        for (const statement of statements) {
          if (statement.length > 0) {
            await connection.execute(statement);
            logger.info(`Executed: ${statement.substring(0, 50)}...`);
          }
        }
        logger.info('✅ Database schema initialized successfully');
      } finally {
        connection.release();
      }
    } catch (error) {
      logger.error('❌ Error initializing database schema:', error);
      throw error;
    }
  }

  /**
   * Verify that all required tables exist
   */
  static async verifyTables(): Promise<boolean> {
    try {
      const connection = await pool.getConnection();
      
      try {
        const dbName = process.env.DB_NAME || 'farmsync_db';
        
        for (const tableName of REQUIRED_TABLES) {
          const [result]: any = await connection.execute(
            `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
            [dbName, tableName]
          );

          if (result.length === 0) {
            logger.warn(`⚠️ Table '${tableName}' not found. Will be created by schema.`);
          }
        }

        logger.info('✅ Table verification complete');
        return true;
      } finally {
        connection.release();
      }
    } catch (error) {
      logger.error('❌ Error verifying tables:', error);
      return false;
    }
  }

  /**
   * Create essential indexes for performance
   */
  static async createIndexes(): Promise<void> {
    try {
      const indexes = [
        // User indexes
        'ALTER TABLE users ADD INDEX idx_email (email)',
        'ALTER TABLE users ADD INDEX idx_role (role)',
        
        // Farm indexes
        'ALTER TABLE farms ADD INDEX idx_farmer_id (farmer_id)',
        'ALTER TABLE farms ADD INDEX idx_created_at (created_at)',
        
        // Crop indexes
        'ALTER TABLE crops ADD INDEX idx_farm_id (farm_id)',
        'ALTER TABLE crops ADD INDEX idx_status (status)',
        'ALTER TABLE crops ADD INDEX idx_sowing_date (sowing_date)',
        
        // Expense indexes
        'ALTER TABLE expenses ADD INDEX idx_farm_id (farm_id)',
        'ALTER TABLE expenses ADD INDEX idx_category (category)',
        'ALTER TABLE expenses ADD INDEX idx_date (date)',
        
        // Yield indexes
        'ALTER TABLE yields ADD INDEX idx_crop_id (crop_id)',
        'ALTER TABLE yields ADD INDEX idx_harvest_date (harvest_date)',
        
        // Irrigation indexes
        'ALTER TABLE irrigations ADD INDEX idx_crop_id (crop_id)',
        'ALTER TABLE irrigations ADD INDEX idx_date (date)',
        
        // Weather alerts indexes
        'ALTER TABLE weather_alerts ADD INDEX idx_farmer_id (farmer_id)',
        'ALTER TABLE weather_alerts ADD INDEX idx_is_read (is_read)',
        
        // Audit logs indexes
        'ALTER TABLE audit_logs ADD INDEX idx_user_id (user_id)',
        'ALTER TABLE audit_logs ADD INDEX idx_created_at (created_at)',
        
        // Calendar events indexes
        'ALTER TABLE calendar_events ADD INDEX idx_farmer_id (farmer_id)',
        'ALTER TABLE calendar_events ADD INDEX idx_event_date (event_date)'
      ];

      const connection = await pool.getConnection();
      
      try {
        for (const indexSQL of indexes) {
          try {
            await connection.execute(indexSQL);
            logger.info(`✅ Index created: ${indexSQL.substring(0, 40)}...`);
          } catch (error: any) {
            // Index might already exist, which is fine
            if (error.code !== 'ER_DUP_INDEX') {
              logger.warn(`⚠️ Could not create index: ${indexSQL.substring(0, 40)}...`);
            }
          }
        }
        logger.info('✅ Indexes verification complete');
      } finally {
        connection.release();
      }
    } catch (error) {
      logger.error('❌ Error creating indexes:', error);
    }
  }

  /**
   * Seed initial data (soil types, crop types)
   */
  static async seedInitialData(): Promise<void> {
    try {
      const connection = await pool.getConnection();
      
      try {
        // Check if soil types exist
        const [soilResult]: any = await connection.execute('SELECT COUNT(*) as count FROM soil_types');
        
        if (soilResult[0].count === 0) {
          logger.info('Seeding soil types...');
          const soilTypes = [
            'Loamy Soil',
            'Clayey Soil',
            'Sandy Soil',
            'Silty Soil',
            'Alluvial Soil',
            'Laterite Soil',
            'Black Soil',
            'Red Soil',
            'Saline Soil',
            'Peaty Soil',
            'Volcanic Soil',
            'Calcareous Soil'
          ];

          for (const soilType of soilTypes) {
            await connection.execute(
              'INSERT INTO soil_types (name, description) VALUES (?, ?)',
              [soilType, `${soilType} - Suitable for various crops`]
            );
          }
          logger.info('✅ Soil types seeded successfully');
        }

        // Check if crop types exist
        const [cropResult]: any = await connection.execute('SELECT COUNT(*) as count FROM crop_types');
        
        if (cropResult[0].count === 0) {
          logger.info('Seeding crop types...');
          const cropTypes = [
            { name: 'Rice', category: 'Grains', season: 'kharif', yield: 50 },
            { name: 'Wheat', category: 'Grains', season: 'rabi', yield: 45 },
            { name: 'Maize', category: 'Grains', season: 'kharif', yield: 40 },
            { name: 'Cotton', category: 'Fiber', season: 'kharif', yield: 15 },
            { name: 'Sugarcane', category: 'Cash Crop', season: 'year-round', yield: 60 },
            { name: 'Tomato', category: 'Vegetables', season: 'year-round', yield: 30 },
            { name: 'Potato', category: 'Vegetables', season: 'rabi', yield: 25 },
            { name: 'Onion', category: 'Vegetables', season: 'rabi', yield: 20 },
            { name: 'Groundnut', category: 'Oilseeds', season: 'kharif', yield: 18 },
            { name: 'Soybean', category: 'Oilseeds', season: 'kharif', yield: 22 }
          ];

          for (const crop of cropTypes) {
            await connection.execute(
              'INSERT INTO crop_types (name, category, season, average_yield, growth_period, water_requirement) VALUES (?, ?, ?, ?, ?, ?)',
              [crop.name, crop.category, crop.season, crop.yield, 120, 'medium']
            );
          }
          logger.info('✅ Crop types seeded successfully');
        }
      } finally {
        connection.release();
      }
    } catch (error) {
      logger.error('❌ Error seeding initial data:', error);
    }
  }

  /**
   * Get database statistics
   */
  static async getDatabaseStats(): Promise<any> {
    try {
      const connection = await pool.getConnection();
      
      try {
        const stats: any = {};
        
        for (const tableName of REQUIRED_TABLES) {
          const [result]: any = await connection.execute(
            `SELECT COUNT(*) as count FROM ${tableName}`
          );
          stats[tableName] = result[0].count;
        }

        return stats;
      } finally {
        connection.release();
      }
    } catch (error) {
      logger.error('❌ Error getting database stats:', error);
      return {};
    }
  }

  /**
   * Perform full database initialization
   */
  static async fullInitialization(): Promise<void> {
    try {
      logger.info('🔄 Starting full database initialization...');
      
      // Step 1: Initialize schema
      await this.initializeSchema();
      
      // Step 2: Verify tables
      await this.verifyTables();
      
      // Step 3: Create indexes
      await this.createIndexes();
      
      // Step 4: Seed initial data
      await this.seedInitialData();
      
      // Step 5: Get and log statistics
      const stats = await this.getDatabaseStats();
      logger.info('✅ Database initialization complete');
      logger.info('Database Statistics:', stats);
      
    } catch (error) {
      logger.error('❌ Full database initialization failed:', error);
      throw error;
    }
  }
}

export default DatabaseInitializer;
