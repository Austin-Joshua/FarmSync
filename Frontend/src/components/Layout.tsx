// Main Layout - Role-aware, fully responsive (mobile/tablet/desktop)
import { ReactNode, useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Sprout, LogOut, Settings, Moon, Sun, Bell, MapPin,
  IndianRupee, Zap, BarChart2, ShoppingCart, Droplets,
  FlaskConical, CalendarDays, TrendingUp, FileText, ChevronDown,
  ChevronUp, Leaf, MessageSquare, ShieldCheck, Landmark, Bug,
  Wifi, Users, Menu, X, Activity, Shield, Store, Package
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import OfflineBanner from './OfflineBanner';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps { children: ReactNode; }

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useNotifications();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Overview', 'Farm Management', 'Discover']);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const role = user?.role || 'farmer';

  // Role-based nav groups
  const navGroups = (() => {
    const adminGroups = [
      { label: 'Overview', items: [
        { path: '/dashboard', label: 'Command Center', translationKey: 'commandCenter', icon: Activity },
        { path: '/admin', label: 'Analytics Hub', translationKey: 'analyticsHub', icon: BarChart2 },
      ]},
      { label: 'Administration', items: [
        { path: '/admin', label: 'District Analytics', translationKey: 'districtAnalytics', icon: Shield },
        { path: '/marketplace', label: 'Marketplace Moderation', translationKey: 'marketplaceModeration', icon: Store },
        { path: '/community', label: 'Community Moderation', translationKey: 'communityModeration', icon: MessageSquare },
      ]},
      { label: 'Farm Data', items: [
        { path: '/crops', label: 'Crop Management', translationKey: 'cropManagement', icon: Sprout },
        { path: '/reports', label: 'System Reports', translationKey: 'systemReports', icon: FileText },
      ]},
      { label: 'System', items: [
        { path: '/settings', label: 'Settings', translationKey: 'settings', icon: Settings },
      ]},
    ];

    const farmerGroups = [
      { label: 'Overview', items: [
        { path: '/dashboard', label: 'Dashboard', translationKey: 'dashboard', icon: Home },
      ]},
      { label: 'Farm Management', items: [
        { path: '/crops', label: 'Crop Management', translationKey: 'cropManagement', icon: Sprout },
        { path: '/fields', label: 'Fields', translationKey: 'fields', icon: MapPin },
        { path: '/yield', label: 'Yield Tracking', translationKey: 'yieldTracking', icon: TrendingUp },
        { path: '/calendar', label: 'Crop Calendar', translationKey: 'calendar', icon: CalendarDays },
        { path: '/iot-dashboard', label: 'IoT Sensors', translationKey: 'iotSensors', icon: Wifi, badge: 'LIVE' },
      ]},
      { label: 'Marketplace', items: [
        { path: '/marketplace', label: 'Community Market', translationKey: 'communityMarket', icon: ShoppingCart, badge: 'NEW' },
        { path: '/market', label: 'Market Prices', translationKey: 'marketPrices', icon: BarChart2 },
      ]},
      { label: 'AI Tools', items: [
        { path: '/crop-recommend', label: 'AI Crop Advisor', translationKey: 'aiCropAdvisor', icon: Leaf, badge: 'AI' },
        { path: '/ai-detect', label: 'Disease Detection', translationKey: 'diseaseDetection', icon: Zap },
        { path: '/pest-predict', label: 'Pest Prediction', translationKey: 'pestPrediction', icon: Bug },
      ]},
      { label: 'Resources', items: [
        { path: '/irrigation', label: 'Irrigation', translationKey: 'irrigation', icon: Droplets },
        { path: '/fertilizer', label: 'Fertilizer & Pest', translationKey: 'fertilizerPest', icon: FlaskConical },
        { path: '/stock', label: 'Stock & Inventory', translationKey: 'stockInventory', icon: Package },
      ]},
      { label: 'Community', items: [
        { path: '/community', label: 'Farmer Forum', translationKey: 'farmerForum', icon: MessageSquare, badge: 'NEW' },
        { path: '/compliance', label: 'Certifications', translationKey: 'compliance', icon: ShieldCheck },
      ]},
      { label: 'Finance', items: [
        { path: '/finance', label: 'Projections & Loans', translationKey: 'finance', icon: Landmark, badge: 'AI' },
        { path: '/expenses', label: 'Expenses', translationKey: 'expenses', icon: IndianRupee },
        { path: '/reports', label: 'Reports', translationKey: 'reports', icon: FileText },
      ]},
      { label: 'System', items: [
        { path: '/settings', label: 'Settings', translationKey: 'settings', icon: Settings },
      ]},
    ];

    const citizenGroups = [
      { label: 'Discover', items: [
        { path: '/dashboard', label: 'My Dashboard', translationKey: 'myDashboard', icon: Home },
        { path: '/market', label: 'Market Prices', translationKey: 'marketPrices', icon: BarChart2 },
      ]},
      { label: 'Marketplace', items: [
        { path: '/marketplace', label: 'Buy Produce', translationKey: 'buyProduce', icon: ShoppingCart, badge: 'NEW' },
        { path: '/history', label: 'My Orders', translationKey: 'myOrders', icon: FileText },
      ]},
      { label: 'Community', items: [
        { path: '/community', label: 'Farmer Forum', translationKey: 'farmerForum', icon: MessageSquare },
        { path: '/compliance', label: 'Schemes & Subsidies', translationKey: 'schemesSubsidies', icon: ShieldCheck },
      ]},
      { label: 'System', items: [
        { path: '/settings', label: 'Settings', translationKey: 'settings', icon: Settings },
      ]},
    ];

    if (role === 'admin') return adminGroups;
    if (role === 'citizen') return citizenGroups;
    return farmerGroups;
  })();

  const mobileItems = (() => {
    if (role === 'admin') return [
      { path: '/dashboard', label: 'Home', translationKey: 'home', icon: Home },
      { path: '/admin', label: 'Analytics', translationKey: 'analytics', icon: Activity },
      { path: '/marketplace', label: 'Moderate', translationKey: 'moderate', icon: Store },
      { path: '/settings', label: 'Settings', translationKey: 'settings', icon: Settings },
    ];
    if (role === 'citizen') return [
      { path: '/dashboard', label: 'Home', translationKey: 'home', icon: Home },
      { path: '/market', label: 'Prices', translationKey: 'prices', icon: BarChart2 },
      { path: '/marketplace', label: 'Buy', translationKey: 'buy', icon: ShoppingCart },
      { path: '/community', label: 'Forum', translationKey: 'forum', icon: MessageSquare },
    ];
    return [
      { path: '/dashboard', label: 'Home', translationKey: 'home', icon: Home },
      { path: '/crops', label: 'Crops', translationKey: 'crops', icon: Sprout },
      { path: '/marketplace', label: 'Market', translationKey: 'market', icon: ShoppingCart },
      { path: '/settings', label: 'Settings', translationKey: 'settings', icon: Settings },
    ];
  })();

  const isActive = (path: string) => location.pathname === path;
  const toggleGroup = (label: string) => setExpandedGroups(prev =>
    prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
  );

  const roleColor = role === 'admin' ? 'from-blue-500 to-blue-700'
    : role === 'citizen' ? 'from-purple-500 to-violet-700'
    : 'from-primary-500 to-emerald-600';

  const RoleIcon = role === 'admin' ? Shield : role === 'citizen' ? Users : Sprout;

  const NavContent = ({ compact = false }: { compact?: boolean }) => (
    <nav className="flex-1 p-2 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
      {navGroups.filter(g => g.items.length > 0).map((group) => {
        const isExpanded = expandedGroups.includes(group.label);
        const hasActive = group.items.some(item => isActive(item.path));
        return (
          <div key={group.label}>
            {!compact && (
              <button
                onClick={() => toggleGroup(group.label)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors ${
                  hasActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
                }`}
              >
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {t('navigation.group.' + group.label.replace(/\s+/g, ''), { defaultValue: group.label })}
                </span>
                {isExpanded ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
              </button>
            )}
            {(isExpanded || compact) && (
              <div className="space-y-0.5 mt-0.5">
                {group.items.map((item) => {
                  const translatedLabel = t('navigation.' + item.translationKey, { defaultValue: item.label });
                  return (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); setMobileOpen(false); }}
                      title={compact ? translatedLabel : undefined}
                      className={`w-full flex items-center gap-3 ${compact ? 'justify-center px-2 py-3' : 'px-3 py-2.5'} rounded-xl transition-all text-left ${
                        isActive(item.path)
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <item.icon size={compact ? 20 : 17} className="flex-shrink-0" />
                      {!compact && (
                        <>
                          <span className="font-medium text-sm flex-1">{translatedLabel}</span>
                          {(item as any).badge && (
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                              isActive(item.path) ? 'bg-white/20 text-white' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            }`}>{(item as any).badge}</span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">

      {/* === MOBILE DRAWER OVERLAY === */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* === MOBILE DRAWER === */}
      <aside className={`fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-[70] flex flex-col transition-transform duration-300 lg:hidden ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
          <Logo />
          <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>
        {user && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className={`flex items-center gap-3 bg-gradient-to-r ${roleColor} rounded-2xl px-3 py-2.5 shadow-lg`}>
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <div className="flex items-center gap-1.5">
                  <RoleIcon size={10} className="text-white/70" />
                  <p className="text-[10px] text-white/70 capitalize">{role}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <NavContent />
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button onClick={() => logout()} className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
            <LogOut size={18} /><span className="font-medium text-sm">{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* === TABLET SIDEBAR (md–lg): collapsible mini sidebar === */}
      <aside
        className={`hidden md:flex lg:hidden fixed left-0 top-0 h-full flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 overflow-hidden ${
          sidebarExpanded ? 'w-56' : 'w-16'
        }`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 flex items-center gap-2 min-h-[60px]">
          {sidebarExpanded ? <Logo /> : (
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColor} flex items-center justify-center shadow-md mx-auto`}>
              <RoleIcon size={16} className="text-white" />
            </div>
          )}
        </div>
        {sidebarExpanded ? <NavContent /> : <NavContent compact />}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button onClick={() => logout()} className={`w-full flex items-center gap-2 px-2 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all ${!sidebarExpanded ? 'justify-center' : ''}`}>
            <LogOut size={17} />
            {sidebarExpanded && <span className="font-medium text-sm">{t('logout')}</span>}
          </button>
        </div>
      </aside>

      {/* === DESKTOP SIDEBAR (lg+) === */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-60 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Logo />
          {user && (
            <div className={`mt-3 flex items-center gap-2 bg-gradient-to-r ${roleColor} rounded-xl px-3 py-2 shadow-sm`}>
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-[11px] font-bold text-white truncate">{user.name}</p>
                <div className="flex items-center gap-1">
                  <RoleIcon size={9} className="text-white/70" />
                  <p className="text-[9px] text-white/70 capitalize">{role}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <NavContent />
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button onClick={() => logout()} className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
            <LogOut size={17} />
            <span className="font-medium text-sm">{t('logout')}</span>
          </button>
          <div className="mt-2 px-3 text-[9px] text-gray-400 text-center">
            {t('navigation.mlEngine', 'ML Engine')}: <span className="text-green-500 font-bold">99.5% {t('navigation.accuracy', 'accuracy')}</span>
          </div>
        </div>
      </aside>

      {/* === TOP HEADER === */}
      <header className={`fixed top-0 right-0 h-14 md:h-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-40 flex items-center justify-between px-4 sm:px-6 transition-all left-0 md:left-16 lg:left-60`}>
        {/* Mobile hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all"
          >
            <Menu size={20} />
          </button>
          <h1 
            onClick={() => navigate('/dashboard')}
            className="hidden md:block text-base sm:text-lg font-bold text-gray-900 dark:text-white capitalize truncate cursor-pointer hover:opacity-80 transition-all select-none"
            title={t('navigation.home') || 'Go to Dashboard'}
          >
            FarmSync
          </h1>
          <div className="md:hidden flex items-center">
            <Logo size="small" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all" title={t('settings.theme')}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              aria-label="View notifications"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all relative"
            >
              <Bell size={18} className="text-gray-600 dark:text-white" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white dark:border-gray-800">
                  {notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-3 px-4 z-50">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">{t('navigation.notifications', 'Notifications')}</h3>
                {notifications.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notifications.map((notif: any) => (
                      <div key={notif.id} className="text-sm border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-xs">{notif.title}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">{t('navigation.noNewNotifications', 'No new notifications')}</p>
                )}
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr ${roleColor} flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-all text-sm`}
            >
              {user?.name?.charAt(0) || 'U'}
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || ''}</p>
                  <span className={`text-[9px] bg-gradient-to-r ${roleColor} text-white px-2 py-0.5 rounded-full font-bold mt-1 inline-block uppercase`}>
                    {user?.role || 'FARMER'}
                  </span>
                </div>
                <div className="py-1">
                  <button onClick={() => { setShowProfile(false); navigate('/profile'); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300">{t('navigation.myProfile', 'My Profile')}</button>
                  <button onClick={() => { setShowProfile(false); navigate('/settings'); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300">{t('navigation.accountSettings', 'Account Settings')}</button>
                  {role !== 'citizen' && (
                    <button onClick={() => { setShowProfile(false); navigate('/crop-recommend'); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Leaf size={12} className="text-green-500" /> {t('navigation.aiCropAdvisor', 'AI Crop Advisor')}
                    </button>
                  )}
                </div>
                <div className="py-1 border-t border-gray-100 dark:border-gray-700">
                  <button onClick={() => { setShowProfile(false); logout(); }} className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 text-xs font-bold text-red-600">{t('navigation.signOut', 'Sign out')}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* === MAIN CONTENT === */}
      <main className="pt-14 md:pt-16 pb-24 md:pb-6 md:ml-16 lg:ml-60 min-h-screen transition-all">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* === MOBILE BOTTOM NAV === */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 h-16 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 z-50 rounded-[2rem] shadow-2xl flex items-center justify-around px-3">
        {mobileItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-12 rounded-2xl transition-all relative ${
                active ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <item.icon size={active ? 22 : 20} className={active ? 'scale-110' : ''} />
              <span className="text-[9px] font-bold">{t('navigation.' + item.translationKey, { defaultValue: item.label })}</span>
              {active && <span className="absolute -bottom-1 w-1 h-1 bg-primary-600 rounded-full" />}
            </button>
          );
        })}
      </div>

      <OfflineBanner />
    </div>
  );
};

export default Layout;
