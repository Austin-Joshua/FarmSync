import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-bold rounded-xl transition-all outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm focus:ring-primary-500',
    secondary: 'bg-earth-100 hover:bg-earth-200 text-earth-800 focus:ring-earth-400 dark:bg-earth-900/30 dark:hover:bg-earth-900/50 dark:text-earth-300',
    outline: 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-primary-500',
    ghost: 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 focus:ring-primary-500',
    destructive: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
