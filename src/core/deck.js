// src/core/deck.js

// Définition des valeurs et des couleurs
export const CARD_VALUES = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
  'A',
];
export const CARD_SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];

/**
 * Crée un nouveau deck de 52 cartes
 * @returns {Array} Un tableau contenant toutes les cartes
 */
export function createDeck() {
  const deck = [];

  // Générer toutes les cartes possibles
  for (const suit of CARD_SUITS) {
    for (const value of CARD_VALUES) {
      deck.push({
        value: value,
        suit: suit,
        // Pour faciliter l'évaluation des mains, on ajoute une valeur numérique
        numericValue: getNumericValue(value),
      });
    }
  }

  return deck;
}

/**
 * Mélange un deck de cartes
 * @param {Array} deck Le deck à mélanger
 * @returns {Array} Le deck mélangé
 */
export function shuffleDeck(deck) {
  // Créer une copie du deck pour ne pas modifier l'original
  const shuffled = [...deck];

  // Algorithme de Fisher-Yates pour mélanger
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Tire un certain nombre de cartes du deck
 * @param {Array} deck Le deck de cartes
 * @param {number} count Le nombre de cartes à tirer
 * @returns {Array} Les cartes tirées
 */
export function drawCards(deck, count) {
  if (count > deck.length) {
    throw new Error(
      `Cannot draw ${count} cards from a deck of ${deck.length} cards`
    );
  }

  // Prendre les premières cartes du deck
  return deck.slice(0, count);
}

/**
 * Convertit une valeur de carte en valeur numérique
 * @param {string} value La valeur de la carte (2-10, J, Q, K, A)
 * @returns {number} La valeur numérique (2-14)
 */
export function getNumericValue(value) {
  const valueMap = {
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  };

  return valueMap[value] || parseInt(value);
}
