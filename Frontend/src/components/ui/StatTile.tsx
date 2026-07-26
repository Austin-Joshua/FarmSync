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
    <div className={`bg-surface border border-border rounded-lg p-6 ${className}`}>
      <p className="text-text-muted text-sm font-medium mb-2">{label}</p>
      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-bold text-text tabular">{value}</p>
        {delta && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              delta.trend === 'up' ? 'text-success' : 'text-danger'
            }`}
          >
            {delta.trend === 'up' ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}
            <span>{delta.value}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatTile;
