// Mock data for the Digital Farm Record Management System
import { Farm, Crop, Fertilizer, Pesticide, Irrigation, Expense, Yield } from '../types';

export const mockFarms: Farm[] = [
  {
    id: '1',
    name: 'Green Valley Farm',
    location: 'Coimbatore, Tamil Nadu',
    landSize: 25.5,
    soilType: 'Alluvial',
    farmerId: '1',
  },
  {
    id: '2',
    name: 'Sunrise Agricultural Land',
    location: 'Madurai, Tamil Nadu',
    landSize: 18.0,
    soilType: 'Red Soil',
    farmerId: '1',
  },
];

// Crops from dataset with comprehensive details
export const mockCrops: Crop[] = [
  {
    id: '1',
    name: 'Rice',
    season: 'Kharif',
    sowingDate: '2024-06-15',
    harvestDate: '2024-11-20',
    status: 'active',
    farmId: '1',
    category: 'Grains',
    n: 79.89,
    p: 47.58,
    k: 39.87,
    temperature: 23.69,
    humidity: 82.27,
    ph: 6.43,
    rainfall: 236.18,
    growthPeriod: 120,
    waterRequirement: 'high',
    averageYield: 2780,
  },
  {
    id: '2',
    name: 'Wheat',
    season: 'Rabi',
    sowingDate: '2024-11-01',
    harvestDate: '2025-03-15',
    status: 'active',
    farmId: '1',
    category: 'Grains',
    n: 80,
    p: 50,
    k: 40,
    temperature: 20,
    humidity: 60,
    ph: 6.5,
    rainfall: 100,
    growthPeriod: 120,
    waterRequirement: 'medium',
    averageYield: 3559,
  },
  {
    id: '3',
    name: 'Maize',
    season: 'Kharif',
    sowingDate: '2024-05-10',
    harvestDate: '2024-08-10',
    status: 'active',
    farmId: '2',
    category: 'Grains',
    n: 77.76,
    p: 48.44,
    k: 19.79,
    temperature: 22.39,
    humidity: 65.09,
    ph: 6.25,
    rainfall: 84.77,
    growthPeriod: 90,
    waterRequirement: 'medium',
    averageYield: 2671,
  },
  {
    id: '4',
    name: 'Cotton',
    season: 'Kharif',
    sowingDate: '2024-05-20',
    harvestDate: '2024-10-30',
    status: 'harvested',
    farmId: '2',
    category: 'Fiber',
    n: 117.77,
    p: 46.24,
    k: 19.56,
    temperature: 23.99,
    humidity: 79.84,
    ph: 6.91,
    rainfall: 80.4,
    growthPeriod: 180,
    waterRequirement: 'medium',
    averageYield: 500,
  },
  {
    id: '5',
    name: 'Banana',
    season: 'Year-round',
    sowingDate: '2023-01-15',
    harvestDate: '2024-12-31',
    status: 'active',
    farmId: '1',
    category: 'Fruits',
    n: 100.23,
    p: 82.01,
    k: 50.05,
    temperature: 27.38,
    humidity: 80.36,
    ph: 5.98,
    rainfall: 104.63,
    growthPeriod: 365,
    waterRequirement: 'medium',
    averageYield: 25000,
  },
  {
    id: '6',
    name: 'Mango',
    season: 'Year-round',
    sowingDate: '2020-06-01',
    harvestDate: '2024-12-31',
    status: 'active',
    farmId: '2',
    category: 'Fruits',
    n: 20.07,
    p: 27.18,
    k: 29.92,
    temperature: 31.21,
    humidity: 50.16,
    ph: 5.77,
    rainfall: 94.7,
    growthPeriod: 365,
    waterRequirement: 'medium',
    averageYield: 8000,
  },
  {
    id: '7',
    name: 'ChickPea',
    season: 'Rabi',
    sowingDate: '2024-10-15',
    harvestDate: '2025-02-15',
    status: 'planned',
    farmId: '1',
    category: 'Pulses',
    n: 40.09,
    p: 67.79,
    k: 79.92,
    temperature: 18.87,
    humidity: 16.86,
    ph: 7.34,
    rainfall: 80.06,
    growthPeriod: 120,
    waterRequirement: 'medium',
    averageYield: 1200,
  },
  {
    id: '8',
    name: 'Blackgram',
    season: 'Kharif',
    sowingDate: '2024-07-01',
    harvestDate: '2024-09-30',
    status: 'harvested',
    farmId: '2',
    category: 'Pulses',
    n: 40.02,
    p: 67.47,
    k: 19.24,
    temperature: 29.97,
    humidity: 65.12,
    ph: 7.13,
    rainfall: 67.88,
    growthPeriod: 90,
    waterRequirement: 'medium',
    averageYield: 800,
  },
  {
    id: '9',
    name: 'Coffee',
    season: 'Year-round',
    sowingDate: '2022-01-10',
    harvestDate: '2024-12-31',
    status: 'active',
    farmId: '1',
    category: 'Beverages',
    n: 101.2,
    p: 28.74,
    k: 29.94,
    temperature: 25.54,
    humidity: 58.87,
    ph: 6.79,
    rainfall: 158.07,
    growthPeriod: 365,
    waterRequirement: 'high',
    averageYield: 1000,
  },
  {
    id: '10',
    name: 'Grapes',
    season: 'Year-round',
    sowingDate: '2021-03-15',
    harvestDate: '2024-12-31',
    status: 'active',
    farmId: '2',
    category: 'Fruits',
    n: 23.18,
    p: 132.53,
    k: 200.11,
    temperature: 23.85,
    humidity: 81.88,
    ph: 6.03,
    rainfall: 69.61,
    growthPeriod: 180,
    waterRequirement: 'medium',
    averageYield: 15000,
  },
  {
    id: '11',
    name: 'Sugarcane',
    season: 'Year-round',
    sowingDate: '2023-02-01',
    harvestDate: '2024-12-31',
    status: 'active',
    farmId: '1',
    category: 'Grains',
    n: 85.5,
    p: 42.3,
    k: 45.8,
    temperature: 26.5,
    humidity: 75,
    ph: 6.8,
    rainfall: 120,
    growthPeriod: 365,
    waterRequirement: 'high',
    averageYield: 75000,
  },
  {
    id: '12',
    name: 'Potato',
    season: 'Rabi',
    sowingDate: '2024-10-20',
    harvestDate: '2025-01-30',
    status: 'active',
    farmId: '2',
    category: 'Vegetables',
    n: 50.2,
    p: 55.8,
    k: 48.3,
    temperature: 18,
    humidity: 70,
    ph: 5.5,
    rainfall: 60,
    growthPeriod: 100,
    waterRequirement: 'medium',
    averageYield: 25000,
  },
  {
    id: '13',
    name: 'Onion',
    season: 'Rabi',
    sowingDate: '2024-11-10',
    harvestDate: '2025-04-15',
    status: 'planned',
    farmId: '1',
    category: 'Vegetables',
    n: 30.5,
    p: 28.4,
    k: 35.2,
    temperature: 22,
    humidity: 65,
    ph: 6.2,
    rainfall: 50,
    growthPeriod: 150,
    waterRequirement: 'medium',
    averageYield: 20000,
  },
  {
    id: '14',
    name: 'Tomato',
    season: 'Year-round',
    sowingDate: '2024-08-01',
    harvestDate: '2024-12-15',
    status: 'active',
    farmId: '2',
    category: 'Vegetables',
    n: 45.3,
    p: 52.1,
    k: 38.7,
    temperature: 24,
    humidity: 72,
    ph: 6.0,
    rainfall: 90,
    growthPeriod: 120,
    waterRequirement: 'high',
    averageYield: 35000,
  },
  {
    id: '15',
    name: 'Coconut',
    season: 'Year-round',
    sowingDate: '2020-01-01',
    harvestDate: '2024-12-31',
    status: 'active',
    farmId: '1',
    category: 'Fruits',
    n: 35.8,
    p: 25.6,
    k: 40.9,
    temperature: 28,
    humidity: 80,
    ph: 5.8,
    rainfall: 150,
    growthPeriod: 365,
    waterRequirement: 'high',
    averageYield: 8000,
  },
  {
    id: '16',
    name: 'Groundnut',
    season: 'Kharif',
    sowingDate: '2024-06-10',
    harvestDate: '2024-10-25',
    status: 'harvested',
    farmId: '2',
    category: 'Oilseeds',
    n: 25.4,
    p: 48.2,
    k: 30.6,
    temperature: 26,
    humidity: 68,
    ph: 6.5,
    rainfall: 85,
    growthPeriod: 120,
    waterRequirement: 'medium',
    averageYield: 2000,
  },
  {
    id: '17',
    name: 'Soybean',
    season: 'Kharif',
    sowingDate: '2024-06-20',
    harvestDate: '2024-10-15',
    status: 'harvested',
    farmId: '1',
    category: 'Oilseeds',
    n: 38.6,
    p: 42.8,
    k: 35.4,
    temperature: 24,
    humidity: 70,
    ph: 6.4,
    rainfall: 95,
    growthPeriod: 110,
    waterRequirement: 'medium',
    averageYield: 2200,
  },
  {
    id: '18',
    name: 'Sunflower',
    season: 'Rabi',
    sowingDate: '2024-11-05',
    harvestDate: '2025-03-20',
    status: 'planned',
    farmId: '2',
    category: 'Oilseeds',
    n: 42.3,
    p: 38.5,
    k: 45.2,
    temperature: 21,
    humidity: 62,
    ph: 6.6,
    rainfall: 70,
    growthPeriod: 100,
    waterRequirement: 'medium',
    averageYield: 1500,
  },
  {
    id: '19',
    name: 'Mustard',
    season: 'Rabi',
    sowingDate: '2024-10-25',
    harvestDate: '2025-02-28',
    status: 'active',
    farmId: '1',
    category: 'Oilseeds',
    n: 35.7,
    p: 40.2,
    k: 32.8,
    temperature: 19,
    humidity: 58,
    ph: 6.8,
    rainfall: 65,
    growthPeriod: 125,
    waterRequirement: 'low',
    averageYield: 1800,
  },
  {
    id: '20',
    name: 'Turmeric',
    season: 'Kharif',
    sowingDate: '2024-05-15',
    harvestDate: '2024-11-30',
    status: 'active',
    farmId: '2',
    category: 'Spices',
    n: 55.4,
    p: 48.6,
    k: 52.3,
    temperature: 25,
    humidity: 75,
    ph: 6.0,
    rainfall: 110,
    growthPeriod: 200,
    waterRequirement: 'high',
    averageYield: 12000,
  },
];

export const mockFertilizers: Fertilizer[] = [
  {
    id: '1',
    type: 'Urea',
    quantity: 50,
    dateOfUsage: '2024-07-10',
    cropId: '1',
  },
  {
    id: '2',
    type: 'NPK (19:19:19)',
    quantity: 75,
    dateOfUsage: '2024-08-15',
    cropId: '1',
  },
  {
    id: '3',
    type: 'DAP',
    quantity: 40,
    dateOfUsage: '2024-11-10',
    cropId: '2',
  },
  {
    id: '4',
    type: 'MOP (Muriate of Potash)',
    quantity: 30,
    dateOfUsage: '2024-07-25',
    cropId: '1',
  },
  {
    id: '5',
    type: 'SSP (Single Super Phosphate)',
    quantity: 60,
    dateOfUsage: '2024-08-05',
    cropId: '3',
  },
  {
    id: '6',
    type: 'Zinc Sulphate',
    quantity: 25,
    dateOfUsage: '2024-09-10',
    cropId: '5',
  },
  {
    id: '7',
    type: 'Organic Compost',
    quantity: 100,
    dateOfUsage: '2024-06-20',
    cropId: '5',
  },
  {
    id: '8',
    type: 'Vermicompost',
    quantity: 80,
    dateOfUsage: '2024-07-15',
    cropId: '6',
  },
  {
    id: '9',
    type: 'NPK (12:32:16)',
    quantity: 45,
    dateOfUsage: '2024-10-01',
    cropId: '2',
  },
  {
    id: '10',
    type: 'Bone Meal',
    quantity: 35,
    dateOfUsage: '2024-08-20',
    cropId: '4',
  },
];

export const mockPesticides: Pesticide[] = [
  {
    id: '1',
    type: 'Insecticide - Imidacloprid',
    quantity: 2.5,
    dateOfUsage: '2024-07-25',
    cropId: '1',
  },
  {
    id: '2',
    type: 'Fungicide - Mancozeb',
    quantity: 3.0,
    dateOfUsage: '2024-08-20',
    cropId: '1',
  },
  {
    id: '3',
    type: 'Herbicide - Glyphosate',
    quantity: 1.5,
    dateOfUsage: '2024-11-15',
    cropId: '2',
  },
  {
    id: '4',
    type: 'Neem Oil (Organic)',
    quantity: 5.0,
    dateOfUsage: '2024-07-12',
    cropId: '5',
  },
  {
    id: '5',
    type: 'Insecticide - Chlorpyriphos',
    quantity: 2.0,
    dateOfUsage: '2024-08-08',
    cropId: '3',
  },
  {
    id: '6',
    type: 'Fungicide - Copper Oxychloride',
    quantity: 4.5,
    dateOfUsage: '2024-09-05',
    cropId: '6',
  },
  {
    id: '7',
    type: 'Herbicide - 2,4-D',
    quantity: 1.0,
    dateOfUsage: '2024-07-30',
    cropId: '4',
  },
  {
    id: '8',
    type: 'Biological - Bacillus Thuringiensis',
    quantity: 3.5,
    dateOfUsage: '2024-08-18',
    cropId: '5',
  },
  {
    id: '9',
    type: 'Insecticide - Cypermethrin',
    quantity: 2.8,
    dateOfUsage: '2024-09-20',
    cropId: '10',
  },
  {
    id: '10',
    type: 'Fungicide - Carbendazim',
    quantity: 3.2,
    dateOfUsage: '2024-10-10',
    cropId: '9',
  },
  {
    id: '11',
    type: 'Herbicide - Atrazine',
    quantity: 1.8,
    dateOfUsage: '2024-08-25',
    cropId: '11',
  },
  {
    id: '12',
    type: 'Organic - Garlic Extract',
    quantity: 4.0,
    dateOfUsage: '2024-07-20',
    cropId: '6',
  },
];

export const mockIrrigations: Irrigation[] = [
  {
    id: '1',
    method: 'drip',
    date: '2024-07-05',
    duration: 4,
    cropId: '1',
  },
  {
    id: '2',
    method: 'sprinkler',
    date: '2024-07-12',
    duration: 3,
    cropId: '1',
  },
  {
    id: '3',
    method: 'manual',
    date: '2024-11-05',
    duration: 6,
    cropId: '2',
  },
  {
    id: '4',
    method: 'drip',
    date: '2024-11-12',
    duration: 5,
    cropId: '2',
  },
  {
    id: '5',
    method: 'drip',
    date: '2024-07-20',
    duration: 4.5,
    cropId: '3',
  },
  {
    id: '6',
    method: 'sprinkler',
    date: '2024-08-01',
    duration: 3.5,
    cropId: '5',
  },
  {
    id: '7',
    method: 'drip',
    date: '2024-08-08',
    duration: 5,
    cropId: '5',
  },
  {
    id: '8',
    method: 'manual',
    date: '2024-08-15',
    duration: 7,
    cropId: '6',
  },
  {
    id: '9',
    method: 'drip',
    date: '2024-09-01',
    duration: 4,
    cropId: '10',
  },
  {
    id: '10',
    method: 'sprinkler',
    date: '2024-09-10',
    duration: 3,
    cropId: '4',
  },
  {
    id: '11',
    method: 'drip',
    date: '2024-09-18',
    duration: 4.5,
    cropId: '9',
  },
  {
    id: '12',
    method: 'manual',
    date: '2024-10-05',
    duration: 6.5,
    cropId: '11',
  },
  {
    id: '13',
    method: 'drip',
    date: '2024-10-15',
    duration: 5,
    cropId: '14',
  },
  {
    id: '14',
    method: 'sprinkler',
    date: '2024-10-22',
    duration: 3.5,
    cropId: '15',
  },
  {
    id: '15',
    method: 'drip',
    date: '2024-11-01',
    duration: 4,
    cropId: '1',
  },
  {
    id: '16',
    method: 'drip',
    date: '2024-11-18',
    duration: 4.5,
    cropId: '2',
  },
];

export const mockExpenses: Expense[] = [
  {
    id: '1',
    category: 'seeds',
    description: 'Rice seeds (Basmati)',
    amount: 15000,
    date: '2024-06-10',
    farmId: '1',
  },
  {
    id: '2',
    category: 'labor',
    description: 'Field preparation labor',
    amount: 8000,
    date: '2024-06-12',
    farmId: '1',
  },
  {
    id: '3',
    category: 'fertilizers',
    description: 'Urea and NPK',
    amount: 12000,
    date: '2024-07-10',
    farmId: '1',
  },
  {
    id: '4',
    category: 'pesticides',
    description: 'Insecticides and fungicides',
    amount: 5000,
    date: '2024-07-25',
    farmId: '1',
  },
  {
    id: '5',
    category: 'irrigation',
    description: 'Water pump maintenance',
    amount: 3000,
    date: '2024-08-01',
    farmId: '1',
  },
  {
    id: '6',
    category: 'seeds',
    description: 'Wheat seeds',
    amount: 10000,
    date: '2024-10-25',
    farmId: '1',
  },
];

export const mockYields: Yield[] = [
  {
    id: '1',
    cropId: '1',
    quantity: 2500,
    date: '2024-11-20',
    quality: 'excellent',
  },
  {
    id: '2',
    cropId: '2',
    quantity: 1800,
    date: '2025-03-15',
    quality: 'good',
  },
  {
    id: '3',
    cropId: '4',
    quantity: 1200,
    date: '2024-10-30',
    quality: 'good',
  },
];

// Helper function to get crop name by ID
export const getCropName = (cropId: string): string => {
  const crop = mockCrops.find(c => c.id === cropId);
  if (!crop) return 'Unknown Crop';
  
  // Use translation utility if available
  try {
    const { translateCrop } = require('../utils/translations');
    return translateCrop(crop.name);
  } catch {
    return crop.name;
  }
};

// Helper function to calculate monthly expenses
export const getMonthlyExpenses = (month: number, year: number): number => {
  return mockExpenses
    .filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === month && expDate.getFullYear() === year;
    })
    .reduce((sum, exp) => sum + exp.amount, 0);
};

// Helper function to get total yield
export const getTotalYield = (): number => {
  return mockYields.reduce((sum, yield_) => sum + yield_.quantity, 0);
};

// Transaction data for dashboard
export interface Transaction {
  id: string;
  name: string;
  date: string;
  amount: number;
  quantity: number; // in kg
  category: string;
  paymentStatus: 'paid' | 'pending' | 'partial';
  deliveryStatus: 'delivered' | 'pending' | 'in-transit';
}

export const mockTransactions: Transaction[] = [
  {
    id: 'SFL/010420',
    name: 'Ebeano Supermarket',
    date: '2024-04-01',
    amount: 230580,
    quantity: 2500,
    category: 'Leafy Veg',
    paymentStatus: 'paid',
    deliveryStatus: 'delivered',
  },
  {
    id: 'SFL/01082023/056',
    name: 'Shoprite Lagos',
    date: '2024-08-31',
    amount: 900580,
    quantity: 9500,
    category: 'Tomatoes',
    paymentStatus: 'partial',
    deliveryStatus: 'delivered',
  },
  {
    id: 'SFL/09112024/012',
    name: 'Big Bazaar Chennai',
    date: '2024-11-09',
    amount: 450000,
    quantity: 5000,
    category: 'Rice',
    paymentStatus: 'paid',
    deliveryStatus: 'in-transit',
  },
  {
    id: 'SFL/10152024/089',
    name: 'Reliance Fresh',
    date: '2024-10-15',
    amount: 320000,
    quantity: 3500,
    category: 'Wheat',
    paymentStatus: 'paid',
    deliveryStatus: 'delivered',
  },
  {
    id: 'SFL/11012024/045',
    name: 'More Supermarket',
    date: '2024-11-01',
    amount: 180000,
    quantity: 2000,
    category: 'Vegetables',
    paymentStatus: 'pending',
    deliveryStatus: 'pending',
  },
];

// Materials in store data
export interface Material {
  name: string;
  quantity: number; // in kg
}

export const mockMaterials: Material[] = [
  { name: 'Biochar', quantity: 180 },
  { name: 'Liquid nutrient', quantity: 225 },
  { name: 'Rice hull', quantity: 60 },
  { name: 'Coconut coir', quantity: 210 },
  { name: 'Peat', quantity: 210 },
  { name: 'Straws', quantity: 150 },
];

// New supplies data for donut chart
export interface Supply {
  name: string;
  quantity: number;
}

export const mockSupplies: Supply[] = [
  { name: 'Liquid nutrient', quantity: 45 },
  { name: 'Seeds', quantity: 30 },
  { name: 'Biochar', quantity: 25 },
];

// Land properties data
export interface LandProperty {
  id: string;
  name: string;
  area: number; // in acres
  soilType: string;
  location: string;
}

export const mockLandProperties: LandProperty[] = [
  { id: '1', name: 'Green Valley Farm', area: 25.5, soilType: 'Alluvial', location: 'Coimbatore' },
  { id: '2', name: 'Sunrise Agricultural Land', area: 18.0, soilType: 'Red Soil', location: 'Madurai' },
  { id: '3', name: 'Golden Fields', area: 12.5, soilType: 'Black Soil', location: 'Coimbatore' },
  { id: '4', name: 'Harvest Land', area: 8.0, soilType: 'Alluvial', location: 'Chennai' },
];

// Stock materials (seeds, fertilizers, pesticides)
export interface StockItem {
  id: string;
  name: string;
  category: 'seeds' | 'fertilizers' | 'pesticides';
  quantity: number;
  unit: string;
}

export const mockStockItems: StockItem[] = [
  { id: '1', name: 'Rice Seeds (Basmati)', category: 'seeds', quantity: 500, unit: 'kg' },
  { id: '2', name: 'Wheat Seeds', category: 'seeds', quantity: 300, unit: 'kg' },
  { id: '3', name: 'Cotton Seeds', category: 'seeds', quantity: 200, unit: 'kg' },
  { id: '4', name: 'Urea', category: 'fertilizers', quantity: 150, unit: 'kg' },
  { id: '5', name: 'NPK (19:19:19)', category: 'fertilizers', quantity: 225, unit: 'kg' },
  { id: '6', name: 'DAP', category: 'fertilizers', quantity: 100, unit: 'kg' },
  { id: '7', name: 'Insecticide - Imidacloprid', category: 'pesticides', quantity: 25, unit: 'L' },
  { id: '8', name: 'Fungicide - Mancozeb', category: 'pesticides', quantity: 30, unit: 'L' },
  { id: '9', name: 'Herbicide - Glyphosate', category: 'pesticides', quantity: 15, unit: 'L' },
];

// Farmer registration statistics (district-wise)
export interface FarmerStats {
  district: string;
  count: number;
}

export const mockFarmerStats: FarmerStats[] = [
  { district: 'Coimbatore', count: 1245 },
  { district: 'Chennai', count: 980 },
  { district: 'Madurai', count: 756 },
  { district: 'Tirunelveli', count: 432 },
  { district: 'Salem', count: 389 },
  { district: 'Erode', count: 298 },
];

