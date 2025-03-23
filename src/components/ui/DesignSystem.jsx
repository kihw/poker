// src/components/ui/DesignSystem.jsx - Comprehensive Design System Enhancements

import React from 'react';
import { motion } from 'framer-motion';

// Expanded Design Tokens with comprehensive definitions
export const DESIGN_TOKENS = {
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
  colors: {
    primary: { main: '#3B82F6', light: '#60A5FA', dark: '#2563EB' },
    secondary: { main: '#6366F1', light: '#818CF8', dark: '#4338CA' },
    success: { main: '#10B981', light: '#34D399', dark: '#047857' },
    danger: { main: '#EF4444', light: '#FCA5A5', dark: '#B91C1C' },
    warning: { main: '#F59E0B', light: '#FCD34D', dark: '#B45309' },
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
};

// Animation Presets
export const AnimationPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { 
      duration: DESIGN_TOKENS.animations.duration.normal,
      ease: 'easeInOut'
    }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 20 
    }
  },
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 10
      }
    },
    exit: { 
      scale: 0.9, 
      opacity: 0 
    }
  }
};

// Autres composants et exports existants
export const Button = ({ children, variant = 'primary', ...props }) => {
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    outline: 'border border-gray-300 hover:bg-gray-100 text-gray-700',
    ghost: 'hover:bg-gray-100 text-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <button 
      className={`
        px-4 py-2 rounded-md transition-colors 
        ${variantStyles[variant] || variantStyles.primary}
      `} 
      {...props}
    >
      {children}
    </button>
  );
};

// Autres composants et définitions...
export default {
  Button,
  DESIGN_TOKENS,
  AnimationPresets,
};
