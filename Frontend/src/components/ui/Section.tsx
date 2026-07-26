import React from 'react';

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

const Section: React.FC<SectionProps> = ({
  title,
  description,
  children,
  className = '',
  ...props
}) => {
  return (
    <section className={`space-y-4 ${className}`} {...props}>
      {title && (
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-text">{title}</h2>
          {description && (
            <p className="text-sm text-text-muted">{description}</p>
          )}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
};

export default Section;
