/**
 * Évalue une main de poker de manière robuste
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
    return {
      type: HAND_TYPES.FULL_HOUSE,
      cards: sortedHand,
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
    // Trouver les deux paires
    const valueCount = countValues(sortedHand);
    const pairValues = Object.keys(valueCount)
      .filter((value) => valueCount[value] === 2)
      .map(Number)
      .sort((a, b) => b - a);

    // Trier les cartes par appartenance aux paires
    const pairs = sortedHand.filter(
      (card) =>
        card.numericValue === pairValues[0] ||
        card.numericValue === pairValues[1]
    );
    const remaining = sortedHand.filter(
      (card) =>
        card.numericValue !== pairValues[0] &&
        card.numericValue !== pairValues[1]
    );

    return {
      type: HAND_TYPES.TWO_PAIR,
      cards: [...pairs, ...remaining],
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

/**
 * Calcule les dégâts en fonction du type de main
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
 * Trouve la meilleure main possible à partir d'un ensemble de cartes
 * @param {Array} cards - Les cartes disponibles (5 ou plus)
 * @returns {Object} - La meilleure main trouvée et les indices des cartes qui la composent
 */
export function findBestHand(cards) {
  // Vérifications de sécurité
  if (!cards || !Array.isArray(cards) || cards.length < 5) {
    throw new Error("Besoin d'au moins 5 cartes");
  }

  // S'il y a exactement 5 cartes, pas besoin de chercher la meilleure combinaison
  if (cards.length === 5) {
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

  // Générer toutes les combinaisons possibles de 5 cartes
  const combinations = getCombinations(cards.length, 5);

  let bestEvaluation = null;
  let bestIndices = [];

  // Évaluer chaque combinaison
  for (const indices of combinations) {
    const hand = indices.map((index) => cards[index]);

    try {
      const evaluation = evaluateHand(hand);

      // Comparer avec la meilleure main trouvée jusqu'à présent
      if (!bestEvaluation || evaluation.type.rank > bestEvaluation.type.rank) {
        bestEvaluation = evaluation;
        bestIndices = indices;
      }
    } catch (error) {
      // Ignorer les mains invalides
      console.warn(`Erreur lors de l'évaluation d'une combinaison:`, error);
    }
  }

  if (!bestEvaluation) {
    throw new Error('Aucune main valide trouvée');
  }

  return {
    evaluation: bestEvaluation,
    indices: bestIndices,
  };
}

/**
 * Génère toutes les combinaisons possibles de n éléments pris k à k
 * @param {number} n - Le nombre total d'éléments
 * @param {number} k - Le nombre d'éléments à choisir
 * @returns {Array} - Un tableau de toutes les combinaisons possibles (indices)
 */
function getCombinations(n, k) {
  const result = [];

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
// src/core/hand-evaluation.js

// Constantes pour les types de mains
export const HAND_TYPES = {
  HIGH_CARD: { name: 'Carte Haute', rank: 0 },
  PAIR: { name: 'Paire', rank: 1 },
  TWO_PAIR: { name: 'Double Paire', rank: 2 },
  THREE_OF_A_KIND: { name: 'Brelan', rank: 3 },
  STRAIGHT: { name: 'Suite', rank: 4 },
  FLUSH: { name: 'Couleur', rank: 5 },
  FULL_HOUSE: { name: 'Full', rank: 6 },
  FOUR_OF_A_KIND: { name: 'Carré', rank: 7 },
  STRAIGHT_FLUSH: { name: 'Quinte Flush', rank: 8 },
  ROYAL_FLUSH: { name: 'Quinte Flush Royale', rank: 9 },
};

// Mapping for converting numeric values to card names
const VALUE_TO_NAME = {
  11: 'Valet',
  12: 'Dame',
  13: 'Roi',
  14: 'As',
};

/**
 * Convertit une valeur de carte en valeur numérique
 * @param {string} value - La valeur de la carte (2-10, J, Q, K, A)
 * @returns {number} - La valeur numérique (2-14)
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

  return valueMap[value] || parseInt(value) || 2; // Valeur par défaut: 2
}

/**
 * Convert numeric value to a readable card name
 * @param {number} value - Numeric card value
 * @returns {string} Readable card name
 */
function getCardName(value) {
  return VALUE_TO_NAME[value] || value.toString();
}

/**
 * Vérifie si une carte est valide
 * @param {Object} card - La carte à vérifier
 * @returns {boolean} - true si la carte est valide, false sinon
 */
export function isValidCard(card) {
  return (
    card &&
    typeof card === 'object' &&
    card.value !== undefined &&
    card.suit !== undefined &&
    card.numericValue !== undefined
  );
}

/**
 * Compte les occurrences de chaque valeur numérique dans une main
 * @param {Array} hand - Tableau de cartes
 * @returns {Object} - Dictionnaire des occurrences par valeur
 */
export function countValues(hand) {
  const valueCount = {};

  for (const card of hand) {
    if (!card || card.numericValue === undefined) continue;

    const value = card.numericValue;
    valueCount[value] = (valueCount[value] || 0) + 1;
  }

  return valueCount;
}

/**
 * Count card value occurrences
 * @param {Array} cards - Array of cards
 * @returns {Object} Counts of each card value
 */
function countValueOccurrences(cards) {
  const counts = {};
  for (const card of cards) {
    const value = card.numericValue;
    counts[value] = (counts[value] || 0) + 1;
  }
  return counts;
}

/**
 * Vérifie si une main contient une couleur (toutes cartes de même couleur)
 * @param {Array} hand - Tableau de 5 cartes
 * @returns {boolean} - true si la main contient une couleur
 */
export function isFlush(hand) {
  if (!hand || !hand[0] || !hand[0].suit) return false;

  const firstSuit = hand[0].suit;
  return hand.every((card) => card && card.suit === firstSuit);
}

/**
 * Vérifie si une main contient une suite (5 cartes de valeurs consécutives)
 * @param {Array} hand - Tableau de 5 cartes triées par valeur décroissante
 * @returns {boolean} - true si la main contient une suite
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

/**
 * Vérifie si une main contient une quinte flush (suite + couleur)
 * @param {Array} hand - Tableau de 5 cartes
 * @returns {boolean} - true si la main contient une quinte flush
 */
export function isStraightFlush(hand) {
  return isStraight(hand) && isFlush(hand);
}

/**
 * Vérifie si une main contient une quinte flush royale (10-J-Q-K-A de même couleur)
 * @param {Array} hand - Tableau de 5 cartes
 * @returns {boolean} - true si la main contient une quinte flush royale
 */
export function isRoyalFlush(hand) {
  if (!isStraightFlush(hand)) return false;

  // Trier les cartes par valeur numérique décroissante
  const sortedHand = [...hand].sort((a, b) => b.numericValue - a.numericValue);

  // Vérifier que la carte la plus haute est un As (14) et la plus basse est un 10
  return sortedHand[0].numericValue === 14 && sortedHand[4].numericValue === 10;
}

/**
 * Vérifie si une main contient un groupe de cartes de même valeur
 * @param {Array} hand - Tableau de cartes
 * @param {number} groupSize - Taille du groupe recherché (2 pour paire, 3 pour brelan, 4 pour carré)
 * @returns {boolean} - true si la main contient le groupe spécifié
 */
export function hasGroupOfSameValue(hand, groupSize) {
  const valueCount = countValues(hand);
  return Object.values(valueCount).some((count) => count === groupSize);
}

/**
 * Vérifie si une main contient un brelan (3 cartes de même valeur)
 * @param {Array} hand - Tableau de cartes
 * @returns {boolean} - true si la main contient un brelan
 */
export function isThreeOfAKind(hand) {
  return hasGroupOfSameValue(hand, 3);
}

/**
 * Vérifie si une main contient un carré (4 cartes de même valeur)
 * @param {Array} hand - Tableau de cartes
 * @returns {boolean} - true si la main contient un carré
 */
export function isFourOfAKind(hand) {
  return hasGroupOfSameValue(hand, 4);
}

/**
 * Vérifie si une main contient une paire (2 cartes de même valeur)
 * @param {Array} hand - Tableau de cartes
 * @returns {boolean} - true si la main contient une paire
 */
export function isPair(hand) {
  return hasGroupOfSameValue(hand, 2);
}

/**
 * Vérifie si une main contient deux paires
 * @param {Array} hand - Tableau de cartes
 * @returns {boolean} - true si la main contient deux paires
 */
export function isTwoPair(hand) {
  const valueCount = countValues(hand);
  const pairs = Object.keys(valueCount).filter(
    (value) => valueCount[value] === 2
  );
  return pairs.length === 2;
}

/**
 * Vérifie si une main contient un full house (brelan + paire)
 * @param {Array} hand - Tableau de cartes
 * @returns {boolean} - true si la main contient un full house
 */
export function isFullHouse(hand) {
  // On regarde si on a un brelan et une paire
  const valueCount = countValues(hand);
  const values = Object.keys(valueCount);

  return (
    values.length === 2 &&
    ((valueCount[values[0]] === 3 && valueCount[values[1]] === 2) ||
      (valueCount[values[0]] === 2 && valueCount[values[1]] === 3))
  );
}

/**
 * Trouve le groupe de cartes de même valeur dans une main
 * @param {Array} hand - Tableau de cartes
 * @param {number} groupSize - Taille du groupe (2, 3 ou 4)
 * @returns {Object} - Objet contenant le groupe et les cartes restantes
 */
export function findGroups(hand, groupSize) {
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

/**
 * Évaluer une main avec moins de 5 cartes
 * @param {Array} cards - Cartes à évaluer
 * @returns {Object} Résultat de l'évaluation
 */
export function evaluatePartialHand(cards) {
  if (!cards || cards.length === 0) {
    return {
      handName: 'Aucune carte',
      handRank: 0,
      baseDamage: 0,
    };
  }

  // Trier les cartes par valeur numérique pour évaluation cohérente
  const sortedCards = [...cards].sort(
    (a, b) => b.numericValue - a.numericValue
  );
  const valueCounts = countValueOccurrences(cards);
  const uniqueValues = Object.keys(valueCounts).map(Number);

  // Logique d'évaluation basée sur le nombre de cartes
  switch (cards.length) {
    case 1:
      return {
        handName: '1 Carte',
        handRank: 0,
        baseDamage: cards[0].numericValue,
      };

    case 2:
      // Vérifier la paire
      if (uniqueValues.length === 1) {
        return {
          handName: `Paire de ${getCardName(uniqueValues[0])}`,
          handRank: 1,
          baseDamage: Math.floor(uniqueValues[0] * 2 * 1.5), // Bonus de 50% pour une paire
        };
      }
      // Somme simple pour des valeurs différentes
      return {
        handName: '2 Cartes',
        handRank: 0,
        baseDamage: cards.reduce((sum, card) => sum + card.numericValue, 0),
      };

    case 3:
      // Brelan
      if (uniqueValues.length === 1) {
        return {
          handName: `Brelan de ${getCardName(uniqueValues[0])}`,
          handRank: 3,
          baseDamage: Math.floor(uniqueValues[0] * 3 * 2), // Bonus de 100% pour un brelan
        };
      }

      // Paire avec une carte
      if (Object.values(valueCounts).includes(2)) {
        const pairValue = uniqueValues.find((val) => valueCounts[val] === 2);
        const singleValue = uniqueValues.find((val) => valueCounts[val] === 1);

        return {
          handName: `Paire de ${getCardName(pairValue)}`,
          handRank: 1,
          baseDamage: Math.floor(pairValue * 2 * 1.5 + singleValue),
        };
      }

      // Somme simple pour des valeurs différentes
      return {
        handName: '3 Cartes',
        handRank: 0,
        baseDamage: cards.reduce((sum, card) => sum + card.numericValue, 0),
      };

    case 4:
      // Carré (toutes les cartes de même valeur)
      if (uniqueValues.length === 1) {
        return {
          handName: `Carré de ${getCardName(uniqueValues[0])}`,
          handRank: 7,
          baseDamage: Math.floor(uniqueValues[0] * 4 * 3), // Bonus de 200% pour un carré
        };
      }

      // Double paire
      if (
        uniqueValues.length === 2 &&
        Object.values(valueCounts).every((count) => count === 2)
      ) {
        const [highPair, lowPair] = uniqueValues.sort((a, b) => b - a);
        return {
          handName: `Double Paire de ${getCardName(highPair)} et ${getCardName(lowPair)}`,
          handRank: 2,
          baseDamage: Math.floor((highPair + lowPair) * 2 * 1.3), // Bonus de 30% pour deux paires
        };
      }

      // Brelan avec une carte
      if (Object.values(valueCounts).includes(3)) {
        const brealanValue = uniqueValues.find((val) => valueCounts[val] === 3);
        const singleValue = uniqueValues.find((val) => valueCounts[val] === 1);

        return {
          handName: `Brelande ${getCardName(brealanValue)}`,
          handRank: 3,
          baseDamage: Math.floor(brealanValue * 3 * 1.8 + singleValue),
        };
      }

      // Paire avec deux autres cartes
      if (Object.values(valueCounts).includes(2)) {
        const pairValue = uniqueValues.find((val) => valueCounts[val] === 2);
        const otherValues = uniqueValues.filter((val) => val !== pairValue);
        const nonPairSum = otherValues.reduce((sum, val) => sum + val, 0);

        return {
          handName: `Paire de ${getCardName(pairValue)}`,
          handRank: 1,
          baseDamage: Math.floor(pairValue * 2 * 1.3 + nonPairSum),
        };
      }

      // Somme simple pour des valeurs différentes
      return {
        handName: '4 Cartes',
        handRank: 0,
        baseDamage: cards.reduce((sum, card) => sum + card.numericValue, 0),
      };

    default:
      // Fallback pour un nombre de cartes inattendu
      return {
        handName: `${cards.length} Cartes`,
        handRank: 0,
        baseDamage: cards.reduce((sum, card) => sum + card.numericValue, 0),
      };
  }
}
