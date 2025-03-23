// src/components/ui/ImprovedGameInterface.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Import des composants améliorés
import {
  Button,
  Card,
  Badge,
  ProgressBar,
  Tooltip,
  COLORS,
  ICONS,
} from './DesignSystem';
import ImprovedCombatInterface from '../combat/ImprovedCombatInterface';
import ImprovedPlayerStatus from '../player/ImprovedPlayerStatus';
import ImprovedActionFeedback from './ImprovedActionFeedback';

// Import des actions Redux
import { setGamePhase } from '../../redux/slices/gameSlice';
import { saveGame } from '../../redux/thunks/saveThunks';

const ImprovedGameInterface = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Sélecteurs Redux
  const gamePhase = useSelector((state) => state.game.gamePhase);
  const playerHealth = useSelector((state) => state.player.health);
  const playerMaxHealth = useSelector((state) => state.player.maxHealth);
  const playerGold = useSelector((state) => state.player.gold);
  const playerLevel = useSelector((state) => state.player.level);
  const playerExperience = useSelector((state) => state.player.experience);
  const stage = useSelector((state) => state.game.stage);
  const isGameOver = useSelector((state) => state.game.isGameOver);

  // État pour les animations et les interactions
  const [showMenu, setShowMenu] = useState(false);
  const [saveNotification, setSaveNotification] = useState(false);

  // Sauvegarder le jeu
  const handleSave = () => {
    dispatch(saveGame());
    setSaveNotification(true);
    setTimeout(() => setSaveNotification(false), 2000);
  };

  // Naviguer vers les différentes sections
  const navigateTo = (path) => {
    navigate(path);
    setShowMenu(false);
  };

  // Construire une liste de navigation contextuelle basée sur la phase actuelle
  const getNavigationItems = () => {
    const baseItems = [
      {
        label: 'Carte',
        icon: '🗺️',
        path: '/map',
        phase: 'exploration',
        alwaysShow: true,
      },
      {
        label: 'Combat',
        icon: '⚔️',
        path: '/',
        phase: 'combat',
        alwaysShow: true,
      },
      {
        label: 'Collection',
        icon: '🃏',
        path: '/collection',
        phase: null,
        alwaysShow: true,
      },
    ];

    // Ajouter des éléments conditionnels selon la phase
    const conditionalItems = [];

    if (gamePhase === 'shop' || gamePhase === 'rest' || gamePhase === 'event') {
      conditionalItems.push({
        label:
          gamePhase === 'shop'
            ? 'Boutique'
            : gamePhase === 'rest'
              ? 'Repos'
              : 'Événement',
        icon: gamePhase === 'shop' ? '🛒' : gamePhase === 'rest' ? '🏕️' : '❗',
        path:
          gamePhase === 'shop'
            ? '/shop'
            : gamePhase === 'rest'
              ? '/rest'
              : '/event',
        phase: gamePhase,
        alwaysShow: false,
      });
    }

    return [...baseItems, ...conditionalItems];
  };

  // Générer le contenu du header
  const renderHeader = () => (
    <header className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center sticky top-0 z-40">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-white">Poker Solo RPG</h1>
        <Badge className="ml-3" variant="primary">
          Niveau {stage}
        </Badge>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="outline"
          className="flex items-center"
          onClick={handleSave}
        >
          <span className="mr-1">💾</span> Sauvegarder
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="relative"
          onClick={() => setShowMenu(!showMenu)}
        >
          <span className="text-xl">☰</span>
        </Button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-md shadow-lg overflow-hidden z-50 border border-gray-700"
            >
              <ul>
                {getNavigationItems().map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={() => navigateTo(item.path)}
                      className={`text-left w-full px-4 py-2 hover:bg-gray-700 flex items-center ${
                        item.phase === gamePhase ? 'bg-gray-700' : ''
                      }`}
                      disabled={item.phase === gamePhase}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );

  // Générer la barre d'état du joueur
  const renderPlayerStatusBar = () => (
    <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
      <div className="flex items-center">
        <div className="flex items-center mr-4">
          <span className="text-red-500 mr-1">{ICONS.resources.health}</span>
          <span className="text-white">
            {playerHealth}/{playerMaxHealth}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-yellow-500 mr-1">{ICONS.resources.gold}</span>
          <span className="text-white">{playerGold}</span>
        </div>
      </div>

      <div className="flex items-center">
        <span className="text-blue-400 mr-2 text-sm">Niveau {playerLevel}</span>
        <div className="w-24">
          <ProgressBar
            value={playerExperience}
            maxValue={100}
            color="experience"
            height="0.5rem"
          />
        </div>
      </div>
    </div>
  );

  // Écran de Game Over
  const renderGameOver = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full p-8 text-center"
    >
      <h2 className="text-4xl font-bold text-red-500 mb-6">GAME OVER</h2>
      <p className="text-xl text-gray-300 mb-8">Vous avez été vaincu !</p>

      <Card className="p-6 max-w-md mb-8">
        <h3 className="text-lg font-bold text-yellow-400 mb-4">
          Statistiques finales
        </h3>
        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="text-gray-300">Niveau atteint:</div>
          <div className="text-white font-bold">{stage}</div>

          <div className="text-gray-300">Niveau du joueur:</div>
          <div className="text-white font-bold">{playerLevel}</div>

          <div className="text-gray-300">Or accumulé:</div>
          <div className="text-white font-bold">{playerGold}</div>
        </div>
      </Card>

      <div className="space-y-4">
        <Button
          variant="primary"
          size="lg"
          onClick={() => window.location.reload()}
        >
          Nouvelle partie
        </Button>
      </div>
    </motion.div>
  );

  // Contenu principal en fonction de la phase du jeu
  const renderContent = () => {
    if (isGameOver) {
      return renderGameOver();
    }

    return <div className="flex-grow overflow-auto">{children}</div>;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-white relative">
      {renderHeader()}
      {renderPlayerStatusBar()}

      {renderContent()}

      {/* Notification de sauvegarde */}
      <AnimatePresence>
        {saveNotification && (
          <ImprovedActionFeedback
            message="Jeu sauvegardé avec succès"
            type="success"
            duration={2000}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImprovedGameInterface;
