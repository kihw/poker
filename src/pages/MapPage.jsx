// src/pages/MapPage.jsx - Version corrigée

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectMapPath,
  selectCurrentNodeId,
  selectIsGameOver,
  selectGamePhase,
} from '../redux/selectors/gameSelectors';
import {
  selectPlayerHealth,
  selectPlayerMaxHealth,
  selectPlayerGold,
} from '../redux/selectors/playerSelectors';
import { generateNewMap } from '../redux/thunks/mapThunks';
import { setActionFeedback } from '../redux/slices/uiSlice';
import RoguelikeWorldMap from '../components/map/RoguelikeWorldMap';
import Navigation from '../components/ui/Navigation';
import ActionFeedback from '../components/ui/ActionFeedback';

const MapPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mapLoading, setMapLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Regroupez tous les sélecteurs ici pour éviter les problèmes
  const path = useSelector(selectMapPath);
  const currentNodeId = useSelector(selectCurrentNodeId);
  const isGameOver = useSelector(selectIsGameOver);
  const gamePhase = useSelector(selectGamePhase);
  const playerHealth = useSelector(selectPlayerHealth);
  const playerMaxHealth = useSelector(selectPlayerMaxHealth);
  const playerGold = useSelector(selectPlayerGold);
  const currentFloor = useSelector((state) => state.game?.currentFloor) || 1;
  const maxFloors = useSelector((state) => state.game?.maxFloors) || 10;

  // S'assurer que path est un tableau valide
  const safePath = Array.isArray(path) ? path : [];
  const safePlayer = {
    health: playerHealth || 50,
    maxHealth: playerMaxHealth || 50,
    gold: playerGold || 0,
  };

  // Navigation automatique en fonction de la phase
  useEffect(() => {
    if (isGameOver) {
      navigate('/');
      return;
    }
    
    // Redirection basée sur la phase de jeu actuelle
    switch (gamePhase) {
      case 'combat':
      case 'reward':
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
  }, [gamePhase, navigate, isGameOver]);

  // Generate map if not exists or empty
  useEffect(() => {
    const tryGenerateMap = async () => {
      console.log('Vérification de la carte', {
        pathExists: safePath.length > 0,
      });

      // Ensure path is empty before generating a new map
      if (safePath.length === 0 && !mapLoading) {
        try {
          setMapLoading(true);
          console.log('Génération de la carte roguelike');
          await dispatch(generateNewMap({})).unwrap();
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
      }
    };

    // Try to generate map immediately
    tryGenerateMap();
  }, [safePath, dispatch, mapLoading]);

  if (mapLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-white text-xl">Génération de la carte...</div>
      </div>
    );
  }

  if (safePath.length === 0) {
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
            onClick={() => {
              setMapLoading(true);
              dispatch(generateNewMap({}))
                .unwrap()
                .then(() => setMapLoading(false))
                .catch(() => setMapLoading(false));
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Essayer de générer une nouvelle carte
          </button>
          <button
            onClick={() => navigate('/')}
            className="mt-4 ml-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Retour au menu principal
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
          currentFloor={currentFloor}
          maxFloors={maxFloors}
          nodes={safePath}
          currentNodeId={currentNodeId}
          playerStats={safePlayer}
        />
      </div>

      {/* Légende de la carte (optionnel) */}
      <div className="mt-4 bg-gray-800 p-3 rounded-md text-white text-sm max-w-md text-center">
        <p>
          Cliquez sur un lieu connecté pour vous y rendre. Les lieux plus
          lumineux sont accessibles depuis votre position actuelle.
        </p>
        <div className="flex flex-wrap justify-center mt-2 gap-2">
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
