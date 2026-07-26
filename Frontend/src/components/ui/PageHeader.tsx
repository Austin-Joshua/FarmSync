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
    <div className="space-y-4 mb-8">
      {breadcrumb && <div className="text-sm text-text-muted">{breadcrumb}</div>}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold text-text">{title}</h1>
          {description && (
            <p className="text-text-muted text-lg">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
