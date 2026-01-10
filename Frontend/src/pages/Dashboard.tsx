// Dashboard - Summary Overview Page (Read-Only)
// This page provides a consolidated view without modifying any existing modules
import StatCard from '../components/StatCard';
import WeatherCard from '../components/WeatherCard';
import ClimateAlert from '../components/ClimateAlert';
import LocationMap from '../components/LocationMap';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useLocation } from '../hooks/useLocation';
import {
  MapPin,
  LandPlot,
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Sprout,
  Droplets,
  Bug,
} from 'lucide-react';
import {
  mockFarms,
  mockExpenses,
  mockTransactions,
  mockStockItems,
  mockFarmerStats,
  mockLandProperties,
  getTotalYield,
  StockItem,
} from '../data/mockData';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { location: gpsLocation } = useLocation();

  // Ensure default values (0) for new accounts
  const totalLandArea = mockLandProperties.length > 0 
    ? mockLandProperties.reduce((sum, land) => sum + (land.area || 0), 0)
    : 0;
  const totalFields = mockLandProperties.length || 0;
  const soilTypeDistribution = mockLandProperties.reduce((acc, land) => {
    acc[land.soilType] = (acc[land.soilType] || 0) + land.area;
    return acc;
  }, {} as Record<string, number>);
  const soilTypeData = Object.entries(soilTypeDistribution).map(([name, value]) => ({
    name,
    area: value,
  }));

  // Calculate Input Investment Overview (default to 0 for new accounts)
  const totalInputInvestment = mockExpenses.length > 0
    ? mockExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
    : 0;
  const investmentByCategory = mockExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);
  const investmentChartData = Object.entries(investmentByCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    amount: value,
  }));

  // Calculate Profit & Yield Summary (default to 0 for new accounts)
  const totalIncome = mockTransactions.length > 0
    ? mockTransactions
        .filter((t) => t.paymentStatus === 'paid')
        .reduce((sum, t) => sum + (t.amount || 0), 0)
    : 0;
  const netProfit = totalIncome - totalInputInvestment;
  const totalYield = mockTransactions.length > 0 ? getTotalYield() : 0;

  // Stock & Materials Status
  const stockByCategory = mockStockItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { total: 0, items: [] };
    }
    acc[item.category].total += item.quantity;
    acc[item.category].items.push(item);
    return acc;
  }, {} as Record<string, { total: number; items: StockItem[] }>);

  // Farmer Registration Statistics (default to 0 for new accounts)
  const totalFarmers = mockFarmerStats.length > 0
    ? mockFarmerStats.reduce((sum, stat) => sum + (stat.count || 0), 0)
    : 0;
  const farmerChartData = mockFarmerStats.map((stat) => ({
    name: stat.district,
    farmers: stat.count,
  }));

  // Colors for charts
  const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-gray-600 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Weather, Alerts & Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ClimateAlert />
          {/* Location Map */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={24} className="text-primary-600" />
              {t('dashboard.farmLocation')}
            </h2>
            <LocationMap
              latitude={gpsLocation.latitude}
              longitude={gpsLocation.longitude}
              locationName={user?.location || gpsLocation.address || t('dashboard.locationNotSet')}
              height="350px"
            />
          </div>
        </div>
        <div>
          <WeatherCard />
        </div>
      </div>

      {/* 1. Land Properties Summary */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <LandPlot className="text-primary-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Land Properties Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-primary-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t('dashboard.totalLandArea')}</p>
            <p className="text-2xl font-bold text-gray-900">{totalLandArea.toFixed(1)} {t('common.acres')}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t('dashboard.totalFields')}</p>
            <p className="text-2xl font-bold text-gray-900">{totalFields}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t('dashboard.averageFieldSize')}</p>
            <p className="text-2xl font-bold text-gray-900">
              {(totalLandArea / totalFields).toFixed(1)} {t('common.acres')}
            </p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('dashboard.soilTypeDistribution')}</h3>
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

      {/* 2. Input Investment Overview */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="text-primary-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">{t('dashboard.investmentOverview')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="bg-orange-50 p-6 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-1">{t('dashboard.totalInvestment')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{t('common.currency')}{totalInputInvestment.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {t('dashboard.includes')}
              </p>
            </div>
            <div className="space-y-2">
              {Object.entries(investmentByCategory).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{category}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{t('common.currency')}{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('dashboard.investmentByCategory')}</h3>
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

      {/* 3. Profit & Yield Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-primary-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">{t('dashboard.profitSummary')}</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{t('dashboard.totalIncome')}</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{t('common.currency')}{totalIncome.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.fromHarvested')}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.totalYield')}</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{totalYield.toLocaleString()} {t('common.kg')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.cropProduction')}</p>
            </div>
            <div className={`p-4 rounded-lg ${netProfit >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.netProfit')}</p>
              <p
                className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
              >
                {t('common.currency')}{netProfit.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.incomeExpenses')}</p>
            </div>
          </div>
        </div>

        {/* 4. Stock & Materials Status */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Package className="text-primary-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">{t('dashboard.stockMaterialsStatus')}</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(stockByCategory).map(([category, data]) => {
              const icons = {
                seeds: Sprout,
                fertilizers: Droplets,
                pesticides: Bug,
              };
              const Icon = icons[category as keyof typeof icons] || Package;
              return (
                <div key={category} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="text-primary-600" size={20} />
                      <span className="font-semibold text-gray-900 capitalize">{category}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {data.total} {data.items[0]?.unit || t('dashboard.units')}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {data.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-gray-600">
                        <span>{item.name}</span>
                        <span className="font-medium">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
                    {data.items.length > 3 && (
                      <p className="text-xs text-gray-500 mt-1">
                        +{data.items.length - 3} {t('common.moreItems')}
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
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Users className="text-primary-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">{t('dashboard.farmerRegistration')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="bg-primary-50 p-6 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-1">{t('dashboard.totalRegisteredFarmers')}</p>
              <p className="text-3xl font-bold text-gray-900">{totalFarmers.toLocaleString()}</p>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {mockFarmerStats.map((stat) => (
                <div key={stat.district} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-primary-600" size={16} />
                    <span className="font-medium text-gray-900">{stat.district}</span>
                  </div>
                  <span className="font-bold text-gray-900">{stat.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('dashboard.districtWiseDistribution')}</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={farmerChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
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
          value={mockFarms.length}
          icon={LandPlot}
          color="green"
        />
        <StatCard
          title={t('dashboard.activeCrops')}
          value={mockFarms.length * 2}
          icon={Sprout}
          color="blue"
        />
        <StatCard
          title={t('dashboard.totalYield')}
          value={`${totalYield.toLocaleString()} kg`}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title={t('dashboard.netProfit')}
          value={`₹${netProfit.toLocaleString()}`}
          icon={DollarSign}
          color={netProfit >= 0 ? 'green' : 'orange'}
        />
      </div>
    </div>
  );
};

export default Dashboard;
