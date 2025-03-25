// src/redux/thunks/combatThunks.js - Mise à jour avec l'intégration des combinaisons de cartes bonus
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  setEnemy,
  dealHand,
  evaluateSelectedHand as evaluateSelectedHandAction,
  enemyAction,
  startCombat as startCombatAction,
} from '../slices/combatSlice';
import { setGamePhase, incrementStage } from '../slices/gameSlice';
import { setActionFeedback } from '../slices/uiSlice';
import { takeDamage } from '../slices/playerSlice';
import { evaluatePartialHand } from '../../core/hand-evaluation.js';
import { evaluateBonusDeck, resetBonusDeckEffects } from './bonusDeckThunks';

// Import and re-export specific thunks from combatCycleThunks
import {
  startCombatFromNode as importedStartCombatFromNode,
  processCombatVictory as importedProcessCombatVictory,
  checkCombatEnd as importedCheckCombatEnd,
  executeCombatTurn as importedExecuteCombatTurn,
  generateEnemy,
} from './combatCycleThunks';

// Exporter explicitement les thunks importés
export const startCombatFromNode = importedStartCombatFromNode;
export const processCombatVictory = importedProcessCombatVictory;
export const checkCombatEnd = importedCheckCombatEnd;
export const executeCombatTurn = importedExecuteCombatTurn;

/**
 * Thunk pour continuer après une victoire en combat
 * Gère la transition vers la phase d'exploration
 */
export const continueAfterVictory = createAsyncThunk(
  'combat/continueAfterVictory',
  async (_, { dispatch, getState }) => {
    try {
      // Traiter la victoire si ce n'est pas déjà fait
      await dispatch(processCombatVictory());

      // Réinitialiser les effets du deck bonus
      await dispatch(resetBonusDeckEffects());

      // Vérifier si c'était un boss
      const state = getState();
      const enemy = state.combat.enemy;
      const isBoss = enemy && enemy.type === 'boss';

      // Si c'était un boss, incrémenter le niveau
      if (isBoss) {
        dispatch(incrementStage());
      }

      // Passer à la phase d'exploration
      dispatch(setGamePhase('exploration'));

      return { success: true };
    } catch (error) {
      console.error('Error in continueAfterVictory:', error);
      dispatch(
        setActionFeedback({
          message: 'Erreur lors de la fin du combat',
          type: 'error',
        })
      );
      return { success: false, error: error.message };
    }
  }
);

/**
 * Thunk pour démarrer un nouveau combat
 * @param {Object} options - Options pour le combat
 * @param {boolean} [options.isElite=false] - Si l'ennemi est d'élite
 * @param {boolean} [options.isBoss=false] - Si l'ennemi est un boss
 */
export const startNewCombat = createAsyncThunk(
  'combat/startNewCombat',
  async ({ isElite = false, isBoss = false }, { dispatch, getState }) => {
    try {
      console.log("Démarrage d'un nouveau combat");
      // Récupérer le niveau actuel
      const stage = getState().game.stage || 1;

      // Générer un ennemi
      const enemy = generateEnemy(stage, isElite, isBoss);
      console.log('Ennemi généré:', enemy);

      // Initialiser correctement le combat
      dispatch(startCombatAction(enemy));

      // Changer la phase du jeu
      dispatch(setGamePhase('combat'));

      // Évaluer le deck bonus pour appliquer les effets de combinaison
      await dispatch(evaluateBonusDeck());

      // Distribuer les cartes
      dispatch(dealHand());

      console.log('Combat initialisé avec succès');

      return enemy;
    } catch (error) {
      console.error('Erreur lors du démarrage du combat:', error);
      return null;
    }
  }
);

/**
 * Thunk pour attaquer l'ennemi
 * Évalue la main sélectionnée et calcule les dégâts
 */
export const attackEnemy = createAsyncThunk(
  'combat/attackEnemy',
  async (_, { dispatch, getState }) => {
    try {
      const state = getState();
      const hand = state.combat.hand;
      const selectedCardsIndices = state.combat.selectedCards;

      // Obtenir les bonus globaux de dégâts du deck bonus
      const bonusDeckCombination = state.bonusCards.deckCombination;
      const globalDamageBonus = state.combat.globalDamageBonus || 0;

      console.log('Attaque avec cartes sélectionnées:', selectedCardsIndices);

      // Extraire les cartes sélectionnées
      const selectedCards = selectedCardsIndices.map((index) => hand[index]).filter((card) => card);

      // Évaluer la main
      const partialHandResult = evaluatePartialHand(selectedCards);

      // Calculer les dégâts de base
      const baseDamage = partialHandResult.baseDamage;

      // Appliquer les bonus du deck bonus s'il y a une combinaison active
      let totalDamage = baseDamage;
      const bonusEffects = [];

      // Appliquer le bonus global de dégâts si présent
      if (globalDamageBonus > 0) {
        const damageBonus = Math.floor(baseDamage * (globalDamageBonus / 100));
        totalDamage += damageBonus;
        bonusEffects.push(`Bonus de dégâts global: +${globalDamageBonus}% (${damageBonus} points)`);
      }

      // Appliquer d'autres bonus spécifiques en fonction du type d'effet
      if (bonusDeckCombination?.isActive && bonusDeckCombination.effect) {
        // Bonus d'une combinaison de cartes
        bonusEffects.push(
          `${bonusDeckCombination.combination.name}: ${bonusDeckCombination.description}`
        );

        // Appliquer des effets spécifiques selon le type
        if (bonusDeckCombination.effect.type === 'nextSkillDamage') {
          // Bonus pour la compétence suivante uniquement
          const skillBonus = Math.floor(baseDamage * (bonusDeckCombination.effect.value / 100));
          totalDamage += skillBonus;
          bonusEffects.push(
            `Bonus de compétence: +${bonusDeckCombination.effect.value}% (${skillBonus} points)`
          );

          // Réinitialiser ce bonus après utilisation
          dispatch({ type: 'combat/clearNextSkillBonus' });
        }
      }

      // S'assurer que les dégâts sont au moins égaux à 1
      totalDamage = Math.max(1, Math.floor(totalDamage));

      console.log(
        'Évaluation de la main:',
        partialHandResult.handName,
        'Dégâts de base:',
        baseDamage,
        'Dégâts totaux:',
        totalDamage
      );

      // Dispatcher l'évaluation de la main avec les dégâts
      dispatch(
        evaluateSelectedHandAction({
          totalDamage,
          bonusEffects,
        })
      );

      // Feedback visuel
      dispatch(
        setActionFeedback({
          message: `Attaque avec ${partialHandResult.handName}, ${totalDamage} dégâts`,
          type: 'success',
        })
      );

      return {
        handName: partialHandResult.handName,
        baseDamage,
        totalDamage,
        bonusEffects,
      };
    } catch (error) {
      console.error("Erreur lors de l'attaque:", error);
      dispatch(
        setActionFeedback({
          message: "Erreur lors de l'attaque",
          type: 'error',
        })
      );
      return null;
    }
  }
);

/**
 * Traite l'attaque de l'ennemi
 */
export const processEnemyAttack = createAsyncThunk(
  'combat/processEnemyAttack',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const enemy = state.combat.enemy;
    const bonusDeckCombination = state.bonusCards.deckCombination;
    const defenseBonus = state.player.defenseBonus || 0;
    const isInvulnerable = state.combat.invulnerableNextTurn || false;

    if (!enemy || enemy.health <= 0) {
      return { attacked: false };
    }

    // Make the enemy attack (update log)
    dispatch(enemyAction());

    // Si le joueur est invulnérable, ignorer les dégâts
    if (isInvulnerable) {
      dispatch(
        setActionFeedback({
          message: 'Vous êtes invulnérable pour ce tour!',
          type: 'success',
        })
      );

      // Réinitialiser l'invulnérabilité après utilisation
      dispatch({ type: 'combat/setInvulnerableNextTurn', payload: false });

      return {
        attacked: true,
        damage: 0,
        blocked: true,
      };
    }

    // Calculer les dégâts en tenant compte du bonus de défense
    let damageAmount = enemy.attack;

    // Appliquer la réduction de dégâts grâce au bonus de défense
    if (defenseBonus > 0) {
      const damageReduction = Math.floor(enemy.attack * (defenseBonus / 100));
      damageAmount = Math.max(1, enemy.attack - damageReduction);

      dispatch(
        setActionFeedback({
          message: `Votre défense a réduit les dégâts de ${damageReduction} points!`,
          type: 'info',
        })
      );
    }

    // IMPORTANT: Use takeDamage to apply damage to the player
    dispatch(takeDamage(damageAmount));

    console.log(`Player took ${damageAmount} damage`);

    return {
      attacked: true,
      damage: damageAmount,
    };
  }
);

// Export des actions du slice (pas les thunks)
export { evaluateSelectedHandAction as evaluateSelectedHand };
