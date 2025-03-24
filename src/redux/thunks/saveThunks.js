// src/redux/thunks/saveThunks.js - Correction pour le chargement de l'état de combat

import { createAsyncThunk } from '@reduxjs/toolkit';
import { setLoading, setError, setActionFeedback } from '../slices/uiSlice';
import { resetPlayer, LOAD_SAVED_DATA as LOAD_PLAYER_DATA } from '../slices/playerSlice';
import { resetGame, LOAD_SAVED_DATA as LOAD_GAME_DATA, setGamePhase } from '../slices/gameSlice';
import {
  resetCombatState,
  LOAD_SAVED_DATA as LOAD_COMBAT_DATA,
  startCombat,
  setEnemy,
  setTurnPhase,
} from '../slices/combatSlice';
import {
  resetBonusCards,
  LOAD_SAVED_DATA as LOAD_BONUS_CARDS_DATA,
  initCollection,
} from '../slices/bonusCardsSlice';
import { resetMap, LOAD_SAVED_DATA as LOAD_MAP_DATA } from '../slices/mapSlice';
import { resetShop, LOAD_SAVED_DATA as LOAD_SHOP_DATA } from '../slices/shopSlice';
import { resetUi } from '../slices/uiSlice';
import { resetAllEvents, LOAD_SAVED_DATA as LOAD_EVENT_DATA } from '../slices/eventSlice';
import { generateNewMap } from './mapThunks';
import { selectGameSaveState } from '../selectors/gameSelectors';

const SAVE_KEY = 'pokerSoloRpgSave';

/**
 * Sauvegarde l'état actuel du jeu dans le localStorage
 * @returns {Promise<{success: boolean}>} - Résultat de la sauvegarde
 */
export const saveGame = createAsyncThunk('save/saveGame', async (_, { dispatch, getState }) => {
  try {
    const state = getState();

    // Structure de sauvegarde plus complète incluant l'état de combat
    const saveData = {
      version: '1.2',
      timestamp: Date.now(),
      player: {
        health: state.player.health,
        maxHealth: state.player.maxHealth,
        gold: state.player.gold,
        level: state.player.level,
        experience: state.player.experience,
        inventory: state.player.inventory || [],
        shield: state.player.shield || 0,
      },
      game: {
        stage: state.game.stage,
        currentFloor: state.game.currentFloor || 1,
        maxFloors: state.game.maxFloors || 10,
        gamePhase: state.game.gamePhase || 'exploration',
        exploreEnabled: state.game.exploreEnabled,
        collectionAccessLevel: state.game.collectionAccessLevel,
        shopAccessible: state.game.shopAccessible,
        stats: state.game.stats || {},
      },
      map: {
        path: state.map.path || [],
        currentNodeId: state.map.currentNodeId,
      },
      bonusCards: {
        collection: state.bonusCards.collection.map((card) => ({
          id: card.id,
          owned: card.owned !== false,
          level: card.level || 1,
        })),
        active: state.bonusCards.active.map((card) => ({
          id: card.id,
          usesRemaining: card.usesRemaining || 0,
        })),
        maxSlots: state.bonusCards.maxSlots,
      },
      combat:
        state.game.gamePhase === 'combat'
          ? {
              enemy: state.combat.enemy,
              hand: state.combat.hand,
              selectedCards: state.combat.selectedCards,
              deck: state.combat.deck,
              discard: state.combat.discard,
              turnPhase: state.combat.turnPhase,
              handResult: state.combat.handResult,
              combatLog: state.combat.combatLog || [],
            }
          : null,
      shop: {
        items: state.shop.items || [],
        itemsPurchased: state.shop.itemsPurchased || {},
      },
      event:
        state.game.gamePhase === 'event'
          ? {
              currentEvent: state.event.currentEvent,
              eventResult: state.event.eventResult,
              eventHistory: state.event.eventHistory || [],
            }
          : null,
    };

    // Sauvegarder dans le localStorage
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));

    // Feedback de succès
    dispatch(
      setActionFeedback({
        message: 'Partie sauvegardée avec succès',
        type: 'success',
        duration: 2000,
      })
    );

    return { success: true, timestamp: Date.now() };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du jeu:', error);

    dispatch(
      setActionFeedback({
        message: 'Erreur lors de la sauvegarde',
        type: 'error',
      })
    );

    return { success: false, error: error.message };
  }
});

/**
 * Charge une sauvegarde depuis le localStorage
 */
export const loadGame = createAsyncThunk('save/loadGame', async (_, { dispatch }) => {
  try {
    dispatch(setLoading(true));

    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) {
      dispatch(
        setActionFeedback({
          message: 'Aucune sauvegarde trouvée',
          type: 'warning',
        })
      );
      dispatch(setLoading(false));

      // Initialize a new game if no save exists
      dispatch(initCollection());
      await dispatch(generateNewMap({ width: 3, depth: 5 }));

      return { success: false, reason: 'no_save' };
    }

    const saveData = JSON.parse(savedData);
    console.log('Données de sauvegarde chargées:', saveData);

    // Reset all states first
    dispatch(resetPlayer());
    dispatch(resetCombatState());
    dispatch(resetBonusCards());
    dispatch(resetMap());
    dispatch(resetShop());
    dispatch(resetUi());
    dispatch(resetAllEvents());
    dispatch(resetGame());

    // Load each slice's saved data
    if (saveData.player) {
      dispatch(LOAD_PLAYER_DATA(saveData.player));
    }

    if (saveData.map && saveData.map.path && saveData.map.path.length) {
      dispatch(LOAD_MAP_DATA(saveData.map));
    } else {
      // Generate a new map if no map in save
      await dispatch(generateNewMap({ width: 3, depth: 5 }));
    }

    if (saveData.bonusCards) {
      dispatch(LOAD_BONUS_CARDS_DATA(saveData.bonusCards));
    } else {
      dispatch(initCollection());
    }

    if (saveData.shop) {
      dispatch(LOAD_SHOP_DATA(saveData.shop));
    }

    // Load combat state explicitly if in combat phase
    if (saveData.combat && saveData.game.gamePhase === 'combat') {
      // Important: Pour les états de combat, nous devons utiliser les actions spécifiques
      // au lieu de LOAD_COMBAT_DATA générique qui pourrait ne pas traiter tous les aspects

      console.log("Chargement de l'état de combat:", saveData.combat);

      // D'abord, démarrer un nouveau combat avec l'ennemi sauvegardé
      if (saveData.combat.enemy) {
        dispatch(startCombat(saveData.combat.enemy));
        dispatch(setEnemy(saveData.combat.enemy));
      }

      // Ensuite, charger le reste des données de combat
      dispatch(LOAD_COMBAT_DATA(saveData.combat));

      // Assurez-vous que la phase de tour est correctement définie
      if (saveData.combat.turnPhase) {
        dispatch(setTurnPhase(saveData.combat.turnPhase));
      }
    }

    if (saveData.event) {
      dispatch(LOAD_EVENT_DATA(saveData.event));
    }

    // Important: Charger la phase du jeu en dernier pour s'assurer
    // que toutes les données spécifiques à la phase sont déjà chargées
    if (saveData.game) {
      dispatch(LOAD_GAME_DATA(saveData.game));

      // Réappliquer explicitement la phase du jeu pour déclencher toutes les logiques associées
      if (saveData.game.gamePhase) {
        dispatch(setGamePhase(saveData.game.gamePhase));
      }
    }

    dispatch(setLoading(false));
    dispatch(
      setActionFeedback({
        message: 'Partie chargée avec succès',
        type: 'success',
      })
    );

    return { success: true };
  } catch (error) {
    console.error('Error loading game:', error);

    dispatch(setLoading(false));
    dispatch(setError('Erreur lors du chargement'));
    dispatch(
      setActionFeedback({
        message: 'Erreur lors du chargement de la sauvegarde',
        type: 'error',
      })
    );

    // Initialize a new game in case of loading error
    dispatch(initCollection());
    await dispatch(generateNewMap({ width: 3, depth: 5 }));

    return { success: false, error: error.message };
  }
});

// Autres fonctions existantes...
/**
 * Supprime la sauvegarde du localStorage
 * @returns {Promise<{success: boolean}>} - Résultat de la suppression
 */
export const deleteSave = createAsyncThunk('save/deleteSave', async (_, { dispatch }) => {
  try {
    // Supprimer la sauvegarde du localStorage
    localStorage.removeItem(SAVE_KEY);

    // Réinitialiser tous les états
    dispatch(resetPlayer());
    dispatch(resetCombatState());
    dispatch(resetBonusCards());
    dispatch(resetMap());
    dispatch(resetShop());
    dispatch(resetUi());
    dispatch(resetAllEvents());
    dispatch(resetGame());

    // Initialiser une nouvelle collection de cartes bonus
    dispatch(initCollection());

    // Générer une nouvelle carte
    await dispatch(generateNewMap({ width: 3, depth: 5 }));

    // Feedback de succès
    dispatch(
      setActionFeedback({
        message: 'Sauvegarde supprimée avec succès',
        type: 'success',
      })
    );

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de la sauvegarde:', error);

    dispatch(
      setActionFeedback({
        message: 'Erreur lors de la suppression de la sauvegarde',
        type: 'error',
      })
    );

    return { success: false, error: error.message };
  }
});

/**
 * Réinitialise complètement le jeu, similaire à deleteSave mais avec un focus sur la réinitialisation
 * @returns {Promise<{success: boolean}>} - Résultat de la réinitialisation
 */
export const resetEntireGame = createAsyncThunk('save/resetEntireGame', async (_, { dispatch }) => {
  try {
    // Supprimer la sauvegarde du localStorage
    localStorage.removeItem(SAVE_KEY);

    // Réinitialiser tous les états
    dispatch(resetPlayer());
    dispatch(resetCombatState());
    dispatch(resetBonusCards());
    dispatch(resetMap());
    dispatch(resetShop());
    dispatch(resetUi());
    dispatch(resetAllEvents());
    dispatch(resetGame());

    // Initialiser une nouvelle collection de cartes bonus
    dispatch(initCollection());

    // Générer une nouvelle carte
    await dispatch(generateNewMap({ width: 3, depth: 5 }));

    // Feedback de succès
    dispatch(
      setActionFeedback({
        message: 'Jeu réinitialisé. Nouvelle partie démarrée !',
        type: 'success',
      })
    );

    // Réinitialiser la phase de jeu à l'exploration
    dispatch(setGamePhase('exploration'));

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du jeu:', error);

    dispatch(
      setActionFeedback({
        message: 'Erreur lors de la réinitialisation du jeu',
        type: 'error',
      })
    );

    return { success: false, error: error.message };
  }
});

export default {
  saveGame,
  loadGame,
  deleteSave,
  resetEntireGame,
};
