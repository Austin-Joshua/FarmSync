-- FarmSync Database Schema
-- Generated from Java Entity Models
-- Target Database: H2 / PostgreSQL compatible

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'farmer', 'admin'
    location VARCHAR(255),
    land_size DOUBLE PRECISION,
    soil_type VARCHAR(100),
    picture_url TEXT,
    fcm_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Soil Types Table
CREATE TABLE IF NOT EXISTS soil_types (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Farms Table
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    land_size DOUBLE PRECISION NOT NULL,
    soil_type_id UUID REFERENCES soil_types(id),
    farmer_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Crop Types Table
CREATE TABLE IF NOT EXISTS crop_types (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 5. Crops Table
CREATE TABLE IF NOT EXISTS crops (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    crop_type_id UUID REFERENCES crop_types(id),
    season VARCHAR(50),
    sowing_date DATE NOT NULL,
    harvest_date DATE,
    status VARCHAR(50) NOT NULL, -- 'active', 'harvested', 'planned'
    farm_id UUID NOT NULL REFERENCES farms(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY,
    category VARCHAR(100) NOT NULL, -- 'seeds', 'labor', 'fertilizers', etc.
    description TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    date DATE NOT NULL,
    farm_id UUID NOT NULL REFERENCES farms(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Crop Recommendations Table
CREATE TABLE IF NOT EXISTS crop_recommendations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    farm_id UUID REFERENCES farms(id),
    n_value DOUBLE PRECISION NOT NULL,
    p_value DOUBLE PRECISION NOT NULL,
    k_value DOUBLE PRECISION NOT NULL,
    temperature DOUBLE PRECISION NOT NULL,
    humidity DOUBLE PRECISION NOT NULL,
    ph DOUBLE PRECISION NOT NULL,
    rainfall DOUBLE PRECISION NOT NULL,
    recommended_crop VARCHAR(255) NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Disease Scans Table
CREATE TABLE IF NOT EXISTS disease_scans (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    crop_name VARCHAR(255) NOT NULL,
    disease_name VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    confidence DOUBLE PRECISION,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_name VARCHAR(255),
    image_url TEXT,
    notes TEXT,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Stock Items Table
CREATE TABLE IF NOT EXISTS stock_items (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    item_name VARCHAR(255) NOT NULL,
    item_type VARCHAR(100) NOT NULL, -- 'seeds', 'fertilizer', 'pesticide'
    quantity DOUBLE PRECISION NOT NULL,
    unit VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Yields Table
CREATE TABLE IF NOT EXISTS yields (
    id UUID PRIMARY KEY,
    crop_id UUID NOT NULL REFERENCES crops(id),
    quantity DOUBLE PRECISION NOT NULL,
    unit VARCHAR(50) NOT NULL,
    harvest_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_alerts BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Fertilizers Table
CREATE TABLE IF NOT EXISTS fertilizers (
    id UUID PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    date_of_usage DATE NOT NULL,
    crop_id UUID NOT NULL REFERENCES crops(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Irrigations Table
CREATE TABLE IF NOT EXISTS irrigations (
    id UUID PRIMARY KEY,
    method VARCHAR(50) NOT NULL, -- 'drip', 'manual', 'sprinkler'
    date DATE NOT NULL,
    duration DOUBLE PRECISION NOT NULL,
    crop_id UUID NOT NULL REFERENCES crops(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Monthly Income Table
CREATE TABLE IF NOT EXISTS monthly_income (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    total_income DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    crops_sold INTEGER NOT NULL DEFAULT 0,
    average_price DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, month, year)
);

-- 16. Pesticides Table
CREATE TABLE IF NOT EXISTS pesticides (
    id UUID PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    date_of_usage DATE NOT NULL,
    crop_id UUID NOT NULL REFERENCES crops(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. Monthly Stock Usage Table
CREATE TABLE IF NOT EXISTS monthly_stock_usage (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    item_name VARCHAR(255) NOT NULL,
    item_type VARCHAR(100) NOT NULL, -- 'seeds', 'fertilizer', 'pesticide'
    quantity_used DOUBLE PRECISION NOT NULL,
    remaining_stock DOUBLE PRECISION NOT NULL,
    unit VARCHAR(50) NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    date_recorded DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Calendar Events Table
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- 'planting', 'harvest', 'fertilizer', 'pesticide', 'irrigation', 'other'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    reminder_days INTEGER DEFAULT 7,
    is_completed BOOLEAN DEFAULT FALSE,
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ══════════════════════════════════════════════════════
-- PERFORMANCE INDEXES
-- Phase 7 optimization: cover all high-frequency query
-- patterns in the multi-tenant FarmSync architecture.
-- ══════════════════════════════════════════════════════

-- Calendar events query index
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON calendar_events(user_id, event_date);

-- User lookups (login, profile, JWT validation)
CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role        ON users(role);

-- Farm queries by farmer (most common multi-tenant filter)
CREATE INDEX IF NOT EXISTS idx_farms_farmer_id   ON farms(farmer_id);

-- Crops by farm (dashboard, crop list)
CREATE INDEX IF NOT EXISTS idx_crops_farm_id     ON crops(farm_id);
CREATE INDEX IF NOT EXISTS idx_crops_status      ON crops(status);
CREATE INDEX IF NOT EXISTS idx_crops_farm_status ON crops(farm_id, status);

-- Expenses by farm and date (finance dashboard, monthly reports)
CREATE INDEX IF NOT EXISTS idx_expenses_farm_id  ON expenses(farm_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date     ON expenses(date);

-- Disease scans by user (scan history page)
CREATE INDEX IF NOT EXISTS idx_disease_user_id   ON disease_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_disease_scanned   ON disease_scans(scanned_at);

-- Yields by crop (yield tracking dashboard)
CREATE INDEX IF NOT EXISTS idx_yields_crop_id    ON yields(crop_id);

-- Stock items by user (stock management page)
CREATE INDEX IF NOT EXISTS idx_stock_user_id     ON stock_items(user_id);

-- Crop recommendations by user (history queries)
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON crop_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_farm ON crop_recommendations(farm_id);

-- Audit logs by user and timestamp (admin audit trail)
CREATE INDEX IF NOT EXISTS idx_audit_user_id     ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created     ON audit_logs(created_at);

-- Monthly income composite (unique constraint already exists, index supports analytics)
CREATE INDEX IF NOT EXISTS idx_income_user_year  ON monthly_income(user_id, year);

-- Fertilizer and pesticide usage by crop
CREATE INDEX IF NOT EXISTS idx_fertilizers_crop  ON fertilizers(crop_id);
CREATE INDEX IF NOT EXISTS idx_pesticides_crop   ON pesticides(crop_id);

-- Irrigations by crop
CREATE INDEX IF NOT EXISTS idx_irrigations_crop  ON irrigations(crop_id);
