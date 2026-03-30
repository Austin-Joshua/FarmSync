// Expense Form Modal for Adding/Editing Expenses
import { useState, useEffect } from 'react';
import { X, Save, Calendar as CalendarIcon, IndianRupee } from 'lucide-react';
import { Expense } from '../types';
import CalendarWidget from './CalendarWidget';
import { useTranslation } from 'react-i18next';
import { mockCrops } from '../data/mockData';
import { translateCrop, translateCategory } from '../utils/translations';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'> | Expense) => void;
  expense?: Expense | null;
  mode?: 'add' | 'edit';
}

const ExpenseFormModal = ({ isOpen, onClose, onSave, expense = null, mode = 'add' }: ExpenseFormModalProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    category: expense?.category || 'seeds',
    description: expense?.description || '',
    amount: expense?.amount || 0,
    date: expense?.date || new Date().toISOString().split('T')[0],
    farmId: expense?.farmId || '1',
  });

  const [selectedDate, setSelectedDate] = useState<Date>(expense?.date ? new Date(expense.date) : new Date());

  useEffect(() => {
    if (expense) {
      setFormData({
        category: expense.category || 'seeds',
        description: expense.description || '',
        amount: expense.amount || 0,
        date: expense.date || new Date().toISOString().split('T')[0],
        farmId: expense.farmId || '1',
      });
      if (expense.date) {
        setSelectedDate(new Date(expense.date));
      }
    }
  }, [expense]);

  const categories = [
    { value: 'seeds', label: t('expenses.seeds'), icon: '🌱' },
    { value: 'labor', label: t('expenses.labor'), icon: '👷' },
    { value: 'fertilizers', label: t('expenses.fertilizers'), icon: '💧' },
    { value: 'pesticides', label: t('expenses.pesticides'), icon: '🐛' },
    { value: 'irrigation', label: t('expenses.irrigation'), icon: '🚿' },
    { value: 'equipment', label: t('expenses.equipment') || 'Equipment', icon: '🔧' },
    { value: 'transport', label: t('expenses.transport') || 'Transport', icon: '🚚' },
    { value: 'other', label: t('expenses.other'), icon: '💰' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || formData.amount <= 0) {
      alert(t('expenses.fillRequiredFields') || 'Please fill in all required fields and ensure amount is greater than 0');
      return;
    }

    const expenseData: any = {
      ...formData,
      date: selectedDate.toISOString().split('T')[0],
    };

    if (mode === 'edit' && expense) {
      expenseData.id = expense.id;
    }

    onSave(expenseData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <IndianRupee size={24} className="text-primary-600" />
            {mode === 'edit' ? t('expenses.editExpense') || 'Edit Expense' : t('expenses.addExpense') || 'Add Expense'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label={t('common.close') || 'Close'}
            title={t('common.close') || 'Close'}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('expenses.category')} *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.category === cat.value
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-2">{cat.icon}</div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('expenses.description') || 'Description'} *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('expenses.enterDescription') || 'Enter expense description (e.g., Rice seeds, Labor charges)'}
              className="input-field"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('expenses.amount')} (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="input-field pl-8"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <CalendarIcon size={16} className="inline mr-2" />
              {t('expenses.date') || 'Date'} *
            </label>
            <CalendarWidget
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setFormData({ ...formData, date: date.toISOString().split('T')[0] });
              }}
              maxDate={new Date()}
              className="w-full"
            />
          </div>

          {/* Farm Selection (Optional) */}
          <div>
            <label htmlFor="expense-crop-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('expenses.relatedCrop') || 'Related Crop (Optional)'}
            </label>
            <select
              id="expense-crop-select"
              value={formData.farmId}
              onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
              className="input-field"
              aria-label={t('expenses.relatedCrop') || 'Related Crop'}
            >
              <option value="">{t('expenses.noCrop') || 'No specific crop'}</option>
              {mockCrops.map((crop) => (
                <option key={crop.id} value={crop.farmId}>
                  {translateCrop(crop.name)} ({crop.category ? translateCategory(crop.category) : 'N/A'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {mode === 'edit' ? t('common.save') || 'Save Changes' : t('expenses.addExpense') || 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseFormModal;
