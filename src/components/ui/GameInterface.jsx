// src/components/ui/GameInterface.jsx - Enhanced Design System Header
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  Button, 
  Badge, 
  Tooltip, 
  Icons,
  DESIGN_TOKENS 
} from './DesignSystem';

import PlayerStatus from '../combat/PlayerStatus';
import Navigation from './Navigation';
import SaveButton from './SaveButton';
import ActionFeedback from './ActionFeedback';

// Performance and Design System Utilities
import { performanceDebounce } from '../../utils/performance';

const GameHeader = React.memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Game and player state selectors
  const stage = useSelector((state) => state.game.stage);
  const gamePhase = useSelector((state) => state.game.gamePhase);
  const playerStats = useSelector((state) => ({
    health: state.player.health,
    maxHealth: state.player.maxHealth,
    gold: state.player.gold,
    level: state.player.level,
  }));

  // Header menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Phase indicator styling
  const phaseStyles = {
    exploration: { 
      color: DESIGN_TOKENS.colors.primary.main, 
      icon: '🗺️' 
    },
    combat: { 
      color: DESIGN_TOKENS.colors.danger.main, 
      icon: '⚔️' 
    },
    shop: { 
      color: DESIGN_TOKENS.colors.success.main, 
      icon: '🛒' 
    },
    rest: { 
      color: DESIGN_TOKENS.colors.warning.main, 
      icon: '🏕️' 
    },
    event: { 
      color: DESIGN_TOKENS.colors.secondary.main, 
      icon: '❗' 
    }
  };

  const currentPhaseStyle = phaseStyles[gamePhase] || phaseStyles.exploration;

  return (
    <motion.header 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 shadow-md"
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Game Logo and Stage */}
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold text-white">
            Poker Solo RPG
          </div>
          <Badge variant="primary">
            Stage {stage}
          </Badge>
        </div>

        {/* Current Phase Indicator */}
        <div 
          className="flex items-center space-x-2"
          style={{ color: currentPhaseStyle.color }}
        >
          <span className="text-xl">{currentPhaseStyle.icon}</span>
          <span className="font-semibold capitalize">
            {gamePhase}
          </span>
        </div>

        {/* Player Quick Stats */}
        <div className="flex items-center space-x-4">
          <Tooltip content="Player Health">
            <div className="flex items-center">
              <Icons.health className="mr-2" />
              <span>{playerStats.health}/{playerStats.maxHealth}</span>
            </div>
          </Tooltip>
          
          <Tooltip content="Gold">
            <div className="flex items-center">
              <Icons.gold className="mr-2" />
              <span>{playerStats.gold}</span>
            </div>
          </Tooltip>

          <Tooltip content="Player Level">
            <div className="flex items-center">
              <Icons.level className="mr-2" />
              <span>Lv. {playerStats.level}</span>
            </div>
          </Tooltip>
        </div>

        {/* Game Menu and Actions */}
        <div className="flex items-center space-x-2">
          <SaveButton />
          
          <Tooltip content="Game Menu">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Drop-down Game Menu (Future Implementation) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800 p-4"
          >
            {/* Future menu items */}
            <div className="text-white">Game Menu Placeholder</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
});

const GameInterface = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <GameHeader />
      
      <main className="flex-grow">
        {children}
      </main>

      <Navigation />
      <ActionFeedback />
    </div>
  );
};

export default GameInterface;