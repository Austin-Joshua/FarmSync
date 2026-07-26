import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  const baseStyle = 'bg-surface border border-border rounded-md overflow-hidden transition-shadow';
  const variants = {
    default: 'shadow-sm p-4',
    elevated: 'shadow-md p-6',
  };

  return (
    <div
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
