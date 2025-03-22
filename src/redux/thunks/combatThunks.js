// src/redux/thunks/combatThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  evaluateSelectedHand,
  startCombat,
  enemyAction,
  setTurnPhase,
  addToCombatLog,
} from '../slices/combatSlice';
import { takeDamage, addExperience, addGold } from '../slices/playerSlice';
import { setGamePhase, incrementStage, updateStats } from '../slices/gameSlice';
import { setActionFeedback } from '../slices/uiSlice';
import { resetCardUses } from '../slices/bonusCardsSlice';

// Thunk pour générer un ennemi et démarrer un combat
export const startNewCombat = createAsyncThunk(
  'combat/startNewCombat',
  async ({ isElite = false, isBoss = false }, { dispatch, getState }) => {
    try {
      // Générer un ennemi approprié en fonction du niveau actuel
      const state = getState();
      const stage = state.game.stage;

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
      const enemy = enemyPool[randomIndex];

      // Démarrer le combat avec cet ennemi
      dispatch(startCombat(enemy));

      // Changer la phase du jeu
      dispatch(setGamePhase('combat'));

      // Réinitialiser les utilisations des cartes bonus
      dispatch(resetCardUses());

      return enemy;
    } catch (error) {
      console.error('Error starting combat:', error);
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

// Thunk pour attaquer l'ennemi
export const attackEnemy = createAsyncThunk(
  'combat/attack',
  async (_, { dispatch, getState }) => {
    try {
      const state = getState();

      // Calculer les bonus de dégâts à partir des cartes bonus actives
      const activeBonusCards = state.bonusCards.active;
      const combatState = state.combat;

      // Extraire les cartes sélectionnées
      const selectedCards = combatState.selectedCards.map(
        (index) => combatState.hand[index]
      );

      // Déterminer s'il s'agit d'une main de poker (5 cartes) ou d'une valeur numérique simple
      let baseDamage, handRank, handName;

      if (selectedCards.length === 5) {
        // Évaluer la main de poker
        // Note: Dans une implémentation réelle, vous importeriez et utiliseriez vos fonctions d'évaluation de main
        // Ici nous simulons un résultat
        const result = {
          baseDamage: 16, // Valeur simulée
          handRank: 2, // Valeur simulée
          handName: 'Pair', // Valeur simulée
        };

        baseDamage = result.baseDamage;
        handRank = result.handRank;
        handName = result.handName;
      } else {
        // Calculer la somme des valeurs numériques
        baseDamage = selectedCards.reduce(
          (sum, card) => sum + (card.numericValue || 0),
          0
        );
        handRank = 0;
        handName = `${selectedCards.length} Carte${selectedCards.length > 1 ? 's' : ''}`;
      }

      // Appliquer les bonus des cartes
      let totalDamage = baseDamage;
      const bonusEffects = [];

      // Bonus flat en attente
      if (combatState.pendingDamageBonus > 0) {
        totalDamage += combatState.pendingDamageBonus;
        bonusEffects.push(
          `Bonus de dégâts: +${combatState.pendingDamageBonus}`
        );
      }

      // Multiplicateur de dégâts en attente
      if (combatState.pendingDamageMultiplier > 1) {
        const baseValue = totalDamage;
        totalDamage = Math.floor(
          totalDamage * combatState.pendingDamageMultiplier
        );
        bonusEffects.push(
          `Multiplicateur: x${combatState.pendingDamageMultiplier} (${baseValue} → ${totalDamage})`
        );
      }

      // Appliquer les bonus passifs des cartes
      activeBonusCards.forEach((card) => {
        if (card.effect === 'passive') {
          // Bonus pour certains types de mains
          if (card.condition === handName && card.bonus?.type === 'damage') {
            totalDamage += card.bonus.value;
            bonusEffects.push(`${card.name}: +${card.bonus.value} dégâts`);
          }

          // Bonus constant
          else if (
            card.condition === 'always' &&
            card.bonus?.type === 'damage'
          ) {
            totalDamage += card.bonus.value;
            bonusEffects.push(`${card.name}: +${card.bonus.value} dégâts`);
          }

          // Bonus après avoir subi des dégâts
          else if (
            card.condition === 'damageTaken' &&
            combatState.playerDamagedLastTurn &&
            card.bonus?.type === 'damage'
          ) {
            totalDamage += card.bonus.value;
            bonusEffects.push(
              `${card.name}: +${card.bonus.value} dégâts (après dégâts)`
            );
          }
        }
      });

      // Évaluer la main avec les bonus calculés
      dispatch(evaluateSelectedHand({ totalDamage, bonusEffects }));

      // Obtenir l'état mis à jour après l'évaluation
      const updatedState = getState();
      const enemy = updatedState.combat.enemy;

      // Si l'ennemi est encore en vie, l'ennemi attaque
      if (enemy && enemy.health > 0) {
        // Exécuter l'attaque de l'ennemi
        dispatch(enemyAction());

        // Appliquer les dégâts au joueur
        // Dans un cas réel, cela serait fait dans le reducer enemyAction
        // mais comme nous migrons d'un contexte, nous le faisons ici par souci de clarté
        const damageToPlayer = enemy.attack;

        // Réduire les dégâts en fonction du bouclier
        let actualDamage = damageToPlayer;
        if (updatedState.player.shield > 0) {
          const absorbedDamage = Math.min(
            updatedState.player.shield,
            damageToPlayer
          );
          actualDamage -= absorbedDamage;
          dispatch(
            addToCombatLog(`Votre bouclier absorbe ${absorbedDamage} dégâts.`)
          );
        }

        if (actualDamage > 0 && !updatedState.combat.invulnerableNextTurn) {
          dispatch(takeDamage(actualDamage));
        }

        // Vérifier si le joueur est vaincu
        const playerAfterDamage = getState().player;
        if (playerAfterDamage.health <= 0) {
          dispatch(setGamePhase('gameOver'));
          dispatch(
            setActionFeedback({
              message: 'Game Over! Vous avez été vaincu.',
              type: 'error',
              duration: 5000,
            })
          );
          return { gameOver: true };
        }
      }
      // Si l'ennemi est vaincu, passer à la phase de récompense
      else {
        dispatch(setGamePhase('reward'));

        // Attribuer les récompenses
        const goldReward = 10 + Math.floor(Math.random() * 20);
        const xpReward = 5 + Math.floor(Math.random() * 10);

        dispatch(addGold(goldReward));
        dispatch(addExperience(xpReward));
        dispatch(updateStats({ type: 'enemiesDefeated', value: 1 }));
        dispatch(updateStats({ type: 'goldEarned', value: goldReward }));

        dispatch(
          addToCombatLog(`Vous gagnez ${goldReward} or et ${xpReward} XP.`)
        );

        dispatch(
          setActionFeedback({
            message: `Victoire! ${goldReward} or et ${xpReward} XP gagnés.`,
            type: 'success',
            duration: 3000,
          })
        );

        return { victory: true, rewards: { gold: goldReward, xp: xpReward } };
      }

      return { continueCombat: true };
    } catch (error) {
      console.error('Error during attack:', error);
      dispatch(
        setActionFeedback({
          message: "Erreur lors de l'attaque",
          type: 'error',
        })
      );
      return { error: true };
    }
  }
);

// Thunk pour continuer après la victoire
export const continueAfterVictory = createAsyncThunk(
  'combat/continueAfterVictory',
  async (_, { dispatch, getState }) => {
    // Incrémenter l'étage
    dispatch(incrementStage());

    // Attendre un peu pour les animations
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Retourner à l'exploration
    dispatch(setGamePhase('exploration'));

    return { success: true };
  }
);
