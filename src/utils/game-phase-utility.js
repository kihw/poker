// src/utils/game-phase-utility.js
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { setGamePhase } from '../redux/slices/gameSlice';
import { setActionFeedback } from '../redux/slices/uiSlice';
import {
  selectGamePhase,
  selectIsGameOver,
} from '../redux/selectors/gameSelectors';

/**
 * Hook personnalisé pour gérer les transitions entre phases de jeu
 *
 * Avantages:
 * - Centralise la logique de navigation basée sur les phases
 * - Applique des redirections automatiques cohérentes
 * - Élimine le code dupliqué entre les composants
 *
 * @param {Object} options Configuration optionnelle
 * @param {boolean} options.autoRedirect Activer/désactiver la redirection automatique
 * @param {Object} options.redirectMap Mapping personnalisé des phases aux routes
 * @returns {Object} Objet avec méthodes et propriétés liées aux phases
 */
export function useGamePhaseManager(options = {}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentPhase = useSelector(selectGamePhase);
  const isGameOver = useSelector(selectIsGameOver);

  // Configuration par défaut
  const {
    autoRedirect = true,
    redirectMap = {
      exploration: '/map',
      combat: '/',
      reward: '/',
      shop: '/shop',
      rest: '/rest',
      event: '/event',
      gameOver: '/',
    },
  } = options;

  // Redirection automatique basée sur la phase
  useEffect(() => {
    if (autoRedirect && currentPhase) {
      const targetRoute = redirectMap[currentPhase];

      if (targetRoute && window.location.pathname !== targetRoute) {
        // Délai court pour permettre aux animations de finir
        const timer = setTimeout(() => {
          navigate(targetRoute);
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [currentPhase, autoRedirect, navigate, redirectMap]);

  // Effet spécial pour la phase gameOver
  useEffect(() => {
    if (isGameOver) {
      dispatch(
        setActionFeedback({
          message: 'Game Over! Votre aventure est terminée.',
          type: 'error',
          duration: 5000,
        })
      );
    }
  }, [isGameOver, dispatch]);

  /**
   * Change la phase du jeu
   * @param {string} phase Nouvelle phase
   * @param {Object} options Options additionnelles (ex: enemy, nodeId, etc.)
   */
  const changePhase = (phase, options = {}) => {
    // Validation de la phase
    const validPhases = Object.keys(redirectMap);
    if (!validPhases.includes(phase)) {
      console.error(
        `Phase invalide: ${phase}. Valeurs autorisées: ${validPhases.join(', ')}`
      );
      return;
    }

    // Dispatch l'action pour changer la phase
    dispatch(setGamePhase(phase));

    // Actions supplémentaires selon la phase
    switch (phase) {
      case 'combat':
        // Logique spécifique au combat
        break;

      case 'shop':
        // Logique spécifique à la boutique
        break;

      case 'rest':
        // Logique spécifique au repos
        break;

      case 'event':
        // Logique spécifique aux événements
        break;

      case 'gameOver':
        // Logique spécifique au game over
        break;

      default:
        break;
    }

    // Feedback pour l'utilisateur
    const phaseMessages = {
      exploration: 'Exploration de la carte',
      combat: 'Combat en cours',
      reward: 'Récompenses obtenues',
      shop: 'Bienvenue à la boutique',
      rest: 'Site de repos',
      event: 'Événement en cours',
      gameOver: 'Partie terminée',
    };

    if (phaseMessages[phase]) {
      dispatch(
        setActionFeedback({
          message: phaseMessages[phase],
          type: phase === 'gameOver' ? 'error' : 'info',
        })
      );
    }
  };

  /**
   * Vérifie si une phase est active
   * @param {string} phase Phase à vérifier
   * @returns {boolean} True si la phase est active
   */
  const isPhaseActive = (phase) => {
    return currentPhase === phase;
  };

  /**
   * Vérifie si le joueur peut changer vers la phase spécifiée
   * @param {string} targetPhase Phase cible
   * @returns {boolean} True si la transition est possible
   */
  const canTransitionTo = (targetPhase) => {
    // Transitions spécifiques interdites
    const forbiddenTransitions = {
      gameOver: [], // Pas de transition possible depuis gameOver
      combat: ['shop', 'rest'], // Ne peut pas aller directement du combat à la boutique ou au repos
      exploration: ['reward'], // Ne peut pas aller directement de l'exploration aux récompenses
    };

    // Si le jeu est terminé, aucune transition n'est possible sauf vers une nouvelle partie
    if (isGameOver && targetPhase !== 'exploration') {
      return false;
    }

    // Vérifier les transitions interdites
    const forbidden = forbiddenTransitions[currentPhase];
    if (forbidden && forbidden.includes(targetPhase)) {
      return false;
    }

    return true;
  };

  // Retourner les fonctions et propriétés utiles
  return {
    currentPhase,
    isGameOver,
    changePhase,
    isPhaseActive,
    canTransitionTo,
    // Ajout de fonctions d'aide pour des transitions spécifiques
    goToCombat: (options) => changePhase('combat', options),
    goToMap: () => changePhase('exploration'),
    goToShop: () => changePhase('shop'),
    goToRest: () => changePhase('rest'),
    goToEvent: () => changePhase('event'),
  };
}

/**
 * Hook personnalisé pour la gestion des transitions dans le combat
 * @returns {Object} Fonctions et état pour gérer les phases de combat
 */
export function useCombatPhaseManager() {
  const dispatch = useDispatch();
  const combatPhase = useSelector((state) => state.combat.turnPhase);

  /**
   * Change la phase du tour de combat
   * @param {string} phase Nouvelle phase du tour ('draw', 'select', 'result')
   */
  const changeCombatPhase = (phase) => {
    if (!['draw', 'select', 'result'].includes(phase)) {
      console.error(`Phase de combat invalide: ${phase}`);
      return;
    }

    dispatch({ type: 'combat/setTurnPhase', payload: phase });
  };

  return {
    combatPhase,
    changeCombatPhase,
    isDrawPhase: combatPhase === 'draw',
    isSelectPhase: combatPhase === 'select',
    isResultPhase: combatPhase === 'result',
    goToDrawPhase: () => changeCombatPhase('draw'),
    goToSelectPhase: () => changeCombatPhase('select'),
    goToResultPhase: () => changeCombatPhase('result'),
  };
}

/**
 * Composant d'ordre supérieur pour protéger les routes en fonction de la phase de jeu
 *
 * @param {React.Component} Component Composant à protéger
 * @param {Object} options Options de protection
 * @returns {React.Component} Composant protégé
 */
export function withPhaseProtection(Component, options = {}) {
  const {
    requiredPhase,
    redirectTo = '/',
    message = "Vous n'avez pas accès à cette page actuellement",
  } = options;

  return function ProtectedComponent(props) {
    const currentPhase = useSelector(selectGamePhase);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
      // Si une phase est requise et différente de la phase actuelle
      if (requiredPhase && currentPhase !== requiredPhase) {
        dispatch(
          setActionFeedback({
            message,
            type: 'warning',
          })
        );

        navigate(redirectTo);
      }
    }, [currentPhase, dispatch, navigate]);

    // Si la phase est correcte, render le composant
    if (!requiredPhase || currentPhase === requiredPhase) {
      return <Component {...props} />;
    }

    // Sinon, renvoyer null ou un composant de chargement
    return null;
  };
}

// Exemple d'utilisation:
// const ShopPage = withPhaseProtection(BaseShopPage, {
//   requiredPhase: 'shop',
//   redirectTo: '/map',
//   message: 'La boutique est accessible uniquement depuis la carte'
// });
