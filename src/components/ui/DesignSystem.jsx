// src/components/ui/DesignSystem.jsx - Comprehensive Design System Enhancements

import React from 'react';
import { motion } from 'framer-motion';

// Design tokens - Les constantes globales du système de design
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

// Définir les constantes COLORS exportées pour que les autres composants puissent y accéder
export const COLORS = {
  primary: { main: '#3B82F6', light: '#60A5FA', dark: '#2563EB' },
  secondary: { main: '#6366F1', light: '#818CF8', dark: '#4338CA' },
  success: { main: '#10B981', light: '#34D399', dark: '#047857' },
  danger: { main: '#EF4444', light: '#FCA5A5', dark: '#B91C1C' },
  warning: { main: '#F59E0B', light: '#FCD34D', dark: '#B45309' },
};

// Icônes pour le design system
export const Icons = {
  // Utiliser des fonctions qui retournent des éléments JSX ou des strings
  combat: () => <span>⚔️</span>,
  event: () => <span>❗</span>,
  card: () => <span>🃏</span>,
  health: ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  ),
  gold: ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  level: ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
};

// Animation Presets
export const AnimationPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: DESIGN_TOKENS.animations.duration.normal,
      ease: 'easeInOut',
    },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 10,
      },
    },
    exit: {
      scale: 0.9,
      opacity: 0,
    },
  },
};

// Ajout du composant Card qui était manquant
export const Card = ({ children, variant = 'elevated', className = '', ...props }) => {
  const variantStyles = {
    elevated: 'bg-gray-800 shadow-lg',
    outline: 'bg-gray-800 border border-gray-700',
    flat: 'bg-gray-800',
  };

  return (
    <div className={`rounded-lg overflow-hidden ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

// Bouton standard
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    outline: 'border border-gray-300 hover:bg-gray-700 text-white',
    ghost: 'hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    disabled: 'bg-gray-600 text-gray-400 cursor-not-allowed',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`
        rounded-md transition-colors 
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

// Badge component
export const Badge = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const variantStyles = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-indigo-600 text-white',
    success: 'bg-green-600 text-white',
    danger: 'bg-red-600 text-white',
    warning: 'bg-yellow-600 text-black',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`
        inline-block rounded 
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

// Composant Tooltip
export const Tooltip = ({ children, content, position = 'top', className = '', ...props }) => {
  const positionStyles = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <div className={`relative group ${className}`} {...props}>
      {children}
      <div
        className={`absolute ${positionStyles[position]} left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-50`}
      >
        <div className="bg-gray-800 text-white text-xs p-2 rounded shadow whitespace-nowrap">
          {content}
        </div>
      </div>
    </div>
  );
};

// Export de tous les composants dans un objet par défaut
export default {
  Button,
  Badge,
  Card,
  Tooltip,
  DESIGN_TOKENS,
  COLORS,
  AnimationPresets,
  Icons,
};
