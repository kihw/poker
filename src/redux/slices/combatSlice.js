// src/redux/slices/combatSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { createDeck, shuffleDeck, drawCards } from '../../core/deck.js';
import {
  evaluateHand,
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
  discardUsed: false,
  discardMode: false,
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
    setEnemy: (state, action) => {
      state.enemy = action.payload;
    },
    dealHand: (state) => {
      // Garder les cartes non sélectionnées du tour précédent
      const keptCards = [];
      const keptIndices = [];

      // Vérifier si nous avons des cartes sélectionnées valides
      const hasValidSelectedCards =
        state.selectedCards.length > 0 && state.turnPhase === 'result';

      if (state.hand.length > 0 && hasValidSelectedCards) {
        // Filtrer les cartes qui n'ont pas été sélectionnées
        for (let i = 0; i < state.hand.length; i++) {
          const shouldKeep = !state.selectedCards.includes(i);
          if (shouldKeep) {
            // S'assurer que la carte n'est pas marquée comme sélectionnée
            const card = { ...state.hand[i], isSelected: false };
            keptCards.push(card);
            keptIndices.push(i);
          } else {
            // Ajouter les cartes utilisées à la pile de défausse
            state.discard.push(state.hand[i]);
          }
        }
      }

      // Nombre de nouvelles cartes à tirer
      const drawCount = 7 - keptCards.length;

      // Si le deck est vide ou n'a pas assez de cartes, recréer un deck
      if (state.deck.length < drawCount) {
        // Fusionner le deck avec la défausse et mélanger
        state.deck = shuffleDeck([...state.deck, ...state.discard]);
        state.discard = [];

        // Si le deck est toujours trop petit, on le recrée complètement
        if (state.deck.length < drawCount) {
          state.deck = shuffleDeck(createDeck());
        }
      }

      // Tirer les nouvelles cartes
      const drawnCards = drawCards(state.deck, drawCount);

      // S'assurer que toutes les nouvelles cartes ont isSelected = false
      for (let card of drawnCards) {
        card.isSelected = false;
      }

      // Création de la nouvelle main
      let newHand = new Array(7).fill(null);

      // Placer les cartes conservées à leurs positions originales
      keptIndices.forEach((originalIndex, i) => {
        if (originalIndex >= 0 && originalIndex < 7) {
          newHand[originalIndex] = keptCards[i];
        }
      });

      // Remplir les positions vides avec les nouvelles cartes
      let drawnCardIndex = 0;
      for (let i = 0; i < 7; i++) {
        if (newHand[i] === null && drawnCardIndex < drawnCards.length) {
          newHand[i] = drawnCards[drawnCardIndex++];
        }
      }

      // Filtrer les éléments null
      newHand = newHand.filter((card) => card !== null);

      // Compléter avec les cartes restantes si nécessaire
      while (newHand.length < 7 && drawnCardIndex < drawnCards.length) {
        newHand.push(drawnCards[drawnCardIndex++]);
      }

      // Mettre à jour la main avec les cartes gardées et les nouvelles cartes
      state.hand = newHand;

      // Retirer les cartes tirées du deck
      state.deck = state.deck.slice(drawCount);

      // Reset des cartes sélectionnées et des résultats
      state.selectedCards = [];
      state.bestHandCards = [];
      state.handResult = null;
      state.discardUsed = false;
      state.discardMode = false;

      // Passer en phase "select"
      state.turnPhase = 'select';
    },
    toggleCardSelection: (state, action) => {
      const index = action.payload;
      if (index >= 0 && index < state.hand.length) {
        // Compter les cartes actuellement sélectionnées
        const currentSelectedCount = state.hand.filter(
          (card) => card.isSelected
        ).length;

        // Vérifier les conditions de sélection
        if (
          !state.hand[index].isSelected &&
          currentSelectedCount >= 5 &&
          state.turnPhase === 'select' &&
          !state.discardMode
        ) {
          return; // Ne pas permettre plus de 5 cartes
        }

        // Inverser l'état de sélection
        state.hand[index].isSelected = !state.hand[index].isSelected;

        // Mettre à jour selectedCards en fonction de l'état des cartes
        state.selectedCards = state.hand
          .map((card, idx) => (card.isSelected ? idx : -1))
          .filter((idx) => idx !== -1);
      }
    },
    evaluateSelectedHand: (state, action) => {
      if (state.selectedCards.length < 1 || state.enemy === null) return;

      // Extraire les cartes sélectionnées
      const selectedCardsData = state.selectedCards
        .map((index) => state.hand[index])
        .filter((card) => card);

      let result;

      // Si 5 cartes sont sélectionnées, utiliser l'évaluateur de poker
      if (state.selectedCards.length === 5) {
        // Trouver la meilleure main
        const bestHand = findBestHand(selectedCardsData);

        // Sauvegarder les indices des cartes qui forment la meilleure main
        state.bestHandCards = bestHand.indices.map(
          (relativeIndex) => state.selectedCards[relativeIndex]
        );

        // Calculer les dégâts de base
        const baseDamage = calculateDamage(bestHand.evaluation);

        // Appliquer les bonus
        const { totalDamage, bonusEffects } = action.payload || {
          totalDamage: baseDamage,
          bonusEffects: [],
        };

        // Stocker le résultat
        state.handResult = {
          handName: bestHand.evaluation.type.name,
          handRank: bestHand.evaluation.type.rank,
          baseDamage: baseDamage,
          totalDamage: totalDamage || baseDamage,
          bonusEffects: bonusEffects || [],
          cards: selectedCardsData,
        };
      }
      // Pour moins de 5 cartes, calcul de dégâts simple
      else {
        // Calculer la somme des valeurs numériques
        let totalValue = selectedCardsData.reduce(
          (sum, card) => sum + (card.numericValue || 0),
          0
        );

        // Appliquer les bonus
        const { totalDamage, bonusEffects } = action.payload || {
          totalDamage: totalValue,
          bonusEffects: [],
        };

        // Stocker le résultat
        state.handResult = {
          handName: `${state.selectedCards.length} Carte${state.selectedCards.length > 1 ? 's' : ''}`,
          handRank: 0,
          baseDamage: totalValue,
          totalDamage: totalDamage || totalValue,
          bonusEffects: bonusEffects || [],
          cards: selectedCardsData,
        };
      }

      // Appliquer les dégâts à l'ennemi
      if (state.enemy) {
        const oldHealth = state.enemy.health;
        state.enemy.health = Math.max(
          0,
          state.enemy.health - state.handResult.totalDamage
        );
        const actualDamage = oldHealth - state.enemy.health;

        // Ajouter au journal de combat
        state.combatLog.unshift(
          `Vous infligez ${actualDamage} dégâts avec ${state.handResult.handName}`
        );

        // Ajouter les effets bonus au journal
        if (
          state.handResult.bonusEffects &&
          state.handResult.bonusEffects.length > 0
        ) {
          state.combatLog.unshift(
            `Effets bonus: ${state.handResult.bonusEffects.join(', ')}`
          );
        }

        // Vérifier si l'ennemi est vaincu
        if (state.enemy.health <= 0) {
          state.combatLog.unshift(`Vous avez vaincu ${state.enemy.name}!`);
        }
      }

      // Passer en phase "result"
      state.turnPhase = 'result';
    },
    discardCards: (state, action) => {
      const indices = action.payload;
      if (!indices || indices.length === 0) return;

      // Vérifier que l'on n'essaie pas de défausser plus que la limite
      const validIndices = indices.slice(0, state.discardLimit);

      // Marquer la défausse comme utilisée
      state.discardUsed = true;

      // Sauvegarder les cartes défaussées
      const discardedCards = validIndices.map((index) => state.hand[index]);
      state.discard.push(...discardedCards);

      // Créer une nouvelle main sans les cartes défaussées
      let newHand = [...state.hand];

      // Trier les indices par ordre décroissant pour éviter les problèmes
      const sortedIndices = [...validIndices].sort((a, b) => b - a);
      sortedIndices.forEach((index) => {
        if (index >= 0 && index < newHand.length) {
          newHand.splice(index, 1);
        }
      });

      // Si le deck est trop petit, recycler la défausse
      if (state.deck.length < validIndices.length) {
        const oldDiscard = [...state.discard];
        state.deck = shuffleDeck([...state.deck, ...oldDiscard]);
        state.discard = discardedCards;

        // Si c'est toujours insuffisant, créer un nouveau deck
        if (state.deck.length < validIndices.length) {
          state.deck = shuffleDeck(createDeck());
        }
      }

      // Tirer de nouvelles cartes
      const newCards = drawCards(state.deck, validIndices.length);

      // S'assurer que les nouvelles cartes ont isSelected = false
      for (let card of newCards) {
        card.isSelected = false;
      }

      // Mettre à jour le deck
      state.deck = state.deck.slice(validIndices.length);

      // Mise à jour de la main
      state.hand = [...newHand, ...newCards];

      // Reset des cartes sélectionnées
      state.selectedCards = [];

      // Désactiver le mode défausse
      state.discardMode = false;
    },
    enemyAction: (state) => {
      if (!state.enemy || state.enemy.health <= 0) return;

      // Vérifier d'abord l'invulnérabilité
      if (state.invulnerableNextTurn) {
        state.combatLog.unshift(
          `Vous êtes invulnérable à l'attaque de ${state.enemy.name}.`
        );
        state.invulnerableNextTurn = false;
        state.playerDamagedLastTurn = false;
        return;
      }

      // Dégâts de base de l'ennemi
      let damage = state.enemy.attack;
      const reductionEffects = [];

      // Utiliser pendingDamageReduction si disponible
      if (state.pendingDamageReduction > 0) {
        const reduction = Math.min(damage, state.pendingDamageReduction);
        damage -= reduction;
        reductionEffects.push(`Réduction de dégâts: ${reduction}`);
        state.pendingDamageReduction = 0;
      }

      // Ajouter au journal de combat
      let logEntry = `${state.enemy.name} attaque et inflige ${state.enemy.attack} dégâts`;
      if (reductionEffects.length > 0) {
        logEntry += `. ${reductionEffects.join('. ')}`;
      }
      if (damage !== state.enemy.attack) {
        logEntry += `. Vous ne subissez que ${damage} dégâts`;
      }

      state.combatLog.unshift(logEntry);

      // Marquer que le joueur a subi des dégâts
      state.playerDamagedLastTurn = damage > 0;
    },
    addToCombatLog: (state, action) => {
      state.combatLog.unshift(action.payload);
    },
    startCombat: (state, action) => {
      // Générer un ennemi et initialiser le combat
      state.enemy = action.payload;
      state.turnPhase = 'draw';
      state.combatLog = [
        `Combat début! Vous affrontez un ${action.payload.name}.`,
      ];

      // Réinitialiser les états de combat
      state.selectedCards = [];
      state.bestHandCards = [];
      state.handResult = null;
      state.discardUsed = false;
      state.discardMode = false;
      state.pendingDamageBonus = 0;
      state.pendingDamageMultiplier = 1;
      state.invulnerableNextTurn = false;
      state.playerDamagedLastTurn = false;

      // Initialiser ou réinitialiser le deck
      if (state.deck.length < 7) {
        state.deck = shuffleDeck(createDeck());
        state.discard = [];
      }
    },
    setTurnPhase: (state, action) => {
      state.turnPhase = action.payload;
    },
    toggleDiscardMode: (state) => {
      state.discardMode = !state.discardMode;
      // Réinitialiser les sélections lors du changement de mode
      state.selectedCards = [];
      state.hand.forEach((card) => {
        card.isSelected = false;
      });
    },
    setPendingDamageBonus: (state, action) => {
      state.pendingDamageBonus = action.payload;
    },
    setPendingDamageMultiplier: (state, action) => {
      state.pendingDamageMultiplier = action.payload;
    },
    setInvulnerableNextTurn: (state, action) => {
      state.invulnerableNextTurn = action.payload;
    },
    resetCombatState: () => initialState,
  },
});

export const {
  setEnemy,
  dealHand,
  toggleCardSelection,
  evaluateSelectedHand,
  discardCards,
  enemyAction,
  addToCombatLog,
  startCombat,
  setTurnPhase,
  toggleDiscardMode,
  setPendingDamageBonus,
  setPendingDamageMultiplier,
  setInvulnerableNextTurn,
  resetCombatState,
} = combatSlice.actions;

export default combatSlice.reducer;
