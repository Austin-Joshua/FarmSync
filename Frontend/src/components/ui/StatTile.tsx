import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatTileProps {
  label: string;
  value: string | number;
  delta?: {
    value: number;
    trend: 'up' | 'down';
  };
  className?: string;
}

const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  delta,
  className = '',
}) => {
  return (
    <div className={`bg-surface border border-border rounded-md p-4 ${className}`}>
      <p className="text-text-muted text-xs font-medium mb-2 uppercase tracking-wide">{label}</p>
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-bold text-text tabular">{value}</p>
        {delta && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              delta.trend === 'up' ? 'text-success' : 'text-danger'
            }`}
          >
            {delta.trend === 'up' ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span>{delta.value}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatTile;
