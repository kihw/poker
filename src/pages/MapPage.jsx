// src/pages/MapPage.jsx
import React, { useEffect } from 'react';
import RoguelikeWorldMap from '../components/map/RoguelikeWorldMap';
import Navigation from '../components/ui/Navigation';
import { useGame } from '../context/GameContext';

const MapPage = () => {
  const { gameState, generateMap } = useGame();

  // S'assurer que path est un tableau valide
  const safePath = Array.isArray(gameState?.path) ? gameState.path : [];

  // S'assurer que player existe et contient les propriétés nécessaires
  const safePlayer = gameState?.player || {
    health: 0,
    maxHealth: 1,
    gold: 0,
  };

  // Générer une carte si aucune n'existe encore
  useEffect(() => {
    if (gameState && (!gameState.path || gameState.path.length === 0)) {
      // Si generateMap est disponible, l'utiliser
      if (generateMap) {
        console.log('Génération automatique de la carte roguelike');
        generateMap();
      } else {
        console.warn('Fonction generateMap non disponible');
      }
    }
  }, [gameState, generateMap]);

  // Nettoyer tous les overlays potentiels au chargement de la page
  useEffect(() => {
    // Solution: Désactiver les événements pointer sur les éléments fixed/absolute
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
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">Carte en cours de génération...</h2>
          <p>La carte du jeu se charge, veuillez patienter</p>
          <div className="mt-4 p-4 bg-gray-800 rounded-md max-w-md">
            <p className="text-sm text-gray-400">
              Si la carte ne se charge pas, essayez de retourner au combat pour
              réinitialiser le jeu.
            </p>
          </div>
          <button
            onClick={() => generateMap && generateMap()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Générer une nouvelle carte
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
    </div>
  );
};

export default MapPage;
