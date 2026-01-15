// History Page - Display past financial and stock data with stacked visualization
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';
import { useAuth } from '../context/AuthContext';
import { MonthlyIncome, StockRecord } from '../types';
import DetailModal from '../components/DetailModal';
import {
  TrendingUp,
  Package,
  Download,
  BarChart3,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';

const History = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState<MonthlyIncome[]>([]);
  const [stockRecords, setStockRecords] = useState<StockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState<{
    type: 'income' | 'crops' | 'price' | null;
    data?: any;
  }>({ type: null });

  // Mock data - replace with API calls
  useEffect(() => {
    const fetchHistoryData = async () => {
      setLoading(true);
      try {
        // Simulate API call - All 12 months of data
        const mockIncome: MonthlyIncome[] = [
          {
            id: '1',
            userId: user?.id || '',
            month: 1,
            year: 2024,
            totalIncome: 35000,
            cropsSold: 1000,
            averagePrice: 35.0,
          },
          {
            id: '2',
            userId: user?.id || '',
            month: 2,
            year: 2024,
            totalIncome: 42000,
            cropsSold: 1200,
            averagePrice: 35.0,
          },
          {
            id: '3',
            userId: user?.id || '',
            month: 3,
            year: 2024,
            totalIncome: 38000,
            cropsSold: 1100,
            averagePrice: 34.5,
          },
          {
            id: '4',
            userId: user?.id || '',
            month: 4,
            year: 2024,
            totalIncome: 45000,
            cropsSold: 1300,
            averagePrice: 34.6,
          },
          {
            id: '5',
            userId: user?.id || '',
            month: 5,
            year: 2024,
            totalIncome: 52000,
            cropsSold: 1500,
            averagePrice: 34.7,
          },
          {
            id: '6',
            userId: user?.id || '',
            month: 6,
            year: 2024,
            totalIncome: 48000,
            cropsSold: 1400,
            averagePrice: 34.3,
          },
          {
            id: '7',
            userId: user?.id || '',
            month: 7,
            year: 2024,
            totalIncome: 55000,
            cropsSold: 1600,
            averagePrice: 34.4,
          },
          {
            id: '8',
            userId: user?.id || '',
            month: 8,
            year: 2024,
            totalIncome: 60000,
            cropsSold: 1700,
            averagePrice: 35.3,
          },
          {
            id: '9',
            userId: user?.id || '',
            month: 9,
            year: 2024,
            totalIncome: 58000,
            cropsSold: 1650,
            averagePrice: 35.2,
          },
          {
            id: '10',
            userId: user?.id || '',
            month: 10,
            year: 2024,
            totalIncome: 62000,
            cropsSold: 1800,
            averagePrice: 34.4,
          },
          {
            id: '11',
            userId: user?.id || '',
            month: 11,
            year: 2024,
            totalIncome: 65000,
            cropsSold: 1900,
            averagePrice: 34.2,
          },
          {
            id: '12',
            userId: user?.id || '',
            month: 12,
            year: 2024,
            totalIncome: 70000,
            cropsSold: 2000,
            averagePrice: 35.0,
          },
        ];

        const mockStock: StockRecord[] = [
          {
            id: '1',
            userId: user?.id || '',
            itemName: 'Wheat Seeds',
            itemType: 'seeds',
            quantityUsed: 25,
            remainingStock: 75,
            unit: 'kg',
            month: selectedMonth || 1,
            year: 2024,
            dateRecorded: new Date().toISOString(),
          },
          {
            id: '2',
            userId: user?.id || '',
            itemName: 'NPK Fertilizer',
            itemType: 'fertilizer',
            quantityUsed: 50,
            remainingStock: 150,
            unit: 'kg',
            month: selectedMonth || 1,
            year: 2024,
            dateRecorded: new Date().toISOString(),
          },
          {
            id: '3',
            userId: user?.id || '',
            itemName: 'Pesticide Spray',
            itemType: 'pesticide',
            quantityUsed: 10,
            remainingStock: 40,
            unit: 'liters',
            month: selectedMonth || 1,
            year: 2024,
            dateRecorded: new Date().toISOString(),
          },
        ];

        // Sort by month in chronological order (January to December)
        const sortedIncome = [...mockIncome].sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month; // Ascending order (Jan to Dec)
        });
        
        setMonthlyIncome(sortedIncome);
        setStockRecords(mockStock);
      } catch (error) {
        console.error('Error fetching history data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, [selectedMonth, user?.id]);

  const getMonthName = (monthIndex: number): string => {
    const monthMap: { [key: number]: string } = {
      0: t('reports.jan'),
      1: t('reports.feb'),
      2: t('reports.mar'),
      3: t('reports.apr'),
      4: t('reports.may'),
      5: t('reports.jun'),
      6: t('reports.jul'),
      7: t('reports.aug'),
      8: t('reports.sep'),
      9: t('reports.oct'),
      10: t('reports.nov'),
      11: t('reports.dec')
    };
    return monthMap[monthIndex] || 'Month';
  };

  const selectedMonthData = selectedMonth ? monthlyIncome.find(m => m.month === selectedMonth) : null;
  const selectedMonthStocks = stockRecords.filter(s => s.month === selectedMonth);

  const exportData = () => {
    if (monthlyIncome.length === 0) {
      alert(t('history.noHistory'));
      return;
    }

    // Prepare history data for export
    const historyData = monthlyIncome.map((income) => ({
      Month: getMonthName(income.month - 1),
      'Total Income (₹)': income.totalIncome,
      'Crops Sold (kg)': income.cropsSold,
      'Average Price (₹/kg)': income.averagePrice,
    }));

    const filename = `FarmSync_History_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(historyData, filename);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('history.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('history.subtitle')}</p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 shadow-lg dark:shadow-dark-lg hover:shadow-xl dark:hover:shadow-dark-xl"
        >
          <Download size={16} />
          {t('history.exportData')}
        </button>
      </div>

      {/* Monthly Profit Stacks */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-dark-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">{t('history.monthlyProfitOverview')}</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-3 mb-6">
          {monthlyIncome.map((income, index) => {
            // Map index to delay class (0-350ms in 30ms increments)
            const getDelayClass = (idx: number, multiplier: number = 30) => {
              const delay = Math.min(idx * multiplier, 350);
              if (delay <= 0) return 'delay-0';
              if (delay <= 25) return 'delay-25';
              if (delay <= 30) return 'delay-30';
              if (delay <= 50) return 'delay-50';
              if (delay <= 75) return 'delay-75';
              if (delay <= 100) return 'delay-100';
              if (delay <= 125) return 'delay-125';
              if (delay <= 150) return 'delay-150';
              if (delay <= 175) return 'delay-175';
              if (delay <= 200) return 'delay-200';
              if (delay <= 250) return 'delay-250';
              if (delay <= 300) return 'delay-300';
              return 'delay-350';
            };
            return (
            <div
              key={income.id}
              onClick={() => setSelectedMonth(selectedMonth === income.month ? null : income.month)}
              className={`cursor-pointer transition-all duration-200 ease-out hover:scale-110 active:scale-95 animate-in fade-in slide-in-from-bottom-2 ${getDelayClass(index, 30)} ${
                selectedMonth === income.month
                  ? 'ring-2 ring-primary-500 ring-offset-2 scale-105 shadow-xl'
                  : 'hover:shadow-xl'
              }`}
            >
              <div className="bg-gradient-to-t from-green-500 to-green-400 rounded-lg p-4 text-center text-white shadow-md">
                <div className="text-sm font-medium mb-1">{getMonthName(income.month - 1)}</div>
                <div className="text-lg font-bold">₹{income.totalIncome.toLocaleString()}</div>
                <div className="text-xs opacity-90">{income.cropsSold}{t('history.kgSold')}</div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Selected Month Details */}
        {selectedMonth && selectedMonthData && (
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {getMonthName(selectedMonth - 1)} 2024 - {t('history.detailedAnalysis')}
              </h3>
              <button
                onClick={() => setSelectedMonth(null)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                title="Close details"
                aria-label="Close month details"
              >
                <ChevronRight size={20} />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm dark:shadow-dark-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">{t('history.totalRevenue')}</span>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ₹{selectedMonthData.totalIncome.toLocaleString()}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm dark:shadow-dark-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={20} className="text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">{t('history.cropsSold')}</span>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {selectedMonthData.cropsSold}{t('common.kg')}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm dark:shadow-dark-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={20} className="text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">{t('history.avgPrice')}</span>
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ₹{selectedMonthData.averagePrice}
                </div>
              </div>
            </div>

            {/* Stock Details for Selected Month */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm dark:shadow-dark-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('history.stockConsumption')}</h4>
              <div className="space-y-3">
                {selectedMonthStocks.map((stock) => (
                  <div key={stock.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {stock.itemName === 'Wheat Seeds' ? t('history.wheatSeeds') :
                         stock.itemName === 'NPK Fertilizer' ? t('history.npkFertilizer') :
                         stock.itemName === 'Pesticide Spray' ? t('history.pesticideSpray') :
                         stock.itemName}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{t(`expenses.${stock.itemType}`) || stock.itemType}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {t('history.used')}: {stock.quantityUsed}{stock.unit}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('history.remaining')}: {stock.remainingStock}{stock.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all duration-200 ease-out hover:scale-105 active:scale-95" 
          onClick={() => setDetailModal({ type: 'income', data: monthlyIncome })}
        >
            <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('history.totalAnnualIncome')}</h3>
            </div>
            <Eye size={18} className="text-gray-400 dark:text-gray-500" />
          </div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            ₹{monthlyIncome.reduce((sum, month) => sum + month.totalIncome, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('history.acrossMonths')} 12 {t('history.months')}</div>
        </div>

        <div 
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all duration-200 ease-out hover:scale-105 active:scale-95" 
          onClick={() => setDetailModal({ type: 'crops', data: monthlyIncome })}
        >
            <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package size={20} className="text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('history.totalCropsSold')}</h3>
            </div>
            <Eye size={18} className="text-gray-400 dark:text-gray-500" />
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {monthlyIncome.reduce((sum, month) => sum + month.cropsSold, 0).toLocaleString()}{t('common.kg')}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('history.combinedProduction')}</div>
        </div>

        <div 
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all duration-200 ease-out hover:scale-105 active:scale-95" 
          onClick={() => setDetailModal({ type: 'price', data: monthlyIncome })}
        >
            <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={20} className="text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('history.averagePrice')}</h3>
            </div>
            <Eye size={18} className="text-gray-400 dark:text-gray-500" />
          </div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            ₹{(monthlyIncome.reduce((sum, month) => sum + month.averagePrice, 0) / monthlyIncome.length).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('history.perKgAverage')}</div>
        </div>
      </div>

      {/* Detail Modals */}
      {detailModal.type === 'income' && (
        <DetailModal
          isOpen={true}
          onClose={() => setDetailModal({ type: null })}
          title={t('history.totalAnnualIncome')}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mb-6 border border-green-200 dark:border-green-800">
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                ₹{detailModal.data?.reduce((sum: number, month: MonthlyIncome) => sum + month.totalIncome, 0).toLocaleString() || 0}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('history.acrossMonths')} 12 {t('history.months')}</p>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {detailModal.data?.map((income: MonthlyIncome) => (
                <div key={income.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:shadow-dark-lg transition-shadow bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {getMonthName(income.month - 1)} {income.year}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {income.cropsSold}{t('common.kg')} {t('history.kgSold')} • {t('history.avgPrice')}: ₹{income.averagePrice}/kg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">₹{income.totalIncome.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DetailModal>
      )}

      {detailModal.type === 'crops' && (
        <DetailModal
          isOpen={true}
          onClose={() => setDetailModal({ type: null })}
          title={t('history.totalCropsSold')}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {detailModal.data?.reduce((sum: number, month: MonthlyIncome) => sum + month.cropsSold, 0).toLocaleString() || 0}{t('common.kg')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('history.combinedProduction')}</p>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {detailModal.data?.map((income: MonthlyIncome) => (
                <div key={income.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:shadow-dark-lg transition-shadow bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {getMonthName(income.month - 1)} {income.year}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('history.totalRevenue')}: ₹{income.totalIncome.toLocaleString()} • {t('history.avgPrice')}: ₹{income.averagePrice}/kg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{income.cropsSold.toLocaleString()}{t('common.kg')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DetailModal>
      )}

      {detailModal.type === 'price' && (
        <DetailModal
          isOpen={true}
          onClose={() => setDetailModal({ type: null })}
          title={t('history.averagePrice')}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg mb-6 border border-purple-200 dark:border-purple-800">
              <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                ₹{((detailModal.data?.reduce((sum: number, month: MonthlyIncome) => sum + month.averagePrice, 0) || 0) / (detailModal.data?.length || 1)).toFixed(2)}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('history.perKgAverage')}</p>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {detailModal.data?.map((income: MonthlyIncome) => (
                <div key={income.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:shadow-dark-lg transition-shadow bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {getMonthName(income.month - 1)} {income.year}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('history.totalRevenue')}: ₹{income.totalIncome.toLocaleString()} • {t('history.cropsSold')}: {income.cropsSold}{t('common.kg')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-purple-600 dark:text-purple-400">₹{income.averagePrice.toFixed(2)}/kg</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DetailModal>
      )}
    </div>
  );
};

export default History;