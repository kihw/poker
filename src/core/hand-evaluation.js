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
 * Évalue une main de poker de manière plus robuste
 * @param {Array} hand - Un tableau de 5 cartes
 * @returns {Object} - Le type de main et les cartes qui composent cette main
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
    if (!isValidCard(card)) {
      throw new Error(`Carte invalide à l'index ${i}: ${JSON.stringify(card)}`);
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

/**
 * Version corrigée de la fonction isStraight qui gère correctement
 * le cas particulier de la suite A-5-4-3-2
 */
export function isStraight(hand) {
  if (!hand || !Array.isArray(hand) || hand.length !== 5) {
    return false;
  }

  // Vérifier que toutes les cartes ont une valeur numérique
  for (const card of hand) {
    if (card.numericValue === undefined) {
      return false;
    }
  }

  // Trier les cartes par valeur numérique décroissante
  const sortedHand = [...hand].sort((a, b) => b.numericValue - a.numericValue);

  // Cas spécial: A-5-4-3-2 (As bas)
  if (
    sortedHand[0].numericValue === 14 && // As (haut)
    sortedHand[1].numericValue === 5 &&
    sortedHand[2].numericValue === 4 &&
    sortedHand[3].numericValue === 3 &&
    sortedHand[4].numericValue === 2
  ) {
    return true;
  }

  // Cas standard: vérifier que les cartes se suivent
  for (let i = 0; i < 4; i++) {
    if (sortedHand[i].numericValue !== sortedHand[i + 1].numericValue + 1) {
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
 * Version améliorée qui évite les NaN ou les valeurs invalides
 * @param {Object} handResult - Le résultat de l'évaluation de la main
 * @returns {number} - Les dégâts calculés
 */
export function calculateDamage(handResult) {
  if (!handResult || !handResult.type || handResult.type.rank === undefined) {
    console.warn('handResult invalide:', handResult);
    return 1; // Valeur par défaut
  }

  // Valeur doit être un nombre valide entre 0 et 9
  const rank =
    typeof handResult.type.rank === 'number' && !isNaN(handResult.type.rank)
      ? Math.max(0, Math.min(9, handResult.type.rank))
      : 0;

  // Dégâts de base: 2^rang
  const baseDamage = Math.pow(2, rank);
  return Math.max(1, Math.floor(baseDamage)); // Au moins 1 point de dégât
}

/**
 * Version améliorée de findBestHand avec une gestion plus robuste des erreurs
 * @param {Array} cards - Les cartes disponibles
 * @returns {Object} - La meilleure main trouvée et les indices des cartes qui la composent
 */
export function findBestHand(cards) {
  // Vérifications de sécurité
  if (!cards || !Array.isArray(cards)) {
    throw new Error('Les cartes doivent être un tableau valide');
  }

  // S'assurer que nous avons au moins 5 cartes
  if (cards.length < 5) {
    throw new Error(`Besoin d'au moins 5 cartes, reçu: ${cards.length}`);
  }

  // S'il y a exactement 5 cartes, pas besoin de chercher la meilleure combinaison
  if (cards.length === 5) {
    // Vérifier que toutes les cartes sont valides
    for (let i = 0; i < cards.length; i++) {
      if (!isValidCard(cards[i])) {
        throw new Error(
          `Carte invalide à l'index ${i}: ${JSON.stringify(cards[i])}`
        );
      }
    }

    try {
      const evaluation = evaluateHand(cards);
      return {
        evaluation,
        indices: [0, 1, 2, 3, 4],
      };
    } catch (error) {
      throw new Error(
        `Erreur lors de l'évaluation de la main: ${error.message}`
      );
    }
  }

  // S'il y a plus de 5 cartes, chercher la meilleure combinaison
  const combinations = getCombinations(cards.length, 5);

  let bestEvaluation = null;
  let bestIndices = [];

  for (const indices of combinations) {
    // Extraire la main actuelle
    const hand = indices.map((index) => cards[index]);

    // Vérifier que toutes les cartes sont valides
    let allValid = true;
    for (let i = 0; i < hand.length; i++) {
      if (!isValidCard(hand[i])) {
        allValid = false;
        break;
      }
    }

    if (!allValid) {
      continue; // Passer à la combinaison suivante si une carte est invalide
    }

    try {
      const evaluation = evaluateHand(hand);

      // Mettre à jour la meilleure main si celle-ci est meilleure
      if (!bestEvaluation || evaluation.type.rank > bestEvaluation.type.rank) {
        bestEvaluation = evaluation;
        bestIndices = indices;
      }
    } catch (error) {
      console.error(`Erreur d'évaluation pour les indices ${indices}:`, error);
      // Continuer avec la prochaine combinaison
    }
  }

  // Si aucune main valide n'a été trouvée, essayer de retourner une main par défaut
  if (!bestEvaluation) {
    // Trouver les 5 premières cartes valides
    const validCards = [];
    const validIndices = [];

    for (let i = 0; i < cards.length && validCards.length < 5; i++) {
      if (isValidCard(cards[i])) {
        validCards.push(cards[i]);
        validIndices.push(i);
      }
    }

    // S'il y a au moins 5 cartes valides, créer une main par défaut
    if (validCards.length >= 5) {
      try {
        const defaultEvaluation = evaluateHand(validCards.slice(0, 5));
        return {
          evaluation: defaultEvaluation,
          indices: validIndices.slice(0, 5),
        };
      } catch (error) {
        throw new Error(
          `Impossible de créer une main par défaut: ${error.message}`
        );
      }
    }

    throw new Error(
      'Aucune main valide trouvée, et impossible de créer une main par défaut'
    );
  }

  return {
    evaluation: bestEvaluation,
    indices: bestIndices,
  };
}
/**
 * Vérifie si une carte est valide
 * @param {Object} card - La carte à vérifier
 * @returns {boolean} - true si la carte est valide, false sinon
 */
function isValidCard(card) {
  return (
    card &&
    typeof card === 'object' &&
    card.value !== undefined &&
    card.suit !== undefined &&
    card.numericValue !== undefined
  );
}
/**
 * Génère toutes les combinaisons possibles de n éléments pris k à k
 * Version optimisée pour éviter les dépassements de mémoire avec de grandes entrées
 * @param {number} n - Le nombre total d'éléments
 * @param {number} k - Le nombre d'éléments à choisir
 * @returns {Array} - Un tableau de toutes les combinaisons possibles (indices)
 */
function getCombinations(n, k) {
  // Protection contre les entrées trop grandes
  if (n > 20 || k > 10) {
    console.warn(
      `Valeurs n=${n} ou k=${k} potentiellement trop grandes, limitation appliquée`
    );
    n = Math.min(n, 20);
    k = Math.min(k, 10);
  }

  const result = [];

  // Fonction récursive pour générer les combinaisons
  function backtrack(start, combination) {
    if (combination.length === k) {
      result.push([...combination]);
      return;
    }

    // Optimisation: arrêter la récursion si on ne peut plus atteindre k éléments
    if (combination.length + (n - start) < k) {
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
