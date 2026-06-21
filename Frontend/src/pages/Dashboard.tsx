// Dashboard - Role-aware Summary Overview Page
import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import WeatherCard from '../components/WeatherCard';
import ClimateAlert from '../components/ClimateAlert';
import LocationMap from '../components/LocationMap';
import AIInsightsWidget from '../components/AIInsightsWidget';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/ui/Skeleton';
import { useTranslation } from 'react-i18next';
import { useLocation as useGpsLocation } from '../hooks/useLocation';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, LandPlot, IndianRupee, TrendingUp, Package, Users, Sprout,
  Droplets, Bug, ExternalLink, AlertTriangle, ArrowRight,
  CloudRain, Wind, Thermometer,
} from 'lucide-react';
import { StockItem } from '../data/mockData';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import DetailModal from '../components/DetailModal';
import { translateCrop, translateDistrict, translateCategory } from '../utils/translations';
import { getCropIcon } from '../utils/cropIcons';
import api from '../services/api';
import { DataCache } from '../utils/dataCache';
import { formatDateDisplay } from '../utils/dateFormatter';
import CitizenDashboard from './CitizenDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { location: gpsLocation } = useGpsLocation();
  const navigate = useNavigate();

  // NOTE: role-based rendering happens AFTER all hooks (see just before return)

  const [detailModal, setDetailModal] = useState<{
    type: 'totalFields' | 'activeCrops' | 'totalYield' | 'netProfit' | null;
    data?: any;
  }>({ type: null });
  
  const [data, setData] = useState<{
    farms: any[];
    crops: any[];
    expenses: any[];
    yields: any[];
    transactions: any[];
    stockItems: any[];
    farmerStats: any[];
  }>({
    farms: [],
    crops: [],
    expenses: [],
    yields: [],
    transactions: [],
    stockItems: [],
    farmerStats: [],
  });

  const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<any[]>([]);
  const [loadingLowStock, setLoadingLowStock] = useState(false);

  // NOTE: we no longer auto-redirect admins away from the Home (Dashboard) page.

  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Load all dashboard data
  const fetchDashboardData = async (force = false) => {
    if (!user) return;
    
    // Check cache first if not forced
    if (!force) {
      const cachedData = DataCache.get<any>('dashboard_data');
      if (cachedData) {
        setData(cachedData.data);
        setLastUpdated(cachedData.timestamp);
        return;
      }
    }

    try {
      const [
        farmsRes,
        cropsRes,
        expensesRes,
        yieldsRes,
        stockRes,
        farmerStatsRes
      ] = await Promise.all([
        api.getFarms(),
        api.getCrops(),
        api.getExpenses(),
        api.getYields(),
        api.getStockItems(),
        user.role === 'admin' ? api.getAdminStatistics() : Promise.resolve(null)
      ]);

      const statsBody = farmerStatsRes || {};
      // Backend returns farmerLoginsByDistrict with uniqueFarmers; map to expected shape
      const farmerStats = (statsBody.farmerLoginsByDistrict || []).map((s: any) => ({
        district: s.district,
        count: s.uniqueFarmers || s.count || 0,
      }));

      const newData = {
        farms: farmsRes.data || [],
        crops: cropsRes.data || [],
        expenses: expensesRes.data || [],
        yields: yieldsRes.data || [],
        transactions: [],
        stockItems: stockRes.data || [],
        farmerStats,
      };

      const now = Date.now();
      setData(newData);
      setLastUpdated(now);
      DataCache.set('dashboard_data', { data: newData, timestamp: now });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Load low stock items
  useEffect(() => {
    const loadLowStockItems = async () => {
      if (!user) return;
      setLoadingLowStock(true);
      try {
        const response = await api.getLowStockItems();
        const items = Array.isArray(response) ? response : (response as any)?.data || [];
        setLowStockItems(items);
      } catch (error) {
        console.error('Failed to load low stock items:', error);
      } finally {
        setLoadingLowStock(false);
      }
    };
    loadLowStockItems();
  }, [user]);

  // Load weather alerts
  useEffect(() => {
    const loadWeatherAlerts = async () => {
      if (!user) return;
      try {
        const response = await api.getUnreadAlerts();
        // response is the unwrapped body (an array); also has non-enum .data pointing to itself
        const alertList = Array.isArray(response) ? response : (response as any)?.data || [];
        setWeatherAlerts(alertList.slice(0, 3));
      } catch (error) {
        console.error('Failed to load weather alerts:', error);
      }
    };
    loadWeatherAlerts();
  }, [user]);

  // Calculations from fetched data
  const totalLandArea = data.farms.reduce((sum, farm) => sum + (farm.landSize || farm.area || 0), 0);
  const totalFields = data.farms.length;
  const soilTypeDistribution = data.farms.reduce((acc, farm) => {
    const type = farm.soilType || 'Unknown';
    acc[type] = (acc[type] || 0) + (farm.landSize || farm.area || 0);
    return acc;
  }, {} as Record<string, number>);
  
  const soilTypeData = Object.entries(soilTypeDistribution).map(([name, value]) => ({
    name,
    area: value,
  }));

  const totalInputInvestment = data.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const investmentByCategory = data.expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const investmentChartData = Object.entries(investmentByCategory).map(([name, value]) => ({
    name: translateCategory(name) || name,
    amount: value,
  }));

  // Compute income from harvested yields (quantity × ₹45/kg as a revenue proxy)
  const totalYield = data.yields.reduce((sum, y) => sum + (y.quantity || 0), 0);
  const totalIncome = data.transactions.length > 0
    ? data.transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
    : totalYield * 45;
  const netProfit = totalIncome - totalInputInvestment;

  const stockByCategory = data.stockItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { total: 0, items: [] };
    }
    acc[item.category].total += item.quantity;
    acc[item.category].items.push(item);
    return acc;
  }, {} as Record<string, { total: number; items: any[] }>);

  const totalFarmers = data.farmerStats.reduce((sum, stat) => sum + (stat.count || 0), 0);
  const farmerChartData = data.farmerStats.map((stat) => ({
    name: translateDistrict(stat.district),
    farmers: stat.count,
  }));

  // Colors for charts
  const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'];

  // Role-based rendering (after all hooks)
  if (user?.role === 'citizen') return <CitizenDashboard />;
  if (user?.role === 'admin') return <AdminDashboard />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-700">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium text-sm sm:text-base">
            {t('dashboard.subtitle')}
            {lastUpdated && (
              <span className="ml-2 text-xs opacity-60">
                • Last synced: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => fetchDashboardData(true)}
          className="self-start sm:self-auto p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
          title="Force Sync"
        >
          <TrendingUp size={18} className="text-primary-600" />
        </button>
      </div>

      {/* AI ML Insights Section */}
      <AIInsightsWidget />

      {/* Weather, Alerts & Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="glass-card overflow-hidden">
            <ClimateAlert />
          </div>
          {/* Location Map */}
          <div className="glass-card p-4 sm:p-6">
            <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-primary-600 dark:text-primary-400" />
              {t('dashboard.farmLocation')}
            </h2>
            <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700/50 shadow-inner">
              <LocationMap
                latitude={gpsLocation.latitude}
                longitude={gpsLocation.longitude}
                locationName={user?.location || gpsLocation.address || t('dashboard.locationNotSet')}
                height="250px"
              />
            </div>
          </div>
        </div>
        <div className="space-y-4 sm:space-y-6">
          <div className="glass-card p-4 sm:p-6">
            <WeatherCard />
          </div>

          {/* Low Stock Alert Widget */}
          {lowStockItems.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-amber-600 dark:text-amber-400" size={20} />
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                    Low Stock Alert
                  </h3>
                </div>
                <button
                  onClick={() => navigate('/stock')}
                  className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 text-sm font-medium flex items-center gap-1"
                >
                  View All
                  <ArrowRight size={14} />
                </button>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} running low
              </p>
              <div className="space-y-2">
                {loadingLowStock ? (
                  <>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </>
                ) : (
                  lowStockItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-white dark:bg-gray-800 rounded p-2 text-sm"
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {item.name}
                      </span>
                      <span className="text-amber-700 dark:text-amber-300 font-semibold">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))
                )}
                {!loadingLowStock && lowStockItems.length > 3 && (
                  <p className="text-xs text-amber-700 dark:text-amber-300 text-center">
                    +{lowStockItems.length - 3} more items
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Weather Alerts Widget */}
          {weatherAlerts.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CloudRain className="text-red-600 dark:text-red-400" size={20} />
                  <h3 className="font-semibold text-red-900 dark:text-red-100">
                    Weather Alerts
                  </h3>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await api.markAllAlertsAsRead();
                      const r = await api.getUnreadAlerts();
                      const list = Array.isArray(r) ? r : (r as any)?.data || [];
                      setWeatherAlerts(list.slice(0, 3));
                    } catch (error) {
                      console.error('Failed to mark alerts as read:', error);
                    }
                  }}
                  className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 text-sm font-medium"
                >
                  Mark All Read
                </button>
              </div>
              <div className="space-y-3">
                {weatherAlerts.map((alert) => {
                  const getAlertIcon = () => {
                    switch (alert.alert_type) {
                      case 'heavy_rain':
                      case 'flood':
                        return CloudRain;
                      case 'storm':
                        return Wind;
                      case 'extreme_heat':
                      case 'frost':
                        return Thermometer;
                      default:
                        return AlertTriangle;
                    }
                  };
                  const Icon = getAlertIcon();
                  const getSeverityColor = () => {
                    switch (alert.severity) {
                      case 'critical':
                        return 'bg-red-600 text-white';
                      case 'high':
                        return 'bg-orange-600 text-white';
                      case 'medium':
                        return 'bg-yellow-600 text-white';
                      default:
                        return 'bg-blue-600 text-white';
                    }
                  };
                  return (
                    <div
                      key={alert.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-red-200 dark:border-red-800"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon size={16} className="text-red-600 dark:text-red-400" />
                          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {alert.title}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor()}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {alert.message}
                      </p>
                      {alert.recommendation && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                          💡 {alert.recommendation}
                        </p>
                      )}
                      <button
                        onClick={async () => {
                          try {
                            await api.markAlertAsRead(alert.id);
                            const r = await api.getUnreadAlerts();
                            const list = Array.isArray(r) ? r : (r as any)?.data || [];
                            setWeatherAlerts(list.slice(0, 3));
                          } catch (error) {
                            console.error('Failed to mark alert as read:', error);
                          }
                        }}
                        className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
                      >
                        Mark as read
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 1. Land Properties Summary with glass effect */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <LandPlot className="text-primary-600 dark:text-primary-400" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.landPropertiesSummary')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200 dark:border-primary-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.totalLandArea')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalLandArea.toFixed(1)} {t('common.acres')}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.totalFields')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalFields}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.averageFieldSize')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {(totalLandArea / (totalFields || 1)).toFixed(1)} {t('common.acres')}
            </p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('dashboard.soilTypeDistribution')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={soilTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="area"
              >
                {soilTypeData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Input Investment Overview with interactive glass card */}
      <div className="glass-card p-6 cursor-pointer hover:shadow-xl dark:hover:shadow-primary-900/10 transition-all duration-300" onClick={() => navigate('/expenses')}>
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <IndianRupee className="text-primary-600 dark:text-primary-400" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">{t('dashboard.investmentOverview')}</h2>
          <ExternalLink size={18} className="text-gray-400 dark:text-gray-500 ml-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg mb-4 border border-orange-200 dark:border-orange-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.totalInvestment')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('common.currency')}{totalInputInvestment.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {t('dashboard.includes')}
              </p>
            </div>
            <div className="space-y-2">
              {Object.entries(investmentByCategory).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t(`expenses.${category}`) || t(`dashboard.category${category.charAt(0).toUpperCase() + category.slice(1)}`) || category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{t('common.currency')}{(amount as number).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate('/expenses'); }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.investmentByCategory')}</h3>
              <ExternalLink size={16} className="text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={investmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#16a34a" name={`${t('dashboard.amount')} (${t('common.currency')})`} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Profit & Yield Summary and Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-primary-600 dark:text-primary-400" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.profitSummary')}</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.totalIncome')}</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{t('common.currency')}{totalIncome.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t('dashboard.fromHarvested')}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.totalYield')}</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{totalYield.toLocaleString()} {t('common.kg')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t('dashboard.cropProduction')}</p>
            </div>
            <div className={`p-4 rounded-lg border ${netProfit >= 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.netProfit')}</p>
              <p
                className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
              >
                {t('common.currency')}{netProfit.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t('dashboard.incomeExpenses')}</p>
            </div>
          </div>
        </div>

        {/* 4. Stock & Materials Status */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="text-primary-600 dark:text-primary-400" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.stockMaterialsStatus')}</h2>
          </div>
          <div className="space-y-4">
                    {Object.entries(stockByCategory).map(([category, catData]: [string, any]) => {
                      const icons = {
                        seeds: Sprout,
                        fertilizers: Droplets,
                        pesticides: Bug,
                      };
                      const Icon = (icons as any)[category] || Package;
                      return (
                        <div key={category} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Icon className="text-primary-600 dark:text-primary-400" size={20} />
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {t(`expenses.${category}`) || category.charAt(0).toUpperCase() + category.slice(1)}
                              </span>
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              {catData.total} {catData.items[0]?.unit || t('dashboard.units')}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            {catData.items.slice(0, 3).map((item: any) => (
                              <div key={item.id} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>{item.name}</span>
                                <span className="font-medium">
                                  {item.quantity} {item.unit}
                                </span>
                              </div>
                            ))}
                            {catData.items.length > 3 && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                +{catData.items.length - 3} {t('common.moreItems')}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
          </div>
        </div>
      </div>

      {/* 5. Farmer Registration Statistics */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="text-primary-600 dark:text-primary-400" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.farmerRegistration')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg mb-4 border border-primary-200 dark:border-primary-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.totalRegisteredFarmers')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalFarmers.toLocaleString()}</p>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.farmerStats.map((stat: any) => (
                <div key={stat.district} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-primary-600 dark:text-primary-400" size={16} />
                    <span className="font-medium text-gray-900 dark:text-gray-100">{translateDistrict(stat.district)}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{stat.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('dashboard.districtWiseDistribution')}</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={farmerChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', borderRadius: '4px' }}
                  formatter={(value: any) => [value, t('dashboard.farmers')]}
                />
                <Legend />
                <Bar dataKey="farmers" fill="#16a34a" name={t('dashboard.farmers')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.totalFields')}
          value={data.farms.length}
          icon={LandPlot}
          color="green"
          onClick={() => setDetailModal({ type: 'totalFields', data: data.farms })}
        />
        <StatCard
          title={t('dashboard.activeCrops')}
          value={data.crops.filter((c) => c.status === 'active').length}
          icon={Sprout}
          color="blue"
          onClick={() => setDetailModal({ type: 'activeCrops', data: data.crops.filter((c) => c.status === 'active') })}
        />
        <StatCard
          title={t('dashboard.totalYield')}
          value={`${totalYield.toLocaleString()} kg`}
          icon={TrendingUp}
          color="purple"
          onClick={() => setDetailModal({ type: 'totalYield', data: { totalYield, crops: data.crops, yields: data.yields } })}
        />
        <StatCard
          title={t('dashboard.netProfit')}
          value={`₹${netProfit.toLocaleString()}`}
          icon={IndianRupee}
          color={netProfit >= 0 ? 'green' : 'orange'}
          onClick={() => setDetailModal({ type: 'netProfit', data: { netProfit, totalIncome, totalInputInvestment, expenses: data.expenses, transactions: data.transactions } })}
        />
      </div>

      {/* Detail Modals */}
      {detailModal.type === 'totalFields' && detailModal.data && (
        <DetailModal
          isOpen={true}
          onClose={() => setDetailModal({ type: null })}
          title={t('dashboard.totalFields')}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('common.total')}</p>
              <p className="text-2xl font-bold text-green-600">{detailModal.data.length} {t('dashboard.totalFields')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detailModal.data.map((farm: any) => (
                <div
                  key={farm.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{farm.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <MapPin size={14} className="inline mr-1" />
                    {farm.location}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <LandPlot size={14} className="inline mr-1" />
                    {farm.landSize} {t('common.acres')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('settings.soilType')}: {farm.soilType}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </DetailModal>
      )}

      {detailModal.type === 'activeCrops' && detailModal.data && (
        <DetailModal
          isOpen={true}
          onClose={() => setDetailModal({ type: null })}
          title={t('dashboard.activeCrops')}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('common.total')}</p>
              <p className="text-2xl font-bold text-blue-600">{detailModal.data.length} {t('dashboard.activeCrops')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detailModal.data.map((crop: any) => (
                <div
                  key={crop.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl" title={translateCrop(crop.name)}>{getCropIcon(crop.name)}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{translateCrop(crop.name)}</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('crops.category')}: {crop.category}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('crops.season')}: {crop.season}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('crops.sowingDate')}: {formatDateDisplay(crop.sowingDate)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('crops.harvestDate')}: {formatDateDisplay(crop.harvestDate)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </DetailModal>
      )}

      {detailModal.type === 'totalYield' && detailModal.data && (
        <DetailModal
          isOpen={true}
          onClose={() => setDetailModal({ type: null })}
          title={t('dashboard.totalYield')}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.totalYield')}</p>
              <p className="text-2xl font-bold text-purple-600">{detailModal.data.totalYield.toLocaleString()} {t('common.kg')}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.cropProduction')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detailModal.data.yields.map((yield_: any) => {
                  const crop = detailModal.data.crops.find((c: any) => c.id === yield_.cropId);
                  if (!crop) return null;
                  return (
                    <div
                      key={yield_.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl" title={translateCrop(crop.name)}>{getCropIcon(crop.name)}</span>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{translateCrop(crop.name)}</h4>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">{yield_.quantity.toLocaleString()} {t('common.kg')}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('crops.averageYield')}: {crop.averageYield?.toLocaleString() || 'N/A'} {t('common.kg')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('yield.harvestDate')}: {formatDateDisplay(yield_.date)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('yield.quality')}: {yield_.quality === 'excellent' ? t('yield.excellent') : yield_.quality === 'good' ? t('yield.good') : t('yield.average')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DetailModal>
      )}

      {detailModal.type === 'netProfit' && detailModal.data && (
        <DetailModal
          isOpen={true}
          onClose={() => setDetailModal({ type: null })}
          title={t('dashboard.netProfit')}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            <div className={`p-4 rounded-lg mb-4 ${detailModal.data.netProfit >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.netProfit')}</p>
              <p className={`text-2xl font-bold ${detailModal.data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {t('common.currency')}{detailModal.data.netProfit.toLocaleString()}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.totalIncome')}</p>
                <p className="text-2xl font-bold text-green-600">
                  {t('common.currency')}{detailModal.data.totalIncome.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('dashboard.fromHarvested')}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.totalInvestment')}</p>
                <p className="text-2xl font-bold text-red-600">
                  {t('common.currency')}{detailModal.data.totalInputInvestment.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('dashboard.includes')}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.investmentByCategory')}</h3>
              <div className="space-y-2">
                {(Object.entries(
                  detailModal.data.expenses.reduce((acc: Record<string, number>, exp: any) => {
                    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
                    return acc;
                  }, {} as Record<string, number>)
                ) as [string, number][]).map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {t(`expenses.${category}`) || t(`dashboard.category${category.charAt(0).toUpperCase() + category.slice(1)}`) || category}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">{t('common.currency')}{amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DetailModal>
      )}
    </div>
  );
};



export default Dashboard;
