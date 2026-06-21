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
  Coins,
  Plus,
  Trash2,
  Tag,
  Package,
  Scale,
  Calendar,
  Lock,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

interface ListingItem {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  createdAt: string;
}

const Marketplace = () => {
  const { user } = useAuth();
  
  // Tabs: 'buy' | 'sell' | 'moderate' | 'history'
  const [activeMarketTab, setActiveMarketTab] = useState<'buy' | 'sell' | 'moderate' | 'history'>('buy');
  const [cartHistory, setCartHistory] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('citizen_cart') || '[]'); } catch { return []; }
  });

  // ----------------------------------------
  // BUY STATE & CATALOG
  // ----------------------------------------
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<PriceRecommendation | null>(null);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<VendorItem | null>(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [buying, setBuying] = useState(false);

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
      const vendorsRes = await api.getProductVendors(productName) as any;
      setVendors(vendorsRes || []);

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

  const recommendedVendor = vendors.length > 0 
    ? vendors.reduce((prev, curr) => (prev.price < curr.price) ? prev : curr)
    : null;

  // ----------------------------------------
  // SELL STATE & FORM
  // ----------------------------------------
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [submittingListing, setSubmittingListing] = useState(false);
  const [checkingPrice, setCheckingPrice] = useState(false);

  const [sellName, setSellName] = useState('Tomato');
  const [sellCategory, setSellCategory] = useState('vegetable');
  const [sellPrice, setSellPrice] = useState('');
  const [sellQuantity, setSellQuantity] = useState('');
  const [sellUnit, setSellUnit] = useState('kg');
  const [sellPriceRec, setSellPriceRec] = useState<PriceRecommendation | null>(null);

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
    setSellName(prodName);
    const selected = productOptions.find(p => p.name === prodName);
    if (selected) {
      setSellCategory(selected.category);
    }
    setSellPriceRec(null);
  };

  const fetchMyListings = async () => {
    setLoadingListings(true);
    try {
      const response = await api.getMyMarketplaceListings() as any;
      setListings(response || []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoadingListings(false);
    }
  };

  const handleCheckPrice = async () => {
    if (!sellName) return;
    setCheckingPrice(true);
    setSellPriceRec(null);
    try {
      const response = await api.getLowestMarketPrice(sellName) as any;
      if (response) {
        setSellPriceRec({
          productName: response.productName,
          lowestPrice: response.lowestPrice,
          averagePrice: response.averagePrice,
          unit: response.unit || 'kg',
          source: response.source
        });
        toast.success(`AI price metrics loaded for ${sellName}`);
      }
    } catch (error) {
      console.error('Failed to check market price:', error);
      toast.error('AI price check service offline');
    } finally {
      setCheckingPrice(false);
    }
  };

  const handleApplySuggestedPrice = () => {
    if (sellPriceRec) {
      const suggested = Math.round(((sellPriceRec.lowestPrice + sellPriceRec.averagePrice) / 2) * 100) / 100;
      setSellPrice(suggested.toString());
      toast.success(`Applied AI recommended price of ₹${suggested}/${sellUnit}`);
    }
  };

  const handleListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellName || !sellCategory || !sellPrice || !sellQuantity || !sellUnit) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmittingListing(true);
    try {
      const data = {
        name: sellName,
        category: sellCategory,
        price: parseFloat(sellPrice),
        quantity: parseFloat(sellQuantity),
        unit: sellUnit
      };
      
      const response = await api.createMarketplaceItem(data) as any;
      if (response) {
        toast.success('Your listing was published successfully!');
        setSellPrice('');
        setSellQuantity('');
        setSellPriceRec(null);
        fetchMyListings();
      }
    } catch (error: any) {
      console.error('Failed to create listing:', error);
      toast.error(error.message || 'Failed to publish listing');
    } finally {
      setSubmittingListing(false);
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
    }
  };

  // ----------------------------------------
  // ADMIN MODERATION STATE
  // ----------------------------------------
  const [allListings, setAllListings] = useState<any[]>([]);
  const [loadingAllListings, setLoadingAllListings] = useState(false);

  const fetchAllListings = async () => {
    setLoadingAllListings(true);
    try {
      const response = await api.getMarketplaceItems() as any;
      setAllListings(response || []);
    } catch (error) {
      console.error('Failed to fetch all listings:', error);
    } finally {
      setLoadingAllListings(false);
    }
  };

  const handleAdminDeleteListing = async (id: string) => {
    if (!window.confirm('Moderate action: Delete this listing from community marketplace?')) return;
    try {
      const response = await api.adminDeleteMarketplaceItem(id) as any;
      if (response && response.status === 'success') {
        toast.success('Listing moderated and removed');
        fetchAllListings();
      }
    } catch (error) {
      console.error('Failed to delete listing as admin:', error);
      toast.error('Failed to moderate listing');
    }
  };

  // Trigger loading based on active tab
  useEffect(() => {
    if (activeMarketTab === 'sell') {
      fetchMyListings();
    } else if (activeMarketTab === 'moderate') {
      fetchAllListings();
    }
  }, [activeMarketTab]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            🍏 Community Marketplace
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">
            Browse fresh crops from local farmers and buy direct.
          </p>
        </div>
      </div>

      {/* Unified Tab Bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-none">
        <button
          onClick={() => { setActiveMarketTab('buy'); setSelectedProduct(null); }}
          className={`px-4 sm:px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
            activeMarketTab === 'buy'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          🛒 Buy Produce
        </button>
        {user?.role !== 'citizen' && (
          <button
            onClick={() => setActiveMarketTab('sell')}
            className={`px-4 sm:px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeMarketTab === 'sell'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            📦 Sell Produce
          </button>
        )}
        {user?.role === 'citizen' && (
          <button
            onClick={() => setActiveMarketTab('history')}
            className={`px-4 sm:px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeMarketTab === 'history'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            📋 My Orders ({cartHistory.length})
          </button>
        )}
        {user?.role?.toLowerCase() === 'admin' && (
          <button
            onClick={() => setActiveMarketTab('moderate')}
            className={`px-4 sm:px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeMarketTab === 'moderate'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            🛡️ Moderate
          </button>
        )}
      </div>

      {/* ----------------------------------------
          BUY FRESH PRODUCE TAB
          ---------------------------------------- */}
      {activeMarketTab === 'buy' && (
        <div className="space-y-6">
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
                              No active farmer listings found for {selectedProduct} right now.
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
        </div>
      )}

      {/* ----------------------------------------
          SELL YOUR PRODUCE TAB
          ---------------------------------------- */}
      {activeMarketTab === 'sell' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add listing form */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Plus className="text-primary-600" />
                Publish Produce Offer
              </h2>
              <form onSubmit={handleListingSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    Produce Item
                  </label>
                  <select
                    value={sellName}
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
                    value={sellCategory}
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
                        value={sellQuantity}
                        onChange={(e) => setSellQuantity(e.target.value)}
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
                      value={sellUnit}
                      onChange={(e) => setSellUnit(e.target.value)}
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
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                {/* AI price recommendation banner */}
                {sellPriceRec && (
                  <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800/30 rounded-xl p-4 text-xs space-y-2 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-1.5 font-bold text-primary-800 dark:text-primary-300">
                      <Sparkles size={14} />
                      AI Pricing Insight
                    </div>
                    <div className="space-y-1 text-primary-700 dark:text-primary-400 leading-normal">
                      <p>• Lowest active listed price: <b>₹{sellPriceRec.lowestPrice}</b> / {sellPriceRec.unit}</p>
                      <p>• Estimated market average: <b>₹{sellPriceRec.averagePrice}</b> / {sellPriceRec.unit}</p>
                      <p className="italic opacity-80 mt-1 font-medium">Source: {sellPriceRec.source === 'listings' ? 'Active local listings' : 'Historical district market data'}</p>
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
                  disabled={submittingListing}
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
                        <Plus className="text-gray-450 mb-2 animate-pulse" size={32} />
                        <p className="font-medium text-sm">No active listings published for sale.</p>
                        <p className="text-xs text-gray-400 mt-1">Use the panel on the left to publish your first produce offer!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-8 border-t border-gray-100 dark:border-gray-700/50 pt-4 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <Info size={14} />
                Crops listed here are directly visible in the Citizen grocery portal.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------
          MODERATE TAB (ADMIN ONLY)
          ---------------------------------------- */}
      {activeMarketTab === 'moderate' && user?.role?.toLowerCase() === 'admin' && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Lock size={20} className="text-primary-600" />
            Marketplace Moderation Dashboard
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Moderate or remove non-compliant crop listings from the FarmSync network.</p>

          {loadingAllListings ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-gray-500">Hydrating listings...</p>
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-4">Produce Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Vendor Farmer</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4">Listed Price</th>
                      <th className="px-6 py-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {allListings.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                          {item.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 px-2 py-0.5 bg-primary-100/50 dark:bg-primary-900/20 rounded-full">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-semibold">
                          {item.farmer?.name || 'Unknown Farmer'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-6 py-4 text-base font-black text-gray-900 dark:text-white">
                          ₹{item.price} / {item.unit}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleAdminDeleteListing(item.id)}
                            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-xs rounded-lg active:scale-[0.98] transition-all flex items-center gap-1 ml-auto"
                          >
                            <Trash2 size={13} />
                            Moderate & Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {allListings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
                          No listings currently active in the marketplace.
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
      {/* CART HISTORY TAB — Citizen */}
      {activeMarketTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Orders ({cartHistory.length})</h2>
            {cartHistory.length > 0 && (
              <button
                onClick={() => { localStorage.removeItem('citizen_cart'); setCartHistory([]); toast.success('Cart cleared!'); }}
                className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
          {cartHistory.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <ShoppingBag size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 font-medium">No orders yet</p>
              <button onClick={() => setActiveMarketTab('buy')} className="mt-3 btn-primary text-sm py-2 px-5">Browse Marketplace</button>
            </div>
          ) : (
            <div className="space-y-3">
              {cartHistory.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xl">
                      🧺
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} {item.unit} • Added {new Date(item.addedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-primary-600 dark:text-primary-400">₹{item.price}/{item.unit}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">In Cart</span>
                  </div>
                </div>
              ))}
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-200 dark:border-primary-800">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-gray-900 dark:text-white">Total Estimated</p>
                  <p className="text-2xl font-black text-primary-600 dark:text-primary-400">
                    ₹{cartHistory.reduce((sum: number, item: any) => sum + item.price, 0).toFixed(0)}
                  </p>
                </div>
                <button
                  onClick={() => { toast.success('Order placed! Farmer will contact you shortly.'); localStorage.removeItem('citizen_cart'); setCartHistory([]); }}
                  className="w-full mt-3 btn-primary py-3 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Place Order
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
