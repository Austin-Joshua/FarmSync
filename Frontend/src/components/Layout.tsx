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

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useNotifications();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
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

  const menuItems = [
    { path: '/dashboard', label: t('navigation.dashboard'), icon: Home },
    { path: '/crops', label: t('navigation.cropManagement'), icon: Sprout },
    { path: '/fields', label: t('navigation.fields'), icon: MapPin },
    { path: '/expenses', label: t('navigation.expenses'), icon: IndianRupee },
    { path: '/ai-detect', label: 'AI Detection', icon: Zap },
    { path: '/settings', label: t('navigation.settings'), icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <Logo />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive(item.path)
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Top Bar (Mobile & Desktop) */}
      <header className="fixed top-0 left-0 right-0 lg:left-64 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-40 flex items-center justify-between px-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
          {menuItems.find(i => i.path === location.pathname)?.label || t('common.appName')}
        </h1>
        <div className="flex items-center gap-4">
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
                </div>
                <div className="py-2">
                  <button 
                    onClick={() => { setShowProfile(false); navigate('/settings'); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Account Settings
                  </button>
                  <button 
                    onClick={() => { setShowProfile(false); navigate('/dashboard'); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Dashboard Help
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
      <main className="pt-16 pb-20 lg:pb-0 lg:ml-64 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Floating style for native feel */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 z-50 rounded-[2rem] shadow-2xl flex items-center justify-around px-4">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all relative ${
                active
                  ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <item.icon size={22} className={active ? 'scale-110 transition-transform' : ''} />
              {active && (
                <span className="absolute -bottom-1 w-1 h-1 bg-primary-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Invisible spacer to prevent content from being hidden behind floating nav */}
      <div className="lg:hidden h-28 w-full" />
      <OfflineBanner />
    </div>
  );
};

export default Layout;


