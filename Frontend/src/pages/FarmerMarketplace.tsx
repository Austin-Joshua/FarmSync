import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Tag, 
  Package, 
  Scale, 
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface ListingItem {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  createdAt: string;
}

interface PriceRecommendation {
  lowestPrice: number;
  averagePrice: number;
  unit: string;
  source: string;
}

const FarmerMarketplace = () => {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkingPrice, setCheckingPrice] = useState(false);

  // Form State
  const [name, setName] = useState('Tomato');
  const [category, setCategory] = useState('vegetable');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');

  // AI Recommendation State
  const [priceRec, setPriceRec] = useState<PriceRecommendation | null>(null);

  const productOptions = [
    { name: 'Tomato', category: 'vegetable' },
    { name: 'Onion', category: 'vegetable' },
    { name: 'Potato', category: 'vegetable' },
    { name: 'Carrot', category: 'vegetable' },
    { name: 'Spinach', category: 'vegetable' },
    { name: 'Apple', category: 'fruit' },
    { name: 'Banana', category: 'fruit' },
    { name: 'Mango', category: 'fruit' },
    { name: 'Orange', category: 'fruit' },
    { name: 'Wheat', category: 'grain' },
    { name: 'Rice', category: 'grain' },
    { name: 'Cucumber', category: 'vegetable' },
  ];

  const handleProductChange = (prodName: string) => {
    setName(prodName);
    const selected = productOptions.find(p => p.name === prodName);
    if (selected) {
      setCategory(selected.category);
    }
    setPriceRec(null); // Reset recommendations
  };

  const fetchMyListings = async () => {
    setLoadingListings(true);
    try {
      const response = await api.getMyMarketplaceListings() as any;
      setListings(response || []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      toast.error('Failed to sync listings database');
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleCheckPrice = async () => {
    if (!name) return;
    setCheckingPrice(true);
    setPriceRec(null);
    try {
      const response = await api.getLowestMarketPrice(name) as any;
      if (response) {
        setPriceRec({
          lowestPrice: response.lowestPrice,
          averagePrice: response.averagePrice,
          unit: response.unit || 'kg',
          source: response.source
        });
        toast.success(`AI computed market lowest price for ${name}`);
      }
    } catch (error) {
      console.error('Failed to check market price:', error);
      toast.error('AI price check service offline');
    } finally {
      setCheckingPrice(false);
    }
  };

  const handleApplySuggestedPrice = () => {
    if (priceRec) {
      // Suggest slightly competitive price (average between lowest and average)
      const suggested = Math.round(((priceRec.lowestPrice + priceRec.averagePrice) / 2) * 100) / 100;
      setPrice(suggested.toString());
      toast.success(`Applied AI recommended price of ₹${suggested}/${unit}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !price || !quantity || !unit) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        name,
        category,
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        unit
      };
      
      const response = await api.createMarketplaceItem(data) as any;
      if (response) {
        toast.success('Your listing was published successfully!');
        // Reset form
        setPrice('');
        setQuantity('');
        setPriceRec(null);
        // Refresh listings
        fetchMyListings();
      }
    } catch (error: any) {
      console.error('Failed to create listing:', error);
      toast.error(error.message || 'Failed to publish listing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this marketplace listing?')) return;
    try {
      const response = await api.deleteMarketplaceItem(id) as any;
      if (response && response.status === 'success') {
        toast.success('Listing removed successfully');
        fetchMyListings();
      }
    } catch (error) {
      console.error('Failed to delete listing:', error);
      toast.error('Failed to delete listing');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          🌾 Sell Produce & Manage Goods
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">
          List your fruits, vegetables, and grains to sell directly to citizens. Retrieve AI recommended pricing indices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add listing form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Plus className="text-primary-600" />
              Publish New Offer
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                  Produce Item
                </label>
                <select
                  value={name}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm"
                  required
                >
                  {productOptions.map(p => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  readOnly
                  disabled
                  className="block w-full px-4 py-2 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-100/50 dark:bg-gray-900/50 text-gray-400 outline-none capitalize text-sm cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    Stock Quantity
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Scale size={16} />
                    </div>
                    <input
                      type="number"
                      placeholder="e.g. 100"
                      min="1"
                      step="any"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm"
                    required
                  >
                    <option value="kg">kg</option>
                    <option value="bunch">bunch</option>
                    <option value="dozen">dozen</option>
                    <option value="quintal">quintal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Price per unit (INR)
                  </label>
                  <button
                    type="button"
                    onClick={handleCheckPrice}
                    disabled={checkingPrice}
                    className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-500 flex items-center gap-1"
                  >
                    <Sparkles size={12} className={checkingPrice ? 'animate-spin' : ''} />
                    AI Price Check
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Tag size={16} />
                  </div>
                  <input
                    type="number"
                    placeholder="e.g. 35.00"
                    min="0.1"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              {/* AI price suggestion block */}
              {priceRec && (
                <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800/30 rounded-xl p-4 text-xs space-y-2 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-1.5 font-bold text-primary-800 dark:text-primary-300">
                    <Sparkles size={14} />
                    AI Pricing Insight
                  </div>
                  <div className="space-y-1 text-primary-700 dark:text-primary-400 leading-normal">
                    <p>• Lowest active listed price: <b>₹{priceRec.lowestPrice}</b> / {priceRec.unit}</p>
                    <p>• Estimated market average: <b>₹{priceRec.averagePrice}</b> / {priceRec.unit}</p>
                    <p className="italic opacity-80 mt-1 font-medium">Source: {priceRec.source === 'listings' ? 'Active local listings' : 'Historical district market data'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplySuggestedPrice}
                    className="w-full py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg mt-1 transition-colors"
                  >
                    Use Recommended Price
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                Publish Listing
              </button>
            </form>
          </div>
        </div>

        {/* Farmer Listings Grid */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Package className="text-primary-600" />
                Active Sales Listings ({listings.length})
              </h2>

              {loadingListings ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hydrating items...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listings.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow relative"
                    >
                      <button
                        onClick={() => handleDeleteListing(item.id)}
                        className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                        title="Delete Listing"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 px-2 py-0.5 bg-primary-100/50 dark:bg-primary-900/20 rounded-full w-fit inline-block mb-3">
                          {item.category}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.name}</h3>
                        
                        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <p className="flex items-center gap-1.5">
                            <Scale size={14} className="text-gray-400" />
                            Stock: <span className="font-semibold text-gray-800 dark:text-gray-200">{item.quantity} {item.unit}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Tag size={14} className="text-gray-400" />
                            Listed Price: <span className="font-semibold text-gray-800 dark:text-gray-200">₹{item.price} / {item.unit}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-gray-400" />
                            Date: <span className="text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {listings.length === 0 && (
                    <div className="col-span-full text-center py-20 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <AlertCircle size={36} className="text-gray-400 mb-2" />
                      <p className="font-medium text-sm">No active listings listed for sale.</p>
                      <p className="text-xs text-gray-400 mt-1">Use the panel on the left to publish your first produce offer!</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-gray-100 dark:border-gray-700/50 pt-4 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
              <Info size={14} />
              Crops listed here are directly visible in the Citizen grocery portal. Citizens purchase products through virtual payment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerMarketplace;
