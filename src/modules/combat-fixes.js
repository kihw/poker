// src/modules/combat-fixes.js
import { createDeck, shuffleDeck, drawCards } from '../core/deck.js';
export function fixedToggleCardSelection(index) {
  // Vérification de la validité de l'index
  if (index < 0 || index >= this.hand.length) {
    console.error(`Invalid card index: ${index}`);
    return false;
  }

  // Simplification: On inverse simplement l'état isSelected de la carte
  // Si isSelected n'existe pas, on l'initialise à false avant de l'inverser
  if (this.hand[index].isSelected === undefined) {
    this.hand[index].isSelected = false;
  }
  this.hand[index].isSelected = !this.hand[index].isSelected;

  // Reconstruire le tableau selectedCards à partir des propriétés isSelected
  this.selectedCards = this.hand
    .map((card, idx) => (card.isSelected ? idx : -1))
    .filter((idx) => idx !== -1);

  console.log(
    `Card ${index} is now ${this.hand[index].isSelected ? 'selected' : 'deselected'}`
  );
  console.log(`Selected cards indices: ${this.selectedCards}`);

  return true;
}

/**
 * Version corrigée de la méthode evaluateSelectedHand
 * Cette version s'assure que selectedCards est toujours synchronisé avec
 * les propriétés isSelected des cartes
 */
export function fixedEvaluateSelectedHand() {
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

  // Le reste de la fonction reste inchangé...
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
 * Version corrigée de la méthode discardCards
 * Cette version gère correctement les propriétés isSelected des nouvelles cartes
 */
export function fixedDiscardCards(indices) {
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

  // Reset des cartes sélectionnées pour être cohérent avec isSelected
  this.selectedCards = [];

  return this.hand;
}

/**
 * Version corrigée de la méthode dealHand
 * Cette version s'assure que toutes les nouvelles cartes ont isSelected = false
 * et que selectedCards est correctement réinitialisé
 */
export function fixedDealHand() {
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

  return this.hand;
}

/**
 * Cette fonction applique tous les correctifs aux classes appropriées
 * @param {Object} gameState - L'état du jeu à corriger
 */
export function applyCombatFixes(gameState) {
  if (!gameState) return;

  // Appliquer les correctifs à la classe GameState
  if (gameState.toggleCardSelection) {
    gameState.toggleCardSelection = fixedToggleCardSelection.bind(gameState);
  }

  if (gameState.evaluateSelectedHand) {
    gameState.evaluateSelectedHand = fixedEvaluateSelectedHand.bind(gameState);
  }

  if (gameState.discardCards) {
    gameState.discardCards = fixedDiscardCards.bind(gameState);
  }

  if (gameState.dealHand) {
    gameState.dealHand = fixedDealHand.bind(gameState);
  }

  console.log('Correctifs du système de combat appliqués avec succès');
}
