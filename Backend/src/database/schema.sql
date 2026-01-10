-- Digital Farm Record Management System Database Schema (MySQL)

-- Users table (Farmers & Admins)
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('farmer', 'admin')),
    location VARCHAR(255),
    land_size DECIMAL(10, 2) DEFAULT 0,
    soil_type VARCHAR(100),
    google_id VARCHAR(255) UNIQUE,
    apple_id VARCHAR(255) UNIQUE,
    microsoft_id VARCHAR(255) UNIQUE,
    picture_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Soil types master table
CREATE TABLE IF NOT EXISTS soil_types (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farms/Land table
CREATE TABLE IF NOT EXISTS farms (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    land_size DECIMAL(10, 2) NOT NULL,
    soil_type_id CHAR(36),
    farmer_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (soil_type_id) REFERENCES soil_types(id) ON DELETE SET NULL,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Crop types master table (managed by admin)
CREATE TABLE IF NOT EXISTS crop_types (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    season VARCHAR(50) NOT NULL CHECK (season IN ('kharif', 'rabi', 'zaid', 'year-round')),
    suitable_soil_types JSON,
    average_yield DECIMAL(10, 2),
    growth_period INT,
    water_requirement VARCHAR(20) CHECK (water_requirement IN ('low', 'medium', 'high')),
    description TEXT,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Crops table
CREATE TABLE IF NOT EXISTS crops (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    crop_type_id CHAR(36),
    season VARCHAR(50),
    sowing_date DATE NOT NULL,
    harvest_date DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'harvested', 'planned')),
    farm_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (crop_type_id) REFERENCES crop_types(id) ON DELETE SET NULL,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
);

-- Fertilizers table
CREATE TABLE IF NOT EXISTS fertilizers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    type VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    date_of_usage DATE NOT NULL,
    crop_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE
);

-- Pesticides table
CREATE TABLE IF NOT EXISTS pesticides (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    type VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    date_of_usage DATE NOT NULL,
    crop_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE
);

-- Irrigation table
CREATE TABLE IF NOT EXISTS irrigations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    method VARCHAR(50) NOT NULL CHECK (method IN ('drip', 'manual', 'sprinkler')),
    date DATE NOT NULL,
    duration DECIMAL(5, 2) NOT NULL,
    crop_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    category VARCHAR(50) NOT NULL CHECK (category IN ('seeds', 'labor', 'fertilizers', 'pesticides', 'irrigation', 'other')),
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    farm_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
);

-- Yields table
CREATE TABLE IF NOT EXISTS yields (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    crop_id CHAR(36) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    quality VARCHAR(20) NOT NULL CHECK (quality IN ('excellent', 'good', 'average')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE
);

-- Stock/Inventory table
CREATE TABLE IF NOT EXISTS stock_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('seeds', 'fertilizer', 'pesticide')),
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Disease scans table (with GPS metadata for heatmap)
CREATE TABLE IF NOT EXISTS disease_scans (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    crop_name VARCHAR(255) NOT NULL,
    disease_name VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    confidence DECIMAL(5, 2) DEFAULT 0,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location_name VARCHAR(255),
    image_url TEXT,
    notes TEXT,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_location (latitude, longitude),
    INDEX idx_disease (disease_name),
    INDEX idx_scanned_at (scanned_at)
);

-- Monthly income history table
CREATE TABLE IF NOT EXISTS monthly_income (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INT NOT NULL,
    total_income DECIMAL(12, 2) NOT NULL DEFAULT 0,
    crops_sold INT NOT NULL DEFAULT 0,
    average_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_month_year (user_id, month, year),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Monthly stock usage history table
CREATE TABLE IF NOT EXISTS monthly_stock_usage (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('seeds', 'fertilizer', 'pesticide')),
    quantity_used DECIMAL(10, 2) NOT NULL,
    remaining_stock DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INT NOT NULL,
    date_recorded DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) UNIQUE NOT NULL,
    enable_history_saving BOOLEAN DEFAULT true,
    auto_save_stock_records BOOLEAN DEFAULT true,
    auto_save_income_records BOOLEAN DEFAULT true,
    notifications_enabled BOOLEAN DEFAULT true,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_farms_farmer_id ON farms(farmer_id);
CREATE INDEX idx_crops_farm_id ON crops(farm_id);
CREATE INDEX idx_crops_status ON crops(status);
CREATE INDEX idx_expenses_farm_id ON expenses(farm_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_yields_crop_id ON yields(crop_id);
CREATE INDEX idx_stock_items_user_id ON stock_items(user_id);
CREATE INDEX idx_monthly_income_user_id ON monthly_income(user_id);
CREATE INDEX idx_monthly_income_month_year ON monthly_income(month, year);
CREATE INDEX idx_monthly_stock_usage_user_id ON monthly_stock_usage(user_id);

-- Crop Recommendations table (ML predictions)
CREATE TABLE IF NOT EXISTS crop_recommendations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    farm_id CHAR(36),
    n_value DECIMAL(10, 2) NOT NULL,
    p_value DECIMAL(10, 2) NOT NULL,
    k_value DECIMAL(10, 2) NOT NULL,
    temperature DECIMAL(5, 2) NOT NULL,
    humidity DECIMAL(5, 2) NOT NULL,
    ph DECIMAL(4, 2) NOT NULL,
    rainfall DECIMAL(10, 2) NOT NULL,
    recommended_crop VARCHAR(100) NOT NULL,
    confidence DECIMAL(5, 4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL
);

CREATE INDEX idx_crop_recommendations_user_id ON crop_recommendations(user_id);
CREATE INDEX idx_crop_recommendations_farm_id ON crop_recommendations(farm_id);
CREATE INDEX idx_crop_recommendations_created_at ON crop_recommendations(created_at);

-- Audit Logs table (for tracking system activity)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    action ENUM('login', 'logout', 'create', 'update', 'delete', 'view', 'export', 'admin_action') NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(36),
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at),
    INDEX idx_resource (resource_type, resource_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Push Subscriptions table (for push notifications)
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_endpoint (endpoint(255)),
    UNIQUE KEY unique_user_endpoint (user_id, endpoint(255)),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
