import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string | number; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  className = '',
  label,
  error,
  helperText,
  options,
  id,
  ...props
}, ref) => {
  const selectId = id || React.useId();
  
  const baseSelectStyle = 'w-full px-4 py-3 text-sm border border-border rounded-xl bg-surface text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all disabled:opacity-50';
  const errorSelectStyle = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label 
          htmlFor={selectId}
          className="text-xs font-bold text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        className={`${baseSelectStyle} ${errorSelectStyle} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-danger font-medium">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {helperText}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
