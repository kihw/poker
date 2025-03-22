// src/pages/MapPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoguelikeWorldMap from '../components/map/RoguelikeWorldMap';
import Navigation from '../components/ui/Navigation';
import { useGame } from '../context/gameHooks';
import ActionFeedback from '../components/ui/ActionFeedback';

const MapPage = () => {
  const { gameState, generateMap } = useGame();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);

  // S'assurer que path est un tableau valide
  const safePath = Array.isArray(gameState?.path) ? gameState.path : [];
  const safePlayer = gameState?.player || {
    health: 50,
    maxHealth: 50,
    gold: 100,
  };

  // Navigation automatique vers la page appropriée lorsqu'un nœud est sélectionné
  useEffect(() => {
    if (!gameState) return;

    // Redirection basée sur la phase de jeu actuelle
    switch (gameState.gamePhase) {
      case 'combat':
        console.log('Redirection vers la page de combat');
        navigate('/');
        break;
      case 'shop':
        console.log('Redirection vers la boutique');
        navigate('/shop');
        break;
      case 'rest':
        console.log('Redirection vers le site de repos');
        navigate('/rest');
        break;
      case 'event':
        console.log("Redirection vers la page d'événement");
        navigate('/event');
        break;
      default:
        // Rester sur la page de carte
        break;
    }
  }, [gameState?.gamePhase, navigate]);

  // Generate map if not exists or empty
  useEffect(() => {
    const tryGenerateMap = async () => {
      console.log('Vérification de la carte', {
        gameStateExists: !!gameState,
        pathExists: gameState?.path?.length > 0,
        generateMapAvailable: typeof generateMap === 'function',
      });

      // Ensure gameState exists, path is empty, and generateMap is a function
      if (gameState && (!gameState.path || gameState.path.length === 0)) {
        if (generateMap) {
          try {
            setMapLoading(true);
            console.log('Génération de la carte roguelike');
            await generateMap();
            setFeedback({
              message: 'Carte générée avec succès',
              type: 'success',
            });
          } catch (error) {
            console.error('Erreur lors de la génération de la carte:', error);
            setFeedback({
              message: 'Erreur lors de la génération de la carte',
              type: 'error',
            });
          } finally {
            setMapLoading(false);
          }
        } else {
          console.error('Fonction de génération de carte non disponible');
          setFeedback({
            message: 'Impossible de générer la carte',
            type: 'error',
          });
        }
      }
    };

    // Try to generate map immediately
    tryGenerateMap();
  }, [gameState, generateMap]);

  // Afficher un écran de chargement si la carte est en cours de génération
  if (mapLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-white text-xl">Génération de la carte...</div>
      </div>
    );
  }

  // Si pas de données de carte, afficher un message d'attente
  if (!gameState || safePath.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">Carte non disponible</h2>
          <p className="mb-4">
            La carte du jeu n'a pas pu être générée ou chargée
          </p>
          <div className="mt-4 p-4 bg-gray-800 rounded-md max-w-md">
            <p className="text-sm text-gray-400">
              Si ce problème persiste, essayez de retourner au combat ou de
              réinitialiser le jeu.
            </p>
          </div>
          <button
            onClick={() => generateMap && generateMap()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Essayer de générer une nouvelle carte
          </button>
          <button
            onClick={() => navigate('/')}
            className="mt-4 ml-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Retour au combat
          </button>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-900 p-4 flex flex-col items-center map-page-container"
      style={{ position: 'relative', zIndex: 1 }}
    >
      {/* Afficher le feedback si présent */}
      {feedback && (
        <ActionFeedback
          message={feedback.message}
          type={feedback.type}
          duration={2000}
        />
      )}

      {/* Titre et informations */}
      <div className="mb-4 text-center text-white">
        <h1 className="text-2xl font-bold mb-1">Carte de l'aventure</h1>
        <p className="text-sm text-gray-300">
          Choisissez votre prochain lieu à explorer
        </p>
      </div>

      {/* Carte roguelike avec z-index élevé */}
      <div className="relative z-10 w-full">
        <RoguelikeWorldMap
          currentFloor={gameState.currentFloor || 1}
          maxFloors={gameState.maxFloors || 10}
          nodes={safePath}
          currentNodeId={gameState.currentNodeId}
          playerStats={safePlayer}
        />
      </div>

      {/* Légende de la carte (optionnel) */}
      <div className="mt-4 bg-gray-800 p-3 rounded-md text-white text-sm max-w-md text-center">
        <p>
          Cliquez sur un lieu connecté pour vous y rendre. Les lieux plus
          lumineux sont accessibles depuis votre position actuelle.
        </p>
        <div className="flex justify-center mt-2 space-x-4">
          <span>⚔️ Combat</span>
          <span>🛡️ Élite</span>
          <span>👑 Boss</span>
          <span>🛒 Boutique</span>
          <span>🏕️ Repos</span>
          <span>❗ Événement</span>
        </div>
      </div>

      {/* Barre de navigation */}
      <Navigation />
    </div>
  );
};

export default MapPage;
