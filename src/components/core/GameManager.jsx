// src/components/core/GameManager.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectGamePhase,
  selectIsGameOver,
} from '../../redux/selectors/gameSelectors';
import { selectPlayerHealth } from '../../redux/selectors/playerSelectors';
import { setGamePhase } from '../../redux/slices/gameSlice';
import { setActionFeedback } from '../../redux/slices/uiSlice';
import { loadGame } from '../../redux/thunks/saveThunks';
import { generateNewMap } from '../../redux/thunks/mapThunks';
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

  // Initialisation du jeu au premier chargement
  useEffect(() => {
    const initGame = async () => {
      try {
        // Vérifier si une sauvegarde existe et la charger
        const savedGame = localStorage.getItem('pokerSoloRpgSave');

        if (savedGame) {
          // Charger la sauvegarde
          dispatch(loadGame());
        } else {
          // Générer une nouvelle carte si aucune n'existe
          dispatch(generateNewMap({}));

          dispatch(
            setActionFeedback({
              message: 'Nouvelle partie démarrée !',
              type: 'success',
            })
          );
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation du jeu:", error);
        dispatch(
          setActionFeedback({
            message: "Erreur lors de l'initialisation du jeu",
            type: 'error',
          })
        );
      }
    };

    initGame();
  }, [dispatch]);

  // Gestion des redirections en fonction de la phase du jeu
  useEffect(() => {
    // Gérer le game over
    if (isGameOver || playerHealth <= 0) {
      dispatch(setGamePhase('gameOver'));
      navigate('/');
      return;
    }

    // Redirection automatique basée sur la phase
    switch (gamePhase) {
      case 'exploration':
        if (window.location.pathname === '/') {
          navigate('/map');
        }
        break;
      case 'combat':
      case 'reward':
      case 'gameOver':
        if (window.location.pathname !== '/') {
          navigate('/');
        }
        break;
      case 'shop':
        if (window.location.pathname !== '/shop') {
          navigate('/shop');
        }
        break;
      case 'rest':
        if (window.location.pathname !== '/rest') {
          navigate('/rest');
        }
        break;
      case 'event':
        if (window.location.pathname !== '/event') {
          navigate('/event');
        }
        break;
      default:
        break;
    }
  }, [gamePhase, isGameOver, playerHealth, navigate, dispatch]);

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

    return () => clearInterval(healthCheckInterval);
  }, [playerHealth, isGameOver, dispatch]);

  return (
    <>
      {children}
      <ActionFeedback />
    </>
  );
};

export default GameManager;
