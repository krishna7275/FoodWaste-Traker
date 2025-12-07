import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  type = 'button',
  className = '',
  icon: Icon,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-600 dark:hover:bg-primary-500 focus:ring-primary-400 dark:focus:ring-primary-500 active:bg-primary-700 dark:active:bg-primary-600 shadow-md dark:shadow-black/30',
    secondary: 'bg-white dark:bg-neutral-dark-surface text-neutral-700 dark:text-neutral-dark-text-secondary border border-neutral-300 dark:border-neutral-dark-border hover:bg-neutral-50 dark:hover:bg-neutral-dark-surface-hover focus:ring-neutral-400 dark:focus:ring-neutral-600 active:bg-neutral-100 dark:active:bg-neutral-dark-surface-hover transition-colors duration-200',
    success: 'bg-success text-white hover:bg-success-600 focus:ring-success-400 active:bg-success-700 shadow-md dark:shadow-black/30',
    danger: 'bg-danger text-white hover:bg-danger-600 focus:ring-danger-400 active:bg-danger-700 shadow-md dark:shadow-black/30',
    ghost: 'bg-transparent text-neutral-700 dark:text-neutral-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-dark-surface-hover focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-colors duration-200',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 mr-2 flex-shrink-0" />}
      <span>{children}</span>
    </motion.button>
  );
};

export default Button;