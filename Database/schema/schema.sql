-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (linked to Supabase Auth)
-- Note: Supabase handles authentication in the 'auth' schema.
-- We create a public 'users' table to store additional profile info.
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('farmer', 'admin')),
    location TEXT,
    land_size DECIMAL(10, 2) DEFAULT 0,
    soil_type TEXT,
    picture_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Soil types master table
CREATE TABLE soil_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Farms/Land table
CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    land_size DECIMAL(10, 2) NOT NULL,
    soil_type_id UUID REFERENCES soil_types(id) ON DELETE SET NULL,
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Crop types master table
CREATE TABLE crop_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    season TEXT NOT NULL CHECK (season IN ('kharif', 'rabi', 'zaid', 'year-round')),
    suitable_soil_types JSONB,
    average_yield DECIMAL(10, 2),
    growth_period INT,
    water_requirement TEXT CHECK (water_requirement IN ('low', 'medium', 'high')),
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Crops table
CREATE TABLE crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    crop_type_id UUID REFERENCES crop_types(id) ON DELETE SET NULL,
    season TEXT,
    sowing_date DATE NOT NULL,
    harvest_date DATE,
    status TEXT NOT NULL CHECK (status IN ('active', 'harvested', 'planned')),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Fertilizers table
CREATE TABLE fertilizers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    date_of_usage DATE NOT NULL,
    crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Pesticides table
CREATE TABLE pesticides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    date_of_usage DATE NOT NULL,
    crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Irrigation table
CREATE TABLE irrigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    method TEXT NOT NULL CHECK (method IN ('drip', 'manual', 'sprinkler')),
    date DATE NOT NULL,
    duration DECIMAL(5, 2) NOT NULL,
    crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL CHECK (category IN ('seeds', 'labor', 'fertilizers', 'pesticides', 'irrigation', 'other')),
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Yields table
CREATE TABLE yields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    quantity DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    quality TEXT NOT NULL CHECK (quality IN ('excellent', 'good', 'average')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Stock/Inventory table
CREATE TABLE stock_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('seeds', 'fertilizer', 'pesticide')),
    quantity DECIMAL(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Disease scans table
CREATE TABLE disease_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    disease_name TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    confidence DECIMAL(5, 2) DEFAULT 0,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location_name TEXT,
    image_url TEXT,
    notes TEXT,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Monthly income history
CREATE TABLE monthly_income (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INT NOT NULL,
    total_income DECIMAL(12, 2) NOT NULL DEFAULT 0,
    crops_sold INT NOT NULL DEFAULT 0,
    average_price DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, month, year)
);

-- 14. Monthly stock usage history
CREATE TABLE monthly_stock_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('seeds', 'fertilizer', 'pesticide')),
    quantity_used DECIMAL(10, 2) NOT NULL,
    remaining_stock DECIMAL(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INT NOT NULL,
    date_recorded DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. User settings
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enable_history_saving BOOLEAN DEFAULT true,
    auto_save_stock_records BOOLEAN DEFAULT true,
    auto_save_income_records BOOLEAN DEFAULT true,
    notifications_enabled BOOLEAN DEFAULT true,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Crop recommendations
CREATE TABLE crop_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
    n_value DECIMAL(10, 2) NOT NULL,
    p_value DECIMAL(10, 2) NOT NULL,
    k_value DECIMAL(10, 2) NOT NULL,
    temperature DECIMAL(5, 2) NOT NULL,
    humidity DECIMAL(5, 2) NOT NULL,
    ph DECIMAL(4, 2) NOT NULL,
    rainfall DECIMAL(10, 2) NOT NULL,
    recommended_crop TEXT NOT NULL,
    confidence DECIMAL(5, 4) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Push subscriptions
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, endpoint)
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_crop_types_updated_at BEFORE UPDATE ON crop_types FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON crops FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_stock_items_updated_at BEFORE UPDATE ON stock_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_disease_scans_updated_at BEFORE UPDATE ON disease_scans FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_monthly_income_updated_at BEFORE UPDATE ON monthly_income FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON push_subscriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE fertilizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesticides ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE yields ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_stock_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (User can only see their own data)
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Farms policy
CREATE POLICY "Users can manage their own farms" ON farms FOR ALL USING (auth.uid() = farmer_id);

-- Crops policy (via farm_id)
CREATE POLICY "Users can manage their own crops" ON crops FOR ALL USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = crops.farm_id AND farms.farmer_id = auth.uid())
);

-- Fertilizers, Pesticides, Irrigations, Yields (via crop -> farm)
CREATE POLICY "Users can manage their own fertilizers" ON fertilizers FOR ALL USING (
    EXISTS (SELECT 1 FROM crops JOIN farms ON crops.farm_id = farms.id WHERE crops.id = fertilizers.crop_id AND farms.farmer_id = auth.uid())
);
-- ... Repeat for others ...
