// API service for making HTTP requests to the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
        throw new Error('Request timed out. Please check if the backend server is running on http://localhost:5000');
      }
      // Handle network/fetch errors (these are actual connection issues)
      if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed') || error.message.includes('NetworkError'))) {
        throw new Error('Failed to connect to server. Please make sure the backend server is running on http://localhost:5000');
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
    const response = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, location }),
    });

    if (response.token && response.user) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
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

  async googleLogin(idToken: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    if (response.token && response.user) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async appleLogin(idToken: string, userData?: { name?: string; email?: string }) {
    const response = await this.request<{ token: string; user: any }>('/auth/apple', {
      method: 'POST',
      body: JSON.stringify({ idToken, userData }),
    });

    if (response.token && response.user) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async microsoftLogin(accessToken: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/microsoft', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
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
    const query = farmId ? `?farmId=${farmId}` : '';
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
}

export const api = new ApiService();
export default api;
