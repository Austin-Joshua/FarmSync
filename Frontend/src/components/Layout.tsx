// Main Layout component with sidebar and header
import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
  DollarSign,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import Clock from './Clock';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileProfileMenuRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { path: '/dashboard', label: t('navigation.home'), icon: Home },
    { path: '/crops', label: t('navigation.cropManagement'), icon: Sprout },
    { path: '/fertilizers', label: t('navigation.fertilizers'), icon: Droplets },
    { path: '/irrigation', label: t('navigation.irrigation'), icon: Droplets },
    { path: '/expenses', label: t('navigation.expenses'), icon: IndianRupee },
    { path: '/yield', label: t('navigation.yieldTracking'), icon: TrendingUp },
    { path: '/calendar', label: t('navigation.calendar', 'Calendar'), icon: Calendar },
    { path: '/market-prices', label: t('navigation.marketPrices', 'Market Prices'), icon: DollarSign },
    { path: '/fields', label: t('navigation.fields', 'Fields'), icon: MapPin },
    { path: '/reports', label: t('navigation.reports'), icon: FileText },
    { path: '/history', label: t('navigation.history'), icon: History },
    { path: '/settings', label: t('navigation.settings'), icon: Settings },
    ...(user?.role === 'admin' ? [{ path: '/admin', label: t('navigation.adminDashboard'), icon: Shield }] : []),
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
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5174/api';
      const baseUrl = apiBaseUrl.replace('/api', '');
      return `${baseUrl}${user.picture_url}`;
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
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-primary-700 text-white p-4 flex items-center justify-between">
        <Logo size="small" />
        <div className="flex items-center gap-2">
          <Clock />
          <LanguageSwitcher variant="mobile" />
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
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-primary-600 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} className="flex-shrink-0" /> : <Menu size={20} className="flex-shrink-0" />}
          </button>
        </div>
      </div>

      {/* Desktop header */}
      <div className={`hidden lg:flex fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 items-center justify-between transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-[5rem] lg:pr-6' : 'lg:pl-[17rem] lg:pr-6'
      }`}>
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
          <Clock />
          <LanguageSwitcher variant="desktop" />
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

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-primary-800 text-white transform transition-all duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
        } lg:translate-x-0 ${
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
        }`}
      >
        <div className={`border-b border-primary-700 ${sidebarCollapsed ? 'lg:p-2 lg:py-3' : 'p-6'}`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'lg:flex-col lg:gap-2 lg:justify-center' : 'justify-between gap-3'}`}>
            {!sidebarCollapsed ? (
              <>
                {/* Expanded state - Full logo with title */}
                <div className="flex-1">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-3 font-bold text-2xl hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-800 rounded-lg p-1"
                    title={t('navigation.home')}
                    aria-label={t('navigation.home')}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm relative">
                        {/* Professional Farm icon with sync symbol */}
                        <svg 
                          className="text-primary-600 w-7 h-7"
                          viewBox="0 0 24 24" 
                          fill="currentColor" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {/* Farm/Field layers */}
                          <path d="M12 2L4 6L12 10L20 6L12 2Z" fill="currentColor" opacity="0.9"/>
                          <path d="M4 6L12 10L20 6L12 2L4 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          {/* Growing plant */}
                          <path d="M12 10V18M9 14L12 10L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          <path d="M10 16L12 18L14 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
                        {/* Sync symbol overlay */}
                        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
                          <svg className="text-white w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 3L11 1L9 -1"/>
                            <path d="M11 1C10 4 8 6 5 6C2 6 1 4 1 1"/>
                            <path d="M3 9L1 11L3 13"/>
                            <path d="M1 11C2 8 4 6 7 6C10 6 11 8 11 11"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <span className="text-white tracking-tight">FarmSync</span>
                  </button>
                </div>
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:flex p-2 text-primary-200 hover:bg-primary-700 hover:text-white rounded-lg transition-all duration-200"
                  title="Collapse Sidebar"
                >
                  <Menu size={20} className="flex-shrink-0" />
                </button>
              </>
            ) : (
              <>
                {/* Collapsed state - Only icon, no popout title */}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-800 rounded-lg p-1"
                  title={t('navigation.home')}
                  aria-label={t('navigation.home')}
                >
                  <div className="relative">
                    <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm relative">
                      {/* Professional Farm icon with sync symbol - smaller version */}
                      <svg 
                        className="text-primary-600 w-5 h-5"
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 2L4 6L12 10L20 6L12 2Z" fill="currentColor" opacity="0.9"/>
                        <path d="M4 6L12 10L20 6L12 2L4 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        <path d="M12 10V18M9 14L12 10L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        <path d="M10 16L12 18L14 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                      {/* Sync symbol overlay - smaller */}
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
                        <svg className="text-white w-1.5 h-1.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 3L11 1L9 -1"/>
                          <path d="M11 1C10 4 8 6 5 6C2 6 1 4 1 1"/>
                          <path d="M3 9L1 11L3 13"/>
                          <path d="M1 11C2 8 4 6 7 6C10 6 11 8 11 11"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 text-primary-200 hover:bg-primary-700 hover:text-white rounded-lg transition-all duration-200 mt-2"
                  title="Expand Sidebar"
                >
                  <Menu size={20} className="flex-shrink-0" />
                </button>
              </>
            )}
          </div>
        </div>

        <nav className={`p-4 space-y-2 overflow-y-auto h-[calc(100vh-180px)] ${sidebarCollapsed ? 'lg:px-2 lg:space-y-2' : ''}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 ease-in-out hover:scale-[1.02] active:scale-[0.98] ${
                  sidebarCollapsed ? 'lg:px-2 lg:py-3 lg:justify-center lg:gap-0' : ''
                } ${
                  isActive(item.path)
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-primary-200 hover:bg-primary-700 hover:text-white hover:shadow-md'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className={`font-medium whitespace-nowrap ${sidebarCollapsed ? 'lg:hidden' : ''} ${sidebarCollapsed ? '' : 'text-base'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className={`pt-16 lg:pt-20 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <div className="p-4 lg:p-8">{children}</div>
      </main>

    </div>
  );
};

export default Layout;

