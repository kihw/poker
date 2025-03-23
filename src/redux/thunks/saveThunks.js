// src/redux/thunks/saveThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setLoading, setError, setActionFeedback } from '../slices/uiSlice';
import {
  resetPlayer,
  LOAD_SAVED_DATA as LOAD_PLAYER_DATA,
} from '../slices/playerSlice';
import {
  resetGame,
  LOAD_SAVED_DATA as LOAD_GAME_DATA,
} from '../slices/gameSlice';
import { resetCombatState } from '../slices/combatSlice';
import {
  resetBonusCards,
  LOAD_SAVED_DATA as LOAD_BONUS_CARDS_DATA,
  initCollection
} from '../slices/bonusCardsSlice';
import { resetMap, LOAD_SAVED_DATA as LOAD_MAP_DATA } from '../slices/mapSlice';
import {
  resetShop,
  LOAD_SAVED_DATA as LOAD_SHOP_DATA,
} from '../slices/shopSlice';
import { resetUi } from '../slices/uiSlice';
import { generateNewMap } from './mapThunks';

// Clé de sauvegarde dans le localStorage
const SAVE_KEY = 'pokerSoloRpgSave';

// Thunk pour sauvegarder le jeu
export const saveGame = createAsyncThunk(
  'save/saveGame',
  async (_, { dispatch, getState }) => {
    try {
      dispatch(setLoading(true));

      const state = getState();

      // Créer un objet de sauvegarde avec les données essentielles
      const saveData = {
        version: '1.1', // Version incrémentée
        timestamp: Date.now(),
        player: { ...state.player },
        game: {
          stage: state.game.stage,
          currentFloor: state.game.currentFloor,
          maxFloors: state.game.maxFloors,
          gamePhase: state.game.gamePhase,
          stats: { ...state.game.stats },
        },
        map: {
          path: state.map.path,
          currentNodeId: state.map.currentNodeId,
        },
        bonusCards: {
          collection: state.bonusCards.collection?.map((card) => ({
            id: card.id,
            owned: card.owned !== false,
            level: card.level || 1,
          })) || [],
          active: state.bonusCards.active?.map((card) => ({
            id: card.id,
            usesRemaining: card.usesRemaining || 0,
          })) || [],
          maxSlots: state.bonusCards.maxSlots || 3,
        },
        shop: {
          itemsPurchased: state.shop.itemsPurchased || {},
        },
      };

      // Sauvegarder dans le localStorage
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));

      dispatch(setLoading(false));
      dispatch(
        setActionFeedback({
          message: 'Partie sauvegardée avec succès',
          type: 'success',
        })
      );

      return { success: true };
    } catch (error) {
      console.error('Error saving game:', error);

      dispatch(setLoading(false));
      dispatch(setError('Erreur lors de la sauvegarde'));
      dispatch(
        setActionFeedback({
          message: 'Erreur lors de la sauvegarde',
          type: 'error',
        })
      );

      return { success: false, error: error.message };
    }
  }
);

// Thunk pour charger le jeu
export const loadGame = createAsyncThunk(
  'save/loadGame',
  async (_, { dispatch, getState }) => {
    try {
      dispatch(setLoading(true));

      // Récupérer les données de sauvegarde
      const savedData = localStorage.getItem(SAVE_KEY);
      if (!savedData) {
        dispatch(
          setActionFeedback({
            message: 'Aucune sauvegarde trouvée',
            type: 'warning',
          })
        );
        dispatch(setLoading(false));
        
        // Si pas de sauvegarde, initialiser un nouveau jeu
        dispatch(initCollection());
        await dispatch(generateNewMap({ width: 3, depth: 5 }));
        
        return { success: false, reason: 'no_save' };
      }

      const saveData = JSON.parse(savedData);

      // Réinitialiser tous les états pour éviter des conflits
      dispatch(resetPlayer());
      dispatch(resetCombatState());
      dispatch(resetBonusCards());
      dispatch(resetMap());
      dispatch(resetShop());
      dispatch(resetUi());

      // Charger les données du joueur
      if (saveData.player) {
        dispatch(LOAD_PLAYER_DATA(saveData.player));
      }

      // Charger les données du jeu
      if (saveData.game) {
        dispatch(LOAD_GAME_DATA(saveData.game));
      }

      // Charger les données de la carte
      if (saveData.map && saveData.map.path && saveData.map.path.length > 0) {
        dispatch(LOAD_MAP_DATA(saveData.map));
      } else {
        // Si la carte est manquante ou vide, en générer une nouvelle
        console.log("Carte manquante dans la sauvegarde, génération d'une nouvelle carte");
        await dispatch(generateNewMap({ width: 3, depth: 5 }));
      }

      // Charger les données des cartes bonus
      if (saveData.bonusCards) {
        dispatch(LOAD_BONUS_CARDS_DATA(saveData.bonusCards));
      } else {
        // Initialiser une collection par défaut si manquante
        dispatch(initCollection());
      }

      // Charger les données de la boutique
      if (saveData.shop) {
        dispatch(LOAD_SHOP_DATA(saveData.shop));
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

      // Si erreur, initialiser un nouveau jeu
      dispatch(initCollection());
      await dispatch(generateNewMap({ width: 3, depth: 5 }));

      return { success: false, error: error.message };
    }
  }
);

// Thunk pour supprimer la sauvegarde
export const deleteSave = createAsyncThunk(
  'save/deleteSave',
  async (_, { dispatch }) => {
    try {
      // Supprimer la sauvegarde du localStorage
      localStorage.removeItem(SAVE_KEY);

      dispatch(
        setActionFeedback({
          message: 'Sauvegarde supprimée',
          type: 'info',
        })
      );

      return { success: true };
    } catch (error) {
      console.error('Error deleting save:', error);

      dispatch(
        setActionFeedback({
          message: 'Erreur lors de la suppression de la sauvegarde',
          type: 'error',
        })
      );

      return { success: false, error: error.message };
    }
  }
);

// Thunk pour réinitialiser complètement le jeu
export const resetEntireGame = createAsyncThunk(
  'save/resetEntireGame',
  async (_, { dispatch }) => {
    try {
      // Supprimer la sauvegarde
      localStorage.removeItem(SAVE_KEY);

      // Réinitialiser tous les états
      dispatch(resetPlayer());
      dispatch(resetGame());
      dispatch(resetCombatState());
      dispatch(resetBonusCards());
      dispatch(resetMap());
      dispatch(resetShop());
      dispatch(resetUi());

      // Générer une nouvelle carte
      dispatch(generateNewMap({ width: 3, depth: 5 }));
      
      // Initialiser les cartes bonus
      dispatch(initCollection());

      dispatch(
        setActionFeedback({
          message: 'Jeu réinitialisé avec succès',
          type: 'success',
        })
      );

      return { success: true };
    } catch (error) {
      console.error('Error resetting game:', error);

      dispatch(
        setActionFeedback({
          message: 'Erreur lors de la réinitialisation du jeu',
          type: 'error',
        })
      );

      return { success: false, error: error.message };
    }
  }
);

// Fonction utilitaire pour vérifier si une sauvegarde existe
export const hasSave = () => {
  return localStorage.getItem(SAVE_KEY) !== null;
};
