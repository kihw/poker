// src/components/core/GameManager.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectGamePhase,
  selectIsGameOver,
} from '../../redux/selectors/gameSelectors';
import { selectPlayerHealth } from '../../redux/selectors/playerSelectors';
import { setGamePhase } from '../../redux/slices/gameSlice';
import { setActionFeedback } from '../../redux/slices/uiSlice';
import { loadGame, saveGame } from '../../redux/thunks/saveThunks';
import { generateNewMap } from '../../redux/thunks/mapThunks';
import { initCollection } from '../../redux/slices/bonusCardsSlice';
import ActionFeedback from '../ui/ActionFeedback';

/**
 * Composant central qui gère les transitions d'états globales du jeu
 * et initialise les ressources nécessaires
 */
const GameManager = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const gamePhase = useSelector(selectGamePhase);
  const isGameOver = useSelector(selectIsGameOver);
  const playerHealth = useSelector(selectPlayerHealth);
  
  // Récupérer ces infos de manière sécurisée en gérant les cas undefined
  const mapInitialized = useSelector(
    (state) => state.map?.path && state.map.path.length > 0
  ) || false;
  
  const bonusCardsInitialized = useSelector(
    (state) => state.bonusCards?.collection && state.bonusCards.collection.length > 0
  ) || false;

  // État local pour éviter les redirections multiples
  const [hasRedirected, setHasRedirected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialisation du jeu au premier chargement
  useEffect(() => {
    // Éviter les initialisations multiples
    if (isInitialized) return;
    
    const initGame = async () => {
      try {
        // Vérifier si une sauvegarde existe et la charger
        const savedGame = localStorage.getItem('pokerSoloRpgSave');

        if (savedGame) {
          console.log('Sauvegarde trouvée, chargement en cours...');
          // Charger la sauvegarde
          await dispatch(loadGame()).unwrap();
          dispatch(
            setActionFeedback({
              message: 'Jeu chargé avec succès',
              type: 'success',
            })
          );
        } else {
          console.log("Pas de sauvegarde, initialisation d'un nouveau jeu");

          // Initialiser les cartes bonus si nécessaire
          if (!bonusCardsInitialized) {
            dispatch(initCollection());
          }

          // Générer une nouvelle carte si aucune n'existe
          if (!mapInitialized) {
            await dispatch(generateNewMap({})).unwrap();
          }

          dispatch(
            setActionFeedback({
              message: 'Nouvelle partie démarrée !',
              type: 'success',
            })
          );
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Erreur lors de l'initialisation du jeu:", error);
        dispatch(
          setActionFeedback({
            message: "Erreur lors de l'initialisation du jeu",
            type: 'error',
          })
        );
        
        // Tentative de réinitialisation d'urgence
        if (!bonusCardsInitialized) {
          dispatch(initCollection());
        }
        
        if (!mapInitialized) {
          try {
            await dispatch(generateNewMap({})).unwrap();
          } catch (mapError) {
            console.error("Erreur critique lors de la génération de carte:", mapError);
          }
        }
        
        setIsInitialized(true);
      }
    };

    initGame();
  }, [dispatch, mapInitialized, bonusCardsInitialized, isInitialized]);

  // Gestion des redirections en fonction de la phase du jeu
  useEffect(() => {
    // Ne pas effectuer de redirections pendant l'initialisation
    if (!isInitialized) return;
    
    // Éviter les redirections répétées
    if (hasRedirected) {
      setHasRedirected(false);
      return;
    }
    
    // Gérer le game over
    if (isGameOver || playerHealth <= 0) {
      setHasRedirected(true);
      dispatch(setGamePhase('gameOver'));
      navigate('/');
      return;
    }

    // Redirection automatique basée sur la phase
    switch (gamePhase) {
      case 'exploration':
        if (window.location.pathname === '/') {
          setHasRedirected(true);
          navigate('/map');
        }
        break;
      case 'combat':
      case 'reward':
      case 'gameOver':
        if (window.location.pathname !== '/') {
          setHasRedirected(true);
          navigate('/');
        }
        break;
      case 'shop':
        if (window.location.pathname !== '/shop') {
          setHasRedirected(true);
          navigate('/shop');
        }
        break;
      case 'rest':
        if (window.location.pathname !== '/rest') {
          setHasRedirected(true);
          navigate('/rest');
        }
        break;
      case 'event':
        if (window.location.pathname !== '/event') {
          setHasRedirected(true);
          navigate('/event');
        }
        break;
      default:
        break;
    }
  }, [gamePhase, isGameOver, playerHealth, navigate, dispatch, hasRedirected, isInitialized]);

  // Vérification périodique de l'état du joueur
  useEffect(() => {
    const checkPlayerHealth = () => {
      if (playerHealth <= 0 && !isGameOver) {
        dispatch(setGamePhase('gameOver'));
        dispatch(
          setActionFeedback({
            message: 'Game Over! Vous avez été vaincu.',
            type: 'error',
            duration: 5000,
          })
        );
      }
    };

    // Vérifier l'état du joueur toutes les secondes
    const healthCheckInterval = setInterval(checkPlayerHealth, 1000);

    // Nettoyage de l'interval à la destruction du composant
    return () => clearInterval(healthCheckInterval);
  }, [playerHealth, isGameOver, dispatch]);

  // Sauvegarde automatique
  useEffect(() => {
    // Ne pas sauvegarder pendant l'initialisation
    if (!isInitialized) return;
    
    // Ne pas sauvegarder en game over
    if (isGameOver) return;
    
    const autoSaveInterval = setInterval(() => {
      dispatch(saveGame());
    }, 60000); // Sauvegarde toutes les minutes
    
    // Nettoyage de l'interval à la destruction du composant
    return () => clearInterval(autoSaveInterval);
  }, [dispatch, isInitialized, isGameOver]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {children}
      <ActionFeedback />
    </div>
  );
};

export default GameManager;
