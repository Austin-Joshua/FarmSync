import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  TrendingUp,
  Package,
  LogIn,
  MapPin,
  Activity,
  Truck,
  AlertCircle,
  Calendar,
  IndianRupee,
  Loader,
  RefreshCw,
  TrendingDown,
  Trash2,
  Lock
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
  AreaChart,
  Area
} from 'recharts';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

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
  const [activeTab, setActiveTab] = useState<'analytics' | 'marketplace'>('analytics');
  const [marketplaceItems, setMarketplaceItems] = useState<any[]>([]);
  const [loadingMarket, setLoadingMarket] = useState(false);

  const fetchMarketplaceItems = async () => {
    try {
      setLoadingMarket(true);
      const res = await api.getMarketplaceItems() as any;
      setMarketplaceItems(res || []);
    } catch (e) {
      console.error('Failed to load marketplace listings', e);
      toast.error('Failed to query marketplace listings');
    } finally {
      setLoadingMarket(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'marketplace') {
      fetchMarketplaceItems();
    }
  }, [activeTab]);

  const handleAdminDeleteListing = async (id: string) => {
    if (!window.confirm('Are you sure you want to moderate and delete this marketplace listing?')) return;
    try {
      const response = await api.adminDeleteMarketplaceItem(id) as any;
      if (response && response.status === 'success') {
        toast.success('Listing moderated and deleted successfully');
        fetchMarketplaceItems();
      }
    } catch (err: any) {
      console.error('Failed to delete listing as admin:', err);
      toast.error('Failed to delete listing');
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAdminStatistics() as any;
      if (response?.data) {
        setStatistics(response.data);
      } else {
        setError('Failed to load statistics data');
      }
    } catch (err: any) {
      console.error('Error fetching admin statistics:', err);
      setError(err.message || 'Failed to connect to admin services');
      toast.error('Admin telemetry service unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStatistics();
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-danger mb-6">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-3xl font-black text-text mb-2 uppercase tracking-tight">Access Restricted</h2>
        <p className="text-gray-500 max-w-sm">This terminal is reserved for administrative personnel only. Unauthorized access has been logged.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader className="animate-spin h-12 w-12 text-accent mb-4" />
        <p className="text-gray-500 font-medium font-mono uppercase tracking-widest">Hydrating global analytics...</p>
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <div className="card border-red-500/20 bg-red-50/10 dark:bg-red-900/10 text-center py-24">
        <AlertCircle size={48} className="text-danger mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Service Fault</h2>
        <p className="text-danger dark:text-red-300 mb-8">{error}</p>
        <button onClick={fetchStatistics} className="btn-primary bg-red-600 hover:bg-red-700">Reconnect Service</button>
      </div>
    );
  }

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
    date: format(new Date(item.date), 'MMM d'),
    logins: item.loginCount,
  }));

  const totalRevenue = statistics.revenueByDistrict.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalExpenses = statistics.revenueByDistrict.reduce((sum, item) => sum + item.totalExpenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
// totalYield calculation removed as it's unused

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text font-medium">Global Command Center</h1>
          <p className="text-gray-500 font-medium">Real-time aggregate data across all Tamil Nadu hubs</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-500 flex items-center gap-2">
             <Calendar size={14} />
             {format(new Date(), 'EEEE, MMMM do yyyy')}
           </div>
           <button onClick={fetchStatistics} aria-label="Refresh statistics" className="p-2 bg-accent text-white rounded-xl hover:rotate-180 transition-transform duration-500"><RefreshCw size={20} /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'analytics'
              ? 'border-accent text-accent dark:text-accent font-black'
              : 'border-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500'
          }`}
        >
          Telemetry & Analytics
        </button>
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'marketplace'
              ? 'border-accent text-accent dark:text-accent font-black'
              : 'border-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500'
          }`}
        >
          Marketplace Moderation
        </button>
      </div>

      {activeTab === 'analytics' ? (
        <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card border-l-4 border-blue-500 relative overflow-hidden group">
          <div className="absolute right-[-20px] bottom-[-20px] text-info/10 group-hover:scale-150 transition-transform"><LogIn size={100} /></div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Farmer Sessions</p>
          <p className="text-4xl font-black text-info dark:text-blue-400">{statistics.totalFarmerLogins.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-info/60 bg-blue-50 dark:bg-blue-900/20 w-fit px-2 py-0.5 rounded">
            {statistics.farmerLoginsByDistrict.length} DISTRICTS ACTIVE
          </div>
        </div>

        <div className="card border-l-4 border-accent relative overflow-hidden group">
          <div className="absolute right-[-20px] bottom-[-20px] text-accent/10 group-hover:scale-150 transition-transform"><IndianRupee size={100} /></div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Aggregate Revenue</p>
          <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">₹{totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600/60 bg-emerald-50 dark:bg-emerald-900/20 w-fit px-2 py-0.5 rounded">
            <TrendingUp size={10} /> PROFIT: ₹{totalProfit.toLocaleString()}
          </div>
        </div>

        <div className="card border-l-4 border-purple-500 relative overflow-hidden group">
          <div className="absolute right-[-20px] bottom-[-20px] text-purple-500/10 group-hover:scale-150 transition-transform"><Package size={100} /></div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Crop Volume</p>
          <p className="text-4xl font-black text-purple-600 dark:text-purple-400">{statistics.totalCrops.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-purple-600/60 bg-purple-50 dark:bg-purple-900/20 w-fit px-2 py-0.5 rounded">
            LIVE CROP TRACKING
          </div>
        </div>

        <div className="card border-l-4 border-orange-500 relative overflow-hidden group">
          <div className="absolute right-[-20px] bottom-[-20px] text-orange-500/10 group-hover:scale-150 transition-transform"><Truck size={100} /></div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Logistics Throughput</p>
          <p className="text-4xl font-black text-orange-600 dark:text-orange-400">{statistics.totalGoodsDelivered.totalQuantity.toLocaleString()} kg</p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-orange-600/60 bg-orange-50 dark:bg-orange-900/20 w-fit px-2 py-0.5 rounded">
            {statistics.totalGoodsDelivered.totalDeliveries} SUCCESSFUL SHIPMENTS
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card border-none shadow-xl">
          <h2 className="text-xl font-black text-text uppercase mb-8 flex items-center gap-3">
            <Activity className="text-accent" />
            District Utilization Pulse
          </h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loginChartData} margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <Tooltip cursor={{ fill: '#88888811' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="logins" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Logins" />
                <Bar dataKey="farmers" fill="#10b981" radius={[4, 4, 0, 0]} name="Unique Farmers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card border-none shadow-xl">
           <h2 className="text-xl font-black text-text uppercase mb-8 flex items-center gap-3">
            <TrendingUp className="text-emerald-600" />
            Revenue Distribution
          </h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={140}
                  paddingAngle={5}
                  dataKey="revenue"
                >
                  {revenueChartData.map((_entry) => (
                    <Cell key={`cell-${_entry.name}`} fill={COLORS[revenueChartData.indexOf(_entry) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card border-none shadow-xl">
        <h2 className="text-xl font-black text-text uppercase mb-8 flex items-center gap-3">
          <Activity className="text-info" />
          Network Growth Activity
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={recentLoginsData}>
              <defs>
                <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
              <Tooltip />
              <Area type="monotone" dataKey="logins" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorLogins)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {statistics.revenueByDistrict.map((item) => (
           <div key={item.district} className="card group hover:shadow-2xl transition-all duration-500 border-none bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 text-gray-500/5 group-hover:scale-150 transition-transform"><MapPin size={80} /></div>
             <h3 className="text-lg font-black text-text uppercase mb-4 tracking-wider">{item.district}</h3>
             <div className="space-y-4 relative z-10">
               <div className="flex justify-between items-end">
                 <p className="text-[10px] font-black text-gray-400 uppercase">Revenue</p>
                 <p className="text-lg font-black text-emerald-600">₹{item.totalRevenue.toLocaleString()}</p>
               </div>
               <div className="flex justify-between items-end">
                 <p className="text-[10px] font-black text-gray-400 uppercase">Net Flow</p>
                 <p className={`text-lg font-black ${item.netProfit >= 0 ? 'text-info' : 'text-danger'}`}>
                   {item.netProfit >= 0 ? <TrendingUp size={14} className="inline mr-1" /> : <TrendingDown size={14} className="inline mr-1" />}
                   ₹{Math.abs(item.netProfit).toLocaleString()}
                 </p>
               </div>
               <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full mt-2 overflow-hidden">
                 <div 
                   className="bg-accent h-full transition-all duration-1000" 
                   style={{ width: `${(item.totalRevenue / totalRevenue) * 100}%` }}
                 ></div>
               </div>
             </div>
           </div>
         ))}
      </div>
      </div>
      ) : (
        /* Marketplace Moderation View */
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
              <Lock size={20} className="text-accent" />
              Community Marketplace Moderator
            </h2>
            <p className="text-sm text-text-muted mb-6">Review, moderate, and delete listings published by farmers to maintain marketplace compliance.</p>

            {loadingMarket ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="animate-spin h-10 w-10 text-accent mb-2" />
                <p className="text-gray-500 font-medium">Hydrating listings database...</p>
              </div>
            ) : (
              <div className="border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-sunken text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-wider border-b border-border">
                        <th className="px-6 py-4">Produce Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Vendor Farmer</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4">Listed Price</th>
                        <th className="px-6 py-4 text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {marketplaceItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-text">
                            {item.name}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-accent dark:text-accent px-2 py-0.5 bg-primary-100/50 dark:bg-primary-900/20 rounded-full">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-semibold">
                            {item.farmer?.name || 'Unknown Farmer'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="px-6 py-4 text-base font-black text-text">
                            ₹{item.price} / {item.unit}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleAdminDeleteListing(item.id)}
                              className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-danger dark:text-red-400 font-bold text-xs rounded-lg active:scale-[0.98] transition-all flex items-center gap-1 ml-auto"
                            >
                              <Trash2 size={13} />
                              Moderate & Delete
                            </button>
                          </td>
                        </tr>
                      ))}

                      {marketplaceItems.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-text-muted text-sm">
                            No listings currently published in the marketplace.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
