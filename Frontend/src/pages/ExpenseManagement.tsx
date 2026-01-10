// Expense Management page
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mockExpenses, getMonthlyExpenses } from '../data/mockData';
import { Plus, DollarSign, TrendingDown, Calendar } from 'lucide-react';
import { Expense } from '../types';

const ExpenseManagement = () => {
  const { t } = useTranslation();
  const [expenses] = useState<Expense[]>(mockExpenses);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpense = getMonthlyExpenses(currentMonth, currentYear);

  const filteredExpenses = expenses.filter(
    (expense) => selectedCategory === 'all' || expense.category === selectedCategory
  );

  const handleAddExpense = () => {
    alert(t('expenses.addExpense') + ' - Form would open here.');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'seeds':
        return '🌱';
      case 'labor':
        return '👷';
      case 'fertilizers':
        return '💧';
      case 'pesticides':
        return '🐛';
      case 'irrigation':
        return '🚿';
      default:
        return '💰';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'seeds':
        return 'bg-green-100 text-green-800';
      case 'labor':
        return 'bg-blue-100 text-blue-800';
      case 'fertilizers':
        return 'bg-purple-100 text-purple-800';
      case 'pesticides':
        return 'bg-red-100 text-red-800';
      case 'irrigation':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('expenses.title')}</h1>
          <p className="text-gray-600 mt-1">{t('expenses.subtitle')}</p>
        </div>
        <button onClick={handleAddExpense} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          {t('expenses.addExpense')}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Expenses</p>
              <p className="text-3xl font-bold text-gray-900">₹{monthlyExpense.toLocaleString()}</p>
            </div>
            <DollarSign className="text-red-600" size={48} />
          </div>
        </div>
        <div className="card bg-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('expenses.totalExpenses')}</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹{expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
              </p>
            </div>
            <TrendingDown className="text-orange-600" size={48} />
          </div>
        </div>
        <div className="card bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('expenses.averageExpense')}</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹{Math.round(expenses.reduce((sum, exp) => sum + exp.amount, 0) / (expenses.length || 1)).toLocaleString()}
              </p>
            </div>
            <Calendar className="text-blue-600" size={48} />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="flex items-center gap-4">
          <label className="font-medium text-gray-700">{t('common.filter')} {t('common.by')} {t('expenses.category')}:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field"
          >
            <option value="all">{t('expenses.allCategories')}</option>
            <option value="seeds">{t('expenses.seeds')}</option>
            <option value="labor">{t('expenses.labor')}</option>
            <option value="fertilizers">{t('expenses.fertilizers')}</option>
            <option value="pesticides">{t('expenses.pesticides')}</option>
            <option value="irrigation">{t('expenses.irrigation')}</option>
            <option value="other">{t('expenses.other')}</option>
          </select>
        </div>
      </div>

      {/* Expenses List */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('expenses.expenseRecords')}</h2>
        <div className="space-y-3">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{getCategoryIcon(expense.category)}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">
                          {expense.description === 'Rice seeds (Basmati)' ? t('expenses.riceSeedsBasmati') :
                           expense.description === 'Wheat seeds' ? t('expenses.wheatSeeds') :
                           expense.description === 'Field preparation labor' ? t('expenses.fieldPreparationLabor') :
                           expense.description === 'Urea and NPK' ? t('expenses.ureaAndNPK') :
                           expense.description === 'Insecticides and fungicides' ? t('expenses.insecticidesAndFungicides') :
                           expense.description === 'Water pump maintenance' ? t('expenses.waterPumpMaintenance') :
                           expense.description}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(expense.category)}`}
                        >
                          {t(`expenses.${expense.category}`)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">₹{expense.amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <DollarSign size={48} className="mx-auto mb-4 text-gray-400" />
              <p>{t('expenses.noExpenses')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('expenses.expensesByCategory')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(categoryTotals).map(([category, total]) => (
            <div key={category} className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-3xl mb-2">{getCategoryIcon(category)}</div>
              <p className="text-xs text-gray-600 mb-1 capitalize">{category}</p>
              <p className="text-lg font-bold text-gray-900">₹{total.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseManagement;

