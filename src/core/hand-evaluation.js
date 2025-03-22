// src/core/hand-evaluation.js

// Constantes pour les noms des mains
export const HAND_TYPES = {
  HIGH_CARD: { name: 'High Card', rank: 0 },
  PAIR: { name: 'Pair', rank: 1 },
  TWO_PAIR: { name: 'Two Pair', rank: 2 },
  THREE_OF_A_KIND: { name: 'Three of a Kind', rank: 3 },
  STRAIGHT: { name: 'Straight', rank: 4 },
  FLUSH: { name: 'Flush', rank: 5 },
  FULL_HOUSE: { name: 'Full House', rank: 6 },
  FOUR_OF_A_KIND: { name: 'Four of a Kind', rank: 7 },
  STRAIGHT_FLUSH: { name: 'Straight Flush', rank: 8 },
  ROYAL_FLUSH: { name: 'Royal Flush', rank: 9 },
};

/**
 * Évalue une main de poker et retourne le type de main
 * @param {Array} hand Un tableau de cartes
 * @returns {Object} Le type de main et les cartes qui composent cette main
 */
export function evaluateHand(hand) {
  // Vérifications de sécurité
  if (!hand || !Array.isArray(hand)) {
    throw new Error('La main doit être un tableau valide');
  }

  // On s'assure d'avoir 5 cartes
  if (hand.length !== 5) {
    throw new Error(`Hand must contain exactly 5 cards, got ${hand.length}`);
  }

  // Vérifier que les cartes ont les propriétés nécessaires
  for (let i = 0; i < hand.length; i++) {
    const card = hand[i];
    if (!card || !card.value || !card.suit || card.numericValue === undefined) {
      console.warn(`Carte invalide à l'index ${i}:`, card);
      // Créer une carte valide par défaut si nécessaire
      hand[i] = hand[i] || {
        value: '2',
        suit: 'spades',
        numericValue: 2,
      };
    }
  }

  // Trier les cartes par valeur numérique décroissante
  const sortedHand = [...hand].sort((a, b) => b.numericValue - a.numericValue);

  // Vérifier chaque type de main du plus fort au plus faible
  if (isRoyalFlush(sortedHand)) {
    return {
      type: HAND_TYPES.ROYAL_FLUSH,
      cards: sortedHand,
    };
  }

  if (isStraightFlush(sortedHand)) {
    return {
      type: HAND_TYPES.STRAIGHT_FLUSH,
      cards: sortedHand,
    };
  }

  if (isFourOfAKind(sortedHand)) {
    const { group, remainingCards } = findGroups(sortedHand, 4);
    return {
      type: HAND_TYPES.FOUR_OF_A_KIND,
      cards: [...group, ...remainingCards],
    };
  }

  if (isFullHouse(sortedHand)) {
    const { threeOfAKind, pair } = findFullHouse(sortedHand);
    return {
      type: HAND_TYPES.FULL_HOUSE,
      cards: [...threeOfAKind, ...pair],
    };
  }

  if (isFlush(sortedHand)) {
    return {
      type: HAND_TYPES.FLUSH,
      cards: sortedHand,
    };
  }

  if (isStraight(sortedHand)) {
    return {
      type: HAND_TYPES.STRAIGHT,
      cards: sortedHand,
    };
  }

  if (isThreeOfAKind(sortedHand)) {
    const { group, remainingCards } = findGroups(sortedHand, 3);
    return {
      type: HAND_TYPES.THREE_OF_A_KIND,
      cards: [...group, ...remainingCards],
    };
  }

  if (isTwoPair(sortedHand)) {
    const { pairs, remainingCards } = findTwoPair(sortedHand);
    return {
      type: HAND_TYPES.TWO_PAIR,
      cards: [...pairs, ...remainingCards],
    };
  }

  if (isPair(sortedHand)) {
    const { group, remainingCards } = findGroups(sortedHand, 2);
    return {
      type: HAND_TYPES.PAIR,
      cards: [...group, ...remainingCards],
    };
  }

  // Si aucun autre type, c'est une carte haute
  return {
    type: HAND_TYPES.HIGH_CARD,
    cards: sortedHand,
  };
}

// Fonctions auxiliaires pour vérifier chaque type de main

function isRoyalFlush(hand) {
  return isStraightFlush(hand) && hand[0].numericValue === 14; // As high
}

function isStraightFlush(hand) {
  return isFlush(hand) && isStraight(hand);
}

function isFourOfAKind(hand) {
  return hasGroupOfSameValue(hand, 4);
}

function isFullHouse(hand) {
  // On regarde si on a un brelan et une paire
  const valueCount = countValues(hand);
  const values = Object.keys(valueCount);

  return (
    values.length === 2 &&
    ((valueCount[values[0]] === 3 && valueCount[values[1]] === 2) ||
      (valueCount[values[0]] === 2 && valueCount[values[1]] === 3))
  );
}

function isFlush(hand) {
  // Toutes les cartes doivent avoir la même couleur
  if (!hand || !hand[0] || !hand[0].suit) return false;

  const firstSuit = hand[0].suit;
  return hand.every((card) => card && card.suit === firstSuit);
}

function isStraight(hand) {
  if (!hand || !Array.isArray(hand) || hand.length < 5) return false;

  // Vérifier que toutes les cartes ont une valeur numérique
  if (hand.some((card) => card.numericValue === undefined)) {
    return false;
  }

  // Cas spécial: A-5-4-3-2 (As bas)
  if (
    hand[0].numericValue === 14 &&
    hand[1].numericValue === 5 &&
    hand[2].numericValue === 4 &&
    hand[3].numericValue === 3 &&
    hand[4].numericValue === 2
  ) {
    return true;
  }

  // Vérifier si les cartes se suivent
  for (let i = 0; i < hand.length - 1; i++) {
    if (hand[i].numericValue !== hand[i + 1].numericValue + 1) {
      return false;
    }
  }

  return true;
}

function isThreeOfAKind(hand) {
  return hasGroupOfSameValue(hand, 3);
}

function isTwoPair(hand) {
  const valueCount = countValues(hand);
  const pairs = Object.keys(valueCount).filter(
    (value) => valueCount[value] === 2
  );
  return pairs.length === 2;
}

function isPair(hand) {
  return hasGroupOfSameValue(hand, 2);
}

function hasGroupOfSameValue(hand, groupSize) {
  const valueCount = countValues(hand);
  return Object.values(valueCount).some((count) => count === groupSize);
}

function countValues(hand) {
  const valueCount = {};

  for (const card of hand) {
    if (!card || card.numericValue === undefined) continue;

    const value = card.numericValue;
    valueCount[value] = (valueCount[value] || 0) + 1;
  }

  return valueCount;
}

function findGroups(hand, groupSize) {
  const valueCount = countValues(hand);
  const groupValue = Object.keys(valueCount).find(
    (value) => valueCount[value] === groupSize
  );

  if (!groupValue) {
    return { group: [], remainingCards: hand };
  }

  const group = hand.filter(
    (card) => card && card.numericValue === parseInt(groupValue)
  );
  const remainingCards = hand.filter(
    (card) => card && card.numericValue !== parseInt(groupValue)
  );

  return { group, remainingCards };
}

function findTwoPair(hand) {
  const valueCount = countValues(hand);
  const pairValues = Object.keys(valueCount)
    .filter((value) => valueCount[value] === 2)
    .map((value) => parseInt(value))
    .sort((a, b) => b - a);

  if (pairValues.length < 2) {
    return { pairs: [], remainingCards: hand };
  }

  const pairs = hand.filter(
    (card) =>
      card.numericValue === pairValues[0] || card.numericValue === pairValues[1]
  );

  const remainingCards = hand.filter(
    (card) =>
      card.numericValue !== pairValues[0] && card.numericValue !== pairValues[1]
  );

  return { pairs, remainingCards };
}

function findFullHouse(hand) {
  const valueCount = countValues(hand);
  const values = Object.keys(valueCount);

  let threeOfAKindValue, pairValue;

  if (valueCount[values[0]] === 3) {
    threeOfAKindValue = parseInt(values[0]);
    pairValue = parseInt(values[1]);
  } else {
    threeOfAKindValue = parseInt(values[1]);
    pairValue = parseInt(values[0]);
  }

  const threeOfAKind = hand.filter(
    (card) => card.numericValue === threeOfAKindValue
  );
  const pair = hand.filter((card) => card.numericValue === pairValue);

  return { threeOfAKind, pair };
}

/**
 * Calcule les dégâts en fonction du type de main
 * @param {Object} handResult Le résultat de l'évaluation de la main
 * @returns {number} Les dégâts calculés
 */
export function calculateDamage(handResult) {
  if (!handResult || !handResult.type || handResult.type.rank === undefined) {
    console.warn('handResult invalide:', handResult);
    return 1; // Valeur par défaut
  }

  // Base damage is 2^rank
  const baseDamage = Math.pow(2, handResult.type.rank);
  return baseDamage;
}

/**
 * Trouve la meilleure main de 5 cartes parmi un ensemble de cartes
 * @param {Array} cards Les cartes disponibles
 * @returns {Object} La meilleure main trouvée et les indices des cartes qui la composent
 */
export function findBestHand(cards) {
  // Vérifications de sécurité
  if (!cards || !Array.isArray(cards)) {
    throw new Error('Les cartes doivent être un tableau valide');
  }

  // S'il y a exactement 5 cartes, pas besoin de chercher
  if (cards.length === 5) {
    const evaluation = evaluateHand(cards);
    return {
      evaluation,
      indices: [0, 1, 2, 3, 4],
    };
  }

  // S'il y a plus de 5 cartes, on doit chercher la meilleure combinaison
  const combinations = getCombinations(cards.length, 5);

  let bestEvaluation = null;
  let bestIndices = [];

  for (const indices of combinations) {
    const hand = indices.map((index) => cards[index]);
    try {
      const evaluation = evaluateHand(hand);

      if (!bestEvaluation || evaluation.type.rank > bestEvaluation.type.rank) {
        bestEvaluation = evaluation;
        bestIndices = indices;
      }
    } catch (error) {
      console.error(`Erreur d'évaluation pour les indices ${indices}:`, error);
      continue;
    }
  }

  // Si aucune main valide n'a été trouvée, retourner une main par défaut
  if (!bestEvaluation) {
    console.warn('Aucune main valide trouvée, retour à la valeur par défaut');
    return {
      evaluation: {
        type: HAND_TYPES.HIGH_CARD,
        cards: cards.slice(0, 5),
      },
      indices: [0, 1, 2, 3, 4],
    };
  }

  return {
    evaluation: bestEvaluation,
    indices: bestIndices,
  };
}

/**
 * Génère toutes les combinaisons possibles de n éléments pris k à k
 * @param {number} n Le nombre total d'éléments
 * @param {number} k Le nombre d'éléments à choisir
 * @returns {Array} Un tableau de toutes les combinaisons possibles (indices)
 */
function getCombinations(n, k) {
  const result = [];

  // Fonction récursive pour générer les combinaisons
  function backtrack(start, combination) {
    if (combination.length === k) {
      result.push([...combination]);
      return;
    }

    for (let i = start; i < n; i++) {
      combination.push(i);
      backtrack(i + 1, combination);
      combination.pop();
    }
  }

  backtrack(0, []);
  return result;
}
