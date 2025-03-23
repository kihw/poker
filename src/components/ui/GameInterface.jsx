// src/components/ui/GameInterface.jsx - Enhanced Hierarchical Interface
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  Button, 
  Card, 
  Badge, 
  DESIGN_TOKENS 
} from './DesignSystem';

import PlayerStatus from '../combat/PlayerStatus';
import Navigation from './Navigation';
import ActionFeedback from './ActionFeedback';
import CombatInterface from '../combat/CombatInterface';
import RoguelikeWorldMap from '../map/RoguelikeWorldMap';
import ShopInterface from '../shop/ImprovedShopInterface';
import RestSite from '../rest/RestSite';
import EventEncounter from '../event/EventEncounter';

// Secondary Elements (Persistent across phases)
const SecondaryElements = () => {
  const [isCombatLogOpen, setIsCombatLogOpen] = useState(false);
  const combatLog = useSelector(state => state.combat.combatLog);
  const bonusCards = useSelector(state => state.bonusCards.active);

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40">
      <div className="flex space-x-4">
        {/* Combat Log */}
        <Card 
          variant="elevated" 
          className={`w-1/3 bg-gray-800 p-4 transition-all duration-300 
            ${isCombatLogOpen ? 'h-64 overflow-y-auto' : 'h-12 overflow-hidden'}`}
        >
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setIsCombatLogOpen(!isCombatLogOpen)}
          >
            <h3 className="font-bold text-white">Journal de Combat</h3>
            <Badge variant="primary">{combatLog.length}</Badge>
          </div>
          
          {isCombatLogOpen && (
            <motion.ul 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 space-y-1 text-sm text-gray-300"
            >
              {combatLog.slice(0, 10).map((entry, index) => (
                <li key={index} className="border-b border-gray-700 pb-1">
                  {entry}
                </li>
              ))}
            </motion.ul>
          )}
        </Card>

        {/* Bonus Cards Overview */}
        <Card 
          variant="elevated" 
          className="w-1/3 bg-gray-800 p-4 h-12 overflow-hidden hover:h-64 transition-all duration-300 group"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">Cartes Bonus</h3>
            <Badge variant="secondary">{bonusCards.length}</Badge>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {bonusCards.map((card, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center text-sm text-gray-300"
              >
                <span>{card.name}</span>
                <Badge variant="primary" size="sm">
                  {card.effect}
                </Badge>
              </div>
            ))}
          </motion.div>
        </Card>

        {/* Quick Collection Access */}
        <Card 
          variant="elevated" 
          className="w-1/3 bg-gray-800 p-4 h-12 overflow-hidden hover:h-64 transition-all duration-300 group"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">Collection</h3>
            <Button variant="outline" size="sm">
              Voir tout
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Main Game Interface Component
const GameInterface = ({ children }) => {
  const gamePhase = useSelector(state => state.game.gamePhase);
  const isGameOver = useSelector(state => state.game.isGameOver);

  const renderCentralContent = () => {
    switch (gamePhase) {
      case 'combat':
        return <CombatInterface />;
      case 'exploration':
        return <RoguelikeWorldMap />;
      case 'shop':
        return <ShopInterface />;
      case 'rest':
        return <RestSite />;
      case 'event':
        return <EventEncounter />;
      default:
        return null;
    }
  };

  // Game Over Screen
  if (isGameOver) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <Card variant="elevated" className="p-8 text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">Game Over</h1>
          <p className="text-xl mb-6">Votre aventure s'est terminée...</p>
          <Button variant="primary">Recommencer</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Critical Elements (Top Bar) */}
      <CriticalElements />

      {/* Central Content Area */}
      <CentralElements>
        {renderCentralContent()}
      </CentralElements>

      {/* Secondary Elements (Bottom Bar) */}
      <SecondaryElements />

      {/* Global Navigation */}
      <Navigation />

      {/* Action Feedback */}
      <ActionFeedback />
    </div>
  );
};

export default GameInterface;
