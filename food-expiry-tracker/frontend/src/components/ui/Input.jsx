import React from 'react';

const Input = ({ 
  label, 
  error, 
  icon: Icon,
  className = '',
  ...props 
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-neutral-400" />
          </div>
        )}
        <input
          className={`
            w-full px-4 py-3 border rounded-lg transition-colors duration-200 overflow-hidden
            focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-danger-300 focus:ring-danger-400 focus:border-danger-400' : 'border-neutral-300'}
            disabled:bg-neutral-100 disabled:cursor-not-allowed
            placeholder:text-neutral-400 text-base
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
};

export default Input;