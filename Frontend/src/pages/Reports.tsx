// Reports & Analytics page
import { useTranslation } from 'react-i18next';
import { mockCrops, mockExpenses, getMonthlyExpenses, getTotalYield } from '../data/mockData';
import { Download, FileText, TrendingUp, DollarSign, Sprout } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { translateCrop, translateCategory } from '../utils/translations';

const Reports = () => {
  const { t } = useTranslation();
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

  const handleDownload = (type: string) => {
    const typeMap: Record<string, string> = {
      'monthly': t('reports.monthlyReport'),
      'seasonal': t('reports.seasonalReport'),
      'financial': t('reports.financialReport'),
    };
    alert(`${t('reports.downloading')} ${typeMap[type] || type} ${t('reports.report')}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('reports.title')}</h1>
          <p className="text-gray-600 mt-1">{t('reports.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleDownload('monthly')}
            className="btn-primary flex items-center gap-2"
          >
            <Download size={20} />
            {t('reports.downloadReport')}
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
            <DollarSign className="text-blue-600" size={32} />
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
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{t('reports.monthlyExpensesTrend')}</h2>
            <DollarSign className="text-primary-600" size={24} />
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
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{t('reports.cropStatusDistribution')}</h2>
            <Sprout className="text-primary-600" size={24} />
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
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{t('reports.expenseByCategory')}</h2>
          <DollarSign className="text-primary-600" size={24} />
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
        <div className="card hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleDownload('monthly')}>
          <div className="text-center">
            <FileText className="mx-auto mb-4 text-primary-600" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('reports.monthlyReport')}</h3>
            <p className="text-gray-600 mb-4">{t('reports.monthlyReportDesc')}</p>
            <button className="btn-primary w-full">{t('reports.download')}</button>
          </div>
        </div>
        <div className="card hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleDownload('seasonal')}>
          <div className="text-center">
            <TrendingUp className="mx-auto mb-4 text-primary-600" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('reports.seasonalReport')}</h3>
            <p className="text-gray-600 mb-4">{t('reports.seasonalReportDesc')}</p>
            <button className="btn-primary w-full">{t('reports.download')}</button>
          </div>
        </div>
        <div className="card hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleDownload('financial')}>
          <div className="text-center">
            <DollarSign className="mx-auto mb-4 text-primary-600" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('reports.financialReport')}</h3>
            <p className="text-gray-600 mb-4">{t('reports.financialReportDesc')}</p>
            <button className="btn-primary w-full">{t('reports.download')}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

