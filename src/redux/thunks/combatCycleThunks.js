// src/redux/thunks/combatCycleThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  startCombat,
  dealHand,
  evaluateSelectedHand,
  enemyAction,
  addToCombatLog,
  setTurnPhase,
} from '../slices/combatSlice';
import {
  takeDamage, // S'assurer que cet import est présent
  addExperience,
  addGold,
  addShield,
  heal as healPlayer,
} from '../slices/playerSlice';
import { setGamePhase, incrementStage, updateStats } from '../slices/gameSlice';
import { setActionFeedback } from '../slices/uiSlice';
import { resetCardUses } from '../slices/bonusCardsSlice';
import { selectNode } from '../slices/mapSlice';

/**
 * Génère un ennemi approprié en fonction du niveau et du type
 * @param {number} stage - Le niveau actuel du jeu
 * @param {boolean} isElite - Si l'ennemi est de type élite
 * @param {boolean} isBoss - Si l'ennemi est un boss
 * @returns {Object} - Un objet représentant l'ennemi généré
 */
export function generateEnemy(stage, isElite = false, isBoss = false) {
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
      type: 'boss',
    },
    {
      name: 'Demon Lord',
      health: Math.floor(180 * healthMultiplier),
      maxHealth: Math.floor(180 * healthMultiplier),
      attack: Math.floor(20 * damageMultiplier),
      image: '👿',
      abilities: ['darkmagic'],
      type: 'boss',
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
 * Thunk pour démarrer un combat à partir d'un nœud de la carte
 */
export const startCombatFromNode = createAsyncThunk(
  'combat/startCombatFromNode',
  async ({ nodeId }, { dispatch, getState }) => {
    try {
      console.log("Démarrage d'un combat depuis le nœud:", nodeId);

      // Sélectionner le nœud pour marquer la progression sur la carte
      dispatch(selectNode(nodeId));

      const state = getState();
      const nodes = state.map.path;
      const selectedNode = nodes.find((node) => node.id === nodeId);

      if (!selectedNode) {
        throw new Error(`Nœud avec ID ${nodeId} non trouvé`);
      }

      console.log('Type de nœud pour ce combat:', selectedNode.type);

      // Déterminer le type d'ennemi en fonction du type de nœud
      const isElite = selectedNode.type === 'elite';
      const isBoss = selectedNode.type === 'boss';

      // Générer l'ennemi approprié
      const enemy = generateEnemy(state.game.stage, isElite, isBoss);
      console.log('Ennemi généré:', enemy.name, 'PV:', enemy.health);

      // Utiliser startCombatAction pour initialiser l'état de combat
      dispatch(startCombatAction(enemy));
      dispatch(setGamePhase('combat'));
      dispatch(resetCardUses());

      // Log pour confirmer l'initialisation
      console.log('Combat initialisé, phase:', state.game.gamePhase, 'tour:', 'draw');

      // Distribuer automatiquement la première main
      console.log('Distribution de la première main...');
      dispatch(dealHand());
      console.log('Première main distribuée');

      // Ajouter au journal de combat
      dispatch(addToCombatLog(`Combat début! Vous affrontez un ${enemy.name}.`));

      // Feedback pour le joueur
      dispatch(
        setActionFeedback({
          message: `Combat contre ${enemy.name}`,
          type: 'info',
        })
      );

      return enemy;
    } catch (error) {
      console.error('Error starting combat from node:', error);
      dispatch(
        setActionFeedback({
          message: 'Erreur lors du démarrage du combat',
          type: 'error',
        })
      );
      return null;
    }
  }
);
/**
 * Thunk pour traiter la fin d'un combat (victoire)
 */
export const processCombatVictory = createAsyncThunk(
  'combat/processCombatVictory',
  async (_, { dispatch, getState }) => {
    try {
      const state = getState();
      const stage = state.game.stage;
      const enemy = state.combat.enemy;

      if (!enemy) {
        throw new Error('Aucun ennemi présent pour la victoire');
      }

      // Calculer les récompenses
      const isElite = enemy.abilities && enemy.abilities.length > 0;
      const isBoss = enemy.health > 100 || enemy.type === 'boss'; // Simple heuristique

      // Base gold and XP
      const goldBase = 10 + stage * 5;
      const xpBase = 5 + stage * 2;

      // Multiplicateurs selon le type d'ennemi
      let goldMultiplier = 1.0;
      let xpMultiplier = 1.0;

      if (isElite) {
        goldMultiplier = 1.5;
        xpMultiplier = 1.5;
      }

      if (isBoss) {
        goldMultiplier = 2.0;
        xpMultiplier = 2.0;
      }

      // Calculer les récompenses finales
      const goldReward = Math.floor(goldBase * goldMultiplier);
      const xpReward = Math.floor(xpBase * xpMultiplier);

      // Distribuer les récompenses
      dispatch(addGold(goldReward));
      dispatch(addExperience(xpReward));

      // Mettre à jour les statistiques
      dispatch(updateStats({ type: 'enemiesDefeated', value: 1 }));
      dispatch(updateStats({ type: 'goldEarned', value: goldReward }));

      // Soins légers après le combat
      const healAmount = Math.floor(state.player.maxHealth * 0.1);
      if (healAmount > 0) {
        dispatch(healPlayer(healAmount));
        dispatch(addToCombatLog(`Vous récupérez ${healAmount} PV après le combat.`));
      }

      // Ajouter au journal de combat
      dispatch(addToCombatLog(`Vous avez vaincu ${enemy.name}!`));
      dispatch(addToCombatLog(`Vous gagnez ${goldReward} or et ${xpReward} XP.`));

      // Passer à la phase de récompense
      dispatch(setGamePhase('reward'));

      // Feedback pour le joueur
      dispatch(
        setActionFeedback({
          message: `Victoire! ${goldReward} or et ${xpReward} XP gagnés.`,
          type: 'success',
          duration: 3000,
        })
      );

      return {
        goldReward,
        xpReward,
        healAmount,
      };
    } catch (error) {
      console.error('Error processing combat victory:', error);
      dispatch(
        setActionFeedback({
          message: 'Erreur lors du traitement de la victoire',
          type: 'error',
        })
      );
      return null;
    }
  }
);

/**
 * Thunk pour vérifier la fin du combat après chaque action
 */
export const checkCombatEnd = createAsyncThunk(
  'combat/checkCombatEnd',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const enemy = state.combat.enemy;
    const player = state.player;

    // Vérifier si le joueur est vaincu
    if (player.health <= 0) {
      dispatch(setGamePhase('gameOver'));
      dispatch(addToCombatLog('Game Over! Vous avez été vaincu.'));
      dispatch(
        setActionFeedback({
          message: 'Game Over! Vous avez été vaincu.',
          type: 'error',
          duration: 5000,
        })
      );
      return { status: 'defeat' };
    }

    // Vérifier si l'ennemi est vaincu
    if (enemy && enemy.health <= 0) {
      // Traiter la victoire
      dispatch(processCombatVictory());
      return { status: 'victory' };
    }

    return { status: 'ongoing' };
  }
);

/**
 * Thunk pour exécuter un tour de combat complet
 */
export const executeCombatTurn = createAsyncThunk(
  'combat/executeCombatTurn',
  async (_, { dispatch, getState }) => {
    try {
      console.log('Exécution du tour de combat');
      const state = getState();

      // 1. S'assurer qu'on est en phase de combat
      if (state.game.gamePhase !== 'combat') {
        console.log('Non en phase de combat, phase actuelle:', state.game.gamePhase);
        return { status: 'not_in_combat' };
      }

      // 2. Distribuer une nouvelle main si en phase de tirage
      if (state.combat.turnPhase === 'draw') {
        console.log('Phase de tirage détectée, distribution de cartes');
        dispatch(dealHand());
        dispatch(setTurnPhase('select'));
        return { status: 'hand_dealt' };
      }

      // 3. Exécuter l'attaque si des cartes sont sélectionnées
      if (state.combat.turnPhase === 'select' && state.combat.selectedCards.length > 0) {
        console.log('Attaque du joueur avec', state.combat.selectedCards.length, 'cartes');
        dispatch(evaluateSelectedHand());

        // Vérifier si l'ennemi est encore en vie APRÈS l'attaque du joueur
        const afterAttackState = getState();
        console.log(
          "État de l'ennemi après attaque:",
          afterAttackState.combat.enemy?.health,
          '/',
          afterAttackState.combat.enemy?.maxHealth
        );

        if (afterAttackState.combat.enemy && afterAttackState.combat.enemy.health > 0) {
          console.log("L'ennemi contre-attaque");

          // Action de l'ennemi (journal)
          dispatch(enemyAction());

          // Réduire les PV du joueur - C'est ici que nous corrigeons le problème
          const enemyAttack = afterAttackState.combat.enemy.attack;
          console.log(`Réduction des PV du joueur de ${enemyAttack}`);
          dispatch(takeDamage(enemyAttack));
        } else {
          console.log('Ennemi vaincu, pas de contre-attaque');
        }

        // Vérifier si le combat est terminé
        const combatStatus = await dispatch(checkCombatEnd()).unwrap();
        return { status: 'turn_completed', combatStatus };
      }

      console.log('En attente de sélection de cartes');
      return { status: 'waiting_for_selection' };
    } catch (error) {
      console.error('Error executing combat turn:', error);
      dispatch(
        setActionFeedback({
          message: "Erreur lors de l'exécution du tour de combat",
          type: 'error',
        })
      );
      return { status: 'error', error: error.message };
    }
  }
);
/**
 * Thunk pour continuer après une victoire
 * Transition vers la phase suivante du jeu
 */
export const continueAfterVictory = createAsyncThunk(
  'combat/continueAfterVictory',
  async (_, { dispatch, getState }) => {
    try {
      const state = getState();
      const enemy = state.combat.enemy;
      const isBoss =
        enemy &&
        (enemy.type === 'boss' ||
          enemy.abilities?.includes('firebreath') ||
          enemy.abilities?.includes('darkmagic'));

      // Si c'était un boss, incrémenter l'étage
      if (isBoss) {
        dispatch(incrementStage());
      }

      // Transition vers l'exploration
      dispatch(setGamePhase('exploration'));

      return { success: true };
    } catch (error) {
      console.error('Error transitioning after victory:', error);
      dispatch(
        setActionFeedback({
          message: 'Erreur lors de la transition après victoire',
          type: 'error',
        })
      );
      return { success: false, error: error.message };
    }
  }
);
