// Main Layout component with sidebar and header
import { ReactNode, useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Sprout,
  LogOut,
  Settings,
  Moon,
  Sun,
  Bell,
  MapPin,
  IndianRupee,
  Zap,
  BarChart2,
  ShoppingCart,
  Droplets,
  FlaskConical,
  CalendarDays,
  TrendingUp,
  FileText,
  Users,
  ChevronDown,
  ChevronUp,
  Leaf,
  MessageSquare,
  ShieldCheck,
  Landmark,
  Bug,
  Wifi,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import OfflineBanner from './OfflineBanner';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: ReactNode;
}

export interface MenuItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  children?: MenuItem[];
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useNotifications();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['AI Tools']);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation groups
  const navGroups = [
    {
      label: 'Overview',
      items: [
        { path: '/dashboard', label: t('navigation.dashboard'), icon: Home },
      ],
    },
    {
      label: 'Farm Management',
      items: [
        { path: '/crops', label: t('navigation.cropManagement'), icon: Sprout },
        { path: '/fields', label: t('navigation.fields'), icon: MapPin },
        { path: '/yield', label: 'Yield Tracking', icon: TrendingUp },
        { path: '/calendar', label: 'Crop Calendar', icon: CalendarDays },
        { path: '/iot-dashboard', label: 'IoT Sensors', icon: Wifi, badge: 'LIVE' },
      ],
    },
    {
      label: 'AI Tools',
      items: [
        { path: '/crop-recommend', label: 'AI Crop Advisor', icon: Leaf, badge: 'NEW' },
        { path: '/ai-detect', label: 'Disease Detection', icon: Zap },
        { path: '/pest-predict', label: 'Pest Prediction', icon: Bug },
      ],
    },
    {
      label: 'Resources',
      items: [
        { path: '/irrigation', label: 'Irrigation', icon: Droplets },
        { path: '/fertilizer', label: 'Fertilizer & Pest', icon: FlaskConical },
        { path: '/market', label: 'Market Prices', icon: ShoppingCart },
      ],
    },
    {
      label: 'Community & Compliance',
      items: [
        { path: '/community', label: 'Farmer Forum', icon: MessageSquare, badge: 'NEW' },
        { path: '/compliance', label: 'Certifications', icon: ShieldCheck },
      ],
    },
    {
      label: 'Finance',
      items: [
        { path: '/finance', label: 'Projections & Loans', icon: Landmark, badge: 'AI' },
        { path: '/expenses', label: t('navigation.expenses'), icon: IndianRupee },
        { path: '/market', label: t('navigation.market'), icon: BarChart2 },
        { path: '/reports', label: 'Reports', icon: FileText },
      ],
    },
    {
      label: 'System',
      items: [
        ...(user?.role?.toLowerCase() === 'admin' ? [{ path: '/admin', label: 'Admin Panel', icon: Users }] : []),
        { path: '/settings', label: t('navigation.settings'), icon: Settings },
      ],
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev =>
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  };

  // All flat items for mobile bottom nav (most important ones)
  const mobileItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/crops', label: 'Crops', icon: Sprout },
    { path: '/crop-recommend', label: 'AI', icon: Leaf },
    { path: '/market', label: 'Market', icon: ShoppingCart },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Logo />
          {user && (
            <div className="mt-3 flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl px-3 py-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-emerald-400 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{user.role}</p>
              </div>
            </div>
          )}
        </div>
        <nav className="flex-1 p-3 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
          {navGroups.filter(g => g.items.length > 0).map((group) => {
            const isExpanded = expandedGroups.includes(group.label);
            const hasActive = group.items.some(item => isActive(item.path));
            return (
              <div key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors ${
                    hasActive ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">{group.label}</span>
                  {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                </button>
                {isExpanded && (
                  <div className="space-y-0.5 mt-0.5">
                    {group.items.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                          isActive(item.path)
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <item.icon size={18} className="flex-shrink-0" />
                        <span className="font-medium text-sm flex-1">{item.label}</span>
                        {(item as any).badge && (
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive(item.path) ? 'bg-white/20 text-white' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                            {(item as any).badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">{t('logout')}</span>
          </button>
          <div className="mt-2 px-3">
            <div className="text-[10px] text-gray-400 text-center">
              ML Engine: <span className="text-green-500 font-bold">99.5% accuracy</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Top Bar (Mobile & Desktop) */}
      <header className="fixed top-0 left-0 right-0 lg:left-64 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-40 flex items-center justify-between px-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
          {(() => {
            for (const group of navGroups) {
              const found = group.items.find(i => i.path === location.pathname);
              if (found) return found.label;
            }
            return t('common.appName');
          })()}
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
            title={t('settings.theme')}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <LanguageSwitcher />
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all relative"
            >
              <Bell size={20} className="text-gray-600 dark:text-white" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-gray-800">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-3 px-4 z-50 animate-fade-in-up">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Notifications</h3>
                {notifications.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notifications.map((notif: any) => (
                      <div key={notif.id} className="text-sm border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{notif.title}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No new notifications</p>
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-all focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              {user?.name?.charAt(0) || 'U'}
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-fade-in-up">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="font-bold text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email || ''}</p>
                  <span className="text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">
                    {user?.role || 'FARMER'}
                  </span>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => { setShowProfile(false); navigate('/profile'); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => { setShowProfile(false); navigate('/settings'); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Account Settings
                  </button>
                  <button
                    onClick={() => { setShowProfile(false); navigate('/crop-recommend'); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                  >
                    <Leaf size={14} className="text-green-500" /> AI Crop Advisor
                  </button>
                </div>
                <div className="py-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => { setShowProfile(false); logout(); }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 text-sm font-bold text-red-600"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-24 lg:pb-6 lg:ml-64 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 h-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 z-50 rounded-[2rem] shadow-2xl flex items-center justify-around px-4">
        {mobileItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 w-12 h-12 rounded-2xl transition-all relative ${
                active
                  ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <item.icon size={active ? 22 : 20} className={active ? 'scale-110 transition-transform' : ''} />
              <span className="text-[9px] font-medium">{item.label}</span>
              {active && (
                <span className="absolute -bottom-1 w-1 h-1 bg-primary-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <OfflineBanner />
    </div>
  );
};

export default Layout;
