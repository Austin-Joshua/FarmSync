// Type definitions for the Digital Farm Record Management System

export type UserRole = 'farmer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location?: string;
  land_size?: number;
  soil_type?: string;
  picture_url?: string;
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  landSize: number; // in acres
  soilType: string;
  farmerId: string;
}

export interface Crop {
  id: string;
  name: string;
  season: string;
  sowingDate: string;
  harvestDate: string;
  status: 'active' | 'harvested' | 'planned';
  farmId: string;
  // Dataset information
  category?: string;
  n?: number; // Nitrogen
  p?: number; // Phosphorus
  k?: number; // Potassium
  temperature?: number; // Celsius
  humidity?: number; // Percentage
  ph?: number; // Soil pH
  rainfall?: number; // mm
  growthPeriod?: number; // days
  waterRequirement?: 'low' | 'medium' | 'high';
  averageYield?: number; // kg per acre
}

export interface Fertilizer {
  id: string;
  type: string;
  quantity: number; // in kg
  dateOfUsage: string;
  cropId: string;
}

export interface Pesticide {
  id: string;
  type: string;
  quantity: number; // in liters
  dateOfUsage: string;
  cropId: string;
}

export interface Irrigation {
  id: string;
  method: 'drip' | 'manual' | 'sprinkler';
  date: string;
  duration: number; // in hours
  cropId: string;
}

export interface Expense {
  id: string;
  category: 'seeds' | 'labor' | 'fertilizers' | 'pesticides' | 'irrigation' | 'other';
  description: string;
  amount: number;
  date: string;
  farmId: string;
}

export interface Yield {
  id: string;
  cropId: string;
  quantity: number; // in kg
  date: string;
  quality: 'excellent' | 'good' | 'average';
}

// History and Analytics Types
export interface MonthlyIncome {
  id: string;
  userId: string;
  month: number; // 1-12
  year: number;
  totalIncome: number;
  cropsSold: number;
  averagePrice: number;
}

export interface StockRecord {
  id: string;
  userId: string;
  itemName: string; // seeds, fertilizer, pesticide
  itemType: 'seeds' | 'fertilizer' | 'pesticide';
  quantityUsed: number;
  remainingStock: number;
  unit: string; // kg, liters, etc.
  month: number;
  year: number;
  dateRecorded: string;
}

// Settings Types
export interface UserSettings {
  userId?: string;
  enableHistorySaving?: boolean;
  autoSaveStockRecords?: boolean;
  autoSaveIncomeRecords?: boolean;
  notificationsEnabled?: boolean;
  theme: 'light' | 'dark';
  language?: string;
  notifications?: boolean;
  currency?: string;
  dataRetention?: number;
  // New settings
  weatherAlerts?: boolean;
  stockAlertThreshold?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  dateFormat?: string;
  timeZone?: string;
  units?: 'metric' | 'imperial';
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  cropRecommendations?: boolean;
  irrigationReminders?: boolean;
  lowStockAlert?: boolean;
  climateWarnings?: boolean;
  harvestReminders?: boolean;
  systemUpdates?: boolean;
  dashboardWidgets?: string[];
}

// Admin Types
export interface CropType {
  id: string;
  name: string;
  category: string; // grains, vegetables, fruits, etc.
  season: 'kharif' | 'rabi' | 'zaid';
  suitableSoilTypes: string[];
  averageYield: number; // kg per acre
  growthPeriod: number; // days
  waterRequirement: 'low' | 'medium' | 'high';
  description?: string;
}

// Google Auth Types
export interface GoogleAuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
}

