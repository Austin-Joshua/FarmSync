-- Migration: Add land_size and soil_type columns to users table
-- Run this script to update existing database

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS land_size DECIMAL(10, 2) DEFAULT 0 AFTER location,
ADD COLUMN IF NOT EXISTS soil_type VARCHAR(100) AFTER land_size;
