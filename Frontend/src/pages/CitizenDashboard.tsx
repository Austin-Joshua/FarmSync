// Citizen Dashboard — Market, Weather, Community, Marketplace
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp, TrendingDown, ShoppingCart, MessageSquare, MapPin,
  Package, ArrowRight, BarChart2, HelpCircle, Flame, Star
} from 'lucide-react';
import WeatherCard from '../components/WeatherCard';
import LocationMap from '../components/LocationMap';
import toast from 'react-hot-toast';
import api from '../services/api';

// Mock market prices for common produce
const MARKET_PRICES = [
  { name: 'Rice', price: 2180, prev: 2100, unit: 'per quintal', trend: 'up', icon: '🌾' },
  { name: 'Wheat', price: 2275, prev: 2300, unit: 'per quintal', trend: 'down', icon: '🌿' },
  { name: 'Tomato', price: 45, prev: 38, unit: 'per kg', trend: 'up', icon: '🍅' },
  { name: 'Onion', price: 28, prev: 32, unit: 'per kg', trend: 'down', icon: '🧅' },
  { name: 'Cotton', price: 6850, prev: 6720, unit: 'per quintal', trend: 'up', icon: '☁️' },
  { name: 'Sugarcane', price: 315, prev: 315, unit: 'per quintal', trend: 'flat', icon: '🌱' },
];

// Produce categories for browsing
const CATEGORIES = [
  { name: 'Fresh Vegetables', icon: '🍅', count: 24, path: '/marketplace?category=vegetable' },
  { name: 'Organic Fruits', icon: '🍎', count: 18, path: '/marketplace?category=fruit' },
  { name: 'Grains & Pulses', icon: '🌾', count: 12, path: '/marketplace?category=grain' },
  { name: 'Dairy & Eggs', icon: '🥛', count: 7, path: '/marketplace?category=dairy' },
];

// Frequently bought items
const FREQUENT_ITEMS = [
  { id: 'freq-1', name: 'Organic Bananas', price: 60, unit: 'dozen', rating: 4.8, sales: '140+ bought', icon: '🍌', category: 'fruit' },
  { id: 'freq-2', name: 'Fresh Red Tomatoes', price: 40, unit: 'kg', rating: 4.6, sales: '280+ bought', icon: '🍅', category: 'vegetable' },
  { id: 'freq-3', name: 'Pure Farm Honey', price: 280, unit: '500g', rating: 4.9, sales: '90+ bought', icon: '🍯', category: 'dairy' },
  { id: 'freq-4', name: 'Fresh Desi Cow Milk', price: 65, unit: 'Litre', rating: 4.7, sales: '350+ bought', icon: '🥛', category: 'dairy' },
];

// Community FAQs
const FAQS = [
  {
    q: 'How does the direct farm-to-table delivery model work?',
    a: 'FarmSync connects you directly with local farmers. When you place an order, the farmer harvests it fresh and prepares it for shipment. We coordinate logistics to ensure same-day or next-day delivery.'
  },
  {
    q: 'Are the vegetables and fruits certified organic?',
    a: 'Many of our farmers list organic certifications. Check the certification badge on the product page for specific details.'
  },
  {
    q: 'How do I ensure payment safety for bulk orders?',
    a: 'FarmSync uses safe escrow payments. Funds are released to the farmer only after you verify the quality upon delivery.'
  },
  {
    q: 'What should I do if the produce is damaged?',
    a: 'You can submit a claim in your "My Orders" section within 24 hours of delivery for a full refund or replacement.'
  }
];

interface MarketItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
  farmer?: { name: string; location: string };
}

const CitizenDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nearbyItems, setNearbyItems] = useState<MarketItem[]>([]);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [gps, setGps] = useState({ latitude: 11.0168, longitude: 76.9558 });
  const [cartCount, setCartCount] = useState(() => {
    try { return JSON.parse(localStorage.getItem('citizen_cart') || '[]').length; } catch { return 0; }
  });

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setGps({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => {}
    );
    loadNearbyItems();
    loadCommunityPosts();
  }, []);

  const loadNearbyItems = async () => {
    try {
      const res = await api.getMarketplaceItems() as any;
      const items = Array.isArray(res) ? res : res?.data || [];
      setNearbyItems(items.slice(0, 6));
    } catch {
      // use empty list
    }
  };

  const loadCommunityPosts = async () => {
    try {
      const data = await api.getForumPosts() as any;
      const posts = Array.isArray(data) ? data : [];
      setCommunityPosts(posts.slice(0, 3));
    } catch {}
  };

  const addToCart = (item: any) => {
    const cart = JSON.parse(localStorage.getItem('citizen_cart') || '[]');
    cart.push({ ...item, addedAt: new Date().toISOString() });
    localStorage.setItem('citizen_cart', JSON.stringify(cart));
    setCartCount(cart.length);
    toast.success(`${item.name} added to cart!`);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            {greeting()}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm flex items-center gap-1.5">
            <MapPin size={14} />
            {user?.location || 'Chennai, Tamil Nadu'}
          </p>
        </div>
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-lg shadow-emerald-500/20 relative"
        >
          <ShoppingCart size={18} />
          Browse Marketplace
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Browse by Category (Vegetables, Fruits, Grains, etc.) */}
      <div className="glass-card p-4 sm:p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Package size={20} className="text-emerald-600" /> Browse by Fresh Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map(cat => (
            <div
              key={cat.name}
              onClick={() => navigate(cat.path)}
              className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-transparent hover:border-emerald-500/20 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md cursor-pointer transition-all flex flex-col items-center text-center"
            >
              <span className="text-4xl mb-2">{cat.icon}</span>
              <h3 className="font-bold text-sm text-gray-800 dark:text-white">{cat.name}</h3>
              <span className="text-[10px] text-gray-400 font-semibold mt-1">{cat.count} listings nearby</span>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Bought Food and Related Items */}
      <div className="glass-card p-4 sm:p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Flame size={20} className="text-orange-500 animate-pulse" /> Frequently Bought Food & Items
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FREQUENT_ITEMS.map(item => (
            <div
              key={item.id}
              className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1 truncate">{item.name}</h3>
                <div className="flex items-center gap-1 mb-3 text-[10px] text-gray-400">
                  <div className="flex items-center text-amber-500">
                    <Star size={10} fill="currentColor" />
                    <span className="font-bold text-gray-700 dark:text-gray-300 ml-0.5">{item.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{item.sales}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-xs text-gray-400 block">Price</span>
                  <span className="font-black text-gray-900 dark:text-white">₹{item.price}/{item.unit}</span>
                </div>
                <button
                  onClick={() => addToCart({ ...item, quantity: 1 })}
                  className="flex items-center justify-center p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/10"
                >
                  <ShoppingCart size={13} className="mr-1" /> Reorder
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Prices */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart2 size={20} className="text-emerald-600" /> Today's Market Prices
          </h2>
          <button onClick={() => navigate('/market')} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {MARKET_PRICES.map(item => (
            <div key={item.name} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center hover:bg-white dark:hover:bg-gray-700 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md cursor-pointer" onClick={() => navigate('/market')}>
              <div className="text-2xl mb-1">{item.icon}</div>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.name}</p>
              <p className="text-sm font-black text-gray-900 dark:text-white">₹{item.price.toLocaleString()}</p>
              <p className="text-[9px] text-gray-400">{item.unit}</p>
              <div className={`flex items-center justify-center gap-0.5 mt-1 text-[9px] font-bold ${
                item.trend === 'up' ? 'text-green-600' : item.trend === 'down' ? 'text-red-500' : 'text-gray-400'
              }`}>
                {item.trend === 'up' && <TrendingUp size={10} />}
                {item.trend === 'down' && <TrendingDown size={10} />}
                {item.trend === 'flat' ? 'Stable' : `${Math.abs(item.price - item.prev)}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather + Map row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 glass-card overflow-hidden flex flex-col">
          <div className="p-4 sm:p-6 flex-grow flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-emerald-600" /> Your Location
            </h2>
            <div className="flex-grow min-h-[220px]">
              <LocationMap
                latitude={gps.latitude}
                longitude={gps.longitude}
                locationName={user?.location || 'Chennai, Tamil Nadu'}
                height="100%"
              />
            </div>
          </div>
        </div>
        <div className="glass-card p-4 sm:p-6">
          <WeatherCard latitude={gps.latitude} longitude={gps.longitude} />
        </div>
      </div>

      {/* Buy Fresh Produce + Farmer Forum Discussions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Marketplace listings */}
        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart size={20} className="text-emerald-600" /> Buy Fresh Produce
            </h2>
            <button onClick={() => navigate('/marketplace')} className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:gap-2 transition-all">
              See All <ArrowRight size={14} />
            </button>
          </div>
          {nearbyItems.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No listings available right now</p>
              <button onClick={() => navigate('/marketplace')} className="mt-3 text-xs font-bold text-emerald-600 hover:underline">Browse Marketplace</button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {nearbyItems.slice(0, 4).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.quantity} {item.unit} • {item.farmer?.name || 'Local Farmer'}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="font-black text-gray-900 dark:text-white text-sm">₹{item.price}/{item.unit}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="p-1.5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all"
                    >
                      <ShoppingCart size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Community discussions */}
        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={20} className="text-emerald-600" /> Farmer Discussions
            </h2>
            <button onClick={() => navigate('/community')} className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:gap-2 transition-all">
              Join Forum <ArrowRight size={14} />
            </button>
          </div>
          {communityPosts.length === 0 ? (
            <div className="space-y-2.5">
              {[
                { title: 'Best rice varieties for Kharif season?', author: 'Ravi Kumar', likes: 14, time: '2h ago' },
                { title: 'How to deal with brown spot disease in rice?', author: 'Anbu Selvan', likes: 8, time: '5h ago' },
                { title: 'Market prices dropping for onion — should I wait?', author: 'Murugesan', likes: 22, time: '1d ago' },
              ].map((post, i) => (
                <div key={i} onClick={() => navigate('/community')} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{post.title}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
                    <span className="font-bold text-emerald-600">{post.author}</span>
                    <span>👍 {post.likes}</span>
                    <span>{post.time}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {communityPosts.map(post => (
                <div key={post.id} onClick={() => navigate('/community')} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all cursor-pointer">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{post.title}</p>
                  <p className="text-[10px] text-gray-500 mt-1">by {post.author?.name || 'Farmer'} • 👍 {post.likesCount || 0}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Community FAQs */}
      <div className="glass-card p-4 sm:p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <HelpCircle size={20} className="text-emerald-600" /> Buyer & Marketplace FAQs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FAQS.map((faq, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-all">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mb-2 flex items-start gap-2">
                <span className="text-emerald-600 shrink-0">Q:</span>
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium pl-5 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
