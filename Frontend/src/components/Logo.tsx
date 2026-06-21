// FarmSync Premium Image Logo Component
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Logo = ({ 
  size = 'default',
  variant = 'dark', // 'dark' for dark backgrounds, 'light' for light backgrounds
  onAfterClick,
}: { 
  size?: 'small' | 'default' | 'large';
  variant?: 'dark' | 'light';
  onAfterClick?: () => void;
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  
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

  // The logo image contains the text "FARMSYNC" and the tagline, with a black background.
  // We use mix-blend-screen so the black background is transparent and blends perfectly with
  // both light headers (white/gray) and dark headers/sidebars.
  return (
    <button
      onClick={handleLogoClick}
      className="flex items-center hover:opacity-90 transition-all cursor-pointer focus:outline-none p-0.5 group shrink-0"
      title={t('navigation.home')}
      aria-label={t('navigation.home')}
    >
      <img 
        src="/logo.jpg" 
        alt="FarmSync Logo" 
        className={`${heightClasses[size]} w-auto object-contain mix-blend-screen`}
      />
    </button>
  );
};

export default Logo;
