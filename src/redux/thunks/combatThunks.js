// src/redux/thunks/combatThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  setEnemy,
  startCombat,
  evaluateSelectedHand as evaluateSelectedHandAction,
} from '../slices/combatSlice';
import { setGamePhase } from '../slices/gameSlice';
import { setActionFeedback } from '../slices/uiSlice';
import {
  evaluatePartialHand,
  calculateDamage,
} from '../../utils/handEvaluationUtils';

// Import and re-export specific thunks from combatCycleThunks
import * as combatCycleThunks from './combatCycleThunks';

// Directly export the individual thunks
export const startCombatFromNode = combatCycleThunks.startCombatFromNode;
export const processCombatVictory = combatCycleThunks.processCombatVictory;
export const checkCombatEnd = combatCycleThunks.checkCombatEnd;
export const executeCombatTurn = combatCycleThunks.executeCombatTurn;
export const continueAfterVictory = combatCycleThunks.continueAfterVictory;

/**
 * Génère un ennemi approprié en fonction du niveau et du type
 * @param {number} stage - Le niveau actuel du jeu
 * @param {boolean} isElite - Si l'ennemi est de type élite
 * @param {boolean} isBoss - Si l'ennemi est un boss
 * @returns {Object} - Un objet représentant l'ennemi généré
 */
export function generateEnemy(stage = 1, isElite = false, isBoss = false) {
  // Scaling basé sur le niveau
  const healthMultiplier = 1 + stage * 0.1;
  const damageMultiplier = 1 + stage * 0.1;

  // Base enemies pool
  const baseEnemies = [
    {
      name: 'Goblin',
      health: Math.floor(40 * healthMultiplier),
      maxHealth: Math.floor(40 * healthMultiplier),
      attack: Math.floor(8 * damageMultiplier),
      image: '👺',
    },
    {
      name: 'Orc',
      health: Math.floor(50 * healthMultiplier),
      maxHealth: Math.floor(50 * healthMultiplier),
      attack: Math.floor(10 * damageMultiplier),
      image: '👹',
    },
    {
      name: 'Skeleton',
      health: Math.floor(35 * healthMultiplier),
      maxHealth: Math.floor(35 * healthMultiplier),
      attack: Math.floor(7 * damageMultiplier),
      image: '💀',
    },
  ];

  // Elite enemies pool
  const eliteEnemies = [
    {
      name: 'Dark Knight',
      health: Math.floor(80 * healthMultiplier),
      maxHealth: Math.floor(80 * healthMultiplier),
      attack: Math.floor(14 * damageMultiplier),
      image: '🧟',
      abilities: ['armor'],
    },
    {
      name: 'Troll Berserker',
      health: Math.floor(90 * healthMultiplier),
      maxHealth: Math.floor(90 * healthMultiplier),
      attack: Math.floor(16 * damageMultiplier),
      image: '👹',
      abilities: ['rage'],
    },
  ];

  // Boss enemies pool
  const bossEnemies = [
    {
      name: 'Dragon',
      health: Math.floor(150 * healthMultiplier),
      maxHealth: Math.floor(150 * healthMultiplier),
      attack: Math.floor(18 * damageMultiplier),
      image: '🐉',
      abilities: ['firebreath'],
    },
    {
      name: 'Demon Lord',
      health: Math.floor(180 * healthMultiplier),
      maxHealth: Math.floor(180 * healthMultiplier),
      attack: Math.floor(20 * damageMultiplier),
      image: '👿',
      abilities: ['darkmagic'],
    },
  ];

  // Sélectionner l'ennemi en fonction du type
  let enemyPool;
  if (isBoss) {
    enemyPool = bossEnemies;
  } else if (isElite) {
    enemyPool = eliteEnemies;
  } else {
    enemyPool = baseEnemies;
  }

  // Sélectionner un ennemi aléatoire de la piscine
  const randomIndex = Math.floor(Math.random() * enemyPool.length);
  return enemyPool[randomIndex];
}

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
      // Récupérer le niveau actuel
      const stage = getState().game.stage || 1;

      // Générer un ennemi
      const enemy = generateEnemy(stage, isElite, isBoss);

      // Dispatcher l'action pour définir l'ennemi et commencer le combat
      dispatch(setEnemy(enemy));
      dispatch(startCombat(enemy));
      dispatch(setGamePhase('combat'));

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

      // Extraire les cartes sélectionnées
      const selectedCards = selectedCardsIndices
        .map((index) => hand[index])
        .filter((card) => card);

      // Évaluer la main
      const partialHandResult = evaluatePartialHand(selectedCards);

      // Calculer les dégâts
      const baseDamage = partialHandResult.baseDamage;
      const totalDamage = Math.max(1, Math.floor(baseDamage));

      // Préparer les bonus
      const bonusEffects = [];

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

// Exporter toutes les actions liées au combat
export { startCombat, evaluateSelectedHandAction as evaluateSelectedHand };
