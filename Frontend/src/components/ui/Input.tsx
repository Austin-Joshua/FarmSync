import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  label,
  error,
  helperText,
  type = 'text',
  id,
  ...props
}, ref) => {
  const inputId = id || React.useId();
  
  const baseInputStyle = 'w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-950';
  const errorInputStyle = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label 
          htmlFor={inputId}
          className="text-xs font-bold text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        ref={ref}
        className={`${baseInputStyle} ${errorInputStyle} ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 font-medium">
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

Input.displayName = 'Input';

export default Input;
