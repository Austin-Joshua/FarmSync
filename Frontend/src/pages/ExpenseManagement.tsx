// Expense Management page
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mockExpenses, getMonthlyExpenses } from '../data/mockData';
import { Plus, IndianRupee, TrendingDown, Calendar, Edit2, Trash2, Eye, ExternalLink } from 'lucide-react';
import { Expense } from '../types';
import ExpenseFormModal from '../components/ExpenseFormModal';
import DetailModal from '../components/DetailModal';
import ProgressBar from '../components/ProgressBar';
import { formatDateDisplay } from '../utils/dateFormatter';

const ExpenseManagement = () => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [detailModal, setDetailModal] = useState<{
    type: 'expenses' | 'category' | null;
    data?: any;
  }>({ type: null });
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpense = getMonthlyExpenses(currentMonth, currentYear);

  // LIFO: Sort by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

  const filteredExpenses = sortedExpenses.filter(
    (expense) => selectedCategory === 'all' || expense.category === selectedCategory
  );

  const handleAddExpense = () => {
    setEditingExpense(null);
    setIsFormModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormModalOpen(true);
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (confirm(t('expenses.confirmDelete') || 'Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(e => e.id !== expenseId));
      alert(t('expenses.expenseDeleted') || 'Expense deleted successfully!');
    }
  };

  const handleSaveExpense = (expenseData: Expense | Omit<Expense, 'id'>) => {
    if ('id' in expenseData && expenseData.id) {
      // Editing existing expense - maintain LIFO order
      const updated = expenses.map(e => e.id === expenseData.id ? expenseData as Expense : e);
      const sorted = updated.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
      setExpenses(sorted);
      alert(t('expenses.expenseUpdated') || 'Expense updated successfully!');
    } else {
      // Adding new expense (will be first due to LIFO - newest dates first)
      const newExpense: Expense = {
        ...expenseData as Omit<Expense, 'id'>,
        id: Date.now().toString(),
      };
      // Insert at beginning, then sort to ensure proper LIFO order
      const updated = [newExpense, ...expenses].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });
      setExpenses(updated);
      alert(t('expenses.expenseAdded') || 'Expense added successfully!');
    }
    setEditingExpense(null);
    setIsFormModalOpen(false);
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
        <button onClick={handleAddExpense} className="btn-primary flex items-center gap-2 transition-all duration-150 ease-in-out hover:scale-105 active:scale-95">
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
            <IndianRupee className="text-red-600" size={48} />
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
          <label htmlFor="expense-category-filter" className="font-medium text-gray-700">{t('common.filter')} {t('common.by')} {t('expenses.category')}:</label>
          <select
            id="expense-category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field"
            aria-label={t('expenses.category')}
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
      <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setDetailModal({ type: 'expenses', data: filteredExpenses })}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{t('expenses.expenseRecords')}</h2>
          <Eye size={18} className="text-gray-400" />
        </div>
        <div className="space-y-3">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense, index) => {
              // Map index to delay class (0-350ms in 30ms increments)
              const getDelayClass = (idx: number) => {
                const delay = Math.min(idx * 30, 350);
                if (delay <= 0) return 'delay-0';
                if (delay <= 25) return 'delay-25';
                if (delay <= 30) return 'delay-30';
                if (delay <= 50) return 'delay-50';
                if (delay <= 75) return 'delay-75';
                if (delay <= 100) return 'delay-100';
                if (delay <= 150) return 'delay-150';
                if (delay <= 200) return 'delay-200';
                if (delay <= 250) return 'delay-250';
                if (delay <= 300) return 'delay-300';
                return 'delay-350';
              };
              return (
              <div
                key={expense.id}
                className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-all duration-200 ease-out group animate-in fade-in slide-in-from-right-4 bg-white dark:bg-gray-800 ${getDelayClass(index)}`}
                onClick={(e) => { e.stopPropagation(); }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-3xl">{getCategoryIcon(expense.category)}</div>
                    <div className="flex-1">
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
                        {formatDateDisplay(expense.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">₹{expense.amount.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        title={t('common.edit') || 'Edit'}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title={t('common.delete') || 'Delete'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-gray-500">
              <IndianRupee size={48} className="mx-auto mb-4 text-gray-400" />
              <p>{t('expenses.noExpenses')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setDetailModal({ type: 'category', data: categoryTotals })}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{t('expenses.expensesByCategory')}</h2>
          <Eye size={18} className="text-gray-400" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(categoryTotals).map(([category, total]) => (
            <div key={category} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className="text-3xl mb-2">{getCategoryIcon(category)}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t(`expenses.${category}`)}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">₹{total.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Form Modal */}
      <ExpenseFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        expense={editingExpense}
        mode={editingExpense ? 'edit' : 'add'}
      />

      {/* Detail Modals */}
      {detailModal.type === 'expenses' && (
        <DetailModal
          isOpen={true}
          onClose={() => setDetailModal({ type: null })}
          title={t('expenses.expenseRecords')}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('expenses.totalExpenses')}</p>
                <p className="text-2xl font-bold text-red-600">₹{detailModal.data?.reduce((sum: number, exp: Expense) => sum + exp.amount, 0).toLocaleString() || 0}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('expenses.averageExpense')}</p>
                <p className="text-2xl font-bold text-blue-600">₹{Math.round((detailModal.data?.reduce((sum: number, exp: Expense) => sum + exp.amount, 0) || 0) / (detailModal.data?.length || 1)).toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('common.total')} {t('common.records')}</p>
                <p className="text-2xl font-bold text-purple-600">{detailModal.data?.length || 0}</p>
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {detailModal.data?.map((expense: Expense) => (
                <div
                  key={expense.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-3xl">{getCategoryIcon(expense.category)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {expense.description === 'Rice seeds (Basmati)' ? t('expenses.riceSeedsBasmati') :
                             expense.description === 'Wheat seeds' ? t('expenses.wheatSeeds') :
                             expense.description === 'Field preparation labor' ? t('expenses.fieldPreparationLabor') :
                             expense.description === 'Urea and NPK' ? t('expenses.ureaAndNPK') :
                             expense.description === 'Insecticides and fungicides' ? t('expenses.insecticidesAndFungicides') :
                             expense.description === 'Water pump maintenance' ? t('expenses.waterPumpMaintenance') :
                             expense.description}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(expense.category)}`}>
                            {t(`expenses.${expense.category}`)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDateDisplay(expense.date)}
                          {expense.relatedCropId && (
                            <span className="ml-2 text-xs">• {t('expenses.relatedCrop')}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{expense.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DetailModal>
      )}

      {detailModal.type === 'category' && (
        <DetailModal
          isOpen={true}
          onClose={() => setDetailModal({ type: null })}
          title={t('expenses.expensesByCategory')}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('expenses.totalExpenses')}: ₹{Object.values(detailModal.data || {}).reduce((sum: number, val: any) => sum + val, 0).toLocaleString()}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('common.total')} {Object.keys(detailModal.data || {}).length} {t('expenses.category')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(detailModal.data || {}).map(([category, total]) => {
                const categoryExpenses = expenses.filter(exp => exp.category === category);
                const totalAll = Object.values(detailModal.data || {}).reduce((sum: number, val: any) => sum + val, 0);
                const percentageNum = totalAll > 0 ? ((total as number) / totalAll * 100) : 0;
                const percentage = percentageNum.toFixed(1);
                const progressValueCalc = Math.min(100, Math.max(0, percentageNum));
                const progressValueNum = Number.isFinite(progressValueCalc) ? Math.round(progressValueCalc) : 0;
                const progressValue = progressValueNum; // Explicit number for ARIA
                return (
                  <div key={category} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{getCategoryIcon(category)}</div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{t(`expenses.${category}`)}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{categoryExpenses.length} {t('common.records')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('expenses.totalExpenses')}</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">₹{(total as number).toLocaleString()}</span>
                      </div>
                      <div className="mt-2">
                        <ProgressBar
                          value={progressValue}
                          className="bg-gray-200 dark:bg-gray-600"
                          barClassName="bg-primary-600"
                          aria-valuenow={progressValue}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Expense progress: ${progressValue}%`}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{percentage}% {t('common.of')} {t('expenses.totalExpenses')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DetailModal>
      )}
    </div>
  );
};

export default ExpenseManagement;

