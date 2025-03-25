// src/utils/bonusDeckEvaluator.js
import { evaluateHand, HAND_TYPES } from '../core/hand-evaluation';

/**
 * Configuration des bonus par type de combinaison de poker dans le deck bonus
 */
export const BONUS_DECK_EFFECTS = {
  HIGH_CARD: {
    name: 'Carte Haute',
    description: 'Aucun bonus particulier',
    effect: {
      type: 'none',
      value: 0,
    },
  },
  PAIR: {
    name: 'Paire',
    description: '+10% chances de coup critique',
    effect: {
      type: 'criticalChance',
      value: 10,
    },
  },
  TWO_PAIR: {
    name: 'Double Paire',
    description: '+15% défense',
    effect: {
      type: 'defense',
      value: 15,
    },
  },
  THREE_OF_A_KIND: {
    name: 'Brelan',
    description: '+20% aux dégâts sur la prochaine compétence',
    effect: {
      type: 'nextSkillDamage',
      value: 20,
    },
  },
  STRAIGHT: {
    name: 'Suite',
    description: "+15% à la vitesse d'action / initiative",
    effect: {
      type: 'actionSpeed',
      value: 15,
    },
  },
  FLUSH: {
    name: 'Couleur',
    description: '+10% aux dégâts et à la défense',
    effect: {
      type: 'multistat',
      values: {
        damage: 10,
        defense: 10,
      },
    },
  },
  FULL_HOUSE: {
    name: 'Full',
    description: '+20% de dégâts globaux',
    effect: {
      type: 'globalDamage',
      value: 20,
    },
  },
  FOUR_OF_A_KIND: {
    name: 'Carré',
    description: 'Applique un effet spécial puissant',
    effect: {
      type: 'specialEffect',
      value: 'majorBuff',
      details: 'Invulnérabilité pendant un tour',
    },
  },
  STRAIGHT_FLUSH: {
    name: 'Quinte Flush',
    description: 'Active une compétence ultime',
    effect: {
      type: 'ultimateSkill',
      value: 'powerfulAttack',
      details: 'Attaque tous les ennemis avec 2x dégâts',
    },
  },
  ROYAL_FLUSH: {
    name: 'Quinte Flush Royale',
    description: 'Effet surpuissant: domination totale',
    effect: {
      type: 'ultimate',
      value: 'domination',
      details: 'Triple dégâts et invulnérabilité pendant un tour',
    },
  },
};

/**
 * Évalue la combinaison de poker formée par les cartes bonus équipées
 * @param {Array} bonusCards - Tableau des cartes bonus équipées
 * @returns {Object} Résultat contenant la combinaison et l'effet de bonus
 */
export function evaluateBonusDeckCombination(bonusCards) {
  // Validation des entrées
  if (!bonusCards || !Array.isArray(bonusCards) || bonusCards.length === 0) {
    return {
      combination: null,
      effect: null,
      description: 'Aucune carte bonus équipée',
    };
  }

  // Si moins de 5 cartes, pas de combinaison complète possible
  if (bonusCards.length < 5) {
    return {
      combination: {
        name: `${bonusCards.length} cartes`,
        type: 'INCOMPLETE',
      },
      effect: {
        type: 'partial',
        value: Math.min(5, bonusCards.length * 2), // Bonus partiel basé sur le nombre de cartes
      },
      description: `Deck incomplet (${bonusCards.length}/5 cartes)`,
    };
  }

  // Convertir les cartes bonus en format compatible avec l'évaluateur de main
  const pokerCards = bonusCards.map((card) => ({
    value: card.cardValue,
    suit: card.cardSuit,
    numericValue: getNumericValue(card.cardValue),
  }));

  try {
    // Évaluer la main de poker avec les 5 cartes
    const handResult = evaluateHand(pokerCards);

    // Récupérer les informations de combinaison et d'effet depuis la configuration
    const combinationType = handResult.type.englishName || handResult.type.name;
    const typeKey = getHandTypeKey(combinationType);
    const bonusEffect = BONUS_DECK_EFFECTS[typeKey] || BONUS_DECK_EFFECTS.HIGH_CARD;

    return {
      combination: {
        name: handResult.type.name,
        type: typeKey,
      },
      cards: handResult.cards,
      effect: bonusEffect.effect,
      description: bonusEffect.description,
    };
  } catch (error) {
    console.error("Erreur lors de l'évaluation des cartes bonus:", error);
    return {
      combination: null,
      effect: null,
      description: "Erreur lors de l'évaluation des cartes",
    };
  }
}

/**
 * Convertit une valeur de carte en valeur numérique pour l'évaluation
 * @param {string} value - Valeur de la carte (2-10, J, Q, K, A)
 * @returns {number} Valeur numérique (2-14)
 */
function getNumericValue(value) {
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

/**
 * Convertit un nom de combinaison en clé standardisée pour accéder aux effets
 * @param {string} handName - Nom de la combinaison (peut être en français ou en anglais)
 * @returns {string} Clé standardisée
 */
function getHandTypeKey(handName) {
  const mapping = {
    // Anglais
    'High Card': 'HIGH_CARD',
    Pair: 'PAIR',
    'One Pair': 'PAIR',
    'Two Pair': 'TWO_PAIR',
    'Three of a Kind': 'THREE_OF_A_KIND',
    Straight: 'STRAIGHT',
    Flush: 'FLUSH',
    'Full House': 'FULL_HOUSE',
    'Four of a Kind': 'FOUR_OF_A_KIND',
    'Straight Flush': 'STRAIGHT_FLUSH',
    'Royal Flush': 'ROYAL_FLUSH',

    // Français
    'Carte Haute': 'HIGH_CARD',
    Paire: 'PAIR',
    'Double Paire': 'TWO_PAIR',
    Brelan: 'THREE_OF_A_KIND',
    Suite: 'STRAIGHT',
    Couleur: 'FLUSH',
    Full: 'FULL_HOUSE',
    Carré: 'FOUR_OF_A_KIND',
    'Quinte Flush': 'STRAIGHT_FLUSH',
    'Quinte Flush Royale': 'ROYAL_FLUSH',
  };

  return mapping[handName] || 'HIGH_CARD';
}
