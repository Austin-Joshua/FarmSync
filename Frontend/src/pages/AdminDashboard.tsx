// Exclusive Admin Dashboard with Comprehensive Statistics
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Users,
  TrendingUp,
  Package,
  LogIn,
  DollarSign,
  MapPin,
  BarChart3,
  Activity,
  Truck,
  AlertCircle,
  Calendar,
  IndianRupee,
} from 'lucide-react';
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
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#16a34a', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

interface AdminStatistics {
  farmerLoginsByDistrict: Array<{
    district: string;
    totalLogins: number;
    uniqueFarmers: number;
  }>;
  revenueByDistrict: Array<{
    district: string;
    totalRevenue: number;
    totalYield: number;
    totalExpenses: number;
    netProfit: number;
  }>;
  totalCrops: number;
  totalGoodsDelivered: {
    totalQuantity: number;
    totalDeliveries: number;
  };
  totalFarmerLogins: number;
  recentLogins: Array<{
    date: string;
    loginCount: number;
  }>;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await api.getAdminStatistics() as any;
        if (response?.data) {
          setStatistics(response.data);
        } else {
          setError('Failed to load statistics');
        }
      } catch (err: any) {
        console.error('Error fetching admin statistics:', err);
        setError(err.message || 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchStatistics();
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Statistics</h2>
          <p className="text-gray-600 dark:text-gray-400">{error || 'Failed to load statistics'}</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const loginChartData = statistics.farmerLoginsByDistrict.map(item => ({
    name: item.district,
    logins: item.totalLogins,
    farmers: item.uniqueFarmers,
  }));

  const revenueChartData = statistics.revenueByDistrict.map(item => ({
    name: item.district,
    revenue: item.totalRevenue,
    expenses: item.totalExpenses,
    profit: item.netProfit,
  }));

  const recentLoginsData = statistics.recentLogins.map(item => ({
    date: (() => {
      const d = new Date(item.date);
      const day = d.getDate();
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      return `${day} ${month}`;
    })(),
    logins: item.loginCount,
  }));

  const totalRevenue = statistics.revenueByDistrict.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalExpenses = statistics.revenueByDistrict.reduce((sum, item) => sum + item.totalExpenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const totalYield = statistics.revenueByDistrict.reduce((sum, item) => sum + item.totalYield, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">System-wide statistics and analytics</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar size={18} />
            <span>{(() => {
              const d = new Date();
              const day = d.getDate();
              const month = d.toLocaleDateString('en-US', { month: 'long' });
              const year = d.getFullYear();
              const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
              return `${day} ${month} ${year}, ${weekday}`;
            })()}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg shadow p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-1 font-medium">Total Farmer Logins</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{statistics.totalFarmerLogins.toLocaleString()}</p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {statistics.farmerLoginsByDistrict.length} districts
              </p>
            </div>
            <LogIn className="text-blue-600 dark:text-blue-400" size={40} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg shadow p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 mb-1 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Net Profit: ₹{totalProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <DollarSign className="text-green-600 dark:text-green-400" size={40} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg shadow p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 mb-1 font-medium">Total Crops</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{statistics.totalCrops.toLocaleString()}</p>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Active across all farms</p>
            </div>
            <Package className="text-purple-600 dark:text-purple-400" size={40} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg shadow p-6 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400 mb-1 font-medium">Goods Delivered</p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                {statistics.totalGoodsDelivered.totalQuantity.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                {statistics.totalGoodsDelivered.totalDeliveries} deliveries
              </p>
            </div>
            <Truck className="text-orange-600 dark:text-orange-400" size={40} />
          </div>
        </div>
      </div>

      {/* Farmer Logins by District */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <LogIn className="text-primary-600 dark:text-primary-400" size={24} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Farmer Logins by District</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={loginChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="logins" fill="#3b82f6" name="Total Logins" />
                <Bar dataKey="farmers" fill="#16a34a" name="Unique Farmers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={loginChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="logins"
                >
                  {loginChartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statistics.farmerLoginsByDistrict.map((item, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.district}</h3>
                <MapPin className="text-primary-600 dark:text-primary-400" size={18} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Logins:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{item.totalLogins}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Unique Farmers:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{item.uniqueFarmers}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by District */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <DollarSign className="text-primary-600 dark:text-primary-400" size={24} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Revenue by District</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                <Legend />
                <Bar dataKey="revenue" fill="#16a34a" name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                <Bar dataKey="profit" fill="#3b82f6" name="Net Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={revenueChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {revenueChartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statistics.revenueByDistrict.map((item, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.district}</h3>
                <MapPin className="text-primary-600 dark:text-primary-400" size={18} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Revenue:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    ₹{item.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Expenses:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    ₹{item.totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Net Profit:</span>
                  <span className={`font-semibold ${item.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ₹{item.netProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Yield:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {item.totalYield.toLocaleString('en-IN', { maximumFractionDigits: 0 })} kg
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Login Activity */}
      {statistics.recentLogins.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-primary-600 dark:text-primary-400" size={24} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recent Login Activity (Last 30 Days)</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={recentLoginsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="logins" stroke="#3b82f6" strokeWidth={2} name="Daily Logins" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Crop Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Crops:</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{statistics.totalCrops}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Yield:</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totalYield.toLocaleString('en-IN', { maximumFractionDigits: 0 })} kg
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Delivery Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Deliveries:</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {statistics.totalGoodsDelivered.totalDeliveries}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Quantity:</span>
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {statistics.totalGoodsDelivered.totalQuantity.toLocaleString('en-IN', { maximumFractionDigits: 0 })} kg
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Financial Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Revenue:</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Expenses:</span>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                ₹{totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400 font-semibold">Net Profit:</span>
              <span className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                ₹{totalProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
