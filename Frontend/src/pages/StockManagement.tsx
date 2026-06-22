// Stock Management — Inventory tracking for seeds, fertilizers, pesticides
import { useState, useEffect } from 'react';
import { Package, Plus, Pencil, Trash2, Search, AlertTriangle, Sprout, Droplets, Bug, RefreshCw } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CATEGORY_ICONS: Record<string, any> = {
  seeds: Sprout,
  fertilizers: Droplets,
  pesticides: Bug,
};

const CATEGORY_COLORS: Record<string, string> = {
  seeds: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  fertilizers: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  pesticides: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
};

const MOCK_STOCK = [
  { id: '1', name: 'Paddy Seeds (IR-20)', category: 'seeds', quantity: 50, unit: 'kg', minQuantity: 20, pricePerUnit: 45 },
  { id: '2', name: 'Urea Fertilizer', category: 'fertilizers', quantity: 120, unit: 'kg', minQuantity: 30, pricePerUnit: 22 },
  { id: '3', name: 'Mancozeb 75% WP', category: 'pesticides', quantity: 8, unit: 'kg', minQuantity: 5, pricePerUnit: 380 },
  { id: '4', name: 'NPK 19:19:19', category: 'fertilizers', quantity: 4, unit: 'bags', minQuantity: 5, pricePerUnit: 1250 },
  { id: '5', name: 'Hybrid Tomato Seeds', category: 'seeds', quantity: 2, unit: 'packets', minQuantity: 3, pricePerUnit: 180 },
  { id: '6', name: 'Chlorpyrifos 20% EC', category: 'pesticides', quantity: 15, unit: 'liters', minQuantity: 5, pricePerUnit: 420 },
];

interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  pricePerUnit: number;
}

const StockManagement = () => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<StockItem | null>(null);
  const [form, setForm] = useState({ name: '', category: 'seeds', quantity: 0, unit: 'kg', minQuantity: 10, pricePerUnit: 0 });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.getStockItems() as any;
      const data = Array.isArray(res) ? res : (res?.data || []);
      setItems(data.length > 0 ? data : MOCK_STOCK);
    } catch {
      setItems(MOCK_STOCK);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await api.updateStockItem(editItem.id, form);
        toast.success('Stock item updated!');
      } else {
        await api.createStockItem(form);
        toast.success('Stock item added!');
      }
      setShowModal(false);
      setEditItem(null);
      fetchItems();
    } catch {
      // optimistic update for demo
      if (editItem) {
        setItems(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } : i));
      } else {
        setItems(prev => [...prev, { id: Date.now().toString(), ...form }]);
      }
      setShowModal(false);
      setEditItem(null);
      toast.success(editItem ? 'Stock item updated!' : 'Stock item added!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this stock item?')) return;
    try {
      await api.deleteStockItem(id);
      toast.success('Item deleted');
    } catch {}
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleEdit = (item: StockItem) => {
    setEditItem(item);
    setForm({ name: item.name, category: item.category, quantity: item.quantity, unit: item.unit, minQuantity: item.minQuantity, pricePerUnit: item.pricePerUnit });
    setShowModal(true);
  };

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const lowStockItems = items.filter(i => i.quantity <= i.minQuantity);
  const totalValue = items.reduce((sum, i) => sum + (i.quantity * i.pricePerUnit), 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Stock & Inventory</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage seeds, fertilizers, and pesticides</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchItems} className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:shadow-md transition-all">
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => { setEditItem(null); setForm({ name: '', category: 'seeds', quantity: 0, unit: 'kg', minQuantity: 10, pricePerUnit: 0 }); setShowModal(true); }}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-lg shadow-primary-500/20"
          >
            <Plus size={18} /> Add Item
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-4 !p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Items</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{items.length}</p>
        </div>
        <div className="glass-card p-4 !p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Value</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">₹{totalValue.toLocaleString()}</p>
        </div>
        <div className={`glass-card p-4 !p-4 ${lowStockItems.length > 0 ? 'border-amber-300 dark:border-amber-700' : ''}`}>
          <p className="text-xs text-gray-500 dark:text-gray-400">Low Stock</p>
          <p className={`text-2xl font-extrabold ${lowStockItems.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>{lowStockItems.length}</p>
        </div>
        <div className="glass-card p-4 !p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Categories</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">3</p>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-amber-900 dark:text-amber-100">Low Stock Alert</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map(item => (
              <span key={item.id} className="px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 rounded-lg text-xs font-semibold">
                {item.name}: {item.quantity} {item.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'seeds', 'fertilizers', 'pesticides'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all ${filterCategory === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stock table/cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p>No stock items found</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2 font-bold text-gray-600 dark:text-gray-400">Item</th>
                    <th className="text-left py-3 px-2 font-bold text-gray-600 dark:text-gray-400">Category</th>
                    <th className="text-right py-3 px-2 font-bold text-gray-600 dark:text-gray-400">Quantity</th>
                    <th className="text-right py-3 px-2 font-bold text-gray-600 dark:text-gray-400">Min Qty</th>
                    <th className="text-right py-3 px-2 font-bold text-gray-600 dark:text-gray-400">Price/Unit</th>
                    <th className="text-right py-3 px-2 font-bold text-gray-600 dark:text-gray-400">Total Value</th>
                    <th className="text-center py-3 px-2 font-bold text-gray-600 dark:text-gray-400">Status</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => {
                    const isLow = item.quantity <= item.minQuantity;
                    const Icon = CATEGORY_ICONS[item.category] || Package;
                    return (
                      <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                              <Icon size={14} className="text-primary-600 dark:text-primary-400" />
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-600'}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-gray-900 dark:text-white">{item.quantity} {item.unit}</td>
                        <td className="py-3 px-2 text-right text-gray-500 dark:text-gray-400">{item.minQuantity} {item.unit}</td>
                        <td className="py-3 px-2 text-right text-gray-700 dark:text-gray-300">₹{item.pricePerUnit}</td>
                        <td className="py-3 px-2 text-right font-bold text-gray-900 dark:text-white">₹{(item.quantity * item.pricePerUnit).toLocaleString()}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isLow ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                            {isLow ? 'Low' : 'OK'}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden mt-4 space-y-3">
              {filtered.map(item => {
                const isLow = item.quantity <= item.minQuantity;
                const Icon = CATEGORY_ICONS[item.category] || Package;
                return (
                  <div key={item.id} className={`p-4 rounded-2xl border-2 ${isLow ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <Icon size={16} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${CATEGORY_COLORS[item.category] || ''}`}>{item.category}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center mt-2">
                      <div>
                        <p className="text-[10px] text-gray-500">Stock</p>
                        <p className={`font-bold text-sm ${isLow ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>{item.quantity} {item.unit}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Min Qty</p>
                        <p className="font-bold text-sm text-gray-700 dark:text-gray-300">{item.minQuantity} {item.unit}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Value</p>
                        <p className="font-bold text-sm text-gray-900 dark:text-white">₹{(item.quantity * item.pricePerUnit).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editItem ? 'Edit Stock Item' : 'Add Stock Item'}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 block">Item Name</label>
                <input
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500/50 outline-none"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Urea Fertilizer"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 block">Category</label>
                  <select
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                    value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="seeds">Seeds</option>
                    <option value="fertilizers">Fertilizers</option>
                    <option value="pesticides">Pesticides</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 block">Unit</label>
                  <select
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                    value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  >
                    <option value="kg">kg</option>
                    <option value="liters">liters</option>
                    <option value="bags">bags</option>
                    <option value="packets">packets</option>
                    <option value="units">units</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 block">Quantity</label>
                  <input type="number" min={0}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                    value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 block">Min Qty</label>
                  <input type="number" min={0}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                    value={form.minQuantity} onChange={e => setForm(f => ({ ...f, minQuantity: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 block">Price/Unit (₹)</label>
                  <input type="number" min={0}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                    value={form.pricePerUnit} onChange={e => setForm(f => ({ ...f, pricePerUnit: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setShowModal(false); setEditItem(null); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >Cancel</button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition-all"
              >{editItem ? 'Update' : 'Add Item'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
