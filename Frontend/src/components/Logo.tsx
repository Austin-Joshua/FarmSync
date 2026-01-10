// FarmSync Logo Component
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Logo = ({ 
  size = 'default',
  variant = 'dark' // 'dark' for dark backgrounds, 'light' for light backgrounds
}: { 
  size?: 'small' | 'default' | 'large';
  variant?: 'dark' | 'light';
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const sizeClasses = {
    small: 'text-lg',
    default: 'text-2xl',
    large: 'text-3xl',
  };

  const textColor = variant === 'dark' ? 'text-white' : 'text-gray-900';

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  return (
    <button
      onClick={handleLogoClick}
      className={`flex items-center gap-3 font-bold ${sizeClasses[size]} hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg p-1`}
      title={t('navigation.home')}
      aria-label={t('navigation.home')}
    >
      <div className="relative flex-shrink-0">
        {/* FarmSync logo icon - Farm with sync symbol */}
        <div className={`flex items-center justify-center w-10 h-10 ${variant === 'dark' ? 'bg-white' : 'bg-primary-100'} rounded-lg shadow-sm relative`}>
          {/* Farm/Plant icon */}
          <svg 
            className={`${variant === 'dark' ? 'text-primary-600' : 'text-primary-600'} w-7 h-7`}
            viewBox="0 0 24 24" 
            fill="currentColor" 
            xmlns="http://www.w3.org/2000/svg"
          >
          {/* Farm field layers */}
          <path d="M12 2L4 6L12 10L20 6L12 2Z" fill="currentColor" opacity="0.9"/>
          <path d="M4 6L12 10L20 6L12 2L4 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {/* Growing plant/stem */}
          <path d="M12 10V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {/* Plant leaves/branches */}
          <path d="M9 14L12 10L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M10 16L12 18L14 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          {/* Sync symbol overlay - circular arrow */}
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
            <svg className="text-white w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 3L11 1L9 -1" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 1C10 4 8 6 5 6C2 6 1 4 1 1" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 9L1 11L3 13" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 11C2 8 4 6 7 6C10 6 11 8 11 11" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
      <span className={`${textColor} tracking-tight`}>FarmSync</span>
    </button>
  );
};

export default Logo;

