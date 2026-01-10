// Main Layout component with sidebar and header
import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  User,
  Sprout,
  Droplets,
  DollarSign,
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
  Languages,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';

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
  const [mobileLangOpen, setMobileLangOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  ];

  const menuItems = [
    { path: '/dashboard', label: t('navigation.dashboard'), icon: LayoutDashboard },
    { path: '/crops', label: t('navigation.cropManagement'), icon: Sprout },
    { path: '/fertilizers', label: t('navigation.fertilizers'), icon: Droplets },
    { path: '/irrigation', label: t('navigation.irrigation'), icon: Droplets },
    { path: '/expenses', label: t('navigation.expenses'), icon: DollarSign },
    { path: '/yield', label: t('navigation.yieldTracking'), icon: TrendingUp },
    { path: '/reports', label: t('navigation.reports'), icon: FileText },
    { path: '/history', label: t('navigation.history'), icon: History },
    { path: '/settings', label: t('navigation.settings'), icon: Settings },
    ...(user?.role === 'admin' ? [{ path: '/admin', label: t('navigation.adminDashboard'), icon: Shield }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-primary-700 text-white p-4 flex items-center justify-between">
        <Logo size="small" />
        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="mobile" />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-primary-600 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} className="flex-shrink-0" /> : <Menu size={20} className="flex-shrink-0" />}
          </button>
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden lg:flex fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 items-center justify-end">
        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="desktop" />
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-700"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} className="flex-shrink-0" /> : <Sun size={20} className="flex-shrink-0" />}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-gray-700"
            title="Logout"
          >
            <LogOut size={20} className="flex-shrink-0" />
          </button>
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
        {/* FarmSync title when sidebar is collapsed - appears to the right */}
        {sidebarCollapsed && (
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden lg:block fixed left-16 top-6 z-50 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 rounded-r-lg"
            title={t('navigation.dashboard')}
            aria-label={t('navigation.dashboard')}
          >
            <div className="bg-primary-700 text-white px-3 py-2 rounded-r-lg shadow-lg">
              <span className="text-sm font-bold whitespace-nowrap">FarmSync</span>
            </div>
          </button>
        )}
        <div className={`p-6 border-b border-primary-700 ${sidebarCollapsed ? 'lg:px-3 lg:py-4' : ''}`}>
          <div className="flex items-center justify-between gap-3">
            <div className={`flex-1 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
              {/* Custom logo with FarmSync title */}
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-3 font-bold text-2xl hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-800 rounded-lg p-1"
                title={t('navigation.dashboard')}
                aria-label={t('navigation.dashboard')}
              >
                <div className="relative flex-shrink-0">
                  <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm">
                    <span className="text-primary-600 text-2xl">🌾</span>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">↻</span>
                    </div>
                  </div>
                </div>
                <span className="text-white tracking-tight">FarmSync</span>
              </button>
            </div>
            <div className={`hidden ${sidebarCollapsed ? 'lg:flex lg:flex-col lg:items-center lg:gap-2' : ''}`}>
              {/* Compact icon for collapsed state */}
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-800 rounded-lg p-1"
                title={t('navigation.dashboard')}
                aria-label={t('navigation.dashboard')}
              >
                <div className="relative">
                  <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm">
                    <span className="text-primary-600 text-lg">🌾</span>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">↻</span>
                    </div>
                  </div>
                </div>
              </button>
              {/* Collapse button - visible in collapsed state */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 text-primary-200 hover:bg-primary-700 hover:text-white rounded-lg transition-all duration-200"
                title="Expand Sidebar"
              >
                <Menu size={20} className="flex-shrink-0" />
              </button>
            </div>
            {/* Collapse button - visible in expanded state */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`hidden lg:flex p-2 text-primary-200 hover:bg-primary-700 hover:text-white rounded-lg transition-all duration-200 ${sidebarCollapsed ? 'lg:hidden' : ''}`}
              title="Collapse Sidebar"
            >
              <Menu size={20} className="flex-shrink-0" />
            </button>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  sidebarCollapsed ? 'lg:px-2 lg:py-3 lg:justify-center lg:gap-0' : ''
                } ${
                  isActive(item.path)
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-primary-200 hover:bg-primary-700 hover:text-white'
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

