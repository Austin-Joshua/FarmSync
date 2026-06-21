// FarmSync Premium Theme-Aware Image Logo Component
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Logo = ({ 
  size = 'default',
  variant, // 'dark' for dark backgrounds (white text), 'light' for light backgrounds (dark text)
  onAfterClick,
}: { 
  size?: 'small' | 'default' | 'large';
  variant?: 'dark' | 'light';
  onAfterClick?: () => void;
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  
  const heightClasses = {
    small: 'h-8 sm:h-9',
    default: 'h-10 sm:h-12',
    large: 'h-16 sm:h-20',
  };

  const handleLogoClick = () => {
    if (isAuthenticated) {
      if (window.location.pathname !== '/dashboard') {
        navigate('/dashboard');
      }
    } else {
      if (window.location.pathname === '/' || window.location.pathname === '/landing') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/');
      }
    }
    onAfterClick?.();
  };

  // Determine if the background is dark.
  // If variant is passed explicitly (e.g. 'dark' or 'light'), respect it.
  // Otherwise, default to the current active theme.
  const isDarkBg = variant ? (variant === 'dark') : (theme === 'dark');
  const logoSrc = isDarkBg ? '/logo-dark.png' : '/logo-light.png';

  return (
    <button
      onClick={handleLogoClick}
      className="flex items-center hover:opacity-90 transition-all cursor-pointer focus:outline-none p-0.5 group shrink-0"
      title={t('navigation.home')}
      aria-label={t('navigation.home')}
    >
      <img 
        src={logoSrc} 
        alt="FarmSync Logo" 
        className={`${heightClasses[size]} w-auto object-contain`}
      />
    </button>
  );
};

export default Logo;
