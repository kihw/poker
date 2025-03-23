// src/components/ui/DesignSystem.jsx
import React from 'react';

// Constantes pour le système de design
export const COLORS = {
  // Couleurs primaires
  primary: {
    light: '#3b82f6', // blue-500
    main: '#2563eb', // blue-600
    dark: '#1d4ed8', // blue-700
  },
  // Couleurs secondaires
  secondary: {
    light: '#a78bfa', // violet-400
    main: '#8b5cf6', // violet-500
    dark: '#7c3aed', // violet-600
  },
  // Couleurs fonctionnelles
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
  // Niveaux de gris
  gray: {
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
  // Couleurs pour les raretés de carte
  rarity: {
    common: '#6b7280', // gray-500
    uncommon: '#10b981', // emerald-500
    rare: '#3b82f6', // blue-500
    epic: '#8b5cf6', // violet-500
    legendary: '#f59e0b', // amber-500
  },
};

// Système typographique
export const TYPOGRAPHY = {
  fontFamily: {
    sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
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
};

// Espacement et tailles
export const SPACING = {
  0: '0',
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
  24: '6rem', // 96px
  32: '8rem', // 128px
};

// Ombres
export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

// Arrondis
export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem', // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px', // Circle
};

// Transitions
export const TRANSITIONS = {
  DEFAULT: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
};

// Composants de base
export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    primary: `bg-${COLORS.primary.main} hover:bg-${COLORS.primary.dark} text-white`,
    secondary: `bg-${COLORS.secondary.main} hover:bg-${COLORS.secondary.dark} text-white`,
    success: `bg-${COLORS.success.main} hover:bg-${COLORS.success.dark} text-white`,
    danger: `bg-${COLORS.danger.main} hover:bg-${COLORS.danger.dark} text-white`,
    warning: `bg-${COLORS.warning.main} hover:bg-${COLORS.warning.dark} text-black`,
    outline: `border border-${COLORS.gray[300]} hover:bg-${COLORS.gray[100]} text-${COLORS.gray[700]}`,
    ghost: `hover:bg-${COLORS.gray[100]} text-${COLORS.gray[700]}`,
  };

  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`rounded font-medium transition-colors ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = '', ...props }) => (
  <div
    className={`bg-${COLORS.gray[800]} rounded-lg shadow-md overflow-hidden ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const Badge = ({ variant = 'primary', children, ...props }) => {
  const variants = {
    primary: `bg-${COLORS.primary.main} text-white`,
    secondary: `bg-${COLORS.secondary.main} text-white`,
    success: `bg-${COLORS.success.main} text-white`,
    danger: `bg-${COLORS.danger.main} text-white`,
    warning: `bg-${COLORS.warning.main} text-black`,
  };

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${variants[variant]}`}
      {...props}
    >
      {children}
    </span>
  );
};

// Fonction pour obtenir la couleur de rareté
export const getRarityColor = (rarity) => {
  return COLORS.rarity[rarity] || COLORS.rarity.common;
};

// Composant pour afficher une barre de progression
export const ProgressBar = ({
  value,
  maxValue,
  color = 'primary',
  height = '0.5rem',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));

  const colors = {
    primary: COLORS.primary.main,
    secondary: COLORS.secondary.main,
    success: COLORS.success.main,
    danger: COLORS.danger.main,
    warning: COLORS.warning.main,
    health: COLORS.danger.main,
    experience: COLORS.primary.main,
  };

  const bgColor = colors[color] || colors.primary;

  return (
    <div
      className={`w-full bg-${COLORS.gray[700]} rounded-full overflow-hidden ${className}`}
      style={{ height }}
    >
      <div
        className="transition-all duration-300 ease-out"
        style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: bgColor,
        }}
      />
    </div>
  );
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  SHADOWS,
  BORDER_RADIUS,
  TRANSITIONS,
  Button,
  Card,
  Badge,
  ProgressBar,
  getRarityColor,
};
