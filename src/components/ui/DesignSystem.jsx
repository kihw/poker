// src/components/ui/DesignSystem.jsx
import React from 'react';

// Constantes pour le système de design
export const COLORS = {
  // Couleurs primaires
  primary: {
    light: '#60a5fa', // blue-400
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
  // Combinaisons de poker
  pokerHand: {
    highCard: '#6b7280', // gray-500
    pair: '#f59e0b', // amber-500
    twoPair: '#22c55e', // green-500
    threeOfAKind: '#16a34a', // green-600
    straight: '#3b82f6', // blue-500
    flush: '#2563eb', // blue-600
    fullHouse: '#6366f1', // indigo-500
    fourOfAKind: '#4f46e5', // indigo-600
    straightFlush: '#9333ea', // purple-600
    royalFlush: '#7e22ce', // purple-700
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
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  glow: {
    primary: '0 0 15px rgba(59, 130, 246, 0.5)',
    success: '0 0 15px rgba(34, 197, 94, 0.5)',
    danger: '0 0 15px rgba(239, 68, 68, 0.5)',
    warning: '0 0 15px rgba(245, 158, 11, 0.5)',
  },
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
  bounce: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// Animations
export const ANIMATIONS = {
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  bounce: 'bounce 1s infinite',
  spin: 'spin 1s linear infinite',
  ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
};

// Composants de base
export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  disabled = false,
  icon,
  className = '',
  ...props
}) => {
  const variants = {
    primary: `bg-blue-600 hover:bg-blue-700 text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    secondary: `bg-violet-600 hover:bg-violet-700 text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    success: `bg-green-600 hover:bg-green-700 text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    danger: `bg-red-600 hover:bg-red-700 text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    warning: `bg-amber-500 hover:bg-amber-600 text-black ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    outline: `border border-gray-300 hover:bg-gray-100 text-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    ghost: `hover:bg-gray-100 text-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  return (
    <button
      className={`rounded font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export const Card = ({
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  const variants = {
    default: 'bg-gray-800',
    primary: 'bg-blue-900',
    secondary: 'bg-violet-900',
  };

  return (
    <div
      className={`rounded-lg shadow-md overflow-hidden ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const Badge = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-violet-600 text-white',
    success: 'bg-green-600 text-white',
    danger: 'bg-red-600 text-white',
    warning: 'bg-amber-500 text-black',
  };

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${variants[variant]} ${className}`}
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
  showText = false,
  animate = false,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));

  const colors = {
    primary: 'bg-blue-600',
    secondary: 'bg-violet-600',
    success: 'bg-green-600',
    danger: 'bg-red-600',
    warning: 'bg-amber-500',
    health: 'bg-red-600',
    experience: 'bg-blue-600',
    energy: 'bg-yellow-500',
    shield: 'bg-blue-400',
  };

  const bgColor = colors[color] || colors.primary;

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className="w-full bg-gray-700 rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className={`transition-all duration-300 ease-out ${bgColor} ${animate ? 'animate-pulse' : ''}`}
          style={{
            width: `${percentage}%`,
            height: '100%',
          }}
        />
      </div>
      {showText && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs text-white font-bold">
          {value}/{maxValue}
        </div>
      )}
    </div>
  );
};

// Icônes du jeu (optimisées sous forme d'objet)
export const ICONS = {
  // Types de nœuds de la carte
  mapNodes: {
    start: '🏁',
    combat: '⚔️',
    elite: '🛡️',
    boss: '👑',
    shop: '🛒',
    rest: '🏕️',
    event: '❗',
  },
  // Types d'ennemis
  enemies: {
    goblin: '👺',
    skeleton: '💀',
    orc: '👹',
    dragon: '🐉',
    ghost: '👻',
    wolf: '🐺',
    spider: '🕷️',
    troll: '👹',
    demon: '👿',
    defaultEnemy: '👾',
  },
  // Ressources
  resources: {
    health: '❤️',
    gold: '💰',
    shield: '🛡️',
    experience: '✨',
    card: '🃏',
    damage: '⚔️',
    heal: '💊',
  },
  // Effets de cartes bonus
  cardEffects: {
    passive: '🔄',
    damage: '⚔️',
    heal: '❤️',
    shield: '🛡️',
    discard: '🔄',
    invulnerable: '✨',
    damageMultiplier: '🔥',
    default: '🎮',
  },
};

// Éléments d'interface réutilisables
export const Tooltip = ({ content, children }) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute z-50 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg w-max max-w-xs">
        {content}
      </div>
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
  ANIMATIONS,
  ICONS,
  Button,
  Card,
  Badge,
  ProgressBar,
  Tooltip,
  getRarityColor,
};
