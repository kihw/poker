// src/utils/test-helpers.js
import { CARD_VALUES, CARD_SUITS, getNumericValue } from '../core/deck.js';

/**
 * Crée une main de test spécifique pour le développement
 * @param {string} handType - Type de main à générer (pair, twoPair, threeOfAKind, etc.)
 * @returns {Array} - Tableau de 5 cartes correspondant au type demandé
 */
export function createTestHand(handType) {
  switch (handType.toLowerCase()) {
    case 'pair':
      return [
        { value: 'K', suit: 'hearts', numericValue: 13, isHeld: false },
        { value: 'K', suit: 'spades', numericValue: 13, isHeld: false },
        { value: '7', suit: 'diamonds', numericValue: 7, isHeld: false },
        { value: '4', suit: 'clubs', numericValue: 4, isHeld: false },
        { value: '2', suit: 'hearts', numericValue: 2, isHeld: false },
      ];

    case 'twopair':
      return [
        { value: 'Q', suit: 'hearts', numericValue: 12, isHeld: false },
        { value: 'Q', suit: 'diamonds', numericValue: 12, isHeld: false },
        { value: '8', suit: 'spades', numericValue: 8, isHeld: false },
        { value: '8', suit: 'clubs', numericValue: 8, isHeld: false },
        { value: '3', suit: 'hearts', numericValue: 3, isHeld: false },
      ];

    case 'threeofakind':
      return [
        { value: 'J', suit: 'clubs', numericValue: 11, isHeld: false },
        { value: 'J', suit: 'diamonds', numericValue: 11, isHeld: false },
        { value: 'J', suit: 'hearts', numericValue: 11, isHeld: false },
        { value: '9', suit: 'spades', numericValue: 9, isHeld: false },
        { value: '5', suit: 'clubs', numericValue: 5, isHeld: false },
      ];

    case 'straight':
      return [
        { value: '9', suit: 'hearts', numericValue: 9, isHeld: false },
        { value: '8', suit: 'spades', numericValue: 8, isHeld: false },
        { value: '7', suit: 'clubs', numericValue: 7, isHeld: false },
        { value: '6', suit: 'diamonds', numericValue: 6, isHeld: false },
        { value: '5', suit: 'hearts', numericValue: 5, isHeld: false },
      ];

    case 'flush':
      return [
        { value: 'A', suit: 'hearts', numericValue: 14, isHeld: false },
        { value: 'J', suit: 'hearts', numericValue: 11, isHeld: false },
        { value: '8', suit: 'hearts', numericValue: 8, isHeld: false },
        { value: '6', suit: 'hearts', numericValue: 6, isHeld: false },
        { value: '3', suit: 'hearts', numericValue: 3, isHeld: false },
      ];

    case 'fullhouse':
      return [
        { value: '10', suit: 'spades', numericValue: 10, isHeld: false },
        { value: '10', suit: 'hearts', numericValue: 10, isHeld: false },
        { value: '10', suit: 'clubs', numericValue: 10, isHeld: false },
        { value: '4', suit: 'diamonds', numericValue: 4, isHeld: false },
        { value: '4', suit: 'spades', numericValue: 4, isHeld: false },
      ];

    case 'fourofakind':
      return [
        { value: '7', suit: 'clubs', numericValue: 7, isHeld: false },
        { value: '7', suit: 'diamonds', numericValue: 7, isHeld: false },
        { value: '7', suit: 'hearts', numericValue: 7, isHeld: false },
        { value: '7', suit: 'spades', numericValue: 7, isHeld: false },
        { value: 'K', suit: 'clubs', numericValue: 13, isHeld: false },
      ];

    case 'straightflush':
      return [
        { value: 'J', suit: 'clubs', numericValue: 11, isHeld: false },
        { value: '10', suit: 'clubs', numericValue: 10, isHeld: false },
        { value: '9', suit: 'clubs', numericValue: 9, isHeld: false },
        { value: '8', suit: 'clubs', numericValue: 8, isHeld: false },
        { value: '7', suit: 'clubs', numericValue: 7, isHeld: false },
      ];

    case 'royalflush':
      return [
        { value: 'A', suit: 'spades', numericValue: 14, isHeld: false },
        { value: 'K', suit: 'spades', numericValue: 13, isHeld: false },
        { value: 'Q', suit: 'spades', numericValue: 12, isHeld: false },
        { value: 'J', suit: 'spades', numericValue: 11, isHeld: false },
        { value: '10', suit: 'spades', numericValue: 10, isHeld: false },
      ];

    case 'highcard':
    default:
      return [
        { value: 'A', suit: 'hearts', numericValue: 14, isHeld: false },
        { value: 'J', suit: 'clubs', numericValue: 11, isHeld: false },
        { value: '8', suit: 'diamonds', numericValue: 8, isHeld: false },
        { value: '6', suit: 'spades', numericValue: 6, isHeld: false },
        { value: '2', suit: 'clubs', numericValue: 2, isHeld: false },
      ];
  }
}

/**
 * Modifie l'état du jeu pour utiliser une main de test
 * @param {Object} gameState - L'état du jeu à modifier
 * @param {string} handType - Type de main à générer
 */
export function setTestHand(gameState, handType) {
  if (!gameState) return;

  // Générer la main de test
  const testHand = createTestHand(handType);

  // Mettre à jour l'état du jeu
  gameState.hand = testHand;
  gameState.heldCards = [];
  gameState.turnPhase = 'hold';

  // Log de debug
  console.log(`Main de test ${handType} générée:`, testHand);

  return testHand;
}

/**
 * Fonction utilitaire uniquement pour le développement
 * Génère une main de test et la force dans l'état du jeu
 */
export function DEBUG_setTestHandInGameState(gameState, handType) {
  if (!gameState) {
    console.error("GameState n'est pas disponible");
    return;
  }

  // Générer la main de test
  const testHand = setTestHand(gameState, handType);

  // Forcer la mise à jour de l'interface
  if (gameState.evaluateCurrentHand) {
    setTimeout(() => {
      gameState.evaluateCurrentHand();
    }, 100);
  }

  return testHand;
}
