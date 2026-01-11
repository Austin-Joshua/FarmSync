// Reusable progress bar component that uses refs to avoid inline styles
import { useRef, useEffect } from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  barClassName?: string;
  role?: string;
  'aria-valuenow'?: number;
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-label'?: string;
}

const ProgressBar = ({ 
  value, 
  className = '', 
  barClassName = '',
  role = 'progressbar',
  'aria-valuenow': ariaValueNow,
  'aria-valuemin': ariaValueMin = 0,
  'aria-valuemax': ariaValueMax = 100,
  'aria-label': ariaLabel,
}: ProgressBarProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const clampedValue = Math.max(0, Math.min(100, value));
      containerRef.current.style.setProperty('--progress-width', `${clampedValue}%`);
    }
  }, [value]);

  return (
    <div 
      ref={containerRef}
      className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 relative overflow-hidden ${className}`}
      role={role}
      aria-valuenow={ariaValueNow ?? value}
      aria-valuemin={ariaValueMin}
      aria-valuemax={ariaValueMax}
      aria-label={ariaLabel}
    >
      <div 
        className={`h-2 rounded-full transition-all duration-300 progress-bar ${barClassName}`}
      />
    </div>
  );
};

export default ProgressBar;
