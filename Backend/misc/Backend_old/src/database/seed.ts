import { pool } from '../config/database';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('Starting database seeding...');
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Seed soil types
      const soilTypes = [
        { name: 'Alluvial', description: 'Rich in nutrients, suitable for most crops' },
        { name: 'Red Soil', description: 'Well-drained, suitable for cotton, wheat, pulses' },
        { name: 'Black Soil', description: 'High clay content, excellent for cotton and cereals' },
        { name: 'Laterite Soil', description: 'Rich in iron, suitable for tea, coffee, cashew' },
        { name: 'Mountain Soil', description: 'Suitable for fruits and vegetables' },
        { name: 'Desert Soil', description: 'Sandy, requires irrigation' },
      ];
      
      for (const soil of soilTypes) {
        await connection.query(
          'INSERT INTO soil_types (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = name',
          [soil.name, soil.description]
        );
      }
      
      // Seed crop types (master data)
      const cropTypes = [
        {
          name: 'Rice (Paddy)',
          category: 'grains',
          season: 'kharif',
          average_yield: 2500,
          growth_period: 120,
          water_requirement: 'high',
          description: 'Staple food crop, requires abundant water',
        },
        {
          name: 'Wheat',
          category: 'grains',
          season: 'rabi',
          average_yield: 3000,
          growth_period: 120,
          water_requirement: 'medium',
          description: 'Winter crop, major staple food',
        },
        {
          name: 'Sugarcane',
          category: 'cash crops',
          season: 'year-round',
          average_yield: 70000,
          growth_period: 365,
          water_requirement: 'high',
          description: 'Long duration crop, requires consistent irrigation',
        },
        {
          name: 'Cotton',
          category: 'cash crops',
          season: 'kharif',
          average_yield: 500,
          growth_period: 180,
          water_requirement: 'medium',
          description: 'Fiber crop, suitable for black soil',
        },
        {
          name: 'Tomato',
          category: 'vegetables',
          season: 'year-round',
          average_yield: 25000,
          growth_period: 90,
          water_requirement: 'medium',
          description: 'Popular vegetable crop',
        },
        {
          name: 'Potato',
          category: 'vegetables',
          season: 'rabi',
          average_yield: 20000,
          growth_period: 90,
          water_requirement: 'medium',
          description: 'Tuber crop, requires cool climate',
        },
      ];
      
      // Get admin user ID (create one if doesn't exist)
      const adminPassword = await bcrypt.hash('admin123', 10);
      const [adminResult] = await connection.query(
        `INSERT INTO users (name, email, password_hash, role) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE role = 'admin'`,
        ['System Admin', 'admin@farmsync.com', adminPassword, 'admin']
      ) as any[];
      
      let adminId;
      if (adminResult.insertId) {
        // New user created
        adminId = adminResult.insertId;
      } else {
        // User already exists, get the ID
        const [existingUser] = await connection.query(
          'SELECT id FROM users WHERE email = ?',
          ['admin@farmsync.com']
        ) as any[];
        adminId = existingUser[0].id;
      }
      
      for (const crop of cropTypes) {
        await connection.query(
          `INSERT INTO crop_types (name, category, season, average_yield, growth_period, water_requirement, description, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name = name`,
          [
            crop.name,
            crop.category,
            crop.season,
            crop.average_yield,
            crop.growth_period,
            crop.water_requirement,
            crop.description,
            adminId,
          ]
        );
      }
      
      // Create a default farmer user for testing
      const farmerPassword = await bcrypt.hash('farmer123', 10);
      await connection.query(
        `INSERT INTO users (name, email, password_hash, role, location) 
         VALUES (?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE name = name`,
        ['Test Farmer', 'farmer@test.com', farmerPassword, 'farmer', 'Coimbatore, Tamil Nadu']
      );
      
      await connection.commit();
      console.log('Database seeding completed successfully!');
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
