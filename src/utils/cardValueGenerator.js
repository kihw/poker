// src/utils/cardValueGenerator.js

/**
 * Utilitaire pour générer des valeurs de cartes à jouer aléatoires
 * pour les cartes bonus
 */

// Constantes pour les valeurs et couleurs de cartes
export const CARD_VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const CARD_SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];

/**
 * Génère une valeur de carte à jouer aléatoire
 * @returns {string} Valeur aléatoire ('2' à '10', 'J', 'Q', 'K', 'A')
 */
export function generateRandomCardValue() {
  const randomIndex = Math.floor(Math.random() * CARD_VALUES.length);
  return CARD_VALUES[randomIndex];
}

/**
 * Génère une couleur de carte à jouer aléatoire
 * @returns {string} Couleur aléatoire ('hearts', 'diamonds', 'clubs', 'spades')
 */
export function generateRandomCardSuit() {
  const randomIndex = Math.floor(Math.random() * CARD_SUITS.length);
  return CARD_SUITS[randomIndex];
}

/**
 * Génère une carte à jouer complète avec valeur et couleur aléatoires
 * @returns {Object} Objet contenant cardValue et cardSuit
 */
export function generateRandomPlayingCard() {
  return {
    cardValue: generateRandomCardValue(),
    cardSuit: generateRandomCardSuit(),
  };
}

/**
 * Génère une carte à jouer spécifique (non aléatoire)
 * @param {string} value - La valeur de la carte ('2' à '10', 'J', 'Q', 'K', 'A')
 * @param {string} suit - La couleur de la carte ('hearts', 'diamonds', 'clubs', 'spades')
 * @returns {Object} Objet contenant cardValue et cardSuit
 */
export function generateSpecificPlayingCard(value, suit) {
  // Vérifier que la valeur et la couleur sont valides
  if (!CARD_VALUES.includes(value) || !CARD_SUITS.includes(suit)) {
    console.warn(
      'Valeur ou couleur de carte invalide, utilisation de valeurs aléatoires à la place'
    );
    return generateRandomPlayingCard();
  }

  return {
    cardValue: value,
    cardSuit: suit,
  };
}

/**
 * Obtient le symbole visuel correspondant à une couleur de carte
 * @param {string} suit - La couleur de la carte ('hearts', 'diamonds', 'clubs', 'spades')
 * @returns {string} Le symbole correspondant ('♥️', '♦️', '♣️', '♠️')
 */
export function getSuitSymbol(suit) {
  const suitSymbols = {
    hearts: '♥️',
    diamonds: '♦️',
    clubs: '♣️',
    spades: '♠️',
  };
  return suitSymbols[suit] || '♠️';
}

/**
 * Convertit une valeur de carte en valeur numérique (pour les comparaisons)
 * @param {string} value - La valeur de la carte ('2' à '10', 'J', 'Q', 'K', 'A')
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
  return valueMap[value] || parseInt(value) || 2;
}

export default {
  generateRandomCardValue,
  generateRandomCardSuit,
  generateRandomPlayingCard,
  generateSpecificPlayingCard,
  getSuitSymbol,
  getNumericValue,
  CARD_VALUES,
  CARD_SUITS,
};
