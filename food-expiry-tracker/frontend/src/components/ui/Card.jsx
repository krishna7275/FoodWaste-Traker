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
        bg-white rounded-xl shadow-md p-6 w-full overflow-hidden
        ${hover ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
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