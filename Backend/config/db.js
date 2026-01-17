const mysql = require('mysql2/promise');

// Database connection pool configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'farmsync_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // SSL configuration
  ssl: {
    rejectUnauthorized: false,
  },
});

// Export the pool for use in other modules
module.exports = { pool };
