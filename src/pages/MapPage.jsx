// src/pages/MapPage.jsx
<<<<<<< HEAD
import React, { useEffect } from 'react';
import RoguelikeWorldMap from '../components/map/RoguelikeWorldMap';
import Navigation from '../components/ui/Navigation';
import { useGame } from '../context/GameContext';
// import DebugOverlay from '../components/map/DebugOverlay'; // Décommenter pour le débogage
=======
import React from 'react';
import RoguelikeWorldMap from '../components/map/RoguelikeWorldMap';
import Navigation from '../components/ui/Navigation';
import { useGame } from '../context/GameContext';
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c

const MapPage = () => {
  const { gameState } = useGame();

<<<<<<< HEAD
  // S'assurer que path est un tableau valide
  const safePath = Array.isArray(gameState?.path) ? gameState.path : [];

  // S'assurer que player existe et contient les propriétés nécessaires
  const safePlayer = gameState?.player || {
    health: 0,
    maxHealth: 1,
    gold: 0,
  };

  // Nettoyer tous les overlays potentiels au chargement de la page
  useEffect(() => {
    // Solution 1: Désactiver les événements pointer sur les éléments fixed/absolute
    const cleanup = () => {
      // Rechercher des éléments fixed ou absolute qui pourraient bloquer
      const potentialBlockers = document.querySelectorAll(
        '.fixed, .absolute, [style*="position: fixed"], [style*="position:fixed"], [style*="position: absolute"], [style*="position:absolute"]'
      );

      // Vérifier s'ils couvrent toute la page et les désactiver si nécessaire
      potentialBlockers.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const styles = window.getComputedStyle(el);

        // Si l'élément couvre toute la page et n'est pas MapPage lui-même
        if (
          rect.width > window.innerWidth * 0.8 &&
          rect.height > window.innerHeight * 0.8 &&
          !el.classList.contains('map-page-container') &&
          el !== document.querySelector('.map-page-container')
        ) {
          // Désactiver les événements de pointeur pour cet élément
          console.log('Désactivation des événements de pointeur pour:', el);
          el.style.pointerEvents = 'none';
        }
      });
    };

    // Exécuter immédiatement et après un court délai (pour les éléments qui apparaissent plus tard)
    cleanup();
    const timer = setTimeout(cleanup, 500);

    return () => clearTimeout(timer);
  }, []);

  // Affichage de debug pour aider à résoudre le problème
  console.log('MapPage rendering with: ', {
    pathExists: Boolean(gameState?.path),
    pathLength: safePath.length,
    currentNodeId: gameState?.currentNodeId,
    player: safePlayer,
  });

  // Si pas de données de carte, afficher un message d'attente
  if (!gameState || safePath.length === 0) {
=======
  // If there's no map data yet
  if (!gameState?.path) {
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">Carte non disponible</h2>
          <p>La carte du jeu se chargera ici une fois disponible</p>
<<<<<<< HEAD
          <div className="mt-4 p-4 bg-gray-800 rounded-md max-w-md">
            <p className="text-sm text-gray-400">
              Si la carte ne se charge pas, essayez de retourner au combat pour
              réinitialiser le jeu.
            </p>
          </div>
=======
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
        </div>
        <Navigation />
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div
      className="min-h-screen bg-gray-900 p-4 flex flex-col items-center map-page-container"
      style={{ position: 'relative', zIndex: 1 }}
    >
      {/* Force z-index et rend cette div prioritaire */}
      <div className="relative z-10 w-full">
        <RoguelikeWorldMap
          currentFloor={gameState.currentFloor || 1}
          maxFloors={gameState.maxFloors || 10}
          nodes={safePath}
          currentNodeId={gameState.currentNodeId}
          playerStats={safePlayer}
        />
      </div>

      <Navigation />

      {/* Décommenter pour activer le débogage des overlays */}
      {/* <DebugOverlay /> */}
=======
    <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center">
      <RoguelikeWorldMap
        currentFloor={gameState.currentFloor || 1}
        maxFloors={gameState.maxFloors || 10}
        nodes={gameState.path || []}
        currentNodeId={gameState.currentNode}
        playerStats={gameState.player}
      />
      <Navigation />
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
    </div>
  );
};

export default MapPage;
