// API service for making HTTP requests to the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5174/api';

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
  token?: string;
  user?: any;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors (401, 400, 500, etc.)
      // These are NOT connection errors - they're application errors
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const data = await response.json();
          errorMessage = data.error || data.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        // Create an error object that preserves the status code
        const httpError: any = new Error(errorMessage);
        httpError.status = response.status;
        httpError.response = response;
        throw httpError;
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      // Handle timeout/abort errors (these are actual connection issues)
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check if the backend server is running on http://localhost:5174');
      }
      // Handle network/fetch errors (these are actual connection issues)
      if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed') || error.message.includes('NetworkError'))) {
        throw new Error('Failed to connect to server. Please make sure the backend server is running on http://localhost:5174');
      }
      // For other errors (like 401, 400, etc.), preserve the original error message
      // These are NOT connection errors - they're authentication/validation errors
      throw error; // Re-throw to preserve the original error message
    }
  }

  // Authentication
  async register(
    name: string,
    email: string,
    password: string,
    role: 'farmer' | 'admin',
    location?: string
  ) {
    try {
      const response = await this.request<{ token: string; user: any; message?: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role, location }),
      });

      // Check if registration was successful
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return response;
      } else {
        throw new Error(response.message || 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Registration API error:', error);
      throw error;
    }
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async getActiveSessions() {
    return this.request<{ sessions: Array<{
      id: string;
      isCurrent: boolean;
      device: string;
      browser: string;
      ipAddress: string;
      lastActivity: string;
      createdAt: string;
    }> }>('/auth/sessions', {
      method: 'GET',
    });
  }

  async logoutAllDevices() {
    return this.request<{ message: string }>('/auth/logout-all', {
      method: 'POST',
    });
  }

  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.token && response.user) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(data: { name?: string; location?: string; land_size?: number; soil_type?: string; picture_url?: string }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadProfilePicture(file: File): Promise<ApiResponse<{ picture_url: string; user: any }>> {
    const token = this.getAuthToken();
    const formData = new FormData();
    formData.append('picture', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Don't set Content-Type header - let the browser set it with boundary for FormData

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/picture`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred');
    }
  }

  // Dashboard
  async getDashboard() {
    return this.request('/dashboard');
  }

  // Farms
  async getFarms() {
    return this.request('/farms');
  }

  async getFarm(id: string) {
    return this.request(`/farms/${id}`);
  }

  async createFarm(data: any) {
    return this.request('/farms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFarm(id: string, data: any) {
    return this.request(`/farms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFarm(id: string) {
    return this.request(`/farms/${id}`, {
      method: 'DELETE',
    });
  }

  // Crops
  async getCrops(farmId?: string) {
    const query = farmId ? `?farm_id=${farmId}` : '';
    return this.request(`/crops${query}`);
  }

  async getCrop(id: string) {
    return this.request(`/crops/${id}`);
  }

  async createCrop(data: any) {
    return this.request('/crops', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCrop(id: string, data: any) {
    return this.request(`/crops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCrop(id: string) {
    return this.request(`/crops/${id}`, {
      method: 'DELETE',
    });
  }

  // Crop Types
  async getCropTypes() {
    return this.request('/crops/types');
  }

  async createCropType(data: any) {
    return this.request('/crops/types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCropType(id: string, data: any) {
    return this.request(`/crops/types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCropType(id: string) {
    return this.request(`/crops/types/${id}`, {
      method: 'DELETE',
    });
  }

  // Expenses
  async getExpenses(farmId?: string) {
    const query = farmId ? `?farmId=${farmId}` : '';
    return this.request(`/expenses${query}`);
  }

  async getExpense(id: string) {
    return this.request(`/expenses/${id}`);
  }

  async createExpense(data: any) {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExpense(id: string, data: any) {
    return this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExpense(id: string) {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  // Yields
  async getYields(cropId?: string) {
    const query = cropId ? `?cropId=${cropId}` : '';
    return this.request(`/yields${query}`);
  }

  async getYield(id: string) {
    return this.request(`/yields/${id}`);
  }

  async createYield(data: any) {
    return this.request('/yields', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateYield(id: string, data: any) {
    return this.request(`/yields/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteYield(id: string) {
    return this.request(`/yields/${id}`, {
      method: 'DELETE',
    });
  }

  // Stock
  async getStockItems() {
    return this.request('/stock');
  }

  async getLowStockItems() {
    return this.request('/stock/low-stock');
  }

  // Calendar
  async getCalendarEvents(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.request(`/calendar/events${params.toString() ? '?' + params.toString() : ''}`);
  }

  async getUpcomingEvents(days?: number) {
    const params = days ? `?days=${days}` : '';
    return this.request(`/calendar/upcoming${params}`);
  }

  async createCalendarEvent(data: any) {
    return this.request('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCalendarEvent(id: string, data: any) {
    return this.request(`/calendar/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCalendarEvent(id: string) {
    return this.request(`/calendar/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Weather Alerts
  async getWeatherAlerts(activeOnly: boolean = true) {
    return this.request(`/weather/alerts?activeOnly=${activeOnly}`);
  }

  async getUnreadAlerts() {
    return this.request('/weather/alerts/unread');
  }

  async markAlertAsRead(id: string) {
    return this.request(`/weather/alerts/${id}/read`, {
      method: 'POST',
    });
  }

  async markAllAlertsAsRead() {
    return this.request('/weather/alerts/read-all', {
      method: 'POST',
    });
  }

  // Reports
  async getSummaryReport(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.request(`/reports/summary${params.toString() ? '?' + params.toString() : ''}`);
  }

  async getCustomReport(filters: {
    startDate?: string;
    endDate?: string;
    categories?: string[];
    cropIds?: string[];
    reportType: 'financial' | 'crop' | 'expense' | 'yield';
  }) {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.categories) params.append('categories', filters.categories.join(','));
    if (filters.cropIds) params.append('cropIds', filters.cropIds.join(','));
    params.append('reportType', filters.reportType);
    return this.request(`/reports/custom?${params.toString()}`);
  }

  async getStockItem(id: string) {
    return this.request(`/stock/${id}`);
  }

  async createStockItem(data: any) {
    return this.request('/stock', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStockItem(id: string, data: any) {
    return this.request(`/stock/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStockItem(id: string) {
    return this.request(`/stock/${id}`, {
      method: 'DELETE',
    });
  }

  // Monthly Stock Usage
  async getMonthlyStockUsage(month?: number, year?: number) {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/stock/history/monthly${query}`);
  }

  async createMonthlyStockUsage(data: any) {
    return this.request('/stock/history/monthly', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // History
  async getMonthlyIncome(month?: number, year?: number) {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/history/income/monthly${query}`);
  }

  async createOrUpdateMonthlyIncome(data: any) {
    return this.request('/history/income/monthly', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Settings
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(data: any) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Soil Types
  async getSoilTypes() {
    return this.request('/soil-types');
  }

  // Fertilizers
  async getFertilizers(cropId: string) {
    return this.request(`/fertilizers?cropId=${cropId}`);
  }

  async createFertilizer(data: any) {
    return this.request('/fertilizers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFertilizer(id: string, data: any) {
    return this.request(`/fertilizers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFertilizer(id: string) {
    return this.request(`/fertilizers/${id}`, {
      method: 'DELETE',
    });
  }

  // Pesticides
  async getPesticides(cropId: string) {
    return this.request(`/pesticides?cropId=${cropId}`);
  }

  async createPesticide(data: any) {
    return this.request('/pesticides', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePesticide(id: string, data: any) {
    return this.request(`/pesticides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePesticide(id: string) {
    return this.request(`/pesticides/${id}`, {
      method: 'DELETE',
    });
  }

  // Irrigation
  async getIrrigations(cropId: string) {
    return this.request(`/irrigations?cropId=${cropId}`);
  }

  async createIrrigation(data: any) {
    return this.request('/irrigations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIrrigation(id: string, data: any) {
    return this.request(`/irrigations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteIrrigation(id: string) {
    return this.request(`/irrigations/${id}`, {
      method: 'DELETE',
    });
  }

  // ML Recommendations
  async getCropRecommendation(data: {
    N: number;
    P: number;
    K: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
    farm_id?: string;
  }) {
    return this.request('/ml/recommend', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRecommendationHistory() {
    return this.request('/ml/history');
  }

  async getModelInfo() {
    return this.request('/ml/model-info');
  }

  // Weather & Location Endpoints
  async getCurrentWeather(latitude: number, longitude: number) {
    return this.request('/weather/current', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
    });
  }

  async getClimateAlerts(latitude: number, longitude: number) {
    return this.request('/weather/alerts', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
    });
  }

  async getCurrentLocation(latitude: number, longitude: number) {
    return this.request('/weather/location/current', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
    });
  }

  // Audit Logs
  async getActivitySummary(days: number = 7) {
    return this.request(`/audit-logs/activity-summary?days=${days}`);
  }

  async getAuditLogs(limit: number = 100, offset: number = 0) {
    return this.request(`/audit-logs?limit=${limit}&offset=${offset}`);
  }

  async getLoginHistory(limit: number = 100) {
    return this.request(`/audit-logs/login-history?limit=${limit}`);
  }

  async getMyAuditLogs(limit: number = 100) {
    return this.request(`/audit-logs/me?limit=${limit}`);
  }

  // Admin Statistics
  async getAdminStatistics() {
    return this.request('/admin/statistics');
  }

  // Push Notifications
  async subscribePushNotification(subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    return this.request('/notifications/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
    });
  }

  async unsubscribePushNotification(endpoint?: string) {
    return this.request('/notifications/push/unsubscribe', {
      method: 'DELETE',
      body: JSON.stringify({ endpoint }),
    });
  }

  // Email Notifications
  async sendTestEmail() {
    return this.request('/notifications/email/test', {
      method: 'POST',
    });
  }

  // User Profile & Database Status
  async getUserProfile() {
    return this.request('/user/profile');
  }

  async getUserStatus() {
    return this.request('/user/status');
  }

  async getDatabaseStatus() {
    return this.request('/user/db-status');
  }

  // Two-Factor Authentication
  async setup2FA() {
    return this.request('/auth/2fa/setup');
  }

  async verifyAndEnable2FA(secret: string, token: string) {
    return this.request('/auth/2fa/verify-setup', {
      method: 'POST',
      body: JSON.stringify({ secret, token }),
    });
  }

  async verify2FAToken(token: string) {
    return this.request('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async disable2FA(password: string) {
    return this.request('/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async regenerateBackupCodes() {
    return this.request('/auth/2fa/backup-codes');
  }

  // WhatsApp
  async sendWhatsAppMessage(to: string, message: string, type: 'text' | 'template' = 'text') {
    return this.request('/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify({ to, message, type }),
    });
  }

  // SMS
  async sendSMS(to: string, message: string) {
    return this.request('/sms/send', {
      method: 'POST',
      body: JSON.stringify({ to, message }),
    });
  }

  async sendTestSMS() {
    return this.request('/sms/test', {
      method: 'POST',
    });
  }

  // Market Prices
  async getCurrentPrice(crop: string, market?: string) {
    const params = market ? `?market=${market}` : '';
    return this.request(`/market-prices/${crop}${params}`);
  }

  async getPriceHistory(crop: string, days: number = 30) {
    return this.request(`/market-prices/${crop}/history?days=${days}`);
  }

  async getBestTimeToSell(crop: string) {
    return this.request(`/market-prices/${crop}/best-time`);
  }

  async setPriceAlert(crop: string, targetPrice: number, condition: 'above' | 'below') {
    return this.request(`/market-prices/${crop}/alert`, {
      method: 'POST',
      body: JSON.stringify({ targetPrice, condition }),
    });
  }

  // Fields
  async getFields() {
    return this.request('/fields');
  }

  async getFieldsByFarm(farmId: string) {
    return this.request(`/fields/farm/${farmId}`);
  }

  async createField(data: any) {
    return this.request('/fields', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateField(id: string, data: any) {
    return this.request(`/fields/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteField(id: string) {
    return this.request(`/fields/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
export default api;
