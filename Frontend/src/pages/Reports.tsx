// Reports & Analytics page
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mockCrops, mockExpenses, getMonthlyExpenses, getTotalYield } from '../data/mockData';
import { Download, FileText, TrendingUp, IndianRupee, Sprout, Eye } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { translateCrop, translateCategory } from '../utils/translations';
import { exportToCSV, exportToPDF, exportToExcel } from '../utils/exportUtils';
import DetailModal from '../components/DetailModal';

const Reports = () => {
  const { t } = useTranslation();
  const [detailModal, setDetailModal] = useState<{
    type: 'reports' | null;
    data?: any;
  }>({ type: null });
  // Monthly expenses data
  const monthlyExpenseData = [
    { month: 'Jun', expenses: getMonthlyExpenses(5, 2024) },
    { month: 'Jul', expenses: getMonthlyExpenses(6, 2024) },
    { month: 'Aug', expenses: getMonthlyExpenses(7, 2024) },
    { month: 'Sep', expenses: getMonthlyExpenses(8, 2024) },
    { month: 'Oct', expenses: getMonthlyExpenses(9, 2024) },
    { month: 'Nov', expenses: getMonthlyExpenses(10, 2024) },
  ];

  // Crop status distribution
  const cropStatusData = [
    { name: t('crops.active'), value: mockCrops.filter((c) => c.status === 'active').length },
    { name: t('crops.harvested'), value: mockCrops.filter((c) => c.status === 'harvested').length },
    { name: t('crops.planned'), value: mockCrops.filter((c) => c.status === 'planned').length },
  ];

  // Expense category distribution
  const expenseCategoryData = Object.entries(
    mockExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ 
    name: t(`expenses.${name}`) || name.charAt(0).toUpperCase() + name.slice(1), 
    value 
  }));

  const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const handleDownload = (reportType: 'monthly' | 'seasonal' | 'financial', format: 'csv' | 'pdf' | 'excel' = 'csv') => {
    // Prepare report data based on report type
    let reportData: any[] = [];
    let title = '';

    if (reportType === 'monthly') {
      title = t('reports.monthlyReport');
      reportData = [
        {
          'Total Yield (kg)': getTotalYield(),
          'Total Expenses (₹)': mockExpenses.reduce((sum, exp) => sum + exp.amount, 0),
          'Active Crops': mockCrops.filter((c) => c.status === 'active').length,
          'Total Farms': 5,
        },
        ...monthlyExpenseData.map((item) => ({
          Month: item.month,
          'Expenses (₹)': item.expenses,
        })),
      ];
    } else if (reportType === 'seasonal') {
      title = t('reports.seasonalReport');
      reportData = mockCrops.map((crop) => ({
        Crop: translateCrop(crop.name),
        Category: translateCategory(crop.category || ''),
        Season: crop.season,
        Status: crop.status,
      }));
    } else if (reportType === 'financial') {
      title = t('reports.financialReport');
      reportData = [
        {
          'Total Yield (kg)': getTotalYield(),
          'Total Expenses (₹)': mockExpenses.reduce((sum, exp) => sum + exp.amount, 0),
          'Total Income (₹)': getTotalYield() * 20, // Estimated income
          'Net Profit (₹)': (getTotalYield() * 20) - mockExpenses.reduce((sum, exp) => sum + exp.amount, 0),
        },
        ...expenseCategoryData.map((item) => ({
          Category: item.name,
          'Amount (₹)': item.value,
        })),
      ];
    }

    if (reportData.length === 0) {
      alert('No data to export');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `FarmSync_${reportType}_${timestamp}`;

    if (format === 'csv') {
      exportToCSV(reportData, filename);
    } else if (format === 'excel') {
      exportToExcel(reportData, filename, reportType);
    } else {
      exportToPDF(reportData, filename, title);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setDetailModal({ type: 'reports', data: { monthlyExpenseData, cropStatusData, expenseCategoryData } })}>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">{t('reports.title')}</h1>
            <Eye size={20} className="text-gray-400" />
          </div>
          <p className="text-gray-600 mt-1">{t('reports.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleDownload('monthly', 'csv')}
            className="btn-primary flex items-center gap-2"
          >
            <Download size={20} />
            {t('reports.downloadCSV')}
          </button>
          <button
            onClick={() => handleDownload('monthly', 'excel')}
            className="btn-secondary flex items-center gap-2 border border-gray-300"
          >
            <FileText size={20} />
            Excel
          </button>
          <button
            onClick={() => handleDownload('monthly', 'pdf')}
            className="btn-secondary flex items-center gap-2 border border-gray-300"
          >
            <FileText size={20} />
            {t('reports.downloadPDF')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('reports.totalYield')}</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalYield().toLocaleString()} {t('common.kg')}</p>
            </div>
            <TrendingUp className="text-green-600" size={32} />
          </div>
        </div>
        <div className="card bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('reports.totalExpenses')}</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{mockExpenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
              </p>
            </div>
            <IndianRupee className="text-blue-600" size={32} />
          </div>
        </div>
        <div className="card bg-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('reports.activeCrops')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockCrops.filter((c) => c.status === 'active').length}
              </p>
            </div>
            <Sprout className="text-purple-600" size={32} />
          </div>
        </div>
        <div className="card bg-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('reports.totalFarms')}</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
            <FileText className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Expenses Chart */}
        <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setDetailModal({ type: 'reports', data: { monthlyExpenseData, cropStatusData, expenseCategoryData } })}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{t('reports.monthlyExpensesTrend')}</h2>
            <div className="flex items-center gap-2">
              <IndianRupee className="text-primary-600" size={24} />
              <Eye size={18} className="text-gray-400" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyExpenseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#16a34a"
                strokeWidth={2}
                name={`${t('reports.expenses')} (₹)`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Crop Status Distribution */}
        <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setDetailModal({ type: 'reports', data: { monthlyExpenseData, cropStatusData, expenseCategoryData } })}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{t('reports.cropStatusDistribution')}</h2>
            <div className="flex items-center gap-2">
              <Sprout className="text-primary-600" size={24} />
              <Eye size={18} className="text-gray-400" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cropStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {cropStatusData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Category Chart */}
      <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setDetailModal({ type: 'reports', data: { monthlyExpenseData, cropStatusData, expenseCategoryData } })}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{t('reports.expenseByCategory')}</h2>
          <div className="flex items-center gap-2">
            <IndianRupee className="text-primary-600" size={24} />
            <Eye size={18} className="text-gray-400" />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={expenseCategoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#16a34a" name={`${t('reports.amount')} (₹)`} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card hover:shadow-xl transition-shadow">
          <div className="text-center">
            <FileText className="mx-auto mb-4 text-primary-600" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('reports.monthlyReport')}</h3>
            <p className="text-gray-600 mb-4">{t('reports.monthlyReportDesc')}</p>
            <div className="flex gap-2">
              <button onClick={() => handleDownload('monthly', 'csv')} className="btn-primary flex-1">
                {t('reports.downloadCSV')}
              </button>
              <button onClick={() => handleDownload('monthly', 'excel')} className="btn-secondary flex-1 border border-gray-300">
                Excel
              </button>
              <button onClick={() => handleDownload('monthly', 'pdf')} className="btn-secondary flex-1 border border-gray-300">
                {t('reports.downloadPDF')}
              </button>
            </div>
          </div>
        </div>
        <div className="card hover:shadow-xl transition-shadow">
          <div className="text-center">
            <TrendingUp className="mx-auto mb-4 text-primary-600" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('reports.seasonalReport')}</h3>
            <p className="text-gray-600 mb-4">{t('reports.seasonalReportDesc')}</p>
            <div className="flex gap-2">
              <button onClick={() => handleDownload('seasonal', 'csv')} className="btn-primary flex-1">
                {t('reports.downloadCSV')}
              </button>
              <button onClick={() => handleDownload('seasonal', 'excel')} className="btn-secondary flex-1 border border-gray-300">
                Excel
              </button>
              <button onClick={() => handleDownload('seasonal', 'pdf')} className="btn-secondary flex-1 border border-gray-300">
                {t('reports.downloadPDF')}
              </button>
            </div>
          </div>
        </div>
        <div className="card hover:shadow-xl transition-shadow">
          <div className="text-center">
            <IndianRupee className="mx-auto mb-4 text-primary-600" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('reports.financialReport')}</h3>
            <p className="text-gray-600 mb-4">{t('reports.financialReportDesc')}</p>
            <div className="flex gap-2">
              <button onClick={() => handleDownload('financial', 'csv')} className="btn-primary flex-1">
                {t('reports.downloadCSV')}
              </button>
              <button onClick={() => handleDownload('financial', 'excel')} className="btn-secondary flex-1 border border-gray-300">
                Excel
              </button>
              <button onClick={() => handleDownload('financial', 'pdf')} className="btn-secondary flex-1 border border-gray-300">
                {t('reports.downloadPDF')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {detailModal.type === 'reports' && (
        <DetailModal
          isOpen={true}
          onClose={() => setDetailModal({ type: null })}
          title={t('reports.title')}
          maxWidth="6xl"
        >
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('reports.totalYield')}</p>
                <p className="text-xl font-bold text-green-600">{getTotalYield().toLocaleString()} {t('common.kg')}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('reports.totalExpenses')}</p>
                <p className="text-xl font-bold text-blue-600">
                  ₹{mockExpenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('reports.activeCrops')}</p>
                <p className="text-xl font-bold text-purple-600">
                  {mockCrops.filter((c) => c.status === 'active').length}
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('reports.totalFarms')}</p>
                <p className="text-xl font-bold text-orange-600">2</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports.monthlyExpensesTrend')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={detailModal.data?.monthlyExpenseData || monthlyExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#16a34a"
                      strokeWidth={2}
                      name={`${t('reports.expenses')} (₹)`}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports.cropStatusDistribution')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={detailModal.data?.cropStatusData || cropStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(detailModal.data?.cropStatusData || cropStatusData).map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Category Chart */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports.expenseByCategory')}</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={detailModal.data?.expenseCategoryData || expenseCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#16a34a" name={`${t('reports.amount')} (₹)`} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Data Table */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports.monthlyReport')}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('history.month') || 'Month'}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('reports.expenses')} (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {(detailModal.data?.monthlyExpenseData || monthlyExpenseData).map((item: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.month}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">₹{item.expenses.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DetailModal>
      )}
    </div>
  );
};

export default Reports;

