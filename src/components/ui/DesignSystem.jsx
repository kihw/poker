// src/components/ui/DesignSystem.jsx - Comprehensive Design System
import React from 'react';
import { motion } from 'framer-motion';

// Enhanced Design Tokens with more comprehensive color and styling definitions
export const DESIGN_TOKENS = {
  colors: {
    primary: {
      lightest: '#93c5fd', // blue-300
      light: '#60a5fa', // blue-400
      main: '#2563eb', // blue-600
      dark: '#1d4ed8', // blue-700
      darkest: '#1e40af', // blue-800
    },
    secondary: {
      lightest: '#c4b5fd', // violet-300
      light: '#a78bfa', // violet-400
      main: '#8b5cf6', // violet-500
      dark: '#7c3aed', // violet-600
      darkest: '#6d28d9', // violet-700
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
      lightest: '#6ee7b7', // green-300
      light: '#4ade80', // green-400
      main: '#22c55e', // green-500
      dark: '#16a34a', // green-600
      darkest: '#15803d', // green-700
    },
    warning: {
      lightest: '#fde68a', // amber-300
      light: '#fbbf24', // amber-400
      main: '#f59e0b', // amber-500
      dark: '#d97706', // amber-600
      darkest: '#b45309', // amber-700
    },
    danger: {
      lightest: '#fca5a5', // red-300
      light: '#f87171', // red-400
      main: '#ef4444', // red-500
      dark: '#dc2626', // red-600
      darkest: '#b91c1c', // red-700
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
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },
  spacing: {
    0: '0px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },
  transitions: {
    DEFAULT: 'all 0.2s ease-in-out',
    slow: 'all 0.5s ease-in-out',
    fast: 'all 0.1s ease-in-out',
  },
};

// Utility function to get poker hand color
export const getPokerHandColor = (handType) => {
  const handColors = {
    'High Card': DESIGN_TOKENS.colors.neutral[500],
    Pair: DESIGN_TOKENS.colors.warning.main,
    'Two Pair': DESIGN_TOKENS.colors.success.main,
    'Three of a Kind': DESIGN_TOKENS.colors.success.dark,
    Straight: DESIGN_TOKENS.colors.primary.main,
    Flush: DESIGN_TOKENS.colors.primary.dark,
    'Full House': DESIGN_TOKENS.colors.secondary.main,
    'Four of a Kind': DESIGN_TOKENS.colors.secondary.dark,
    'Straight Flush': DESIGN_TOKENS.colors.secondary.light,
    'Royal Flush': DESIGN_TOKENS.colors.secondary.lightest,
  };

  return handColors[handType] || DESIGN_TOKENS.colors.neutral[500];
};
export const COLORS = {
  primary: {
    main: '#2563eb', // blue-600
    light: '#60a5fa', // blue-400
    dark: '#1d4ed8', // blue-700
  },
  danger: {
    main: '#ef4444', // red-500
    light: '#f87171', // red-400
    dark: '#dc2626', // red-600
  },
  // Add other color groups as needed
  success: {
    main: '#22c55e', // green-500
    light: '#4ade80', // green-400
    dark: '#16a34a', // green-600
  },
  warning: {
    main: '#f59e0b', // amber-500
    light: '#fbbf24', // amber-400
    dark: '#d97706', // amber-600
  },
};
export const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      className = '',
      icon,
      ...props
    },
    ref
  ) => {
    // Base button styles
    const baseStyles =
      'rounded-md transition-all duration-200 focus:outline-none focus:ring-2';

    // Variant-specific styles
    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-300',
      outline:
        'border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-blue-300',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300',
      ghost: 'text-gray-500 hover:bg-gray-100 focus:ring-blue-300',
    };

    // Size-specific styles
    const sizeStyles = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    // Combine styles
    const combinedClassName = `
    ${baseStyles} 
    ${variantStyles[variant] || variantStyles.primary} 
    ${sizeStyles[size] || sizeStyles.md} 
    ${className}
  `;

    return (
      <button ref={ref} className={combinedClassName} {...props}>
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

// Badge Component
export const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'inline-block rounded-full';

  const variantStyles = {
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const combinedClassName = `
    ${baseStyles} 
    ${variantStyles[variant] || variantStyles.primary} 
    ${sizeStyles[size] || sizeStyles.md} 
    ${className}
  `;

  return <span className={combinedClassName}>{children}</span>;
};

// Export other components and utilities
export const Card = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-lg p-4 shadow-md';

  const variantStyles = {
    default: 'bg-white',
    elevated: 'bg-gray-800 border border-gray-700',
  };

  const combinedClassName = `
    ${baseStyles} 
    ${variantStyles[variant]} 
    ${className}
  `;

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};

// Tooltip Component (Simple implementation)
export const Tooltip = ({ children, content, className = '' }) => {
  return (
    <div className={`relative group ${className}`}>
      {children}
      <div
        className="
        absolute 
        z-10 
        invisible 
        group-hover:visible 
        bg-black 
        text-white 
        text-xs 
        rounded 
        p-2 
        -top-8 
        left-1/2 
        transform 
        -translate-x-1/2 
        transition-all 
        duration-200
      "
      >
        {content}
      </div>
    </div>
  );
};
// Animations utility
export const AnimationPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
  },
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
  },
};

// Comprehensive Icons collection
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
  },
};
// Utility functions
export const getRarityColor = (rarity) => {
  const rarityColors = {
    common: '#6b7280', // gray
    uncommon: '#10b981', // emerald
    rare: '#3b82f6', // blue
    epic: '#8b5cf6', // violet
    legendary: '#f59e0b', // amber
  };
  return rarityColors[rarity] || rarityColors.common;
};
export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
};

export const TRANSITIONS = {
  DEFAULT: 'all 0.2s ease-in-out',
  slow: 'all 0.5s ease-in-out',
  fast: 'all 0.1s ease-in-out',
};
export default {
  Button,
  Badge,
  Card,
  Tooltip,
  DESIGN_TOKENS,
  AnimationPresets,
  Icons,
  getRarityColor,
  getPokerHandColor,
  COLORS,
  SHADOWS,
  TRANSITIONS,
};
