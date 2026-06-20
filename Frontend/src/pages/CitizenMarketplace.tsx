import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Search, 
  Sparkles, 
  MapPin, 
  User, 
  ShoppingBag, 
  CheckCircle, 
  X, 
  ArrowLeft,
  Coins
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VendorItem {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  farmer: {
    id: string;
    name: string;
    location: string;
  };
}

interface PriceRecommendation {
  productName: string;
  lowestPrice: number;
  averagePrice: number;
  unit: string;
  source: string;
}

const CitizenMarketplace = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<PriceRecommendation | null>(null);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<VendorItem | null>(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [buying, setBuying] = useState(false);

  // Pre-seeded list of common fresh produce categories and items
  const catalog = [
    { name: 'Tomato', category: 'vegetable', emoji: '🍅', desc: 'Fresh vine-ripened red tomatoes.' },
    { name: 'Onion', category: 'vegetable', emoji: '🧅', desc: 'Crisp and pungent red onions.' },
    { name: 'Potato', category: 'vegetable', emoji: '🥔', desc: 'Earth-fresh starchy baking potatoes.' },
    { name: 'Carrot', category: 'vegetable', emoji: '🥕', desc: 'Sweet and crunchy orange carrots.' },
    { name: 'Spinach', category: 'vegetable', emoji: '🥬', desc: 'Nutrient-rich organic spinach leaves.' },
    { name: 'Apple', category: 'fruit', emoji: '🍎', desc: 'Crisp and sweet regional apples.' },
    { name: 'Banana', category: 'fruit', emoji: '🍌', desc: 'Rich and sweet high-potassium bananas.' },
    { name: 'Mango', category: 'fruit', emoji: '🥭', desc: 'Juicy and aromatic alphanso mangoes.' },
    { name: 'Orange', category: 'fruit', emoji: '🍊', desc: 'Zesty citrus rich sweet oranges.' },
    { name: 'Wheat', category: 'grain', emoji: '🌾', desc: 'High-quality whole wheat grains.' },
    { name: 'Rice', category: 'grain', emoji: '🍚', desc: 'Standard premium long-grain white rice.' },
    { name: 'Cucumber', category: 'vegetable', emoji: '🥒', desc: 'Hydrating, cool garden cucumbers.' },
  ];

  const filteredCatalog = catalog.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectProduct = async (productName: string) => {
    setSelectedProduct(productName);
    setLoadingVendors(true);
    setAiRecommendation(null);
    setVendors([]);
    
    try {
      // 1. Fetch vendors selling this product
      const vendorsRes = await api.getProductVendors(productName) as any;
      const listings = vendorsRes || [];
      setVendors(listings);

      // 2. Fetch AI price recommendations & lowest price
      const priceRes = await api.getLowestMarketPrice(productName) as any;
      if (priceRes) {
        setAiRecommendation({
          productName: priceRes.productName,
          lowestPrice: priceRes.lowestPrice,
          averagePrice: priceRes.averagePrice,
          unit: priceRes.unit || 'kg',
          source: priceRes.source
        });
      }
    } catch (error) {
      console.error('Failed to load vendors:', error);
      toast.error('Could not query marketplace database');
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleOpenCheckout = (vendor: VendorItem) => {
    setCheckoutItem(vendor);
    setBuyQuantity(1);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutItem) return;

    if (buyQuantity <= 0 || buyQuantity > checkoutItem.quantity) {
      toast.error(`Please select a valid quantity (1 to ${checkoutItem.quantity})`);
      return;
    }

    setBuying(true);
    try {
      const response = await api.buyMarketplaceItem(checkoutItem.id, buyQuantity) as any;
      if (response && response.status === 'success') {
        toast.success(`Purchase of ${buyQuantity} ${checkoutItem.unit} completed successfully!`);
        setCheckoutItem(null);
        // Refresh product list
        handleSelectProduct(checkoutItem.name);
      } else {
        toast.error(response?.message || 'Transaction failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Transaction failed');
    } finally {
      setBuying(false);
    }
  };

  // Find recommended vendor based on lowest price
  const recommendedVendor = vendors.length > 0 
    ? vendors.reduce((prev, curr) => (prev.price < curr.price) ? prev : curr)
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            🍏 Farm-to-Citizen Marketplace
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">
            Buy fresh organic goods directly from verified local farmers with AI best-deal recommendations.
          </p>
        </div>
      </div>

      {!selectedProduct ? (
        <>
          {/* Controls: Search and Categories */}
          <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500 group-focus-within:text-primary-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search fruits, vegetables, grains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {['all', 'vegetable', 'fruit', 'grain'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category === 'all' ? 'All Items' : category + 's'}
                </button>
              ))}
            </div>
          </div>

          {/* Grocery Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCatalog.map((item) => (
              <div
                key={item.name}
                onClick={() => handleSelectProduct(item.name)}
                className="glass-card hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 cursor-pointer overflow-hidden group flex flex-col justify-between"
              >
                <div className="p-6">
                  <span className="text-5xl group-hover:animate-bounce inline-block mb-4 transition-transform">{item.emoji}</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.desc}</p>
                </div>
                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 px-2 py-0.5 bg-primary-100/50 dark:bg-primary-900/20 rounded-full">
                    {item.category}
                  </span>
                  <span className="text-xs font-bold text-gray-400 group-hover:text-primary-600 transition-colors flex items-center gap-1">
                    Compare Vendors →
                  </span>
                </div>
              </div>
            ))}

            {filteredCatalog.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No goods match your search query.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Vendors Detail View */
        <div className="space-y-6">
          {/* Back button */}
          <button 
            onClick={() => setSelectedProduct(null)} 
            className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Produce Catalog
          </button>

          <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <span className="text-4xl">
              {catalog.find(c => c.name === selectedProduct)?.emoji || '🍎'}
            </span>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">{selectedProduct} Vendors</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Compare pricing and stock from local farms.</p>
            </div>
          </div>

          {/* AI recommendations widget */}
          {aiRecommendation && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl animate-pulse"></div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-emerald-500 dark:bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                  <Sparkles size={24} />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-extrabold text-emerald-900 dark:text-emerald-300 text-lg flex items-center gap-2">
                    AI Best Deal Recommendation
                  </h3>
                  {recommendedVendor ? (
                    <div>
                      <p className="text-sm text-emerald-800 dark:text-emerald-400 leading-relaxed">
                        We recommend buying from <span className="font-bold text-gray-900 dark:text-white">{recommendedVendor.farmer.name}</span> located in <span className="font-bold text-gray-900 dark:text-white">{recommendedVendor.farmer.location || 'Coimbatore'}</span>.
                        They are selling {selectedProduct} at the lowest price of <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">₹{recommendedVendor.price}/{recommendedVendor.unit}</span>.
                      </p>
                      {aiRecommendation.lowestPrice < aiRecommendation.averagePrice && (
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 mt-1">
                          🔥 Saving you {Math.round((1 - (aiRecommendation.lowestPrice / aiRecommendation.averagePrice)) * 100)}% compared to the local marketplace average of ₹{aiRecommendation.averagePrice}!
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-emerald-800 dark:text-emerald-400">
                      No active listings found for {selectedProduct} right now. The normal market benchmark price from All-India CSV records is <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{aiRecommendation.lowestPrice}/kg</span>.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Vendors list */}
          {loadingVendors ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Scanning local farms...</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-4">Farmer / Vendor</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Stock Available</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {vendors.map((vendor) => {
                      const isBestPrice = recommendedVendor && vendor.id === recommendedVendor.id;
                      return (
                        <tr key={vendor.id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors ${isBestPrice ? 'bg-emerald-50/20 dark:bg-emerald-950/5' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-emerald-400 flex items-center justify-center text-white text-xs font-bold">
                                <User size={14} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                  {vendor.farmer.name}
                                  {isBestPrice && (
                                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded">
                                      AI Best Deal
                                    </span>
                                  )}
                                </p>
                                <p className="text-[10px] text-gray-400">Verified Seller</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                              <MapPin size={14} className="text-gray-400" />
                              {vendor.farmer.location || 'Coimbatore, TN'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {vendor.quantity} {vendor.unit}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-base font-black text-gray-900 dark:text-white">
                              ₹{vendor.price} <span className="text-xs font-medium text-gray-400">/ {vendor.unit}</span>
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleOpenCheckout(vendor)}
                              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-600/10 active:scale-[0.98] transition-all flex items-center gap-1.5 ml-auto"
                            >
                              <ShoppingBag size={14} />
                              Buy Now
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {vendors.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
                          No active farmer listings found for {selectedProduct} right now. Please check back later.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full border border-gray-100 dark:border-gray-700 shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setCheckoutItem(null)} 
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
            >
              <X size={18} />
            </button>

            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <ShoppingBag className="text-primary-600" />
              Checkout Review
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Confirm your simulated purchase.</p>

            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-4 space-y-4 mb-6">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Produce Item</span>
                <span className="font-extrabold text-gray-900 dark:text-white text-base">
                  {catalog.find(c => c.name === checkoutItem.name)?.emoji || '🍎'} {checkoutItem.name}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Vendor Farmer</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{checkoutItem.farmer.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Price per unit</span>
                <span className="font-black text-gray-900 dark:text-white">₹{checkoutItem.price} / {checkoutItem.unit}</span>
              </div>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                  Select Quantity ({checkoutItem.unit})
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={checkoutItem.quantity}
                    value={buyQuantity}
                    onChange={(e) => setBuyQuantity(Math.min(checkoutItem.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="block w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-base font-bold text-center"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setBuyQuantity(checkoutItem.quantity)}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-bold text-xs uppercase text-gray-600 dark:text-gray-300 transition-all shrink-0"
                  >
                    Buy All
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 ml-1 font-medium">
                  Available stock: {checkoutItem.quantity} {checkoutItem.unit}
                </p>
              </div>

              {/* Total Calculation */}
              <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800/30 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-sm font-bold text-primary-900 dark:text-primary-300 flex items-center gap-1">
                  <Coins size={16} /> Total Due
                </span>
                <span className="text-2xl font-black text-primary-600 dark:text-primary-400">
                  ₹{(checkoutItem.price * buyQuantity).toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setCheckoutItem(null)}
                  className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={buying}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {buying ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Confirm Buy
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenMarketplace;
