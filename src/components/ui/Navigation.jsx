// src/components/ui/Navigation.jsx - Amélioration pour gérer les restrictions d'accès

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectStage, selectGamePhase } from '../../redux/selectors/gameSelectors';
import { selectPlayerGold } from '../../redux/selectors/playerSelectors';
import { Button, Icons, DESIGN_TOKENS, AnimationPresets } from './DesignSystem';

const NavigationItem = ({ to, icon, label, isActive, isDisabled, disabledMessage }) => {
  // Si l'élément est désactivé, empêcher la navigation
  if (isDisabled) {
    return (
      <motion.div
        {...AnimationPresets.scaleIn}
        className="opacity-50 cursor-not-allowed"
        title={disabledMessage || 'Inaccessible dans la phase actuelle'}
      >
        <div
          className={`
            flex flex-col items-center justify-center 
            px-3 py-2 rounded-md 
            transition-all duration-200
            bg-gray-800 text-gray-500
          `}
        >
          <span className="text-xl mb-1">{icon}</span>
          <span className="text-xs">{label}</span>
        </div>
      </motion.div>
    );
  }

  // Sinon, afficher le lien normal
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
          ${isActive ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
        `}
      >
        {/* Utiliser un span pour contenir l'icône */}
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

  // Déterminer quels éléments de navigation sont accessibles dans la phase actuelle
  const isInCombat = gamePhase === 'combat' || gamePhase === 'reward';
  const isInShop = gamePhase === 'shop';
  const isInEvent = gamePhase === 'event';
  const isInRest = gamePhase === 'rest';
  const isGameOver = gamePhase === 'gameOver';

  // Définir les règles d'accessibilité pour chaque élément de navigation
  const navigationItems = [
    {
      to: '/',
      icon: '⚔️',
      label: 'Combat',
      activeRoutes: ['/'],
      isDisabled: !isInCombat && !isGameOver, // Désactivé si pas en combat
      disabledMessage: 'Disponible uniquement pendant un combat',
    },
    {
      to: '/map',
      icon: '🗺️',
      label: 'Carte',
      activeRoutes: ['/map'],
      isDisabled: isInCombat || isInShop || isInEvent || isInRest || isGameOver, // Désactivé si pas en exploration
      disabledMessage: 'Accessible uniquement en exploration',
    },
    {
      to: '/collection',
      icon: '🃏',
      label: 'Collection',
      activeRoutes: ['/collection'],
      isDisabled: isGameOver, // Accessible en lecture seule pendant le combat
      disabledMessage: 'Non disponible en mode Game Over',
    },
    {
      to: '/shop',
      icon: '🛒',
      label: 'Boutique',
      activeRoutes: ['/shop'],
      isDisabled: isInCombat || isInEvent || isInRest || isGameOver || !isInShop, // Disponible uniquement quand on est déjà dans la boutique
      disabledMessage: isInShop ? '' : 'Disponible uniquement dans les lieux de boutique',
    },
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
