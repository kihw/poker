// src/core/game-state.js
import { createDeck, shuffleDeck, drawCards } from './deck.js';
import {
  evaluateHand,
  calculateDamage,
  findBestHand,
  HAND_TYPES,
} from './hand-evaluation.js';

export class GameState {
  constructor() {
    // Game progression
    this.stage = 1;
    this.currentFloor = 1;
    this.maxFloors = 10;
    this.gamePhase = 'combat'; // combat, reward, shop, rest, event, gameOver
    this.turnPhase = 'draw'; // draw, select, result

    // Player state
    this.player = {
      health: 50,
      maxHealth: 50,
      gold: 100,
      level: 1,
      experience: 0,
      shield: 0,
      inventory: [],
    };

    // Path/map state
    this.path = null;
    this.currentNodeId = null;

    // Combat state
    this.enemy = {
      name: 'Aucun ennemi',
      health: 0,
      maxHealth: 0,
      attack: 0,
      image: '👺',
    };
    this.hand = []; // Toutes les cartes en main (7 cartes)
    this.selectedCards = []; // Indices des cartes sélectionnées pour l'attaque (1-5)
    this.deck = [];
    this.discard = [];
    this.discardLimit = 2;
    this.discardUsed = false;
    this.bestHandCards = [];
    this.combatLog = [];
    this.handResult = null;

    // Bonus card state
    this.bonusCardCollection = [];
    this.activeBonusCards = [];
    this.maxBonusCardSlots = 3;

    // Current event
    this.currentEvent = null;
    this.eventResult = null;

    // Shop state
    this.shopItems = [];

    // UI feedback states
    this.actionFeedback = null;
    this.tutorialStep = 0;
    this.showTutorial = false;

    // Initialize the deck
    this.initializeDeck();
  }

  /**
   * Initialise un nouveau deck
   */
  initializeDeck() {
    this.deck = shuffleDeck(createDeck());
    this.discard = [];
  }

  /**
   * Ajoute un feedback d'action temporaire
   * @param {string} message - Message à afficher
   * @param {string} type - Type de feedback ('success', 'error', 'info')
   * @param {number} duration - Durée en ms
   */
  setActionFeedback(message, type = 'info', duration = 2000) {
    this.actionFeedback = { message, type, timestamp: Date.now() };

    // Réinitialiser le feedback après la durée spécifiée
    setTimeout(() => {
      if (
        this.actionFeedback &&
        this.actionFeedback.timestamp + duration <= Date.now()
      ) {
        this.actionFeedback = null;
      }
    }, duration);
  }

  /**
   * Distribue une nouvelle main jusqu'à avoir 7 cartes
   */
  dealHand() {
    // Garder les cartes non sélectionnées du tour précédent
    const keptCards = [];
    if (this.hand.length > 0 && this.selectedCards.length > 0) {
      // Filtrer les cartes qui n'ont pas été sélectionnées
      for (let i = 0; i < this.hand.length; i++) {
        if (!this.selectedCards.includes(i)) {
          // S'assurer que la carte n'est pas marquée comme sélectionnée
          this.hand[i].isSelected = false;
          keptCards.push(this.hand[i]);
        }
      }
    }

    // Nombre de nouvelles cartes à tirer
    const drawCount = 7 - keptCards.length;

    // Si le deck est vide ou n'a pas assez de cartes, recréer un deck
    if (this.deck.length < drawCount) {
      this.deck = [...this.deck, ...this.discard];
      this.discard = [];
      this.deck = shuffleDeck(this.deck);

      // Si le deck est toujours trop petit, on le recrée complètement
      if (this.deck.length < drawCount) {
        this.initializeDeck();
      }
    }

    // Tirer les nouvelles cartes
    const drawnCards = drawCards(this.deck, drawCount);

    // S'assurer que toutes les nouvelles cartes ont isSelected = false
    drawnCards.forEach((card) => {
      card.isSelected = false;
    });

    // Mettre à jour la main avec les cartes gardées et les nouvelles cartes
    this.hand = [...keptCards, ...drawnCards];

    // Retirer les cartes du deck
    this.deck = this.deck.slice(drawCount);

    // Reset des cartes sélectionnées et des résultats
    this.selectedCards = [];
    this.bestHandCards = [];
    this.handResult = null;
    this.discardUsed = false;

    // Passer en phase "select"
    this.turnPhase = 'select';

    // Feedback
    this.setActionFeedback('Nouvelles cartes distribuées', 'info');

    return this.hand;
  }

  /**
   * Marque une carte comme sélectionnée ou non
   * @param {number} index L'index de la carte dans la main
   */
  toggleCardSelection(index) {
    console.log(`GameState: toggleCardSelection called with index ${index}`);

    // Vérification de la validité de l'index
    if (index < 0 || index >= this.hand.length) {
      console.error(`Invalid card index: ${index}`);
      return false;
    }

    // IMPORTANT: S'assurer que isSelected est toujours un booléen
    this.hand[index].isSelected = !Boolean(this.hand[index].isSelected);

    // IMPORTANT: Toujours reconstruire le tableau selectedCards complet
    // pour qu'il soit correctement synchronisé
    this.selectedCards = this.hand
      .map((card, idx) => (card.isSelected ? idx : -1))
      .filter((idx) => idx !== -1);

    console.log(
      `Card ${index} is now ${this.hand[index].isSelected ? 'selected' : 'deselected'}`
    );
    console.log(`Selected cards indices: ${this.selectedCards}`);

    return true; // Indique que l'opération a réussi
  }

  /**
   * Réinitialise les sélections de cartes
   */
  resetCardSelections() {
    // Réinitialiser les propriétés isSelected de toutes les cartes
    this.hand.forEach((card) => {
      card.isSelected = false;
    });

    // Vider le tableau des indices
    this.selectedCards = [];
  }

  /**
   * Évalue la main sélectionnée et calcule les dégâts
   */
  evaluateSelectedHand() {
    // S'assurer que selectedCards est synchronisé avec l'état isSelected des cartes
    this.selectedCards = this.hand
      .map((card, index) => (card.isSelected ? index : -1))
      .filter((index) => index !== -1);

    // Vérifier qu'on a entre 1 et 5 cartes sélectionnées
    if (this.selectedCards.length < 1 || this.selectedCards.length > 5) {
      throw new Error(
        `Invalid number of selected cards: ${this.selectedCards.length}. Must be between 1 and 5.`
      );
    }

    // Si moins de 5 cartes sont sélectionnées, on attaque avec la valeur simple
    if (this.selectedCards.length < 5) {
      // Calculer la somme des valeurs numériques des cartes
      let totalValue = 0;
      const selectedCardsData = [];

      for (const index of this.selectedCards) {
        const card = this.hand[index];
        totalValue += card.numericValue;
        selectedCardsData.push(card);
      }

      // Stocker le résultat
      this.handResult = {
        handName: `${this.selectedCards.length} Carte${this.selectedCards.length > 1 ? 's' : ''}`,
        handRank: 0, // Rang de base
        baseDamage: totalValue,
        totalDamage: totalValue,
        bonusEffects: [],
        cards: selectedCardsData,
      };

      // Si une fonction de bonus est disponible, l'appliquer
      if (this.bonusCardSystem) {
        const bonusResult = this.bonusCardSystem.applyBonusCardEffects(
          0, // Rang 0 pour les attaques avec moins de 5 cartes
          this.handResult.handName
        );

        this.handResult.totalDamage = bonusResult.damage;
        this.handResult.bonusEffects = bonusResult.bonusEffects;
      }
    }
    // Si 5 cartes sont sélectionnées, on utilise l'évaluateur de main de poker
    else {
      // Extraire les 5 cartes sélectionnées
      const selectedCardsData = this.selectedCards.map(
        (index) => this.hand[index]
      );

      // Trouver la meilleure main
      const result = findBestHand(selectedCardsData);

      // Sauvegarder les indices des cartes qui forment la meilleure main
      this.bestHandCards = result.indices.map((relativeIndex) => {
        // Convertir les indices relatifs en indices absolus dans la main complète
        return this.selectedCards[relativeIndex];
      });

      // Calculer les dégâts de base
      const baseDamage = calculateDamage(result.evaluation);

      // Si une fonction de bonus est disponible, l'appliquer
      let bonusEffects = [];
      let totalDamage = baseDamage;

      if (this.bonusCardSystem) {
        const bonusResult = this.bonusCardSystem.applyBonusCardEffects(
          result.evaluation.type.rank,
          result.evaluation.type.name
        );

        totalDamage = bonusResult.damage;
        bonusEffects = bonusResult.bonusEffects;
      }

      // Stocker le résultat
      this.handResult = {
        handName: result.evaluation.type.name,
        handRank: result.evaluation.type.rank,
        baseDamage: baseDamage,
        totalDamage: totalDamage,
        bonusEffects: bonusEffects,
        cards: selectedCardsData,
      };
    }

    // Appliquer les dégâts à l'ennemi si on est en combat
    if (this.enemy && this.gamePhase === 'combat') {
      this.enemy.health = Math.max(
        0,
        this.enemy.health - this.handResult.totalDamage
      );

      // Ajouter au journal de combat
      let logEntry = `Vous infligez ${this.handResult.totalDamage} dégâts avec ${this.handResult.handName}`;
      this.combatLog.unshift(logEntry);

      // Ajouter les effets bonus au journal
      if (this.handResult.bonusEffects.length > 0) {
        this.combatLog.unshift(
          `Effets bonus: ${this.handResult.bonusEffects.join(', ')}`
        );
      }
    }

    // Passer en phase "result"
    this.turnPhase = 'result';

    return this.handResult;
  }

  /**
   * Défausse les cartes sélectionnées et tire de nouvelles cartes
   * @param {Array} indices Les indices des cartes à défausser
   */
  discardCards(indices) {
    if (indices.length === 0) return;

    // Marquer la défausse comme utilisée
    this.discardUsed = true;

    // Trier les indices en ordre décroissant pour éviter les problèmes lors de la suppression
    const sortedIndices = [...indices].sort((a, b) => b - a);

    // Sauvegarder les cartes défaussées
    const discardedCards = sortedIndices.map((index) => this.hand[index]);
    this.discard.push(...discardedCards);

    // Créer une nouvelle main sans les cartes défaussées
    const newHand = [...this.hand];
    sortedIndices.forEach((index) => {
      newHand.splice(index, 1);
    });

    // Nombre de cartes à tirer
    const drawCount = indices.length;

    // Si le deck est trop petit, on recycle la défausse (sauf les cartes qu'on vient de défausser)
    if (this.deck.length < drawCount) {
      this.deck = shuffleDeck([...this.deck, ...this.discard]);
      this.discard = discardedCards; // On garde seulement les cartes qu'on vient de défausser

      // Si c'est toujours insuffisant, on recrée un deck
      if (this.deck.length < drawCount) {
        this.initializeDeck();
      }
    }

    // Tirer de nouvelles cartes
    const newCards = drawCards(this.deck, drawCount);

    // S'assurer que les nouvelles cartes ont isSelected = false
    newCards.forEach((card) => {
      card.isSelected = false;
    });

    // Mettre à jour le deck
    this.deck = this.deck.slice(drawCount);

    // Mise à jour de la main
    this.hand = [...newHand, ...newCards];

    // Reset des cartes sélectionnées
    this.selectedCards = [];

    // Feedback
    this.setActionFeedback(`${indices.length} cartes défaussées`, 'info');

    return this.hand;
  }
}
