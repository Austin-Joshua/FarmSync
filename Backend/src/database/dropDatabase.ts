import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function dropDatabase() {
  const adminConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
  };

  const dbName = process.env.DB_NAME || 'farmsync_db';

  try {
    const connection = await mysql.createConnection(adminConfig);
    console.log(`Dropping database ${dbName}...`);
    await connection.query(`DROP DATABASE IF EXISTS ${dbName}`);
    console.log(`Database ${dbName} dropped successfully!`);
    await connection.end();
    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

dropDatabase();
