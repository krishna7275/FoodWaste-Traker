import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  onClick,
  ...props 
}) => {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover ? {
    whileHover: { scale: 1.02, y: -4 },
    transition: { duration: 0.2 }
  } : {};

  return (
    <Component
      className={`
        bg-white dark:bg-neutral-dark-surface rounded-xl shadow-md dark:shadow-black/30 p-6 w-full overflow-hidden
        border border-transparent dark:border-neutral-dark-border/50
        ${hover ? 'cursor-pointer hover:shadow-lg dark:hover:shadow-black/40 dark:hover:bg-neutral-dark-surface-hover transition-all duration-300' : ''}
        transition-all duration-300
        ${className}
      `}
      onClick={onClick}
      {...hoverProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;