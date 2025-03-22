// src/modules/card-conservation-fix.js
// Fichier complet pour la conservation des cartes non utilisées

import { createDeck, shuffleDeck, drawCards } from '../core/deck.js';

/**
 * Version améliorée de dealHand() qui conserve les cartes non utilisées
 * Cette fonction remplace celle de game-state.js
 */
export function improvedDealHand() {
  // S'assurer que les tableaux nécessaires existent
  if (!this.hand) this.hand = [];
  if (!this.deck) this.initializeDeck();
  if (!this.discard) this.discard = [];

  console.log(
    'Avant distribution - Main actuelle:',
    this.hand.length,
    'cartes'
  );
  console.log(
    'Cartes sélectionnées:',
    this.selectedCards ? this.selectedCards.length : 0
  );

  // Garder les cartes non sélectionnées du tour précédent
  const keptCards = [];
  const keptIndices = [];

  // Important: vérifier si nous avons des cartes sélectionnées valides
  const hasValidSelectedCards =
    this.selectedCards &&
    Array.isArray(this.selectedCards) &&
    this.selectedCards.length > 0 &&
    this.turnPhase === 'result'; // Uniquement après l'attaque

  if (this.hand.length > 0 && hasValidSelectedCards) {
    // Filtrer les cartes qui n'ont pas été sélectionnées
    for (let i = 0; i < this.hand.length; i++) {
      const shouldKeep = !this.selectedCards.includes(i);

      if (shouldKeep) {
        // S'assurer que la carte n'est pas marquée comme sélectionnée
        const card = { ...this.hand[i], isSelected: false };
        keptCards.push(card);
        keptIndices.push(i);
        console.log(`Gardé carte à l'index ${i}:`, card.value, card.suit);
      } else {
        // Ajouter les cartes utilisées à la pile de défausse
        this.discard.push(this.hand[i]);
        console.log(
          `Carte utilisée à l'index ${i}:`,
          this.hand[i].value,
          this.hand[i].suit
        );
      }
    }
  } else {
    // Si pas de cartes sélectionnées valides ou phase incorrecte,
    // ne garder aucune carte (distribution complète)
    console.log('Aucune carte conservée - distribution complète');
  }

  console.log('Nombre de cartes conservées:', keptCards.length);

  // Nombre de nouvelles cartes à tirer
  const drawCount = 7 - keptCards.length;
  console.log('Nombre de cartes à tirer:', drawCount);

  // Si le deck est vide ou n'a pas assez de cartes, recréer un deck
  if (this.deck.length < drawCount) {
    // Fusionner le deck avec la défausse
    this.deck = [...this.deck, ...this.discard];
    this.discard = [];

    // Mélanger le deck
    this.deck = shuffleDeck(this.deck);

    // Si le deck est toujours trop petit, on le recrée complètement
    if (this.deck.length < drawCount) {
      this.initializeDeck();
    }
  }

  // Tirer les nouvelles cartes
  const drawnCards = drawCards(this.deck, drawCount);
  console.log('Nouvelles cartes tirées:', drawnCards.length);

  // S'assurer que toutes les nouvelles cartes ont isSelected = false
  drawnCards.forEach((card) => {
    card.isSelected = false;
  });

  // Création de la nouvelle main

  // Approche 1: Préserver les positions exactes des cartes conservées
  let newHand = new Array(7).fill(null);

  // D'abord, placer les cartes conservées à leurs positions originales
  keptIndices.forEach((originalIndex, i) => {
    // Si l'indice original est valide, placer la carte conservée à cet emplacement
    if (originalIndex >= 0 && originalIndex < 7) {
      newHand[originalIndex] = keptCards[i];
    }
  });

  // Ensuite, remplir les positions vides avec les nouvelles cartes
  let drawnCardIndex = 0;
  for (let i = 0; i < 7; i++) {
    if (newHand[i] === null && drawnCardIndex < drawnCards.length) {
      newHand[i] = drawnCards[drawnCardIndex++];
    }
  }

  // Filtrer les éléments null
  newHand = newHand.filter((card) => card !== null);

  // Si on a moins de 7 cartes, compléter avec les cartes restantes
  while (newHand.length < 7 && drawnCardIndex < drawnCards.length) {
    newHand.push(drawnCards[drawnCardIndex++]);
  }

  // Mettre à jour la main avec les cartes gardées et les nouvelles cartes
  this.hand = newHand;

  // Retirer les cartes tirées du deck
  this.deck = this.deck.slice(drawCount);

  // Reset des cartes sélectionnées et des résultats
  this.selectedCards = [];
  this.bestHandCards = [];
  this.handResult = null;
  this.discardUsed = false;
  this.discardMode = false;

  // Passer en phase "select"
  this.turnPhase = 'select';

  // Feedback
  if (this.setActionFeedback) {
    this.setActionFeedback('Nouvelles cartes distribuées', 'info');
  }

  console.log(
    'Après distribution - Main mise à jour:',
    this.hand.length,
    'cartes'
  );

  return this.hand;
}

/**
 * Version améliorée de discardCards qui est compatible avec le système de conservation
 */
export function improvedDiscardCards(indices) {
  console.log('Défausse des cartes aux indices:', indices);

  if (!indices || !Array.isArray(indices) || indices.length === 0) {
    console.warn('Aucune carte à défausser');
    return this.hand;
  }

  // Vérifier que l'on n'essaie pas de défausser plus que la limite
  if (indices.length > this.discardLimit) {
    console.warn(
      `Tentative de défausser ${indices.length} cartes alors que la limite est de ${this.discardLimit}`
    );
    indices = indices.slice(0, this.discardLimit);
  }

  // Marquer la défausse comme utilisée
  this.discardUsed = true;

  // Créer une copie de la main actuelle
  const handCopy = [...this.hand];

  // Sauvegarder les cartes défaussées
  if (!this.discard) {
    this.discard = [];
  }

  const discardedCards = indices.map((index) => {
    const card = handCopy[index];
    console.log(
      `Défausse de la carte ${card.value} de ${card.suit} à l'index ${index}`
    );
    return card;
  });

  this.discard.push(...discardedCards);

  // Gérer le deck si besoin
  if (!this.deck || this.deck.length < indices.length) {
    if (!this.deck) this.deck = [];

    // Sauvegarde temporaire des cartes défaussées
    const tempDiscardedCards = [...discardedCards];

    // Fusionner deck et défausse, puis mélanger
    this.deck = [
      ...this.deck,
      ...this.discard.filter((card) => !discardedCards.includes(card)),
    ];
    this.discard = tempDiscardedCards;

    this.deck = shuffleDeck(this.deck);

    // Si toujours insuffisant, recréer un deck
    if (this.deck.length < indices.length) {
      this.initializeDeck();
    }
  }

  // Tirer les nouvelles cartes
  const newCards = drawCards(this.deck, indices.length);

  // S'assurer que les nouvelles cartes ont isSelected = false
  newCards.forEach((card) => {
    if (card) card.isSelected = false;
  });

  // Mettre à jour le deck
  this.deck = this.deck.slice(indices.length);

  // IMPORTANT: Créer une nouvelle main en remplaçant les cartes exactement aux indices fournis
  const newHand = [...handCopy];

  // Remplacer chaque carte dans l'ordre exact des indices fournis
  indices.forEach((index, i) => {
    newHand[index] = newCards[i];
  });

  // Mise à jour de la main
  this.hand = newHand;

  // Reset des cartes sélectionnées
  this.selectedCards = [];

  // Désactiver le mode défausse
  this.discardMode = false;

  if (this.setActionFeedback) {
    this.setActionFeedback(`${indices.length} cartes défaussées`, 'info');
  }

  return this.hand;
}

/**
 * Fonction principale pour appliquer tous les correctifs au système de jeu
 * @param {Object} gameState - L'état du jeu à modifier
 * @returns {Object} L'état du jeu modifié
 */
export function applyCardConservationFixes(gameState) {
  if (!gameState) {
    console.error(
      "Impossible d'appliquer les correctifs: gameState est undefined"
    );
    return gameState;
  }

  console.log(
    'Application des correctifs de conservation des cartes non utilisées'
  );

  // Remplacer dealHand pour conserver les cartes non utilisées
  const originalDealHand = gameState.dealHand;
  gameState.dealHand = improvedDealHand.bind(gameState);
  gameState._originalDealHand = originalDealHand; // Sauvegarde au cas où

  // Remplacer discardCards pour qu'il soit compatible
  if (gameState.discardCards) {
    const originalDiscard = gameState.discardCards;
    gameState.discardCards = improvedDiscardCards.bind(gameState);
    gameState._originalDiscardCards = originalDiscard; // Sauvegarde
  }

  console.log('Correctifs appliqués avec succès');
  return gameState;
}

/**
 * Ajoute une fonction pour désactiver les correctifs si nécessaire
 */
export function removeCardConservationFixes(gameState) {
  if (!gameState) return;

  // Restaurer les fonctions originales si elles ont été sauvegardées
  if (gameState._originalDealHand) {
    gameState.dealHand = gameState._originalDealHand;
  }

  if (gameState._originalDiscardCards) {
    gameState.discardCards = gameState._originalDiscardCards;
  }

  console.log('Correctifs de conservation des cartes désactivés');
}
