// src/redux/slices/bonusCardsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { ALL_BONUS_CARDS } from '../../data/bonus-cards';

const initialState = {
  // Collection complète des cartes bonus possédées par le joueur (inventaire permanent)
  collection: [],
  // Cartes bonus sélectionnées pour être utilisées dans le combat actuel
  active: [],
  // Nombre maximum de cartes bonus qui peuvent être équipées simultanément
  maxSlots: 3,
  // État de chargement pour les opérations asynchrones
  loading: false,
  // Message d'erreur éventuel
  error: null,
};

const bonusCardsSlice = createSlice({
  name: 'bonusCards',
  initialState,
  reducers: {
    // Initialiser la collection avec des cartes de départ
    initCollection: (state) => {
      // Cartes de départ définies par ID
      const startingCardIds = [1, 2, 10, 14, 18];

      // Créer la collection initiale à partir des ID de départ
      state.collection = startingCardIds
        .map((id) => {
          const card = ALL_BONUS_CARDS.find((card) => card.id === id);
          return card ? { ...card, owned: true, level: 1 } : null;
        })
        .filter((card) => card !== null);

      // Équiper automatiquement les premières cartes jusqu'au maximum autorisé
      state.active = state.collection.slice(0, state.maxSlots).map((card) => ({
        ...card,
        usesRemaining: card.uses || 0,
        // Ajouter un flag pour indiquer si la carte est disponible pour utilisation
        available: true,
      }));

      // Sauvegarder la collection dans le localStorage pour persistance
      try {
        localStorage.setItem('bonusCardCollection', JSON.stringify(state.collection));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la collection:', error);
      }
    },

    // Ajouter une nouvelle carte à la collection
    addCard: (state, action) => {
      const cardId = action.payload;

      // Vérifier si la carte existe déjà dans la collection
      const existingCardIndex = state.collection.findIndex((card) => card.id === cardId);

      if (existingCardIndex !== -1) {
        // Si la carte existe mais n'est pas possédée, la marquer comme possédée
        if (!state.collection[existingCardIndex].owned) {
          state.collection[existingCardIndex].owned = true;
        } else {
          // Si la carte est déjà possédée, ne rien faire
          return;
        }
      } else {
        // Ajouter une nouvelle carte à la collection
        const cardTemplate = ALL_BONUS_CARDS.find((card) => card.id === cardId);
        if (cardTemplate) {
          state.collection.push({
            ...cardTemplate,
            owned: true,
            level: 1,
          });
        }
      }

      // Sauvegarder la collection mise à jour
      try {
        localStorage.setItem('bonusCardCollection', JSON.stringify(state.collection));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la collection:', error);
      }
    },

    // Équiper une carte depuis la collection dans les emplacements actifs
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

      // Sauvegarder les cartes actives
      try {
        localStorage.setItem('bonusCardActive', JSON.stringify(state.active));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des cartes actives:', error);
      }
    },

    // Retirer une carte des emplacements actifs
    unequipCard: (state, action) => {
      const cardId = action.payload;

      // Filtrer la carte à retirer
      state.active = state.active.filter((card) => card.id !== cardId);

      // Sauvegarder les cartes actives mises à jour
      try {
        localStorage.setItem('bonusCardActive', JSON.stringify(state.active));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des cartes actives:', error);
      }
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

      // Trouver l'index de la carte dans la collection
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

        // Sauvegarder la collection mise à jour
        try {
          localStorage.setItem('bonusCardCollection', JSON.stringify(state.collection));
          if (activeIndex !== -1) {
            localStorage.setItem('bonusCardActive', JSON.stringify(state.active));
          }
        } catch (error) {
          console.error('Erreur lors de la sauvegarde après amélioration:', error);
        }
      }
    },

    // Augmenter le nombre maximum d'emplacements de cartes disponibles
    increaseMaxSlots: (state, action) => {
      state.maxSlots += action.payload || 1;

      // Sauvegarder le nombre maximum d'emplacements
      try {
        localStorage.setItem('bonusCardMaxSlots', state.maxSlots.toString());
      } catch (error) {
        console.error("Erreur lors de la sauvegarde du nombre maximum d'emplacements:", error);
      }
    },

    // Réinitialiser l'état des cartes bonus
    resetBonusCards: () => initialState,

    // Définir l'état de chargement
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Définir un message d'erreur
    setError: (state, action) => {
      state.error = action.payload;
    },

    // Charger des données sauvegardées
    LOAD_SAVED_DATA: (state, action) => {
      const savedData = action.payload;

      if (savedData) {
        // Charger la collection si elle existe
        if (savedData.collection && Array.isArray(savedData.collection)) {
          state.collection = [];

          // Reconstruire la collection à partir des données sauvegardées
          savedData.collection.forEach((savedCard) => {
            const cardTemplate = ALL_BONUS_CARDS.find((card) => card.id === savedCard.id);
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
        } else {
          // Essayer de charger depuis le localStorage si pas de données passées
          try {
            const storedCollection = localStorage.getItem('bonusCardCollection');
            if (storedCollection) {
              const parsedCollection = JSON.parse(storedCollection);
              if (Array.isArray(parsedCollection) && parsedCollection.length > 0) {
                state.collection = parsedCollection;
              } else {
                // Initialiser une nouvelle collection
                const startingCardIds = [1, 2, 10, 14, 18];
                state.collection = startingCardIds
                  .map((id) => {
                    const card = ALL_BONUS_CARDS.find((card) => card.id === id);
                    return card ? { ...card, owned: true, level: 1 } : null;
                  })
                  .filter((card) => card !== null);
              }
            }
          } catch (error) {
            console.error('Erreur lors du chargement de la collection:', error);
          }
        }

        // Charger les cartes actives
        if (savedData.active && Array.isArray(savedData.active)) {
          state.active = [];

          // Reconstruire les cartes actives
          savedData.active.forEach((activeCard) => {
            const card = state.collection.find((c) => c.id === activeCard.id);
            if (card) {
              state.active.push({
                ...card,
                usesRemaining:
                  activeCard.usesRemaining !== undefined
                    ? activeCard.usesRemaining
                    : card.uses || 0,
                available: activeCard.available !== undefined ? activeCard.available : true,
              });
            }
          });
        } else {
          // Essayer de charger depuis le localStorage
          try {
            const storedActive = localStorage.getItem('bonusCardActive');
            if (storedActive) {
              const parsedActive = JSON.parse(storedActive);
              if (Array.isArray(parsedActive) && parsedActive.length > 0) {
                // Vérifier que toutes les cartes actives sont dans la collection
                state.active = parsedActive.filter((activeCard) =>
                  state.collection.some(
                    (collectionCard) => collectionCard.id === activeCard.id && collectionCard.owned
                  )
                );
              } else {
                // Équiper automatiquement les premières cartes
                state.active = state.collection.slice(0, state.maxSlots).map((card) => ({
                  ...card,
                  usesRemaining: card.uses || 0,
                  available: true,
                }));
              }
            }
          } catch (error) {
            console.error('Erreur lors du chargement des cartes actives:', error);
          }
        }

        // Charger le nombre maximum d'emplacements
        if (savedData.maxSlots !== undefined) {
          state.maxSlots = savedData.maxSlots;
        } else {
          // Essayer de charger depuis le localStorage
          try {
            const storedMaxSlots = localStorage.getItem('bonusCardMaxSlots');
            if (storedMaxSlots) {
              const parsedMaxSlots = parseInt(storedMaxSlots, 10);
              if (!isNaN(parsedMaxSlots) && parsedMaxSlots > 0) {
                state.maxSlots = parsedMaxSlots;
              }
            }
          } catch (error) {
            console.error("Erreur lors du chargement du nombre maximum d'emplacements:", error);
          }
        }
      }
    },

    // Charger les données du localStorage
    loadFromLocalStorage: (state) => {
      try {
        // Charger la collection
        const storedCollection = localStorage.getItem('bonusCardCollection');
        if (storedCollection) {
          const parsedCollection = JSON.parse(storedCollection);
          if (Array.isArray(parsedCollection) && parsedCollection.length > 0) {
            state.collection = parsedCollection;
          }
        }

        // Charger les cartes actives
        const storedActive = localStorage.getItem('bonusCardActive');
        if (storedActive) {
          const parsedActive = JSON.parse(storedActive);
          if (Array.isArray(parsedActive) && parsedActive.length > 0) {
            state.active = parsedActive;
          }
        }

        // Charger le nombre maximum d'emplacements
        const storedMaxSlots = localStorage.getItem('bonusCardMaxSlots');
        if (storedMaxSlots) {
          const parsedMaxSlots = parseInt(storedMaxSlots, 10);
          if (!isNaN(parsedMaxSlots) && parsedMaxSlots > 0) {
            state.maxSlots = parsedMaxSlots;
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données depuis le localStorage:', error);
        state.error = 'Erreur lors du chargement des cartes bonus';
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
  setLoading,
  setError,
  LOAD_SAVED_DATA,
  loadFromLocalStorage,
} = bonusCardsSlice.actions;

export default bonusCardsSlice.reducer;
