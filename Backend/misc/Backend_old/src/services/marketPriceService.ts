import axios from 'axios';
import { AppError } from '../middleware/errorHandler';

export interface CropPrice {
  crop: string;
  price: number;
  unit: string;
  market: string;
  date: Date;
  change?: number; // Percentage change
  trend?: 'up' | 'down' | 'stable';
}

export interface MarketPriceData {
  crop: string;
  currentPrice: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  unit: string;
  market: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  lastUpdated: Date;
}

export class MarketPriceService {
  private apiKey: string;
  private apiUrl: string;
  private cache: Map<string, { data: MarketPriceData; timestamp: number }> = new Map();
  private cacheTimeout = 60 * 60 * 1000; // 1 hour

  constructor() {
    // Configuration for market price API
    // Options:
    // 1. Government of India's e-NAM API: https://enam.gov.in/web/
    // 2. Agmarknet API: https://agmarknet.gov.in/
    // 3. Custom market price API
    this.apiKey = process.env.MARKET_PRICE_API_KEY || '';
    this.apiUrl = process.env.MARKET_PRICE_API_URL || '';

    if (!this.apiKey || !this.apiUrl) {
      console.warn('Market Price API not configured. Using mock data.');
    }
  }

  /**
   * Get current market price for a crop
   * Replace this method with actual API call when API is configured
   */
  async getCurrentPrice(crop: string, market?: string): Promise<MarketPriceData> {
    const cacheKey = `${crop}_${market || 'default'}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // TODO: Replace with actual API call
    // Example API integration:
    /*
    if (this.apiKey && this.apiUrl) {
      try {
        const response = await axios.get(`${this.apiUrl}/prices/${crop}`, {
          params: { market, api_key: this.apiKey },
        });
        const priceData = this.transformApiResponse(response.data);
        this.cache.set(cacheKey, {
          data: priceData,
          timestamp: Date.now(),
        });
        return priceData;
      } catch (error) {
        console.error('Market price API error:', error);
        // Fallback to mock data
      }
    }
    */

    // Mock data - Replace with actual API call
    const mockPrice = this.getMockPrice(crop, market);
    
    this.cache.set(cacheKey, {
      data: mockPrice,
      timestamp: Date.now(),
    });

    return mockPrice;
  }

  /**
   * Get price history for a crop
   * Replace this method with actual API call when API is configured
   */
  async getPriceHistory(crop: string, days: number = 30): Promise<CropPrice[]> {
    // TODO: Replace with actual API call
    // Example:
    /*
    if (this.apiKey && this.apiUrl) {
      try {
        const response = await axios.get(`${this.apiUrl}/prices/${crop}/history`, {
          params: { days, api_key: this.apiKey },
        });
        return this.transformHistoryResponse(response.data);
      } catch (error) {
        console.error('Market price history API error:', error);
      }
    }
    */

    // Mock data - Replace with actual API call
    const prices: CropPrice[] = [];
    const basePrice = this.getMockPrice(crop).currentPrice;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
      prices.push({
        crop,
        price: basePrice * (1 + variation),
        unit: 'kg',
        market: 'Local Market',
        date,
        change: variation * 100,
        trend: variation > 0.05 ? 'up' : variation < -0.05 ? 'down' : 'stable',
      });
    }

    return prices;
  }

  /**
   * Get best time to sell recommendation
   * Uses price history to analyze trends and recommend optimal selling time
   */
  async getBestTimeToSell(crop: string): Promise<{
    recommendedDate: Date;
    expectedPrice: number;
    confidence: number;
    reason: string;
  }> {
    const history = await this.getPriceHistory(crop, 90);
    const prices = history.map(p => p.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const maxPrice = Math.max(...prices);

    // Simple recommendation: sell when price is above average
    const currentPrice = await this.getCurrentPrice(crop);
    const daysToWait = currentPrice.trend === 'up' ? 7 : currentPrice.trend === 'down' ? 0 : 14;

    const recommendedDate = new Date();
    recommendedDate.setDate(recommendedDate.getDate() + daysToWait);

    return {
      recommendedDate,
      expectedPrice: currentPrice.trend === 'up' ? currentPrice.currentPrice * 1.1 : currentPrice.currentPrice,
      confidence: 0.7,
      reason: currentPrice.trend === 'up' 
        ? 'Prices are trending upward. Consider selling soon.'
        : currentPrice.trend === 'down'
        ? 'Prices are declining. Sell immediately if possible.'
        : 'Prices are stable. Monitor for better opportunities.',
    };
  }

  /**
   * Set price alert
   * Stores alert in database for monitoring
   */
  async setPriceAlert(userId: string, crop: string, targetPrice: number, condition: 'above' | 'below'): Promise<void> {
    // This would typically be stored in database
    // For now, we'll just log it
    console.log(`Price alert set for user ${userId}: ${crop} ${condition} ${targetPrice}`);
    
    // TODO: Store in database
    // Example:
    /*
    import { PriceAlertModel } from '../models/PriceAlert';
    await PriceAlertModel.create({
      user_id: userId,
      crop,
      target_price: targetPrice,
      condition_type: condition,
      is_active: true,
    });
    */
  }

  /**
   * Transform API response to MarketPriceData format
   * Customize this based on your API response structure
   */
  private transformApiResponse(apiData: any): MarketPriceData {
    // Example transformation - customize based on your API
    return {
      crop: apiData.crop || apiData.commodity,
      currentPrice: parseFloat(apiData.price || apiData.current_price || 0),
      averagePrice: parseFloat(apiData.avg_price || apiData.average_price || 0),
      minPrice: parseFloat(apiData.min_price || 0),
      maxPrice: parseFloat(apiData.max_price || 0),
      unit: apiData.unit || 'kg',
      market: apiData.market || apiData.market_name || 'Local Market',
      trend: this.determineTrend(apiData),
      changePercent: parseFloat(apiData.change_percent || apiData.change || 0),
      lastUpdated: new Date(apiData.last_updated || apiData.date || Date.now()),
    };
  }

  /**
   * Determine price trend from API data
   */
  private determineTrend(apiData: any): 'up' | 'down' | 'stable' {
    const change = parseFloat(apiData.change_percent || apiData.change || 0);
    if (change > 2) return 'up';
    if (change < -2) return 'down';
    return 'stable';
  }

  /**
   * Transform history API response
   */
  private transformHistoryResponse(apiData: any[]): CropPrice[] {
    return apiData.map(item => ({
      crop: item.crop || item.commodity,
      price: parseFloat(item.price || 0),
      unit: item.unit || 'kg',
      market: item.market || item.market_name || 'Local Market',
      date: new Date(item.date || item.timestamp),
      change: item.change_percent ? parseFloat(item.change_percent) : undefined,
      trend: this.determineTrend(item),
    }));
  }

  /**
   * Get mock price data (used when API is not configured)
   * Replace this with actual API integration
   */
  private getMockPrice(crop: string, market?: string): MarketPriceData {
    const basePrices: Record<string, number> = {
      'rice': 25,
      'wheat': 22,
      'maize': 20,
      'tomato': 30,
      'potato': 15,
      'onion': 35,
      'cotton': 80,
      'sugarcane': 3,
    };

    const basePrice = basePrices[crop.toLowerCase()] || 20;
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const currentPrice = basePrice * (1 + variation);
    const trend = variation > 0.02 ? 'up' : variation < -0.02 ? 'down' : 'stable';

    return {
      crop,
      currentPrice: Math.round(currentPrice * 100) / 100,
      averagePrice: basePrice,
      minPrice: basePrice * 0.9,
      maxPrice: basePrice * 1.1,
      unit: 'kg',
      market: market || 'Local Market',
      trend,
      changePercent: variation * 100,
      lastUpdated: new Date(),
    };
  }
}

export default new MarketPriceService();
