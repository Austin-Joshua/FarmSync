const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '123456',
      database: 'farmsync_db',
      multipleStatements: true
    });

    const schema = `
    CREATE TABLE IF NOT EXISTS sessions (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id CHAR(36) NOT NULL,
        token TEXT NOT NULL,
        device_info VARCHAR(255),
        browser VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS disease_scans (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id CHAR(36) NOT NULL,
        crop_name VARCHAR(255) NOT NULL,
        disease_name VARCHAR(255) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        confidence DECIMAL(5, 2) DEFAULT 0,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        location_name VARCHAR(255),
        image_url TEXT,
        notes TEXT,
        scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id CHAR(36) NOT NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        resource_id CHAR(36),
        details TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS monthly_income (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id CHAR(36) NOT NULL,
        month INT NOT NULL,
        year INT NOT NULL,
        total_income DECIMAL(12, 2) DEFAULT 0,
        crops_sold INT DEFAULT 0,
        average_price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS monthly_stock_usage (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id CHAR(36) NOT NULL,
        item_name VARCHAR(255),
        item_type VARCHAR(50),
        quantity_used DECIMAL(10, 2),
        remaining_stock DECIMAL(10, 2),
        unit VARCHAR(20),
        month INT,
        year INT,
        date_recorded DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS crop_recommendations (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id CHAR(36) NOT NULL,
        farm_id CHAR(36),
        n_value DECIMAL(10, 2),
        p_value DECIMAL(10, 2),
        k_value DECIMAL(10, 2),
        temperature DECIMAL(5, 2),
        humidity DECIMAL(5, 2),
        ph DECIMAL(4, 2),
        rainfall DECIMAL(10, 2),
        recommended_crop VARCHAR(100),
        confidence DECIMAL(5, 4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    `;

    await conn.query(schema);
    await conn.end();
    console.log('✅ Additional tables created successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
