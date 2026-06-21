// Citizen Dashboard — Market, Weather, Community, Marketplace
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp, TrendingDown, ShoppingCart, MessageSquare, CloudRain,
  Thermometer, Wind, Sun, MapPin, Star, Package, Bell, ArrowRight,
  IndianRupee, Wheat, Leaf, Sprout, BarChart2, BookOpen, CheckCircle
} from 'lucide-react';
import WeatherCard from '../components/WeatherCard';
import LocationMap from '../components/LocationMap';
import { useTranslation } from 'react-i18next';
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

// Government schemes
const SCHEMES = [
  {
    title: 'PM-KISAN',
    description: '₹6,000/year direct income support for farmers',
    status: 'Active',
    color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    badge: 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30',
  },
  {
    title: 'Pradhan Mantri Fasal Bima',
    description: 'Crop insurance against natural calamities, pests and diseases',
    status: 'Enrollment Open',
    color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    badge: 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30',
  },
  {
    title: 'Soil Health Card',
    description: 'Free soil testing and crop-wise nutrient recommendations',
    status: 'Available',
    color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    badge: 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30',
  },
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
  const { t } = useTranslation();
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

  const addToCart = (item: MarketItem) => {
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
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-lg shadow-purple-500/20 relative"
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

      {/* Weather + Map row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-purple-600" /> Your Location & Weather
            </h2>
            <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <LocationMap
                latitude={gps.latitude}
                longitude={gps.longitude}
                locationName={user?.location || 'Chennai, Tamil Nadu'}
                height="220px"
              />
            </div>
          </div>
        </div>
        <div className="glass-card p-4 sm:p-6">
          <WeatherCard />
        </div>
      </div>

      {/* Market Prices */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart2 size={20} className="text-purple-600" /> Today's Market Prices
          </h2>
          <button onClick={() => navigate('/market')} className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:gap-2 transition-all">
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

      {/* Nearby Marketplace + Community */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Marketplace listings */}
        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart size={20} className="text-purple-600" /> Buy Fresh Produce
            </h2>
            <button onClick={() => navigate('/marketplace')} className="text-xs font-bold text-purple-600 flex items-center gap-1 hover:gap-2 transition-all">
              See All <ArrowRight size={14} />
            </button>
          </div>
          {nearbyItems.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No listings available right now</p>
              <button onClick={() => navigate('/marketplace')} className="mt-3 text-xs font-bold text-purple-600 hover:underline">Browse Marketplace</button>
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
                      className="p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all"
                    >
                      <ShoppingCart size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Community forum */}
        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={20} className="text-purple-600" /> Farmer Discussions
            </h2>
            <button onClick={() => navigate('/community')} className="text-xs font-bold text-purple-600 flex items-center gap-1 hover:gap-2 transition-all">
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
                    <span className="font-bold text-purple-600">{post.author}</span>
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

      {/* Government Schemes */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen size={20} className="text-purple-600" /> Government Schemes & Subsidies
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SCHEMES.map((scheme, i) => (
            <div key={i} className={`p-4 rounded-2xl border-2 ${scheme.color} cursor-pointer hover:shadow-md transition-all`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{scheme.title}</h3>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${scheme.badge} whitespace-nowrap`}>
                  {scheme.status}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{scheme.description}</p>
              <div className="flex items-center gap-1 mt-3 text-xs font-bold text-purple-600 dark:text-purple-400">
                <CheckCircle size={12} />
                Learn More
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
