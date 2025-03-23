// src/redux/thunks/combatThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  setEnemy,
  dealHand,
  evaluateSelectedHand as evaluateSelectedHandAction,
  enemyAction,
  // Ne pas importer startCombat s'il n'est pas correctement exporté
} from '../slices/combatSlice';
import { setGamePhase, incrementStage } from '../slices/gameSlice';
import { setActionFeedback } from '../slices/uiSlice';
import { takeDamage } from '../slices/playerSlice'; // Important import for damage handling
import { evaluatePartialHand } from '../../core/hand-evaluation.js';

// Import and re-export specific thunks from combatCycleThunks
import {
  startCombatFromNode as importedStartCombatFromNode,
  processCombatVictory as importedProcessCombatVictory,
  checkCombatEnd as importedCheckCombatEnd,
  executeCombatTurn as importedExecuteCombatTurn,
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
      type: 'boss', // Ajout du type boss pour faciliter l'identification
    },
    {
      name: 'Demon Lord',
      health: Math.floor(180 * healthMultiplier),
      maxHealth: Math.floor(180 * healthMultiplier),
      attack: Math.floor(20 * damageMultiplier),
      image: '👿',
      abilities: ['darkmagic'],
      type: 'boss', // Ajout du type boss pour faciliter l'identification
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
      console.log("Démarrage d'un nouveau combat");
      // Récupérer le niveau actuel
      const stage = getState().game.stage || 1;

      // Générer un ennemi
      const enemy = generateEnemy(stage, isElite, isBoss);
      console.log('Ennemi généré:', enemy);

      // Dispatcher l'action pour définir l'ennemi
      dispatch(setEnemy(enemy));

      // Solution alternative: Nous n'utilisons pas startCombat mais nous construisons
      // directement l'état de combat en utilisant les actions disponibles
      // Changer la phase du jeu en premier
      dispatch(setGamePhase('combat'));

      // Ensuite distribuer les cartes
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

      console.log('Attaque avec cartes sélectionnées:', selectedCardsIndices);

      // Extraire les cartes sélectionnées
      const selectedCards = selectedCardsIndices.map((index) => hand[index]).filter((card) => card);

      // Évaluer la main
      const partialHandResult = evaluatePartialHand(selectedCards);

      // Calculer les dégâts
      const baseDamage = partialHandResult.baseDamage;
      const totalDamage = Math.max(1, Math.floor(baseDamage));

      console.log('Évaluation de la main:', partialHandResult.handName, 'Dégâts:', totalDamage);

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

/**
 * Traite l'attaque de l'ennemi
 */
export const processEnemyAttack = createAsyncThunk(
  'combat/processEnemyAttack',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const enemy = state.combat.enemy;

    if (!enemy || enemy.health <= 0) {
      return { attacked: false };
    }

    // Faire attaquer l'ennemi (mettre à jour le journal)
    dispatch(enemyAction());

    // Réduire les PV du joueur - Cette ligne est cruciale
    dispatch(takeDamage(enemy.attack));

    console.log(`Joueur a subi ${enemy.attack} dégâts`);

    return {
      attacked: true,
      damage: enemy.attack,
    };
  }
);

// Export des actions du slice (pas les thunks)
export { evaluateSelectedHandAction as evaluateSelectedHand };
