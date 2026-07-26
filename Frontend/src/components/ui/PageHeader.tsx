import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: React.ReactNode;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumb,
  action,
}) => {
  return (
    <div className="mb-8 pb-6 border-b border-border">
      {breadcrumb && <div className="text-xs text-text-subtle mb-3 uppercase tracking-wide">{breadcrumb}</div>}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text mb-1">{title}</h1>
          {description && (
            <p className="text-sm text-text-muted">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
