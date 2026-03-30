// History Page - Display past financial and stock data with stacked visualization
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../context/useAuthStore';
import { MonthlyIncome, StockRecord } from '../types';
import DetailModal from '../components/DetailModal';
import {
  TrendingUp,
  Package,
  Download,
  BarChart3,
  Eye,
  Loader,
} from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import api from '../services/api';
import toast from 'react-hot-toast';

const History = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState<MonthlyIncome[]>([]);
  const [stockRecords, setStockRecords] = useState<StockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState<{
    type: 'income' | 'crops' | 'price' | null;
    data?: any;
  }>({ type: null });

  useEffect(() => {
    const fetchHistoryData = async () => {
      setLoading(true);
      try {
        // In a real migration, these would be actual API calls
        // For now, we'll keep the mock data structure but ready for the backend
        const response = await api.getYields(); // Use yields as proxy for history for now
        
        // Mocking the structure expected by the UI if API isn't fully ready
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
        
        // Stock records proxy
        setStockRecords([]);
      } catch (error) {
        console.error('Error fetching history data:', error);
        toast.error('Failed to load history data');
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, [user?.id]);

  const getMonthName = (monthIndex: number): string => {
    const monthNames = [
      t('reports.jan'), t('reports.feb'), t('reports.mar'), t('reports.apr'),
      t('reports.may'), t('reports.jun'), t('reports.jul'), t('reports.aug'),
      t('reports.sep'), t('reports.oct'), t('reports.nov'), t('reports.dec')
    ];
    return monthNames[monthIndex] || 'Month';
  };

  const selectedMonthData = selectedMonth ? monthlyIncome.find(m => m.month === selectedMonth) : null;
  const selectedMonthStocks = stockRecords.filter(s => s.month === selectedMonth);

  const exportData = () => {
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
    toast.success('History exported successfully');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader className="animate-spin h-12 w-12 text-primary-600 mb-4" />
        <p className="text-gray-500 font-medium">Brewing your farm history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('history.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('history.subtitle')}</p>
        </div>
        <button
          onClick={exportData}
          className="btn-primary flex items-center gap-2 shadow-lg"
        >
          <Download size={18} />
          {t('history.exportData')}
        </button>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-8">{t('history.monthlyProfitOverview')}</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {monthlyIncome.map((income, index) => (
            <div
              key={income.id}
              onClick={() => setSelectedMonth(selectedMonth === income.month ? null : income.month)}
              className={`group cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                selectedMonth === income.month
                  ? 'ring-4 ring-primary-500 ring-offset-4 dark:ring-offset-gray-900 scale-105'
                  : 'hover:shadow-xl'
              }`}
            >
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-900 rounded-2xl p-4 text-center text-white shadow-lg overflow-hidden relative">
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
          <div className="mt-8 p-8 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {getMonthName(selectedMonth - 1)} 2024 {t('history.detailedAnalysis')}
              </h3>
              <button
                onClick={() => setSelectedMonth(null)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
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
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                    <BarChart3 size={20} />
                  </div>
                  <span className="font-bold text-gray-500 uppercase text-xs tracking-wider">{t('history.avgPrice')}</span>
                </div>
                <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
                  ₹{selectedMonthData.averagePrice.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="card group hover:bg-primary-600 cursor-pointer transition-all duration-300 overflow-hidden relative" 
          onClick={() => setDetailModal({ type: 'income', data: monthlyIncome })}
        >
          <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-150 transition-transform">
             <TrendingUp size={120} />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="font-bold text-gray-500 dark:text-gray-400 group-hover:text-white uppercase text-xs tracking-widest">{t('history.totalAnnualIncome')}</h3>
            <Eye size={18} className="text-gray-400 group-hover:text-white" />
          </div>
          <div className="text-4xl font-black text-primary-600 dark:text-primary-400 mt-4 group-hover:text-white relative z-10 transition-colors">
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
          className="card group hover:bg-purple-600 cursor-pointer transition-all duration-300 overflow-hidden relative" 
          onClick={() => setDetailModal({ type: 'price', data: monthlyIncome })}
        >
          <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-150 transition-transform">
             <BarChart3 size={120} />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="font-bold text-gray-500 dark:text-gray-400 group-hover:text-white uppercase text-xs tracking-widest">{t('history.averagePrice')}</h3>
            <Eye size={18} className="text-gray-400 group-hover:text-white" />
          </div>
          <div className="text-4xl font-black text-purple-600 dark:text-purple-400 mt-4 group-hover:text-white relative z-10 transition-colors">
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
                  <p className="text-lg font-black text-primary-600">₹{Math.round(income.totalIncome).toLocaleString()}</p>
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