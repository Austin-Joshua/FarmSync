import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, Bell, Calendar, IndianRupee, BarChart3, AlertCircle, ShoppingCart } from 'lucide-react';
import api from '../services/api';
import { formatDateDisplay, formatDateShort } from '../utils/dateFormatter';
import toast from 'react-hot-toast';

interface PriceData {
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

interface PriceHistory {
  crop: string;
  price: number;
  unit: string;
  market: string;
  date: Date;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
}

interface BestTimeToSell {
  recommendedDate: Date;
  expectedPrice: number;
  confidence: number;
  reason: string;
}

const MarketPrices = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<PriceData | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [bestTimeToSell, setBestTimeToSell] = useState<BestTimeToSell | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alertPrice, setAlertPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const [showAlertForm, setShowAlertForm] = useState(false);

  const crops = ['rice', 'wheat', 'maize', 'tomato', 'potato', 'onion', 'cotton', 'sugarcane'];

  useEffect(() => {
    if (selectedCrop) {
      loadPriceData();
    }
  }, [selectedCrop]);

  const loadPriceData = async () => {
    if (!selectedCrop) return;

    setLoading(true);
    setError('');

    try {
      const [priceData, historyData, bestTimeData] = await Promise.all([
        api.getCurrentPrice(selectedCrop),
        api.getPriceHistory(selectedCrop, 30),
        api.getBestTimeToSell(selectedCrop),
      ]);

      setCurrentPrice(priceData as PriceData);
      setPriceHistory(historyData as PriceHistory[]);
      setBestTimeToSell(bestTimeData as BestTimeToSell);
    } catch (err: any) {
      setError(err.message || 'Failed to load market price data');
    } finally {
      setLoading(false);
    }
  };

  const handleSetAlert = async () => {
    if (!selectedCrop || !alertPrice) {
      setError('Please enter target price');
      return;
    }

    try {
      await api.setPriceAlert({ crop: selectedCrop, price: parseFloat(alertPrice), condition: alertCondition });
      alert('Price alert set successfully!');
      setShowAlertForm(false);
      setAlertPrice('');
    } catch (err: any) {
      setError(err.message || 'Failed to set price alert');
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="text-green-500" size={20} />;
      case 'down':
        return <TrendingDown className="text-danger" size={20} />;
      default:
        return <Minus className="text-gray-500" size={20} />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-danger dark:text-red-400';
      default:
        return 'text-text-muted';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('marketPrices.title', 'Market Prices')}
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {t('marketPrices.subtitle', 'Track real-time crop prices and get selling recommendations')}
          </p>
        </div>
        <button
          onClick={() => navigate('/marketplace')}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto text-sm"
        >
          <ShoppingCart size={16} /> Buy from Farmers
        </button>
      </div>

      {/* Crop Selection */}
      <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          {t('marketPrices.selectCrop', 'Select Crop')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {crops.map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`py-2.5 px-3 rounded-xl border-2 transition-all text-sm font-semibold capitalize ${
                selectedCrop === crop
                  ? 'border-accent bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-border hover:border-primary-300 text-text-muted'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
          <p className="mt-3 text-gray-500 text-sm">{t('common.loading', 'Loading...')}</p>
        </div>
      )}

      {currentPrice && !loading && (
        <>
          {/* Current Price Card */}
          <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                {currentPrice.crop}
              </h2>
              <div className="flex gap-2">
                <button onClick={() => { navigate('/marketplace'); toast.success('Redirecting to marketplace!'); }} className="btn-primary flex items-center gap-2 text-sm py-2">
                  <ShoppingCart size={15} /> Buy from Farmers
                </button>
                <button onClick={() => setShowAlertForm(!showAlertForm)} className="btn-secondary flex items-center gap-2 text-sm py-2">
                  <Bell size={15} /> Alert
                </button>
              </div>
            </div>

            {showAlertForm && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
                <h3 className="font-semibold mb-3 text-sm">{t('marketPrices.setPriceAlert', 'Set Price Alert')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="number" value={alertPrice} onChange={(e) => setAlertPrice(e.target.value)} placeholder={t('marketPrices.targetPrice', 'Target Price')} className="input-field" />
                  <select aria-label="Price alert condition" value={alertCondition} onChange={(e) => setAlertCondition(e.target.value as 'above' | 'below')} className="input-field">
                    <option value="above">{t('marketPrices.above', 'Above')}</option>
                    <option value="below">{t('marketPrices.below', 'Below')}</option>
                  </select>
                  <button onClick={handleSetAlert} className="btn-primary text-sm">{t('marketPrices.setAlert', 'Set Alert')}</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <p className="text-sm text-text-muted mb-1">
                    {t('marketPrices.currentPrice', 'Current Price')}
                  </p>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="text-accent" size={24} />
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      ₹{currentPrice.currentPrice.toFixed(2)}
                    </span>
                    <span className="text-gray-500">/{currentPrice.unit}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {getTrendIcon(currentPrice.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(currentPrice.trend)}`}>
                      {currentPrice.changePercent > 0 ? '+' : ''}
                      {currentPrice.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-text-muted mb-1">
                    {t('marketPrices.market', 'Market')}
                  </p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {currentPrice.market}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('marketPrices.lastUpdated', 'Last updated')}:{' '}
                    {formatDateDisplay(currentPrice.lastUpdated)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-text-muted mb-1">
                    {t('marketPrices.priceRange', 'Price Range')}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {t('marketPrices.min', 'Min')}: ₹{currentPrice.minPrice.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {t('marketPrices.max', 'Max')}: ₹{currentPrice.maxPrice.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('marketPrices.avg', 'Avg')}: ₹{currentPrice.averagePrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Best Time to Sell */}
            {bestTimeToSell && (
              <div className="bg-gradient-to-r from-primary-50 to-green-50 dark:from-primary-900/20 dark:to-green-900/20 rounded-xl shadow-lg p-6 mb-6 border border-primary-200 dark:border-primary-800">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg">
                    <Calendar className="text-accent dark:text-accent" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {t('marketPrices.bestTimeToSell', 'Best Time to Sell')}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {t('marketPrices.recommendedDate', 'Recommended Date')}:{' '}
                      <span className="font-semibold">
                        {formatDateDisplay(bestTimeToSell.recommendedDate)}
                      </span>
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {t('marketPrices.expectedPrice', 'Expected Price')}:{' '}
                      <span className="font-semibold">₹{bestTimeToSell.expectedPrice.toFixed(2)}</span>
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {t('marketPrices.confidence', 'Confidence')}:{' '}
                      <span className="font-semibold">{(bestTimeToSell.confidence * 100).toFixed(0)}%</span>
                    </p>
                    <p className="text-sm text-text-muted mt-2">
                      {bestTimeToSell.reason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Price History Chart */}
            {priceHistory.length > 0 && (
              <div className="bg-surface rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <BarChart3 size={24} />
                    {t('marketPrices.priceHistory', 'Price History (30 Days)')}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    <div className="grid grid-cols-7 gap-2 text-xs text-text-muted mb-2">
                      <div>{t('marketPrices.date', 'Date')}</div>
                      <div>{t('marketPrices.price', 'Price')}</div>
                      <div>{t('marketPrices.change', 'Change')}</div>
                      <div>{t('marketPrices.trend', 'Trend')}</div>
                      <div>{t('marketPrices.market', 'Market')}</div>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {priceHistory.slice(-10).reverse().map((item, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-7 gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm"
                        >
                          <div>{formatDateShort(item.date)}</div>
                          <div className="font-semibold">₹{item.price.toFixed(2)}</div>
                          <div className={item.change && item.change > 0 ? 'text-green-600' : item.change && item.change < 0 ? 'text-danger' : ''}>
                            {item.change ? `${item.change > 0 ? '+' : ''}${item.change.toFixed(2)}%` : '-'}
                          </div>
                          <div>{item.trend && getTrendIcon(item.trend)}</div>
                          <div className="col-span-3 text-xs text-gray-500">{item.market}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {!selectedCrop && !loading && (
          <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 sm:p-12 text-center">
            <BarChart3 className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <p className="text-text-muted text-lg font-medium">
              {t('marketPrices.selectCropMessage', 'Select a crop to view market prices')}
            </p>
            <p className="text-xs text-gray-400 mt-2">Choose from rice, wheat, tomato, cotton, and more</p>
          </div>
        )}
    </div>
  );
};

export default MarketPrices;
