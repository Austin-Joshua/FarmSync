import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  const baseStyle = 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-2xl p-6 overflow-hidden';
  const hoverStyle = hoverEffect 
    ? 'hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200' 
    : '';

  return (
    <div 
      className={`${baseStyle} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
