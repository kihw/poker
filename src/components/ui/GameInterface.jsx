// src/components/ui/GameInterface.jsx - Enhanced Design System Header
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { Button, Badge, Tooltip, Icons, DESIGN_TOKENS } from './DesignSystem';

import PlayerStatus from '../combat/PlayerStatus';
import Navigation from './Navigation';
import SaveButton from './SaveButton';
import ActionFeedback from './ActionFeedback';

// Performance and Design System Utilities
import { performanceDebounce } from '../../utils/performance';

// Composant GameHeader ajouté
const GameHeader = React.memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Sélecteurs pour les statistiques du jeu
  const stage = useSelector((state) => state.game.stage);
  const gamePhase = useSelector((state) => state.game.gamePhase);
  const playerStats = useSelector((state) => ({
    health: state.player.health,
    maxHealth: state.player.maxHealth,
    gold: state.player.gold,
    level: state.player.level,
  }));

  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between"
    >
      <div className="flex items-center">
        <div className="mr-4">
          <span className="text-2xl font-bold">Poker RPG</span>
          <Badge variant="primary" className="ml-2">
            Stage {stage}
          </Badge>
        </div>
        <div className="text-sm text-gray-400">
          {gamePhase === 'combat' && 'Combat en cours'}
          {gamePhase === 'exploration' && 'Exploration'}
          {gamePhase === 'shop' && 'Boutique'}
          {gamePhase === 'rest' && 'Repos'}
          {gamePhase === 'event' && 'Événement'}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Tooltip content="Points de vie">
          <div className="flex items-center bg-gray-700 px-2 py-1 rounded">
            <span className="text-red-500 mr-1">❤️</span>
            <span>
              {playerStats.health}/{playerStats.maxHealth}
            </span>
          </div>
        </Tooltip>

        <Tooltip content="Or">
          <div className="flex items-center bg-gray-700 px-2 py-1 rounded">
            <span className="text-yellow-500 mr-1">💰</span>
            <span>{playerStats.gold}</span>
          </div>
        </Tooltip>

        <Tooltip content="Niveau">
          <div className="flex items-center bg-gray-700 px-2 py-1 rounded">
            <span className="text-blue-500 mr-1">📊</span>
            <span>Lv. {playerStats.level}</span>
          </div>
        </Tooltip>
      </div>
    </motion.header>
  );
});

const GameFooter = React.memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Sélecteurs pour les statistiques du jeu
  const stage = useSelector((state) => state.game.stage);
  const gamePhase = useSelector((state) => state.game.gamePhase);
  const playerStats = useSelector((state) => ({
    health: state.player.health,
    maxHealth: state.player.maxHealth,
    gold: state.player.gold,
    level: state.player.level,
  }));

  // Actions du footer
  const footerActions = [
    {
      icon: '🗺️',
      label: 'Carte',
      action: () => navigate('/map'),
      isEnabled: gamePhase !== 'combat',
    },
    {
      icon: '🏪',
      label: 'Boutique',
      action: () => navigate('/shop'),
      isEnabled: gamePhase === 'exploration',
    },
    {
      icon: '🏕️',
      label: 'Repos',
      action: () => navigate('/rest'),
      isEnabled: gamePhase === 'exploration',
    },
    {
      icon: '🃏',
      label: 'Collection',
      action: () => navigate('/collection'),
      isEnabled: true,
    },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 border-t border-gray-700 p-4 flex items-center justify-between"
    >
      {/* Statut du joueur compact */}
      <div className="flex items-center space-x-4">
        <Tooltip content="Points de vie">
          <div className="flex items-center">
            <span className="mr-2">❤️</span>
            <span>
              {playerStats.health}/{playerStats.maxHealth}
            </span>
          </div>
        </Tooltip>

        <Tooltip content="Or">
          <div className="flex items-center">
            <span className="mr-2">💰</span>
            <span>{playerStats.gold}</span>
          </div>
        </Tooltip>

        <Tooltip content="Niveau">
          <div className="flex items-center">
            <span className="mr-2">📊</span>
            <span>Lv. {playerStats.level}</span>
          </div>
        </Tooltip>
      </div>

      {/* Actions rapides */}
      <div className="flex space-x-2">
        {footerActions.map((action) => (
          <Tooltip key={action.label} content={action.label}>
            <Button
              variant={action.isEnabled ? 'ghost' : 'disabled'}
              size="sm"
              disabled={!action.isEnabled}
              onClick={action.action}
              className={`${action.isEnabled ? 'hover:bg-gray-700' : 'opacity-50 cursor-not-allowed'}`}
            >
              <span className="text-xl">{action.icon}</span>
            </Button>
          </Tooltip>
        ))}
      </div>

      {/* Stage et bouton de sauvegarde */}
      <div className="flex items-center space-x-2">
        <Badge variant="primary">Stage {stage}</Badge>
        <SaveButton />
      </div>
    </motion.footer>
  );
});

const GameInterface = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <GameHeader />

      <main className="flex-grow">{children}</main>

      <GameFooter />
      <ActionFeedback />
    </div>
  );
};

export default GameInterface;
