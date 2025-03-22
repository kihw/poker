// src/redux/slices/bonusCardsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { ALL_BONUS_CARDS } from '../../data/bonus-cards';

const initialState = {
  collection: [],
  active: [],
  maxSlots: 3,
};

const bonusCardsSlice = createSlice({
  name: 'bonusCards',
  initialState,
  reducers: {
    initCollection: (state) => {
      // Initialiser avec les cartes de départ
      const startingCardIds = [1, 2, 10, 14, 18];
      state.collection = startingCardIds
        .map((id) => {
          const card = ALL_BONUS_CARDS.find((card) => card.id === id);
          return card ? { ...card, owned: true, level: 1 } : null;
        })
        .filter((card) => card !== null);

      // Équiper les premières cartes
      state.active = state.collection
        .slice(0, state.maxSlots)
        .map((card) => ({ ...card, usesRemaining: card.uses || 0 }));
    },
    addCard: (state, action) => {
      const cardId = action.payload;
      const exists = state.collection.some((card) => card.id === cardId);

      if (!exists) {
        const newCard = ALL_BONUS_CARDS.find((card) => card.id === cardId);
        if (newCard) {
          state.collection.push({ ...newCard, owned: true, level: 1 });
        }
      }
    },
    equipCard: (state, action) => {
      const cardId = action.payload;

      // Vérifier si la carte n'est pas déjà équipée
      const isEquipped = state.active.some((card) => card.id === cardId);
      if (isEquipped || state.active.length >= state.maxSlots) return;

      const card = state.collection.find((card) => card.id === cardId);
      if (card) {
        state.active.push({ ...card, usesRemaining: card.uses || 0 });
      }
    },
    unequipCard: (state, action) => {
      const cardId = action.payload;
      state.active = state.active.filter((card) => card.id !== cardId);
    },
    useCard: (state, action) => {
      const index = action.payload;
      if (index >= 0 && index < state.active.length) {
        if (state.active[index].usesRemaining > 0) {
          state.active[index].usesRemaining -= 1;
        }
      }
    },
    resetCardUses: (state) => {
      state.active.forEach((card) => {
        if (card.effect === 'active' && card.uses) {
          card.usesRemaining = card.uses;
        }
      });
    },
    upgradeCard: (state, action) => {
      const { cardId } = action.payload;
      const cardIndex = state.collection.findIndex(
        (card) => card.id === cardId
      );

      if (cardIndex !== -1) {
        const card = state.collection[cardIndex];

        if (!card.level) card.level = 1;
        card.level += 1;

        // Améliorer la valeur du bonus
        if (card.bonus) {
          if (!card.bonus.originalValue) {
            card.bonus.originalValue = card.bonus.value;
          }

          card.bonus.value = Math.floor(
            card.bonus.originalValue * (1 + 0.2 * (card.level - 1))
          );
        }

        // Mettre à jour la carte active si équipée
        const activeIndex = state.active.findIndex((c) => c.id === cardId);
        if (activeIndex !== -1) {
          state.active[activeIndex] = {
            ...card,
            usesRemaining: card.uses || 0,
          };
        }
      }
    },
    increaseMaxSlots: (state, action) => {
      state.maxSlots += action.payload || 1;
    },
    resetBonusCards: () => initialState,
    // Ajouter le handler pour charger les données sauvegardées
    LOAD_SAVED_DATA: (state, action) => {
      const savedData = action.payload;

      if (savedData) {
        // Réinitialiser les collections existantes
        state.collection = [];
        state.active = [];

        // Charger la collection si elle existe
        if (savedData.collection && Array.isArray(savedData.collection)) {
          // Reconstituer la collection à partir des IDs sauvegardés
          savedData.collection.forEach((savedCard) => {
            const cardTemplate = ALL_BONUS_CARDS.find(
              (card) => card.id === savedCard.id
            );
            if (cardTemplate) {
              const card = {
                ...cardTemplate,
                owned: savedCard.owned !== false,
                level: savedCard.level || 1,
              };

              // Ajuster la valeur du bonus en fonction du niveau
              if (card.bonus && card.level > 1) {
                if (!card.bonus.originalValue) {
                  card.bonus.originalValue = card.bonus.value;
                }
                card.bonus.value = Math.floor(
                  card.bonus.originalValue * (1 + 0.2 * (card.level - 1))
                );
              }

              state.collection.push(card);
            }
          });
        }

        // Charger les cartes actives si elles existent
        if (savedData.active && Array.isArray(savedData.active)) {
          savedData.active.forEach((activeCard) => {
            const card = state.collection.find((c) => c.id === activeCard.id);
            if (card) {
              state.active.push({
                ...card,
                usesRemaining:
                  activeCard.usesRemaining !== undefined
                    ? activeCard.usesRemaining
                    : card.uses || 0,
              });
            }
          });
        }

        // Charger le nombre maximum d'emplacements
        if (savedData.maxSlots !== undefined) {
          state.maxSlots = savedData.maxSlots;
        }
      }
    },
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
  increaseMaxSlots,
  resetBonusCards,
  LOAD_SAVED_DATA, // Exporter la nouvelle action
} = bonusCardsSlice.actions;

export default bonusCardsSlice.reducer;
