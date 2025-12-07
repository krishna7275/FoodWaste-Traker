import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ icon, title, value, subtext }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-neutral-900">
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-neutral-500 mt-1">{subtext}</p>
          )}
        </div>
        <div className="flex-shrink-0 ml-4">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
