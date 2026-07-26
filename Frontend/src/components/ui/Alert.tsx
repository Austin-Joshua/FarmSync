import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

type AlertVariant = 'success' | 'warning' | 'danger' | 'info';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  showIcon?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  onClose,
  showIcon = true,
  className = '',
  ...props
}) => {
  const variantConfig: Record<AlertVariant, {
    bg: string;
    border: string;
    text: string;
    icon: React.ReactNode;
  }> = {
    success: {
      bg: 'bg-success-surface',
      border: 'border-success',
      text: 'text-success',
      icon: <CheckCircle2 size={20} />,
    },
    warning: {
      bg: 'bg-warning-surface',
      border: 'border-warning',
      text: 'text-warning',
      icon: <AlertTriangle size={20} />,
    },
    danger: {
      bg: 'bg-danger-surface',
      border: 'border-danger',
      text: 'text-danger',
      icon: <AlertCircle size={20} />,
    },
    info: {
      bg: 'bg-info-surface',
      border: 'border-info',
      text: 'text-info',
      icon: <Info size={20} />,
    },
  };

  const config = variantConfig[variant];

  return (
    <div
      className={`${config.bg} border ${config.border} rounded-lg p-4 flex gap-3 items-start ${className}`}
      {...props}
    >
      {showIcon && <div className={`flex-shrink-0 ${config.text}`}>{config.icon}</div>}
      <div className="flex-1">
        {title && <p className="font-medium text-text mb-1">{title}</p>}
        <p className="text-text-muted text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-text-muted hover:text-text transition-colors"
          aria-label="Close alert"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export default Alert;
