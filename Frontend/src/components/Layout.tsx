// Main Layout component with sidebar and header
import { ReactNode } from 'react';
import { BACKEND_ORIGIN } from '../config/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Sprout,
  Droplets,
  IndianRupee,
  TrendingUp,
  FileText,
  LogOut,
  Menu,
  X,
  Settings,
  History,
  Shield,
  Moon,
  Sun,
  Bell,
  MapPin,
  Calendar,
  Info,
  Search,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuthStore } from '../context/useAuthStore';
import { useThemeStore } from '../context/useThemeStore';

interface LayoutProps {
  children: ReactNode;
}

const LG_BREAKPOINT = 1024;

const Layout = ({ children }: LayoutProps) => {
  const { user, clearAuth: logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= LG_BREAKPOINT : false
  );
  const [sidebarCollapsed] = useState(false);

  // RIT-style: desktop = sidebar open, mobile = sidebar closed; sync on resize
  useEffect(() => {
    const onResize = () => {
      const isDesktop = window.innerWidth >= LG_BREAKPOINT;
      setSidebarOpen(isDesktop);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileProfileMenuRef = useRef<HTMLDivElement>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');

  const isAdmin = user?.role === 'admin';

  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await api.getUnreadAlerts();
      if (response.data && Array.isArray(response.data)) {
        setNotifications(response.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const menuItems = [
    // Admin: only Admin Dashboard + admin views (no separate Home/Calendar entry)
    ...(isAdmin ? [{ path: '/admin', label: t('navigation.adminDashboard'), icon: Shield }] : []),
    // Non-admin: Home entry
    ...(!isAdmin ? [{ path: '/dashboard', label: t('navigation.home'), icon: Home }] : []),
    { path: '/crops', label: t('navigation.cropManagement'), icon: Sprout },
    { path: '/fertilizers', label: t('navigation.fertilizers'), icon: Droplets },
    { path: '/irrigation', label: t('navigation.irrigation'), icon: Droplets },
    { path: '/expenses', label: t('navigation.expenses'), icon: IndianRupee },
    { path: '/yield', label: t('navigation.yieldTracking'), icon: TrendingUp },
    // Calendar visible only for non-admin users
    ...(!isAdmin ? [{ path: '/calendar', label: 'Calendar', icon: Calendar }] : []),
    { path: '/market-prices', label: t('navigation.marketPrices', 'Market Prices'), icon: IndianRupee },
    { path: '/fields', label: t('navigation.fields', 'Fields'), icon: MapPin },
    { path: '/reports', label: t('navigation.reports'), icon: FileText },
    { path: '/history', label: t('navigation.history'), icon: History },
    { path: '/about', label: t('navigation.aboutUs', 'About Us'), icon: Info },
    { path: '/settings', label: t('navigation.settings'), icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileMenuOpen(false);
  };

  const handleMyAccount = () => {
    navigate('/settings');
    setProfileMenuOpen(false);
  };

  // Get profile picture URL
  const getProfilePictureUrl = (): string | null => {
    if (user?.picture_url) {
      // If picture_url is already a full URL, return it; otherwise construct it
      if (user.picture_url.startsWith('http')) {
        return user.picture_url;
      }
      return `${BACKEND_ORIGIN}${user.picture_url}`;
    }
    return null;
  };

  const profilePictureUrl = getProfilePictureUrl();

  const isActive = (path: string) => location.pathname === path;

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isDesktopMenuOpen = profileMenuRef.current && profileMenuRef.current.contains(target);
      const isMobileMenuOpen = mobileProfileMenuRef.current && mobileProfileMenuRef.current.contains(target);
      
      if (!isDesktopMenuOpen && !isMobileMenuOpen && profileMenuOpen) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Mobile header: not shown when sidebar is open (RIT-style — no top bar/logo when sidebar maximised) */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-[60] bg-primary-700 text-white px-3 py-2 flex items-center justify-between ${sidebarOpen ? '!hidden' : ''}`}>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-primary-600 rounded-lg transition-colors"
            aria-label={sidebarOpen ? t('navigation.closeMenu', 'Close menu') : t('navigation.openMenu', 'Open menu')}
          >
            {sidebarOpen ? <X size={20} className="flex-shrink-0" /> : <Menu size={20} className="flex-shrink-0" />}
          </button>
          <Logo size="small" />
        </div>
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher variant="mobile" />

          {/* Notifications icon - mobile */}
          <button
            type="button"
            className="relative p-1.5 rounded-lg hover:bg-primary-600 transition-colors"
            title={t('navigation.notifications', 'Notifications')}
            onClick={() => {
              const next = !notificationsOpen;
              setNotificationsOpen(next);
              if (next) {
                void loadNotifications();
              }
            }}
          >
            <Bell size={18} className="flex-shrink-0" />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1 py-0.5 text-[9px] font-semibold leading-none text-white bg-red-500 rounded-full">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>

          {/* Theme toggle - mobile */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-primary-600 transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={18} className="flex-shrink-0" /> : <Sun size={18} className="flex-shrink-0" />}
          </button>
          {/* Profile Menu for Mobile */}
          <div className="relative" ref={mobileProfileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="p-1 hover:bg-primary-600 rounded-full transition-colors"
              title={user?.name || t('navigation.profile')}
            >
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt={user?.name || 'Profile'}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || (user?.email?.charAt(0).toUpperCase() || 'U')}
                </div>
              )}
            </button>
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || t('common.user')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleMyAccount}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                >
                  <Settings size={16} className="flex-shrink-0" />
                  {t('common.myAccount')}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} className="flex-shrink-0" />
                  {t('auth.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile notifications dropdown */}
      {notificationsOpen && (
        <div className="lg:hidden fixed top-14 left-0 right-0 z-40 px-3 mt-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
            <div className="px-4 pb-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {t('navigation.notifications', 'Notifications')}
              </span>
              <button
                type="button"
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
                disabled={notificationsLoading || notifications.length === 0}
                onClick={async () => {
                  try {
                    await api.markAllAlertsAsRead();
                    setNotifications([]);
                  } catch (err) {
                    console.error('Failed to mark all notifications as read:', err);
                  }
                }}
              >
                {t('common.markAllRead', 'Mark all read')}
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notificationsLoading && (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {t('common.loading', 'Loading notifications...')}
                </div>
              )}
              {!notificationsLoading && notifications.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {t('common.noNotifications', 'No new notifications')}
                </div>
              )}
              {!notificationsLoading &&
                notifications.map((alert: any) => (
                  <button
                    key={alert.id}
                    type="button"
                    onClick={async () => {
                      try {
                        await api.markAlertAsRead(alert.id);
                        setNotifications((prev) => prev.filter((a) => a.id !== alert.id));
                      } catch (err) {
                        console.error('Failed to mark notification as read:', err);
                      }
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {alert.title || 'Alert'}
                    </p>
                    {alert.message && (
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
                        {alert.message}
                      </p>
                    )}
                    {alert.created_at && (
                      <p className="mt-1 text-[11px] text-gray-400">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    )}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop header (main bar: lives in main area right of sidebar, RIT-style) */}
      <div className="hidden lg:flex fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 items-center justify-between transition-all duration-300 lg:pl-[246px] lg:pr-6">
        {/* FarmSync Title on the left */}
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              FarmSync
            </h1>
          </button>
        </div>
        
        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="desktop" />
          {/* Notifications icon (always visible) */}
          <button
            type="button"
            className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-700"
            title={t('navigation.notifications', 'Notifications')}
            onClick={() => {
              const next = !notificationsOpen;
              setNotificationsOpen(next);
              if (next) {
                void loadNotifications();
              }
            }}
          >
            <Bell size={20} className="flex-shrink-0" />
            {/* Badge with unread count */}
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white bg-red-500 rounded-full">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>
          {/* Notifications dropdown panel */}
          {notificationsOpen && (
            <div className="absolute right-32 top-16 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-40">
              <div className="px-4 pb-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {t('navigation.notifications', 'Notifications')}
                </span>
                <button
                  type="button"
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
                  disabled={notificationsLoading || notifications.length === 0}
                  onClick={async () => {
                    try {
                      await api.markAllAlertsAsRead();
                      setNotifications([]);
                    } catch (err) {
                      console.error('Failed to mark all notifications as read:', err);
                    }
                  }}
                >
                  {t('common.markAllRead', 'Mark all read')}
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notificationsLoading && (
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {t('common.loading', 'Loading notifications...')}
                  </div>
                )}
                {!notificationsLoading && notifications.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {t('common.noNotifications', 'No new notifications')}
                  </div>
                )}
                {!notificationsLoading &&
                  notifications.map((alert: any) => (
                    <button
                      key={alert.id}
                      type="button"
                      onClick={async () => {
                        try {
                          await api.markAlertAsRead(alert.id);
                          // Remove from local list so it appears as read
                          setNotifications((prev) => prev.filter((a) => a.id !== alert.id));
                        } catch (err) {
                          console.error('Failed to mark notification as read:', err);
                        }
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {alert.title || 'Alert'}
                      </p>
                      {alert.message && (
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
                          {alert.message}
                        </p>
                      )}
                      {alert.created_at && (
                        <p className="mt-1 text-[11px] text-gray-400">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-700"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} className="flex-shrink-0" /> : <Sun size={20} className="flex-shrink-0" />}
          </button>
          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="p-1 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-700"
              title={user?.name || t('navigation.profile')}
            >
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt={user?.name || 'Profile'}
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || (user?.email?.charAt(0).toUpperCase() || 'U')}
                </div>
              )}
            </button>
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || t('common.user')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleMyAccount}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                >
                  <Settings size={16} className="flex-shrink-0" />
                  {t('common.myAccount')}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} className="flex-shrink-0" />
                  {t('auth.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar: RIT-style structure, FarmSync green/gold palette */}
      <aside
        className={`fixed top-0 left-0 h-full flex flex-col w-[280px] lg:w-[230px] transition-transform duration-300 ease-out z-50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:z-40 bg-primary-800 text-white overflow-y-auto`}
      >
        {/* White header block — FarmSync logo and name */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 min-h-[80px] flex items-center justify-between px-3 py-2.5">
          <Logo size="small" variant="light" onAfterClick={() => setSidebarOpen(false)} />
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 shrink-0"
            aria-label={t('navigation.closeMenu', 'Close menu')}
          >
            <X size={22} className="flex-shrink-0" />
          </button>
        </div>

        {/* Search bar (RIT-style) */}
        <div className="flex-shrink-0 px-2.5 py-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="search"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              placeholder="Search FarmSync..."
              className="w-full pl-9 pr-3 py-2 rounded bg-white/10 border border-transparent text-white placeholder-slate-400 text-[13px] focus:bg-white/15 focus:border-amber-400/50 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Nav — RIT-style: border-left gold for active, darker green hover/active */}
        <nav className="flex-1 overflow-y-auto py-1">
          {(() => {
            const filtered = sidebarSearch.trim()
              ? menuItems.filter((item) => item.label.toLowerCase().includes(sidebarSearch.toLowerCase()))
              : menuItems;
            if (filtered.length === 0) {
              return (
                <div className="px-4 py-6 text-center text-slate-400 text-sm">
                  No matches for &quot;{sidebarSearch}&quot;
                </div>
              );
            }
            return filtered.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 py-3.5 px-4 text-left text-sm border-l-[3px] transition-all duration-200 ${
                    active
                      ? 'bg-primary-700 text-white border-l-[#D4AF37]'
                      : 'border-l-transparent text-primary-100 hover:bg-primary-700 hover:text-white'
                  }`}
                  title={item.label}
                >
                  <Icon size={20} className="flex-shrink-0 opacity-90" strokeWidth={1.8} />
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                </button>
              );
            });
          })()}
        </nav>
      </aside>

      {/* Mobile backdrop: full screen when sidebar open; tap to close (RIT-style) */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Main content: behind sidebar on mobile; desktop margin matches RIT sidebar 230px. Full-width at sm+; packed center column only on mobile. */}
      <main className="relative z-0 pt-16 lg:pt-20 lg:ml-[230px] transition-all duration-300">
        <div className="w-full px-3 pt-4 pb-24 sm:px-4 sm:max-w-none max-w-md mx-auto sm:mx-0 lg:px-6 xl:px-8 2xl:px-10 space-y-3 sm:space-y-4 lg:space-y-6">
          {children}
        </div>
      </main>

    </div>
  );
};

export default Layout;

