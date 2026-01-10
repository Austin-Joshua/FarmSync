-- Add crop_recommendations table for ML predictions
-- Run this if the table doesn't exist in your database

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
