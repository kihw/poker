// src/redux/slices/bonusCardsSlice.js - Version mise à jour avec la gestion des combinaisons

import { createSlice } from '@reduxjs/toolkit';
import { ALL_BONUS_CARDS } from '../../data/bonus-cards';
import { generateRandomPlayingCard } from '../../utils/cardValuesGenerator';

const initialState = {
  // Collection complète des cartes bonus possédées par le joueur
  collection: [],
  // Cartes bonus sélectionnées pour être utilisées dans le combat actuel
  active: [],
  // Nombre maximum de cartes bonus qui peuvent être équipées simultanément
  maxSlots: 5,
  // État actuel de la combinaison des cartes bonus équipées
  deckCombination: {
    combination: null,
    effect: null,
    description: null,
    isActive: false,
  },
  loading: false,
  error: null,
};

const bonusCardsSlice = createSlice({
  name: 'bonusCards',
  initialState,
  reducers: {
    // Initialiser la collection avec des cartes de départ
    initCollection: (state) => {
      // Cartes de départ définies par ID
      const startingCardIds = [1, 2, 10];

      // Créer la collection initiale à partir des ID de départ
      state.collection = startingCardIds
        .map((id) => {
          const card = ALL_BONUS_CARDS.find((card) => card.id === id);
          if (card) {
            const playingCardValues = generateRandomPlayingCard();
            return {
              ...card,
              owned: true,
              level: 1,
              cardValue: playingCardValues.cardValue,
              cardSuit: playingCardValues.cardSuit,
            };
          }
          return null;
        })
        .filter((card) => card !== null);

      // Équiper automatiquement les premières cartes jusqu'au maximum autorisé
      state.active = state.collection.slice(0, state.maxSlots).map((card) => ({
        ...card,
        usesRemaining: card.uses || 0,
        available: true,
      }));
    },

    // Ajouter une nouvelle carte à la collection
    addCard: (state, action) => {
      const cardId = action.payload;

      // Vérifier si la carte existe déjà dans la collection
      const existingCardIndex = state.collection.findIndex((card) => card.id === cardId);

      if (existingCardIndex === -1) {
        // Ajouter une nouvelle carte à la collection
        const cardTemplate = ALL_BONUS_CARDS.find((card) => card.id === cardId);
        if (cardTemplate) {
          // Générer des valeurs de carte à jouer aléatoires
          const playingCardValues = generateRandomPlayingCard();

          state.collection.push({
            ...cardTemplate,
            owned: true,
            level: 1,
            // Fixer les valeurs de la carte (ne seront jamais modifiées par la suite)
            cardValue: playingCardValues.cardValue,
            cardSuit: playingCardValues.cardSuit,
          });
        }
      } else if (!state.collection[existingCardIndex].owned) {
        // Si la carte existe mais n'est pas possédée, la marquer comme possédée
        state.collection[existingCardIndex].owned = true;
      }
    },

    // Équiper une carte depuis la collection
    equipCard: (state, action) => {
      const cardId = action.payload;

      // Vérifier si la carte est déjà équipée
      const isEquipped = state.active.some((card) => card.id === cardId);
      if (isEquipped) return;

      // Vérifier s'il y a de la place disponible
      if (state.active.length >= state.maxSlots) return;

      // Trouver la carte dans la collection
      const cardToEquip = state.collection.find((card) => card.id === cardId && card.owned);
      if (!cardToEquip) return;

      // Ajouter la carte aux cartes actives
      state.active.push({
        ...cardToEquip,
        usesRemaining: cardToEquip.uses || 0,
        available: true,
      });

      // Réinitialiser la combinaison car elle a changé
      state.deckCombination = {
        combination: null,
        effect: null,
        description: null,
        isActive: false,
      };
    },

    // Retirer une carte des emplacements actifs
    unequipCard: (state, action) => {
      const cardId = action.payload;
      state.active = state.active.filter((card) => card.id !== cardId);

      // Réinitialiser la combinaison car elle a changé
      state.deckCombination = {
        combination: null,
        effect: null,
        description: null,
        isActive: false,
      };
    },

    // Utiliser une carte bonus active
    useCard: (state, action) => {
      const index = action.payload;

      // Vérifier si l'index est valide
      if (index < 0 || index >= state.active.length) return;

      // Vérifier si la carte a des utilisations restantes et est active
      if (state.active[index].effect === 'active' && state.active[index].usesRemaining > 0) {
        // Décrémenter le nombre d'utilisations restantes
        state.active[index].usesRemaining -= 1;

        // Marquer la carte comme non disponible si plus d'utilisations
        if (state.active[index].usesRemaining <= 0) {
          state.active[index].available = false;
        }
      }
    },

    // Définir le résultat de l'évaluation du deck
    setDeckCombination: (state, action) => {
      state.deckCombination = {
        ...action.payload,
        isActive: true,
      };
    },

    // Réinitialiser l'évaluation du deck
    resetDeckCombination: (state) => {
      state.deckCombination = {
        combination: null,
        effect: null,
        description: null,
        isActive: false,
      };
    },

    // Réinitialiser les utilisations des cartes pour un nouveau combat
    resetCardUses: (state) => {
      state.active.forEach((card) => {
        if (card.effect === 'active' && card.uses) {
          card.usesRemaining = card.uses;
          card.available = true;
        }
      });
    },

    // Améliorer une carte (augmenter son niveau et ses effets)
    upgradeCard: (state, action) => {
      const { cardId } = action.payload;
      const cardIndex = state.collection.findIndex((card) => card.id === cardId);

      if (cardIndex !== -1) {
        const card = state.collection[cardIndex];

        // Initialiser le niveau s'il n'existe pas
        if (!card.level) card.level = 1;

        // Vérifier si la carte n'a pas déjà atteint le niveau maximum
        if (card.level >= 3) return;

        // Augmenter le niveau
        card.level += 1;

        // Améliorer la valeur du bonus
        if (card.bonus) {
          // Sauvegarder la valeur originale si ce n'est pas déjà fait
          if (!card.bonus.originalValue) {
            card.bonus.originalValue = card.bonus.value;
          }

          // Augmenter la valeur de 20% par niveau
          card.bonus.value = Math.floor(card.bonus.originalValue * (1 + 0.2 * (card.level - 1)));
        }

        // Mettre à jour la carte active si elle est équipée
        const activeIndex = state.active.findIndex((c) => c.id === cardId);
        if (activeIndex !== -1) {
          state.active[activeIndex] = {
            ...state.collection[cardIndex],
            usesRemaining: state.active[activeIndex].usesRemaining,
            available: state.active[activeIndex].available,
          };
        }

        // Réinitialiser la combinaison car une carte a été améliorée
        state.deckCombination = {
          combination: null,
          effect: null,
          description: null,
          isActive: false,
        };
      }
    },

    // Réinitialiser l'ensemble des cartes bonus
    resetBonusCards: () => initialState,
  },
  // Gestion des thunks
  extraReducers: (builder) => {
    builder
      // Gérer les états de thunk evaluateBonusDeck
      .addCase('bonusCards/evaluateDeck/pending', (state) => {
        state.loading = true;
      })
      .addCase('bonusCards/evaluateDeck/fulfilled', (state, action) => {
        state.loading = false;

        if (action.payload.success && action.payload.evaluation) {
          state.deckCombination = {
            ...action.payload.evaluation,
            isActive: true,
          };
        }
      })
      .addCase('bonusCards/evaluateDeck/rejected', (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
  LOAD_SAVED_DATA: (state, action) => {
    // Réinitialiser l'état du deck de cartes bonus
    state.collection = [];
    state.active = [];

    // Charger la collection de cartes bonus
    if (action.payload && action.payload.collection) {
      state.collection = action.payload.collection.map((card) => ({
        ...card,
        owned: card.owned !== false,
        level: card.level || 1,
      }));
    }

    // Charger les cartes actives
    if (action.payload && action.payload.active) {
      state.active = action.payload.active
        .map((card) => {
          // Trouver la carte correspondante dans la collection
          const fullCard = state.collection.find((c) => c.id === card.id);

          return fullCard
            ? {
                ...fullCard,
                usesRemaining: card.usesRemaining || 0,
                available: true,
              }
            : null;
        })
        .filter(Boolean);
    }

    // Mettre à jour le nombre max d'emplacements
    if (action.payload && action.payload.maxSlots) {
      state.maxSlots = action.payload.maxSlots;
    }

    // Réinitialiser la combinaison de deck
    state.deckCombination = {
      combination: null,
      effect: null,
      description: null,
      isActive: false,
    };
  },
});

export const {
  initCollection,
  addCard,
  equipCard,
  unequipCard,
  useCard,
  resetCardUses,
  upgradeCard,
  setDeckCombination,
  resetDeckCombination,
  resetBonusCards,
  LOAD_SAVED_DATA,
} = bonusCardsSlice.actions;

export default bonusCardsSlice.reducer;
