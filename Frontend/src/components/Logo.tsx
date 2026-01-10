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
      title={t('navigation.dashboard')}
      aria-label={t('navigation.dashboard')}
    >
      <div className="relative flex-shrink-0">
        {/* Farm icon with sync symbol */}
        <div className={`flex items-center justify-center w-10 h-10 ${variant === 'dark' ? 'bg-white' : 'bg-primary-100'} rounded-lg shadow-sm`}>
          <span className={`${variant === 'dark' ? 'text-primary-600' : 'text-primary-600'} text-2xl`}>🌾</span>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">↻</span>
          </div>
        </div>
      </div>
      <span className={`${textColor} tracking-tight`}>FarmSync</span>
    </button>
  );
};

export default Logo;

