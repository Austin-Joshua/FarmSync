import axios from 'axios';
import { useAuthStore } from '../context/useAuthStore';

import { API_BASE_URL } from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to add Auth Token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error.response?.data?.message || 'API request failed');
  }
);

// API Service Functions
const ApiService = {
  // Auth
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string, role: string, metadata?: any) => 
    api.post('/auth/register', { name, email, password, role, ...metadata }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  logout: () => api.post('/auth/logout'),

  // Fields
  getFields: (farmId?: string) => api.get('/fields', { params: { farm_id: farmId } }),
  createField: (data: any) => api.post('/fields', data),
  updateField: (id: string, data: any) => api.put(`/fields/${id}`, data),
  deleteField: (id: string) => api.delete(`/fields/${id}`),

  // Calendar Events
  getCalendarEvents: (farmId?: string) => api.get('/calendar/events', { params: { farm_id: farmId } }),
  createCalendarEvent: (data: any) => api.post('/calendar/events', data),
  updateCalendarEvent: (id: string, data: any) => api.put(`/calendar/events/${id}`, data),
  deleteCalendarEvent: (id: string) => api.delete(`/calendar/events/${id}`),

  // Market Prices
  getCurrentPrice: (crop: string) => api.get('/market/current', { params: { crop } }),
  getPriceHistory: (crop: string, days?: number) => api.get('/market/history', { params: { crop, days } }),
  getBestTimeToSell: (crop: string) => api.get('/market/best-time', { params: { crop } }),
  setPriceAlert: (data: any) => api.post('/market/alerts', data),

  // Admin
  getAdminStatistics: () => api.get('/admin/statistics'),

  // Push Notifications
  subscribePushNotification: (data: any) => api.post('/notifications/subscribe', data),
  unsubscribePushNotification: (endpoint: string) => api.delete(`/notifications/unsubscribe/${encodeURIComponent(endpoint)}`),

  // 2FA
  setup2FA: () => api.post('/auth/2fa/setup'),
  verifyAndEnable2FA: (code: string) => api.post('/auth/2fa/verify', { code }),
  disable2FA: () => api.post('/auth/2fa/disable'),

  // Upload
  uploadProfilePicture: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/auth/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Farms
  getFarms: () => api.get('/farms'),
  getFarm: (id: string) => api.get(`/farms/${id}`),
  createFarm: (data: any) => api.post('/farms', data),
  updateFarm: (id: string, data: any) => api.put(`/farms/${id}`, data),
  deleteFarm: (id: string) => api.delete(`/farms/${id}`),

  // Crops
  getCrops: (farmId?: string) => api.get('/crops', { params: { farm_id: farmId } }),
  getCrop: (id: string) => api.get(`/crops/${id}`),
  createCrop: (data: any) => api.post('/crops', data),
  updateCrop: (id: string, data: any) => api.put(`/crops/${id}`, data),
  deleteCrop: (id: string) => api.delete(`/crops/${id}`),

  // Expenses
  getExpenses: (farmId?: string) => api.get('/expenses', { params: { farmId } }),
  getExpense: (id: string) => api.get(`/expenses/${id}`),
  createExpense: (data: any) => api.post('/expenses', data),
  updateExpense: (id: string, data: any) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id: string) => api.delete(`/expenses/${id}`),

  // Yields
  getYields: (cropId?: string) => api.get('/yields', { params: { cropId } }),
  getYield: (id: string) => api.get(`/yields/${id}`),
  createYield: (data: any) => api.post('/yields', data),
  updateYield: (id: string, data: any) => api.put(`/yields/${id}`, data),
  deleteYield: (id: string) => api.delete(`/yields/${id}`),

  // Stock/Inventory
  getStockItems: () => api.get('/inventory'),
  getLowStockItems: () => api.get('/inventory/low'),
  updateStock: (id: string, data: any) => api.put(`/inventory/${id}`, data),
  createStockItem: (data: any) => api.post('/stock', data),
  updateStockItem: (id: string, data: any) => api.put(`/stock/${id}`, data),
  deleteStockItem: (id: string) => api.delete(`/stock/${id}`),

  // Disease Scans
  getDiseaseScans: () => api.get('/disease'),
  getDiseaseScan: (id: string) => api.get(`/disease/${id}`),
  createDiseaseScan: (data: any) => api.post('/disease', data),
  updateDiseaseScan: (id: string, data: any) => api.put(`/disease/${id}`, data),
  deleteDiseaseScan: (id: string) => api.delete(`/disease/${id}`),

  // User Profile
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  
  // Alerts/Notifications
  getUnreadAlerts: () => api.get('/alerts/unread'),
  markAllAlertsAsRead: () => api.post('/alerts/mark-all-read'),
  markAlertAsRead: (id: string) => api.post(`/alerts/${id}/mark-read`),

  // Health
  getHealth: () => api.get('/health'),
};

export default ApiService;
export { api as axiosInstance };
