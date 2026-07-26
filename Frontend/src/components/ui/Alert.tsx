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
      className={`${config.bg} border ${config.border} rounded-md p-3 flex gap-2 items-start ${className}`}
      {...props}
    >
      {showIcon && <div className={`flex-shrink-0 ${config.text} mt-0.5`}>{config.icon}</div>}
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium text-sm text-text mb-0.5">{title}</p>}
        <p className="text-text-muted text-xs leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-text-muted hover:text-text transition-colors p-1"
          aria-label="Close alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
