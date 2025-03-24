// src/components/core/GameManager.jsx - Correction de la boucle d'initialisation à la fin du combat

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectGamePhase, selectIsGameOver } from '../../redux/selectors/gameSelectors';
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
  const location = useLocation();

  const gamePhase = useSelector(selectGamePhase);
  const isGameOver = useSelector(selectIsGameOver);
  const playerHealth = useSelector(selectPlayerHealth);

  // Récupérer ces infos de manière sécurisée en gérant les cas undefined
  const mapInitialized =
    useSelector((state) => state.map?.path && state.map.path.length > 0) || false;

  const bonusCardsInitialized =
    useSelector(
      (state) => state.bonusCards?.collection && state.bonusCards.collection.length > 0
    ) || false;

  // État local pour éviter les redirections multiples
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastPathname, setLastPathname] = useState('');

  // Utiliser une référence pour suivre si une initialisation est déjà en cours
  const initializationInProgress = useRef(false);

  // Référence pour suivre l'état précédent
  const prevGamePhaseRef = useRef(null);

  // Référence pour suivre si la sauvegarde a déjà été vérifiée
  const saveCheckedRef = useRef(false);

  // Initialisation du jeu au premier chargement
  useEffect(() => {
    // Éviter les initialisations multiples ou pendant certaines phases
    if (isInitialized || initializationInProgress.current) {
      return;
    }

    // Si on est en phase de récompense ou de combat, ne pas réinitialiser
    if (gamePhase === 'reward' || gamePhase === 'combat') {
      setIsInitialized(true);
      return;
    }

    // Marquer qu'une initialisation est en cours
    initializationInProgress.current = true;

    const initGame = async () => {
      try {
        console.log("Début de l'initialisation du jeu");

        // Vérifier si une sauvegarde existe et la charger
        // Mais seulement si cela n'a pas déjà été fait
        if (!saveCheckedRef.current) {
          const savedGame = localStorage.getItem('pokerSoloRpgSave');
          saveCheckedRef.current = true;

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
        } else {
          // Si sauvegarde déjà vérifiée mais ressources manquantes
          // S'assurer que les ressources minimales sont présentes

          if (!bonusCardsInitialized) {
            dispatch(initCollection());
          }

          if (!mapInitialized) {
            await dispatch(generateNewMap({})).unwrap();
          }
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
            console.error('Erreur critique lors de la génération de carte:', mapError);
          }
        }

        setIsInitialized(true);
      } finally {
        initializationInProgress.current = false;
      }
    };

    initGame();
  }, [dispatch, mapInitialized, bonusCardsInitialized, isInitialized, gamePhase]);

  // Suivi des changements de phase de jeu
  useEffect(() => {
    // Enregistrer la phase précédente
    prevGamePhaseRef.current = gamePhase;

    // Si on passe de combat à récompense, sauvegarder l'état du jeu
    if (prevGamePhaseRef.current === 'combat' && gamePhase === 'reward') {
      dispatch(saveGame());
    }

    // Si on passe de récompense à exploration, aussi sauvegarder
    if (prevGamePhaseRef.current === 'reward' && gamePhase === 'exploration') {
      dispatch(saveGame());
    }
  }, [gamePhase, dispatch]);

  // Vérification de l'accès aux pages en fonction de la phase du jeu
  useEffect(() => {
    if (!isInitialized) return;

    const currentPath = location.pathname;

    // Éviter les vérifications répétitives sur le même chemin
    if (currentPath === lastPathname) return;

    setLastPathname(currentPath);

    // Règles d'accessibilité des pages selon la phase du jeu
    let shouldRedirect = false;
    let redirectTo = '/';
    let warningMessage = '';

    // Handle game over first
    if (isGameOver || playerHealth <= 0) {
      if (currentPath !== '/') {
        dispatch(setGamePhase('gameOver'));
        shouldRedirect = true;
        redirectTo = '/';
        warningMessage = "Game Over! Retour à l'écran principal.";
      }
    } else {
      // Vérifier l'accès en fonction de la phase du jeu
      switch (gamePhase) {
        case 'combat':
          // En combat, seules la page principale et la collection (en lecture seule) sont accessibles
          if (currentPath !== '/' && currentPath !== '/collection') {
            shouldRedirect = true;
            redirectTo = '/';
            warningMessage = "Cette page n'est pas accessible pendant un combat.";
          }
          break;

        case 'shop':
          // En boutique, seule la page de boutique est accessible
          if (currentPath !== '/shop') {
            shouldRedirect = true;
            redirectTo = '/shop';
            warningMessage = 'Vous êtes dans la boutique. Terminez vos achats avant de continuer.';
          }
          break;

        case 'rest':
          // En repos, seule la page de repos est accessible
          if (currentPath !== '/rest') {
            shouldRedirect = true;
            redirectTo = '/rest';
            warningMessage = 'Vous vous reposez. Terminez votre repos avant de continuer.';
          }
          break;

        case 'event':
          // En événement, seule la page d'événement est accessible
          if (currentPath !== '/event') {
            shouldRedirect = true;
            redirectTo = '/event';
            warningMessage = 'Un événement est en cours. Terminez-le avant de continuer.';
          }
          break;

        case 'exploration':
          // En exploration, on peut accéder à tout sauf la page principale de combat
          if (currentPath === '/') {
            shouldRedirect = true;
            redirectTo = '/map';
            warningMessage =
              "Vous êtes en phase d'exploration. Choisissez votre destination sur la carte.";
          }
          break;

        case 'reward':
          // En phase de récompense, rester sur la page principale
          if (currentPath !== '/') {
            shouldRedirect = true;
            redirectTo = '/';
            warningMessage = 'Vous avez remporté un combat! Récupérez votre récompense.';
          }
          break;

        default:
          break;
      }
    }

    // Appliquer la redirection si nécessaire
    if (shouldRedirect) {
      // Afficher le message d'avertissement
      if (warningMessage) {
        dispatch(
          setActionFeedback({
            message: warningMessage,
            type: 'warning',
          })
        );
      }

      // Rediriger l'utilisateur
      navigate(redirectTo);
    }
  }, [
    gamePhase,
    isGameOver,
    playerHealth,
    navigate,
    dispatch,
    location.pathname,
    isInitialized,
    lastPathname,
  ]);

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
      console.log('Sauvegarde automatique...');
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
