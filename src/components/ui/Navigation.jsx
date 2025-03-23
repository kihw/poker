// src/components/ui/Navigation.jsx - Design System Enhanced
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  selectStage, 
  selectGamePhase 
} from '../../redux/selectors/gameSelectors';
import { selectPlayerGold } from '../../redux/selectors/playerSelectors';
import { 
  Button, 
  Icons, 
  DESIGN_TOKENS, 
  AnimationPresets 
} from './DesignSystem';

const NavigationItem = ({ 
  to, 
  icon, 
  label, 
  isActive, 
  gamePhase 
}) => {
  return (
    <motion.div
      {...AnimationPresets.scaleIn}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link
        to={to}
        className={`
          flex flex-col items-center justify-center 
          px-3 py-2 rounded-md 
          transition-all duration-200
          ${isActive 
            ? 'bg-primary-600 text-white' 
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }
        `}
      >
        <span className="text-xl mb-1">{icon}</span>
        <span className="text-xs">{label}</span>
      </Link>
    </motion.div>
  );
};

const Navigation = () => {
  const location = useLocation();
  const stage = useSelector(selectStage);
  const gold = useSelector(selectPlayerGold);
  const gamePhase = useSelector(selectGamePhase);

  const navigationItems = [
    { 
      to: '/', 
      icon: Icons.combat, 
      label: 'Combat', 
      activeRoutes: ['/']
    },
    { 
      to: '/map', 
      icon: Icons.event, 
      label: 'Carte', 
      activeRoutes: ['/map']
    },
    { 
      to: '/collection', 
      icon: Icons.card, 
      label: 'Collection', 
      activeRoutes: ['/collection']
    }
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-2 z-50"
    >
      <div className="max-w-xl mx-auto flex justify-between items-center">
        <div className="flex space-x-2">
          {navigationItems.map((item) => (
            <NavigationItem
              key={item.to}
              {...item}
              isActive={item.activeRoutes.includes(location.pathname)}
              gamePhase={gamePhase}
            />
          ))}
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <div className="flex items-center">
            <span className="mr-1">📊</span>
            <span>Niveau {stage || 1}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">💰</span>
            <span>{gold || 0} Or</span>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
