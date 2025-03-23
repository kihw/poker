// src/redux/slices/combatSlice.js
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
      console.log('Début dealHand - État initial:', {
        deckLength: state.deck.length,
        handLength: state.hand.length,
        discardLength: state.discard.length,
        phase: state.turnPhase,
        selectedCards: state.selectedCards,
      });

      // Garder les cartes non sélectionnées du tour précédent
      const keptCards = [];

      // Vérifier si nous avons des cartes à garder
      if (state.hand.length > 0) {
        // Sélectionner les cartes qui ne sont pas dans selectedCards (non utilisées)
        for (let i = 0; i < state.hand.length; i++) {
          const shouldKeep = !state.selectedCards.includes(i);
          if (shouldKeep) {
            // S'assurer que la carte n'est pas marquée comme sélectionnée
            const card = { ...state.hand[i], isSelected: false };
            keptCards.push(card);
          } else {
            // Ajouter les cartes utilisées à la pile de défausse
            state.discard.push(state.hand[i]);
          }
        }

        console.log(
          `Gardé ${keptCards.length} cartes, défaussé ${state.selectedCards.length} cartes`
        );
      } else {
        console.log('Aucune carte à garder, distribution complète');
      }

      // Nombre de nouvelles cartes à tirer
      const drawCount = 7 - keptCards.length;
      console.log(`Besoin de tirer ${drawCount} nouvelles cartes`);

      // Si le deck est vide ou n'a pas assez de cartes, recréer un deck
      if (
        !state.deck ||
        !Array.isArray(state.deck) ||
        state.deck.length < drawCount
      ) {
        console.log('Pas assez de cartes dans le deck, recréation...');

        // Fusionner le deck avec la défausse et mélanger
        const existingDeck = Array.isArray(state.deck) ? state.deck : [];
        const existingDiscard = Array.isArray(state.discard)
          ? state.discard
          : [];

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
        state.deck.length >= drawCount
          ? state.deck.slice(0, drawCount)
          : state.deck.slice(0);

      console.log(`Tiré ${drawnCards.length} cartes du deck`);

      // S'assurer que toutes les nouvelles cartes ont isSelected = false
      for (let card of drawnCards) {
        if (card) {
          card.isSelected = false;
        }
      }

      // Création de la nouvelle main avec les cartes conservées et les nouvelles cartes
      let newHand = [...keptCards, ...drawnCards];
      console.log(
        `Nouvelle main créée avec ${newHand.length} cartes (${keptCards.length} conservées + ${drawnCards.length} nouvelles)`
      );

      // Mettre à jour la main
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

      console.log('Fin dealHand - État final:', {
        deckLength: state.deck.length,
        handLength: state.hand.length,
        discardLength: state.discard.length,
        phase: state.turnPhase,
      });
    },
    toggleCardSelection: (state, action) => {
      const index = action.payload;
      console.log(
        'toggleCardSelection appelé, index:',
        index,
        'phase:',
        state.turnPhase
      );

      // Vérification de sécurité
      if (index < 0 || !state.hand || index >= state.hand.length) {
        console.log('Index invalide ou main inexistante');
        return;
      }

      // Vérifier qu'on est bien en phase de sélection
      if (state.turnPhase !== 'select') {
        console.log(
          'Pas en phase de sélection, phase actuelle:',
          state.turnPhase
        );
        return;
      }

      // Si en mode défausse, gérer la sélection différemment
      if (state.discardMode) {
        // Limiter le nombre de cartes à défausser
        const currentDiscardCount = state.hand.filter(
          (card) => card.isSelected
        ).length;
        if (
          currentDiscardCount >= state.discardLimit &&
          !state.hand[index].isSelected
        ) {
          console.log(
            'Limite de défausse atteinte:',
            currentDiscardCount,
            '/',
            state.discardLimit
          );
          return; // Ne pas permettre plus de cartes que la limite de défausse
        }
      } else {
        // Mode attaque normal (limiter à 5 cartes)
        const currentSelectedCount = state.hand.filter(
          (card) => card.isSelected
        ).length;
        if (currentSelectedCount >= 5 && !state.hand[index].isSelected) {
          console.log("Limite de 5 cartes atteinte pour l'attaque");
          return; // Ne pas permettre plus de 5 cartes
        }
      }

      // Inverser l'état de sélection
      state.hand[index].isSelected = !state.hand[index].isSelected;
      console.log(
        'Carte',
        index,
        'sélection mise à:',
        state.hand[index].isSelected
      );

      // Mettre à jour selectedCards en fonction du mode
      state.selectedCards = state.hand
        .map((card, idx) => (card.isSelected ? idx : -1))
        .filter((idx) => idx !== -1);

      console.log('selectedCards mis à jour:', state.selectedCards);
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
        state.enemy.health = Math.max(
          0,
          state.enemy.health - state.handResult.totalDamage
        );
        const actualDamage = oldHealth - state.enemy.health;

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

      // Sauvegarder les cartes défaussées dans la pile de défausse
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

      // Tirer de nouvelles cartes pour remplacer les cartes défaussées
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

      // Passer en phase de sélection
      state.turnPhase = 'select';
    },

    enemyAction: (state) => {
      console.log('Exécution de enemyAction, ennemi:', state.enemy?.name);

      // Vérifications de sécurité
      if (!state.enemy || state.enemy.health <= 0) {
        console.log("Ennemi mort ou inexistant, pas d'attaque");
        return;
      }

      // Vérifier d'abord l'invulnérabilité
      if (state.invulnerableNextTurn) {
        console.log('Joueur invulnérable, attaque bloquée');
        state.combatLog.unshift(
          `Vous êtes invulnérable à l'attaque de ${state.enemy.name}.`
        );
        state.invulnerableNextTurn = false;
        state.playerDamagedLastTurn = false;
        return;
      }

      // Dégâts de base de l'ennemi
      let damage = state.enemy.attack;
      console.log("Dégâts de base de l'ennemi:", damage);

      const reductionEffects = [];

      // Utiliser pendingDamageReduction si disponible
      if (state.pendingDamageReduction > 0) {
        const reduction = Math.min(damage, state.pendingDamageReduction);
        damage -= reduction;
        console.log('Réduction de dégâts appliquée:', reduction);
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
      console.log('Journal de combat mis à jour:', logEntry);

      // Marquer que le joueur a subi des dégâts
      state.playerDamagedLastTurn = damage > 0;
      console.log(
        'playerDamagedLastTurn mis à jour:',
        state.playerDamagedLastTurn
      );
    },
    addToCombatLog: (state, action) => {
      state.combatLog.unshift(action.payload);
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

  startCombat: (state, action) => {
    // Réinitialiser TOUS les états de combat à leurs valeurs initiales
    // C'est crucial pour éviter les bugs entre les combats
    state.enemy = action.payload;
    state.hand = [];
    state.selectedCards = [];
    state.deck = shuffleDeck(createDeck());
    state.discard = [];
    state.turnPhase = 'draw'; // Toujours commencer en phase de tirage
    state.discardLimit = 2;
    state.discardUsed = false;
    state.discardMode = false;
    state.bestHandCards = [];
    state.handResult = null;
    state.pendingDamageBonus = 0;
    state.pendingDamageMultiplier = 1;
    state.invulnerableNextTurn = false;
    state.playerDamagedLastTurn = false;

    // Journal de combat
    state.combatLog = [
      `Combat début! Vous affrontez un ${action.payload.name}.`,
    ];

    console.log(
      'Combat complètement réinitialisé, ennemi:',
      action.payload.name,
      'phase:',
      state.turnPhase,
      'deck:',
      state.deck.length,
      'main:',
      state.hand.length
    );
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
