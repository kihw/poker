export const CARD_RARITIES = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
};

export const ALL_BONUS_CARDS = [
  // Common cards
  {
    id: 1,
    name: 'Soutien tactique',
    description: 'Augmente les dégâts des paires de 2 points',
    effect: 'passive',
    condition: 'Pair',
    rarity: CARD_RARITIES.COMMON,
    bonus: {
      type: 'damage',
      value: 2,
      originalValue: 2,
    },
    // Valeur de carte à jouer associée - sera attribuée lors de l'acquisition
    cardValue: undefined,
    cardSuit: undefined,
  },
  {
    id: 2,
    name: 'Frappe puissante',
    description: 'Augmente les dégâts du Brelan de 3 points',
    effect: 'passive',
    condition: 'Three of a Kind',
    rarity: CARD_RARITIES.COMMON,
    bonus: {
      type: 'damage',
      value: 3,
      originalValue: 3,
    },
    cardValue: undefined,
    cardSuit: undefined,
  },

  // ... plus de cartes ici

  {
    id: 30,
    name: 'Âme du joueur',
    description: 'Double les dégâts de votre prochaine attaque',
    effect: 'active',
    uses: 1,
    rarity: CARD_RARITIES.LEGENDARY,
    bonus: {
      type: 'damageMultiplier',
      value: 2,
      originalValue: 2,
    },
    cardValue: undefined,
    cardSuit: undefined,
  },
];
