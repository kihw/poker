// src/components/ui/DesignSystem.jsx - Comprehensive Design System
import React from 'react';
import { motion } from 'framer-motion';

// Enhanced Design Tokens with more comprehensive styling definitions
export const DESIGN_TOKENS = {
  // Existing content remains the same, but with some enhancements
  animations: {
    entrance: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    press: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  },
  responsiveness: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px'
  }
};

// Enhanced base components with design system integration
export const Button = React.forwardRef(({ children, variant = 'primary', ...props }, ref) => {
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border border-blue-500 text-blue-500 hover:bg-blue-50'
  };

  return (
    <motion.button
      ref={ref}
      className={`px-4 py-2 rounded-md transition-all ${variantStyles[variant]}`}
      whileHover={DESIGN_TOKENS.animations.hover}
      whileTap={DESIGN_TOKENS.animations.press}
      {...props}
    >
      {children}
    </motion.button>
  );
});

// More components and utilities...

export default {
  DESIGN_TOKENS,
  Button,
  // Other exports
};