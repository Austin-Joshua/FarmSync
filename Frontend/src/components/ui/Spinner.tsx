import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  label,
  className = '',
}) => {
  const sizeClasses: Record<SpinnerSize, string> = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-border border-t-accent rounded-full animate-spin`}
        aria-label="Loading"
      />
      {label && <p className="text-text-muted text-xs">{label}</p>}
    </div>
  );
};

export default Spinner;
