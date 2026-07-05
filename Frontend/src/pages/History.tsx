// History Page - Display past financial and stock data for Farmers, and Order History for Citizens
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { MonthlyIncome } from '../types';
import DetailModal from '../components/DetailModal';
import {
  TrendingUp,
  Package,
  Download,
  BarChart3,
  Eye,
  Loader,
  X,
  ShoppingCart,
  Calendar,
  CheckCircle,
  Truck,
  ArrowRight,
  Flame,
  Star
} from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import api from '../services/api';
import toast from 'react-hot-toast';

// Mock Order History for Citizens
const CITIZEN_ORDERS = [
  {
    id: 'ORD-9482',
    date: '2026-07-02',
    items: [
      { name: 'Fresh Red Tomatoes', quantity: 2, unit: 'kg', price: 40 },
      { name: 'Basmati Rice', quantity: 5, unit: 'kg', price: 90 }
    ],
    total: 530,
    status: 'Delivered',
    farmer: 'Ramesh Kumar',
    deliveryDate: '2026-07-03'
  },
  {
    id: 'ORD-9120',
    date: '2026-06-25',
    items: [
      { name: 'Organic Bananas', quantity: 1, unit: 'dozen', price: 60 },
      { name: 'Farm-Fresh Honey', quantity: 1, unit: '500g', price: 280 }
    ],
    total: 340,
    status: 'Delivered',
    farmer: 'Ananya Patel',
    deliveryDate: '2026-06-26'
  },
  {
    id: 'ORD-8941',
    date: '2026-06-18',
    items: [
      { name: 'Fresh Desi Cow Milk', quantity: 4, unit: 'Litre', price: 65 }
    ],
    total: 260,
    status: 'Delivered',
    farmer: 'Suresh Reddy',
    deliveryDate: '2026-06-19'
  }
];

const FREQUENT_ITEMS = [
  { id: 'freq-1', name: 'Organic Bananas', price: 60, unit: 'dozen', rating: 4.8, sales: '140+ bought', icon: '🍌' },
  { id: 'freq-2', name: 'Fresh Red Tomatoes', price: 40, unit: 'kg', rating: 4.6, sales: '280+ bought', icon: '🍅' },
  { id: 'freq-3', name: 'Pure Farm Honey', price: 280, unit: '500g', rating: 4.9, sales: '90+ bought', icon: '🍯' },
  { id: 'freq-4', name: 'Fresh Desi Cow Milk', price: 65, unit: 'Litre', rating: 4.7, sales: '350+ bought', icon: '🥛' },
];

const History = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState<MonthlyIncome[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState<{
    type: 'income' | 'crops' | 'price' | null;
    data?: any;
  }>({ type: null });

  useEffect(() => {
    const fetchHistoryData = async () => {
      setLoading(true);
      try {
        await api.getYields();
        
        const mockIncome: MonthlyIncome[] = Array.from({ length: 12 }, (_, i) => ({
          id: `${i + 1}`,
          userId: user?.id || '',
          month: i + 1,
          year: 2024,
          totalIncome: 30000 + Math.random() * 20000,
          cropsSold: 1000 + Math.random() * 500,
          averagePrice: 30 + Math.random() * 10,
        }));

        const sortedIncome = [...mockIncome].sort((a, b) => a.month - b.month);
        setMonthlyIncome(sortedIncome);
      } catch (error) {
        console.error('Error fetching history data:', error);
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, [user?.id, t]);

  const getMonthName = (monthIndex: number): string => {
    const monthNames = [
      t('reports.jan'), t('reports.feb'), t('reports.mar'), t('reports.apr'),
      t('reports.may'), t('reports.jun'), t('reports.jul'), t('reports.aug'),
      t('reports.sep'), t('reports.oct'), t('reports.nov'), t('reports.dec')
    ];
    return monthNames[monthIndex] || 'Month';
  };

  const selectedMonthData = selectedMonth ? monthlyIncome.find(m => m.month === selectedMonth) : null;

  const exportData = () => {
    if (user?.role === 'citizen') {
      const orderData = CITIZEN_ORDERS.map(order => ({
        'Order ID': order.id,
        Date: order.date,
        Farmer: order.farmer,
        'Total (₹)': order.total,
        Status: order.status,
        Items: order.items.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', ')
      }));
      exportToCSV(orderData, `FarmSync_MyOrders_${new Date().toISOString().split('T')[0]}`);
      toast.success('Orders history exported successfully!');
      return;
    }

    if (monthlyIncome.length === 0) {
      toast.error(t('history.noHistory'));
      return;
    }

    const historyData = monthlyIncome.map((income) => ({
      Month: getMonthName(income.month - 1),
      'Total Income (₹)': Math.round(income.totalIncome),
      'Crops Sold (kg)': Math.round(income.cropsSold),
      'Average Price (₹/kg)': income.averagePrice.toFixed(2),
    }));

    const filename = `FarmSync_History_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(historyData, filename);
    toast.success(t('history.exportSuccess'));
  };

  const addToCart = (item: any) => {
    const cart = JSON.parse(localStorage.getItem('citizen_cart') || '[]');
    cart.push({ ...item, addedAt: new Date().toISOString() });
    localStorage.setItem('citizen_cart', JSON.stringify(cart));
    toast.success(`${item.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader className="animate-spin h-12 w-12 text-emerald-600 mb-4" />
        <p className="text-gray-500 font-medium">Brewing history records...</p>
      </div>
    );
  }

  // ================= CITIZEN VIEW =================
  if (user?.role === 'citizen') {
    const totalSpent = CITIZEN_ORDERS.reduce((sum, order) => sum + order.total, 0);
    const totalItems = CITIZEN_ORDERS.reduce((sum, order) => sum + order.items.length, 0);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Orders & Purchases</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage your order history with local farmers</p>
          </div>
          <button
            onClick={exportData}
            className="btn-primary flex items-center gap-2 shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white border-0"
          >
            <Download size={18} />
            Export Order History
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card flex items-center gap-4">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-2xl">
              <ShoppingCart size={28} />
            </div>
            <div>
              <h3 className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Total Purchases</h3>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-0.5">{CITIZEN_ORDERS.length}</p>
            </div>
          </div>

          <div className="card flex items-center gap-4">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-2xl">
              <TrendingUp size={28} />
            </div>
            <div>
              <h3 className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Total Spent</h3>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">₹{totalSpent.toLocaleString()}</p>
            </div>
          </div>

          <div className="card flex items-center gap-4">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-2xl">
              <Package size={28} />
            </div>
            <div>
              <h3 className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Total Items Bought</h3>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-0.5">{totalItems} items</p>
            </div>
          </div>
        </div>

        {/* Order History List */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-emerald-600" /> Past Orders & Delivery Status
          </h2>
          <div className="space-y-4">
            {CITIZEN_ORDERS.map((order) => (
              <div key={order.id} className="p-5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm text-gray-900 dark:text-white">Order #{order.id}</span>
                    <span className="text-xs text-gray-400">{order.date}</span>
                    <span className="flex items-center gap-1 text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase">
                      <CheckCircle size={10} /> {order.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 font-semibold space-y-1">
                    <p className="text-gray-700 dark:text-gray-300 font-bold">
                      Sold by: <span className="text-emerald-600">{order.farmer}</span>
                    </p>
                    <ul className="list-disc pl-4 space-y-0.5 mt-1">
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.name} — {item.quantity} {item.unit} (@ ₹{item.price}/{item.unit})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex items-end md:items-center gap-4 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-gray-200 dark:border-gray-850">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Amount Paid</span>
                    <span className="text-lg font-black text-gray-900 dark:text-white">₹{order.total}</span>
                  </div>
                  <button
                    onClick={() => toast.success(`Delivery details for #${order.id}: Delivered to address on ${order.deliveryDate}.`)}
                    className="flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-700 hover:gap-2 transition-all"
                  >
                    <Truck size={14} /> Track Order <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Frequently Bought Food and Related Items (Quick Reorder Panel) */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <Flame size={20} className="text-orange-500 animate-pulse" /> Frequently Bought Items & Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FREQUENT_ITEMS.map((item) => (
              <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-850 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-3xl">{item.icon}</span>
                    <div className="flex items-center text-amber-500 text-[10px] font-bold">
                      <Star size={10} fill="currentColor" />
                      <span className="text-gray-700 dark:text-gray-300 ml-0.5">{item.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-0.5 truncate">{item.name}</h3>
                  <span className="text-[10px] text-gray-400 font-semibold block mb-3">{item.sales}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase">Price</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">₹{item.price}/{item.unit}</span>
                  </div>
                  <button
                    onClick={() => addToCart({ ...item, quantity: 1 })}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs hover:scale-105 active:scale-95 transition-transform"
                  >
                    Reorder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ================= FARMER VIEW =================
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('history.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('history.subtitle')}</p>
        </div>
        <button
          onClick={exportData}
          className="btn-primary flex items-center gap-2 shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white border-0"
        >
          <Download size={18} />
          {t('history.exportData')}
        </button>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-8">{t('history.monthlyProfitOverview')}</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {monthlyIncome.map((income) => (
            <div
              key={income.id}
              onClick={() => setSelectedMonth(selectedMonth === income.month ? null : income.month)}
              className={`group cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                selectedMonth === income.month
                  ? 'ring-4 ring-emerald-500 ring-offset-4 dark:ring-offset-gray-900 scale-105'
                  : 'hover:shadow-xl'
              }`}
            >
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-950 rounded-2xl p-4 text-center text-white shadow-lg overflow-hidden relative">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">{getMonthName(income.month - 1)}</div>
                <div className="text-xl font-black">₹{Math.round(income.totalIncome).toLocaleString()}</div>
                <div className="mt-2 inline-block px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold">
                  {Math.round(income.cropsSold)}{t('history.kgSold')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedMonth && selectedMonthData && (
          <div className="mt-8 p-8 bg-gray-50 dark:bg-gray-950/20 rounded-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {getMonthName(selectedMonth - 1)} 2024 {t('history.detailedAnalysis')}
              </h3>
              <button
                onClick={() => setSelectedMonth(null)}
                className="p-2 hover:bg-gray-250 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                    <TrendingUp size={20} />
                  </div>
                  <span className="font-bold text-gray-500 uppercase text-xs tracking-wider">{t('history.totalRevenue')}</span>
                </div>
                <div className="text-3xl font-black text-green-600 dark:text-green-400">
                  ₹{Math.round(selectedMonthData.totalIncome).toLocaleString()}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                    <Package size={20} />
                  </div>
                  <span className="font-bold text-gray-500 uppercase text-xs tracking-wider">{t('history.cropsSold')}</span>
                </div>
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                  {Math.round(selectedMonthData.cropsSold)}{t('common.kg')}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                    <BarChart3 size={20} />
                  </div>
                  <span className="font-bold text-gray-500 uppercase text-xs tracking-wider">{t('history.avgPrice')}</span>
                </div>
                <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                  ₹{selectedMonthData.averagePrice.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="card group hover:bg-emerald-600 cursor-pointer transition-all duration-300 overflow-hidden relative" 
          onClick={() => setDetailModal({ type: 'income', data: monthlyIncome })}
        >
          <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-150 transition-transform">
             <TrendingUp size={120} />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="font-bold text-gray-500 dark:text-gray-400 group-hover:text-white uppercase text-xs tracking-widest">{t('history.totalAnnualIncome')}</h3>
            <Eye size={18} className="text-gray-400 group-hover:text-white" />
          </div>
          <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-4 group-hover:text-white relative z-10 transition-colors">
            ₹{monthlyIncome.reduce((sum, month) => sum + month.totalIncome, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div 
          className="card group hover:bg-blue-600 cursor-pointer transition-all duration-300 overflow-hidden relative" 
          onClick={() => setDetailModal({ type: 'crops', data: monthlyIncome })}
        >
          <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-150 transition-transform">
             <Package size={120} />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="font-bold text-gray-500 dark:text-gray-400 group-hover:text-white uppercase text-xs tracking-widest">{t('history.totalCropsSold')}</h3>
            <Eye size={18} className="text-gray-400 group-hover:text-white" />
          </div>
          <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mt-4 group-hover:text-white relative z-10 transition-colors">
            {Math.round(monthlyIncome.reduce((sum, month) => sum + month.cropsSold, 0)).toLocaleString()}{t('common.kg')}
          </div>
        </div>

        <div 
          className="card group hover:bg-amber-600 cursor-pointer transition-all duration-300 overflow-hidden relative" 
          onClick={() => setDetailModal({ type: 'price', data: monthlyIncome })}
        >
          <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-150 transition-transform">
             <BarChart3 size={120} />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="font-bold text-gray-500 dark:text-gray-400 group-hover:text-white uppercase text-xs tracking-widest">{t('history.averagePrice')}</h3>
            <Eye size={18} className="text-gray-400 group-hover:text-white" />
          </div>
          <div className="text-4xl font-black text-amber-600 dark:text-amber-400 mt-4 group-hover:text-white relative z-10 transition-colors">
            ₹{(monthlyIncome.reduce((sum, month) => sum + month.averagePrice, 0) / (monthlyIncome.length || 1)).toFixed(1)}
          </div>
        </div>
      </div>

      {detailModal.type && (
        <DetailModal
          isOpen={true}
          onClose={() => setDetailModal({ type: null })}
          title={t(`history.${detailModal.type === 'income' ? 'totalAnnualIncome' : detailModal.type === 'crops' ? 'totalCropsSold' : 'averagePrice'}`)}
          maxWidth="2xl"
        >
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {detailModal.data?.map((income: MonthlyIncome) => (
              <div key={income.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{getMonthName(income.month - 1)} {income.year}</p>
                  <p className="text-xs text-gray-500">{income.cropsSold.toFixed(0)} kg sold @ ₹{income.averagePrice.toFixed(1)}/kg</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-emerald-600">₹{Math.round(income.totalIncome).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </DetailModal>
      )}
    </div>
  );
};

export default History;