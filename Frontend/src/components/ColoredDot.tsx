// Colored dot component that uses refs to avoid inline styles
import { useRef, useEffect } from 'react';

interface ColoredDotProps {
  color: string;
  size?: string;
  className?: string;
  'aria-hidden'?: boolean;
}

const ColoredDot = ({ 
  color, 
  size = 'w-4 h-4',
  className = '',
  'aria-hidden': ariaHidden = true,
}: ColoredDotProps) => {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dotRef.current) {
      dotRef.current.style.setProperty('--dynamic-bg-color', color);
    }
  }, [color]);

  return (
    <div
      ref={dotRef}
      className={`${size} rounded-full dynamic-bg-color ${className}`}
      aria-hidden={ariaHidden}
    />
  );
};

export default ColoredDot;
