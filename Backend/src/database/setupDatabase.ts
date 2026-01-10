import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const adminConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  multipleStatements: true,
};

async function setupDatabase() {
  let connection;

  try {
    console.log('Connecting to MySQL...');
    
    // Connect without database first
    connection = await mysql.createConnection(adminConfig);
    
    // Check if database exists
    const dbName = process.env.DB_NAME || 'farmsync_db';
    const [databases] = await connection.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [dbName]
    );

    if (Array.isArray(databases) && databases.length === 0) {
      console.log(`Creating database ${dbName}...`);
      await connection.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created successfully!`);
    } else {
      console.log(`Database ${dbName} already exists.`);
    }

    await connection.end();

    // Now connect to the new database and create tables
    const dbConfig = {
      ...adminConfig,
      database: dbName,
    };

    connection = await mysql.createConnection(dbConfig);
    console.log(`Connected to ${dbName}...`);

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    console.log('Creating tables...');
    await connection.query(schema);
    console.log('Tables created successfully!');

    await connection.end();
    console.log('Database setup completed successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('Database setup failed:', error.message);
    console.error(error);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

setupDatabase();
