// src/components/ui/GameInterface.jsx - Comprehensive Game Interface
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  Button, 
  Card, 
  Badge, 
  ProgressBar, 
  Tooltip,
  COLORS,
  Icons 
} from './DesignSystem';

import Navigation from './Navigation';
import ActionFeedback from './ActionFeedback';

import { 
  setGamePhase, 
  resetGame, 
  completeTutorial 
} from '../../redux/slices/gameSlice';
import { selectPlayerSaveData } from '../../redux/selectors/playerSelectors';
import { saveGame, deleteSave } from '../../redux/thunks/saveThunks';
import PlayerStatus from '../combat/PlayerStatus';

const GameInterface = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Game and player state selectors
  const gameState = useSelector((state) => state.game);
  const playerStats = useSelector(selectPlayerSaveData);
  const tutorialStatus = useSelector((state) => ({
    step: state.game.tutorialStep,
    showTutorial: state.game.showTutorial
  }));

  // UI state
  const [menuOpen, setMenuOpen] = useState(false);
  const [saveNotification, setSaveNotification] = useState(false);

  // Game phase and navigation management
  useEffect(() => {
    const handleGamePhaseChange = () => {
      switch (gameState.gamePhase) {
        case 'combat':
          navigate('/');
          break;
        case 'exploration':
          navigate('/map');
          break;
        case 'shop':
          navigate('/shop');
          break;
        case 'rest':
          navigate('/rest');
          break;
        case 'event':
          navigate('/event');
          break;
        default:
          break;
      }
    };

    handleGamePhaseChange();
  }, [gameState.gamePhase, navigate]);

  // Game over and restart handling
  const handleRestart = () => {
    dispatch(resetGame());
    navigate('/');
    window.location.reload();
  };

  const handleDeleteSaveAndRestart = () => {
    dispatch(deleteSave());
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Save game handler with visual feedback
  const handleSave = () => {
    dispatch(saveGame());
    setSaveNotification(true);
    setTimeout(() => setSaveNotification(false), 2000);
  };

  // Render game over screen
  const renderGameOver = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full p-8 text-center"
    >
      <h2 className="text-4xl font-bold text-red-500 mb-6">GAME OVER</h2>
      <p className="text-xl text-gray-300 mb-8">Vous avez été vaincu!</p>

      <Card className="p-6 max-w-md mb-8">
        <h3 className="text-lg font-bold text-yellow-400 mb-4">
          Statistiques finales
        </h3>
        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="text-gray-300">Niveau atteint:</div>
          <div className="text-white font-bold">{gameState.stage}</div>

          <div className="text-gray-300">Niveau du joueur:</div>
          <div className="text-white font-bold">{playerStats.level}</div>

          <div className="text-gray-300">Or accumulé:</div>
          <div className="text-white font-bold">{playerStats.gold}</div>
        </div>
      </Card>

      <div className="space-y-4">
        <Button
          variant="primary"
          size="lg"
          onClick={handleRestart}
        >
          Nouvelle partie
        </Button>
        <Button
          variant="danger"
          size="lg"
          onClick={handleDeleteSaveAndRestart}
        >
          Supprimer la sauvegarde et recommencer
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-white relative">
      {/* Header with game navigation */}
      <header className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">Poker Solo RPG</h1>
          <Badge className="ml-3" variant="primary">
            Étage {gameState.stage}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Tooltip content="Sauvegarder la partie">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSave}
            >
              💾 Sauver
            </Button>
          </Tooltip>

          <Tooltip content="Menu du jeu">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ☰
            </Button>
          </Tooltip>
        </div>
      </header>

      {/* Player status bar */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <PlayerStatus 
          hp={playerStats.health}
          maxHp={playerStats.maxHealth}
          gold={playerStats.gold}
          xp={playerStats.experience}
          level={playerStats.level}
          shield={playerStats.shield}
        />
      </div>

      {/* Main content area */}
      <main className="flex-grow overflow-auto">
        {gameState.isGameOver ? renderGameOver() : children}
      </main>

      {/* Action Feedback */}
      <ActionFeedback />

      {/* Navigation */}
      <Navigation />
    </div>
  );
};

export default GameInterface;
