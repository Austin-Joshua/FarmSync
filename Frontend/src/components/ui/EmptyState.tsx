import React from 'react';
import { LucideIcon } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionText?: string;
  onActionClick?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  actionText,
  onActionClick,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-surface border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm ${className}`}>
      <div className="p-4 bg-surface-sunken rounded-full mb-4">
        <Icon className="text-gray-400 dark:text-gray-500" size={32} />
      </div>
      <h3 className="text-lg font-bold text-text mb-1">
        {title}
      </h3>
      <p className="text-sm text-text-muted max-w-sm mb-6">
        {description}
      </p>
      {actionText && onActionClick && (
        <Button onClick={onActionClick} variant="primary" size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
