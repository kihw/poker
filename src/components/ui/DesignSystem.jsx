// src/components/ui/DesignSystem.jsx - Comprehensive Design System Enhancements

import React from 'react';
import { motion } from 'framer-motion';

// Expanded Design Tokens with comprehensive definitions
export const DESIGN_TOKENS = {
  ...EXISTING_DESIGN_TOKENS, // Spread existing tokens
  layout: {
    borderRadius: {
      sm: '0.125rem',
      base: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      base: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
    },
    zIndex: {
      base: 1,
      overlay: 10,
      modal: 100,
      tooltip: 1000,
    },
  },
  animations: {
    transition: {
      smooth: 'all 0.3s ease-in-out',
      bounce: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    duration: {
      fast: 0.2,
      normal: 0.4,
      slow: 0.6,
    },
  },
};

// Enhanced ProgressBar component
export const ProgressBar = ({ 
  value, 
  max = 100, 
  color = 'primary', 
  className = '' 
}) => {
  const percentage = (value / max) * 100;
  const colorClasses = {
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    danger: 'bg-red-500',
    warning: 'bg-yellow-500',
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5 }}
        className={`h-2.5 rounded-full ${colorClasses[color]}`}
      />
    </div>
  );
};

// Add other needed enhancements...

export default {
  ...EXISTING_EXPORT, // Spread existing exports
  ProgressBar,
  DESIGN_TOKENS,
};