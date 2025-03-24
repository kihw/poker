// src/redux/slices/combatSlice.js - Modifié pour le nouveau système de sélection
import { createSlice } from '@reduxjs/toolkit';
import { createDeck, shuffleDeck, drawCards } from '../../core/deck.js';
import {
  evaluateHand,
  evaluatePartialHand,
  calculateDamage,
  findBestHand,
} from '../../core/hand-evaluation.js';

const initialState = {
  enemy: null,
  hand: [],
  selectedCards: [],
  deck: [],
  discard: [],
  turnPhase: 'draw', // draw, select, result
  discardLimit: 2,
  actionMode: null, // Nouveau: null, 'attack', 'discard'
  bestHandCards: [],
  handResult: null,
  combatLog: [],
  pendingDamageBonus: 0,
  pendingDamageMultiplier: 1,
  invulnerableNextTurn: false,
  playerDamagedLastTurn: false,
};

const combatSlice = createSlice({
  name: 'combat',
  initialState,
  reducers: {
    // Nouveau reducer pour démarrer un combat
    startCombat: (state, action) => {
      // Initialiser l'ennemi
      state.enemy = action.payload;

      // Réinitialiser le journal de combat
      state.combatLog = [];

      // Ajouter un message de début de combat
      state.combatLog.unshift(`Combat contre ${state.enemy.name} commence!`);

      // Réinitialiser les états de combat
      state.hand = [];
      state.selectedCards = [];
      state.deck = shuffleDeck(createDeck());
      state.discard = [];
      state.turnPhase = 'draw';
      state.actionMode = null;
      state.bestHandCards = [];
      state.handResult = null;
      state.pendingDamageBonus = 0;
      state.pendingDamageMultiplier = 1;
      state.invulnerableNextTurn = false;
      state.playerDamagedLastTurn = false;

      console.log(`Combat démarré contre ${state.enemy.name}`);
    },

    setEnemy: (state, action) => {
      state.enemy = action.payload;
    },

    // Nouveau reducer pour ajouter des entrées au journal de combat
    addToCombatLog: (state, action) => {
      state.combatLog.unshift(action.payload);
    },

    // Nouveau reducer pour l'action de l'ennemi
    enemyAction: (state) => {
      if (!state.enemy) return;

      // Ajouter un message au journal de combat
      const attackMessage = `${state.enemy.name} prépare une attaque de ${state.enemy.attack} dégâts`;
      state.combatLog.unshift(attackMessage);

      // Marquer que le joueur a subi des dégâts lors de ce tour
      state.playerDamagedLastTurn = true;
    },

    // Nouveau reducer pour définir la phase de tour
    setTurnPhase: (state, action) => {
      state.turnPhase = action.payload;
      console.log(`Phase de tour définie à: ${action.payload}`);
    },

    dealHand: (state) => {
      console.log('Début dealHand - État initial:', {
        deckLength: state.deck.length,
        handLength: state.hand.length,
        discardLength: state.discard.length,
        phase: state.turnPhase,
        selectedCards: state.selectedCards,
      });

      // Conserver toutes les cartes de la main actuelle pour la défausse si on est en phase 'result'
      if (state.turnPhase === 'result') {
        // Ajouter la main actuelle à la défausse (y compris les cartes non utilisées)
        if (state.hand && state.hand.length > 0) {
          state.discard = [...state.discard, ...state.hand];
          state.hand = [];
        }
      }

      // Nombre de cartes à piocher (une main complète)
      const drawCount = 7;
      console.log(`Besoin de tirer ${drawCount} nouvelles cartes`);

      // Si le deck est vide ou n'a pas assez de cartes, recréer un deck
      if (!state.deck || !Array.isArray(state.deck) || state.deck.length < drawCount) {
        console.log('Pas assez de cartes dans le deck, recréation...');

        // Fusionner le deck avec la défausse et mélanger
        const existingDeck = Array.isArray(state.deck) ? state.deck : [];
        const existingDiscard = Array.isArray(state.discard) ? state.discard : [];

        state.deck = shuffleDeck([...existingDeck, ...existingDiscard]);
        state.discard = [];

        console.log(`Deck recréé avec ${state.deck.length} cartes`);

        // Si le deck est toujours trop petit, on le recrée complètement
        if (state.deck.length < drawCount) {
          console.log("Deck toujours insuffisant, création d'un nouveau deck");
          state.deck = shuffleDeck(createDeck());
          console.log(`Nouveau deck créé avec ${state.deck.length} cartes`);
        }
      }

      // Vérifier que le deck est valide
      if (!Array.isArray(state.deck)) {
        console.error("state.deck n'est pas un tableau:", state.deck);
        state.deck = shuffleDeck(createDeck());
      }

      // Tirer les nouvelles cartes
      const drawnCards =
        state.deck.length >= drawCount ? state.deck.slice(0, drawCount) : state.deck.slice(0);

      console.log(`Tiré ${drawnCards.length} cartes du deck`);

      // S'assurer que toutes les nouvelles cartes ont isSelected = false
      drawnCards.forEach((card) => {
        if (card) {
          card.isSelected = false;
        }
      });

      // Mettre à jour la main
      state.hand = drawnCards;

      // Retirer les cartes tirées du deck
      state.deck = state.deck.slice(drawCount);

      // Reset des cartes sélectionnées et des résultats
      state.selectedCards = [];
      state.bestHandCards = [];
      state.handResult = null;

      // Réinitialiser le mode d'action
      state.actionMode = null;

      // Passer en phase "select"
      state.turnPhase = 'select';

      console.log('Fin dealHand - État final:', {
        deckLength: state.deck.length,
        handLength: state.hand.length,
        discardLength: state.discard.length,
        phase: state.turnPhase,
      });
    },

    toggleCardSelection: (state, action) => {
      const index = action.payload;

      // Vérifications de sécurité
      if (index < 0 || !state.hand || index >= state.hand.length) {
        console.warn('Index de carte invalide');
        return;
      }

      // Vérifier qu'on est bien en phase de sélection
      if (state.turnPhase !== 'select') {
        console.warn('Pas en phase de sélection');
        return;
      }

      // Trouver la carte
      const card = state.hand[index];

      // Si la carte est déjà sélectionnée, la désélectionner
      if (card.isSelected) {
        card.isSelected = false;
        // Supprimer l'index des cartes sélectionnées
        state.selectedCards = state.selectedCards.filter((idx) => idx !== index);
        return;
      }

      // Pour sélectionner une carte, vérifier si on n'a pas déjà 5 cartes
      if (state.selectedCards.length < 5) {
        card.isSelected = true;
        state.selectedCards.push(index);
      }
    },

    setActionMode: (state, action) => {
      state.actionMode = action.payload;
      console.log(`Mode d'action défini à: ${action.payload}`);

      // Si le mode est 'attack', limiter à 5 cartes max
      if (action.payload === 'attack' && state.selectedCards.length > 5) {
        // Désélectionner les cartes en trop
        const cardsToDeselect = state.selectedCards.slice(5);
        cardsToDeselect.forEach((index) => {
          state.hand[index].isSelected = false;
        });
        state.selectedCards = state.selectedCards.slice(0, 5);
      }

      // Si le mode est 'discard', limiter à 2 cartes max
      if (action.payload === 'discard' && state.selectedCards.length > 2) {
        // Désélectionner les cartes en trop
        const cardsToDeselect = state.selectedCards.slice(2);
        cardsToDeselect.forEach((index) => {
          state.hand[index].isSelected = false;
        });
        state.selectedCards = state.selectedCards.slice(0, 2);
      }
    },

    evaluateSelectedHand: (state, action) => {
      if (state.selectedCards.length < 1 || state.enemy === null) return;

      // Extraire les cartes sélectionnées
      const selectedCardsData = state.selectedCards
        .map((index) => state.hand[index])
        .filter((card) => card);

      // Utiliser evaluatePartialHand pour gérer les mains de 1-4 cartes
      const partialHandResult = evaluatePartialHand(selectedCardsData);

      // Appliquer les bonus
      const { totalDamage, bonusEffects } = action.payload || {
        totalDamage: partialHandResult.baseDamage,
        bonusEffects: [],
      };

      // Stocker le résultat
      state.handResult = {
        handName: partialHandResult.handName,
        handRank: partialHandResult.handRank,
        baseDamage: partialHandResult.baseDamage,
        totalDamage: totalDamage || partialHandResult.baseDamage,
        bonusEffects: bonusEffects || [],
        cards: selectedCardsData,
      };

      // Appliquer les dégâts à l'ennemi
      if (state.enemy) {
        const oldHealth = state.enemy.health;
        state.enemy.health = Math.max(0, state.enemy.health - state.handResult.totalDamage);
        const actualDamage = oldHealth - state.enemy.health;

        state.combatLog.unshift(
          `Vous infligez ${actualDamage} dégâts avec ${state.handResult.handName}`
        );

        // Ajouter les effets bonus au journal
        if (state.handResult.bonusEffects && state.handResult.bonusEffects.length > 0) {
          state.combatLog.unshift(`Effets bonus: ${state.handResult.bonusEffects.join(', ')}`);
        }

        // Vérifier si l'ennemi est vaincu
        if (state.enemy.health <= 0) {
          state.combatLog.unshift(`Vous avez vaincu ${state.enemy.name}!`);
        }
      }

      // Passer en phase "result"
      state.turnPhase = 'result';
      // Réinitialiser le mode d'action après l'attaque
      state.actionMode = null;
    },

    discardCards: (state, action) => {
      const indices = action.payload;
      console.log('discardCards appelé avec indices:', indices);

      // Sortir si aucune carte n'est sélectionnée
      if (!indices || indices.length === 0) {
        console.log('Aucune carte sélectionnée pour la défausse');
        return;
      }

      // Vérifier que l'on n'essaie pas de défausser plus que la limite
      const indicesToUse =
        indices.length > state.discardLimit ? indices.slice(0, state.discardLimit) : indices;

      // Sauvegarder les cartes défaussées dans la pile de défausse
      const discardedCards = [];

      // Créer une copie de la main pour éviter les modifications directes pendant le parcours
      const newHand = [...state.hand];

      // Trier les indices par ordre décroissant pour éviter les problèmes lorsqu'on supprime des éléments
      const sortedIndices = [...indicesToUse].sort((a, b) => b - a);

      // Supprimer les cartes de la nouvelle main et les ajouter à la pile de défausse
      sortedIndices.forEach((index) => {
        if (index >= 0 && index < newHand.length) {
          const card = newHand[index];
          discardedCards.push(card);
          newHand.splice(index, 1);
        }
      });

      // Ajouter les cartes défaussées à la pile de défausse
      state.discard.push(...discardedCards);
      console.log(`${discardedCards.length} cartes défaussées`);

      // Si le deck est trop petit, recycler la défausse
      if (state.deck.length < discardedCards.length) {
        console.log('Recycler la défausse dans le deck');
        // Sauvegarder les cartes que l'on vient juste de défausser
        const oldDiscard = [...state.discard].filter((card) => !discardedCards.includes(card));
        // Recycler l'ancienne défausse dans le deck
        state.deck = shuffleDeck([...state.deck, ...oldDiscard]);
        // Garder seulement les nouvelles cartes défaussées dans la pile de défausse
        state.discard = [...discardedCards];

        // Si c'est toujours insuffisant, créer un nouveau deck
        if (state.deck.length < discardedCards.length) {
          console.log('Créer un nouveau deck');
          state.deck = shuffleDeck(createDeck());
        }
      }

      // Tirer de nouvelles cartes pour remplacer les cartes défaussées
      console.log(`Tirer ${discardedCards.length} nouvelles cartes`);
      const newCards = drawCards(state.deck, discardedCards.length);

      // S'assurer que les nouvelles cartes ont isSelected = false
      newCards.forEach((card) => {
        card.isSelected = false;
      });

      // Mettre à jour le deck
      state.deck = state.deck.slice(discardedCards.length);

      // Mise à jour de la main
      state.hand = [...newHand, ...newCards];
      console.log(`Nouvelle main: ${state.hand.length} cartes`);

      // Reset des cartes sélectionnées
      state.selectedCards = [];

      // Réinitialiser le mode d'action
      state.actionMode = null;

      // Rester en phase de sélection
      state.turnPhase = 'select';
    },
    setInvulnerableNextTurn: (state, action) => {
      state.invulnerableNextTurn = action.payload;
      console.log(`Invulnérabilité définie à: ${action.payload}`);
    },
    setPendingDamageBonus: (state, action) => {
      state.pendingDamageBonus = action.payload;
      console.log(`Bonus de dégâts en attente défini à: ${action.payload}`);
    },

    setPendingDamageMultiplier: (state, action) => {
      state.pendingDamageMultiplier = action.payload;
      console.log(`Multiplicateur de dégâts en attente défini à: ${action.payload}`);
    },

    // Autres reducers existants...
    resetCombatState: () => initialState,
  },
});

export const {
  startCombat,
  setEnemy,
  dealHand,
  toggleCardSelection,
  setActionMode,
  evaluateSelectedHand,
  discardCards,
  addToCombatLog,
  enemyAction,
  setTurnPhase,
  resetCombatState,
  setInvulnerableNextTurn,
  setPendingDamageBonus,
  setPendingDamageMultiplier,
} = combatSlice.actions;

export default combatSlice.reducer;
