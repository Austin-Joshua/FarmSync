const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '123456',
      database: 'farmsync_db'
    });

    // Create a test user
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    
    await conn.query(
      'INSERT INTO users (id, name, email, password_hash, role, location) VALUES (UUID(), ?, ?, ?, ?, ?)',
      ['Test Farmer', 'test@farmsync.com', hashedPassword, 'farmer', 'Test Location']
    );

    // Create a test settings record
    const [users] = await conn.query(
      'SELECT id FROM users WHERE email = ?',
      ['test@farmsync.com']
    );

    if (users.length > 0) {
      const userId = users[0].id;
      
      try {
        await conn.query(
          'INSERT INTO user_settings (user_id, enable_history_saving, auto_save_stock_records, auto_save_income_records, notifications_enabled) VALUES (?, true, true, true, true)',
          [userId]
        );
      } catch (err) {
        // Settings might already exist
      }
    }

    await conn.end();
    console.log('✅ Test user created: test@farmsync.com / Test@123');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
