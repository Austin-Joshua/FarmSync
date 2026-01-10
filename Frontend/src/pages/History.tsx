// History Page - Display past financial and stock data with stacked visualization
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';
import { useAuth } from '../context/AuthContext';
import { MonthlyIncome, StockRecord } from '../types';
import {
  TrendingUp,
  Package,
  Download,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

const History = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState<MonthlyIncome[]>([]);
  const [stockRecords, setStockRecords] = useState<StockRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API calls
  useEffect(() => {
    const fetchHistoryData = async () => {
      setLoading(true);
      try {
        // Simulate API call
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

        setMonthlyIncome(mockIncome);
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
    const monthNames = {
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      ta: ['ஜன', 'பிப்', 'மார்', 'ஏப்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக', 'செப்', 'அக்', 'நவ', 'டிச'],
      hi: ['जन', 'फर', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अग', 'सितं', 'अक्टू', 'नवं', 'दिसं']
    };
    const lang = (i18n.language || 'en') as 'en' | 'ta' | 'hi';
    return monthNames[lang]?.[monthIndex] || monthNames.en[monthIndex];
  };

  const selectedMonthData = selectedMonth ? monthlyIncome.find(m => m.month === selectedMonth) : null;
  const selectedMonthStocks = stockRecords.filter(s => s.month === selectedMonth);

  const exportData = () => {
    // Implement export functionality
    console.log('Exporting data...');
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
          <h1 className="text-2xl font-bold text-gray-900">{t('history.title')}</h1>
          <p className="text-gray-600">{t('history.subtitle')}</p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Download size={16} />
          {t('history.exportData')}
        </button>
      </div>

      {/* Monthly Profit Stacks */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('history.monthlyProfitOverview')}</h2>

        <div className="grid grid-cols-6 gap-4 mb-6">
          {monthlyIncome.map((income) => (
            <div
              key={income.id}
              onClick={() => setSelectedMonth(selectedMonth === income.month ? null : income.month)}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedMonth === income.month
                  ? 'ring-2 ring-primary-500 ring-offset-2'
                  : 'hover:shadow-lg'
              }`}
            >
              <div className="bg-gradient-to-t from-green-500 to-green-400 rounded-lg p-4 text-center text-white shadow-md">
                <div className="text-sm font-medium mb-1">{getMonthName(income.month - 1)}</div>
                <div className="text-lg font-bold">₹{income.totalIncome.toLocaleString()}</div>
                <div className="text-xs opacity-90">{income.cropsSold}{t('history.kgSold')}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Month Details */}
        {selectedMonth && selectedMonthData && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {getMonthName(selectedMonth - 1)} 2024 - {t('history.detailedAnalysis')}
              </h3>
              <button
                onClick={() => setSelectedMonth(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={20} className="text-green-600" />
                  <span className="font-medium text-gray-900">{t('history.totalRevenue')}</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{selectedMonthData.totalIncome.toLocaleString()}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={20} className="text-blue-600" />
                  <span className="font-medium text-gray-900">{t('history.cropsSold')}</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {selectedMonthData.cropsSold}{t('common.kg')}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={20} className="text-purple-600" />
                  <span className="font-medium text-gray-900">{t('history.avgPrice')}</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  ₹{selectedMonthData.averagePrice}
                </div>
              </div>
            </div>

            {/* Stock Details for Selected Month */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">{t('history.stockConsumption')}</h4>
              <div className="space-y-3">
                {selectedMonthStocks.map((stock) => (
                  <div key={stock.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {stock.itemName === 'Wheat Seeds' ? t('history.wheatSeeds') :
                         stock.itemName === 'NPK Fertilizer' ? t('history.npkFertilizer') :
                         stock.itemName === 'Pesticide Spray' ? t('history.pesticideSpray') :
                         stock.itemName}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">{t(`expenses.${stock.itemType}`) || stock.itemType}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {t('history.used')}: {stock.quantityUsed}{stock.unit}
                      </div>
                      <div className="text-sm text-gray-600">
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
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-green-600" />
            <h3 className="font-semibold text-gray-900">{t('history.totalAnnualIncome')}</h3>
          </div>
          <div className="text-3xl font-bold text-green-600">
            ₹{monthlyIncome.reduce((sum, month) => sum + month.totalIncome, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-1">{t('history.acrossMonths')} 6 {t('history.months')}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Package size={20} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">{t('history.totalCropsSold')}</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {monthlyIncome.reduce((sum, month) => sum + month.cropsSold, 0).toLocaleString()}{t('common.kg')}
          </div>
          <div className="text-sm text-gray-600 mt-1">{t('history.combinedProduction')}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-purple-600" />
            <h3 className="font-semibold text-gray-900">{t('history.averagePrice')}</h3>
          </div>
          <div className="text-3xl font-bold text-purple-600">
            ₹{(monthlyIncome.reduce((sum, month) => sum + month.averagePrice, 0) / monthlyIncome.length).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 mt-1">{t('history.perKgAverage')}</div>
        </div>
      </div>
    </div>
  );
};

export default History;