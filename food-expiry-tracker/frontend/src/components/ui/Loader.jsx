import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ size = 'md', text }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        className={`${sizes[size]} border-4 border-primary-200 border-t-primary rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && (
        <p className="text-neutral-600 text-sm font-medium">{text}</p>
      )}
    </div>
  );
};

export default Loader;