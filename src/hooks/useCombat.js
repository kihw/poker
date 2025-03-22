// src/hooks/useCombat.js
import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  dealHand, 
  toggleCardSelection, 
  toggleDiscardMode,
  discardCards,
  addToCombatLog
} from '../redux/slices/combatSlice';
import { 
  startCombatFromNode, 
  executeCombatTurn, 
  checkCombatEnd, 
  processCombatVictory 
} from '../redux/thunks/combatCycleThunks';
import { useCard } from '../redux/slices/bonusCardsSlice';
import { setActionFeedback } from '../redux/slices/uiSlice';

/**
 * Hook personnalisé pour gérer le cycle de combat
 * Fournit une API simple pour les composants d'interface de combat
 */
export function useCombat() {
  const dispatch = useDispatch();
  
  // Sélectionner les données nécessaires du state Redux
  const enemy = useSelector((state) => state.combat.enemy);
  const hand = useSelector((state) => state.combat.hand);
  const selectedCards = useSelector((state) => state.combat.selectedCards);
  const turnPhase = useSelector((state) => state.combat.turnPhase);
  const discardLimit = useSelector((state) => state.combat.discardLimit);
  const discardUsed = useSelector((state) => state.combat.discardUsed);
  const discardMode = useSelector((state) => state.combat.discardMode);
  const handResult = useSelector((state) => state.combat.handResult);
  const combatLog = useSelector((state) => state.combat.combatLog);
  const gamePhase = useSelector((state) => state.game.gamePhase);
  const isGameOver = useSelector((state) => state.game.isGameOver);
  const activeBonusCards = useSelector((state) => state.bonusCards.active);
  
  // Vérification automatique de la fin du combat
  useEffect(() => {
    // Si l'ennemi est vaincu mais que nous sommes encore en phase combat
    if (
      enemy &&
      enemy.health <= 0 &&
      gamePhase === 'combat' &&
      turnPhase === 'result'
    ) {
      // Vérifier la fin du combat
      dispatch(checkCombatEnd());
    }
  }, [enemy?.health, gamePhase, turnPhase, dispatch]);
  
  // Fonctions d'action
  
  /**
   * Démarre un combat à partir d'un nœud de la carte
   * @param {string} nodeId - ID du nœud à partir duquel démarrer le combat
   */
  const startCombat = useCallback((nodeId) => {
    dispatch(startCombatFromNode({ nodeId }));
  }, [dispatch]);
  
  /**
   * Distribue une nouvelle main de cartes
   */
  const handleDealHand = useCallback(() => {
    dispatch(dealHand());
  }, [dispatch]);
  
  /**
   * Sélectionne/désélectionne une carte
   * @param {number} index - Index de la carte dans la main
   */
  const handleCardSelection = useCallback((index) => {
    // Vérifier si nous sommes dans la bonne phase
    if (turnPhase !== 'select') {
      dispatch(setActionFeedback({
        message: 'Vous ne pouvez pas sélectionner de cartes en ce moment',
        type: 'warning'
      }));
      return;
    }
    
    dispatch(toggleCardSelection(index));
  }, [dispatch, turnPhase]);
  
  /**
   * Exécute l'attaque avec les cartes sélectionnées
   */
  const handleAttack = useCallback(() => {
    // Vérifier si on a des cartes sélectionnées
    if (selectedCards.length === 0) {
      dispatch(setActionFeedback({
        message: 'Vous devez sélectionner au moins 1 carte pour attaquer',
        type: 'warning'
      }));
      return;
    }
    
    // Vérifier si on n'a pas trop de cartes sélectionnées
    if (selectedCards.length > 5) {
      dispatch(setActionFeedback({
        message: 'Vous ne pouvez pas sélectionner plus de 5 cartes pour attaquer',
        type: 'warning'
      }));
      return;
    }
    
    // Exécuter le tour de combat
    dispatch(executeCombatTurn());
  }, [dispatch, selectedCards]);
  
  /**
   * Active/désactive le mode défausse
   */
  const handleToggleDisc