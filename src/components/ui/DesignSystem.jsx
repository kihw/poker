// src/components/ui/DesignSystem.jsx - Comprehensive Design System
import React from 'react';
import { motion } from 'framer-motion';

// Enhanced Design Tokens
export const DESIGN_TOKENS = {
  colors: {
    primary: {
      light: '#60a5fa', // blue-400
      main: '#2563eb', // blue-600
      dark: '#1d4ed8', // blue-700
    },
    secondary: {
      light: '#a78bfa', // violet-400
      main: '#8b5cf6', // violet-500
      dark: '#7c3aed', // violet-600
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    success: {
      light: '#4ade80', // green-400
      main: '#22c55e', // green-500
      dark: '#16a34a', // green-600
    },
    warning: {
      light: '#fbbf24', // amber-400
      main: '#f59e0b', // amber-500
      dark: '#d97706', // amber-600
    },
    danger: {
      light: '#f87171', // red-400
      main: '#ef4444', // red-500
      dark: '#dc2626', // red-600
    },
    rarity: {
      common: '#6b7280', // gray
      uncommon: '#10b981', // emerald
      rare: '#3b82f6', // blue
      epic: '#8b5cf6', // violet
      legendary: '#f59e0b', // amber
    },
  },
  typography: {
    fontFamily: {
      sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    0: '0px',
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
  },
  borderRadius: {
    sm: '0.125rem', // 2px
    base: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    full: '9999px', // Circle
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  }
};

// Enhanced Components
export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary: `bg-blue-600 hover:bg-blue-700 text-white`,
    secondary: `bg-violet-600 hover:bg-violet-700 text-white`,
    success: `bg-green-600 hover:bg-green-700 text-white`,
    danger: `bg-red-600 hover:bg-red-700 text-white`,
    outline: `border border-gray-300 hover:bg-gray-100 text-gray-700`,
    ghost: `hover:bg-gray-100 text-gray-700`,
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        rounded-md 
        transition-all 
        ${variantStyles[variant]} 
        ${sizeStyles[size]} 
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  ...props 
}) => {
  const variantStyles = {
    default: 'bg-gray-100 shadow-md',
    elevated: 'bg-white shadow-lg hover:shadow-xl transition-shadow',
    outline: 'bg-white border border-gray-200 shadow-sm',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        rounded-lg 
        overflow-hidden 
        ${variantStyles[variant]} 
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const ProgressBar = ({ 
  value, 
  maxValue, 
  color = 'primary', 
  height = '0.5rem',
  showLabel = false
}) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const colorMap = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    danger: 'bg-red-600',
    warning: 'bg-amber-500',
    health: 'bg-red-500',
    experience: 'bg-blue-500',
  };

  return (
    <div className="w-full">
      <div 
        className="w-full bg-gray-200 rounded-full overflow-hidden" 
        style={{ height }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full ${colorMap[color] || colorMap.primary}`}
        />
      </div>
      {showLabel && (
        <div className="text-xs text-gray-600 mt-1 flex justify-between">
          <span>{value}</span>
          <span>{maxValue}</span>
        </div>
      )}
    </div>
  );
};

export const Badge = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  size = 'md',
  ...props 
}) => {
  const variantStyles = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-violet-600 text-white',
    success: 'bg-green-600 text-white',
    danger: 'bg-red-600 text-white',
    warning: 'bg-amber-500 text-black',
  };

  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-block 
        rounded-full 
        font-medium 
        ${variantStyles[variant]} 
        ${sizeStyles[size]} 
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};

export const Tooltip = ({ content, children }) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div 
        className="
          absolute 
          z-50 
          hidden 
          group-hover:block 
          bg-gray-800 
          text-white 
          text-xs 
          p-2 
          rounded 
          shadow-lg 
          -top-10 
          left-1/2 
          transform 
          -translate-x-1/2
        "
      >
        {content}
      </div>
    </div>
  );
};

export const getRarityColor = (rarity) => {
  return DESIGN_TOKENS.colors.rarity[rarity] || DESIGN_TOKENS.colors.rarity.common;
};

export const getPokerHandColor = (handType) => {
  const handColors = {
    'High Card': DESIGN_TOKENS.colors.neutral[500],
    'Pair': '#f59e0b', // amber
    'Two Pair': '#22c55e', // green
    'Three of a Kind': '#16a34a', // green dark
    'Straight': '#3b82f6', // blue
    'Flush': '#2563eb', // blue dark
    'Full House': '#6366f1', // indigo
    'Four of a Kind': '#4f46e5', // indigo dark
    'Straight Flush': '#9333ea', // purple
    'Royal Flush': '#7e22ce', // purple dark
  };

  return handColors[handType] || DESIGN_TOKENS.colors.neutral[500];
};

export const Icons = {
  combat: '⚔️',
  health: '❤️',
  gold: '💰',
  experience: '✨',
  shield: '🛡️',
  level: '📊',
  rest: '🏕️',
  card: '🃏',
  shop: '🛒',
  event: '❗',
  enemy: {
    goblin: '👺',
    skeleton: '💀',
    orc: '👹',
    dragon: '🐉',
    wolf: '🐺',
    spider: '🕷️',
  }
};

export default {
  DESIGN_TOKENS,
  Button,
  Card,
  Badge,
  ProgressBar,
  Tooltip,
  Icons,
  getRarityColor,
  getPokerHandColor,
};
