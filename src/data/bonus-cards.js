// src/data/bonus-cards.js

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
  },
  {
    id: 3,
    name: 'Riposte',
    description:
      'Après avoir subi des dégâts, votre prochaine attaque fait 2 dégâts supplémentaires',
    effect: 'passive',
    condition: 'damageTaken',
    rarity: CARD_RARITIES.COMMON,
    bonus: {
      type: 'damage',
      value: 2,
      originalValue: 2,
    },
  },
  {
    id: 4,
    name: 'Petite potion',
    description: 'Récupérez 5 PV après avoir obtenu une Suite',
    effect: 'passive',
    condition: 'Straight',
    rarity: CARD_RARITIES.COMMON,
    bonus: {
      type: 'heal',
      value: 5,
      originalValue: 5,
    },
  },
  {
    id: 5,
    name: 'Parade',
    description: 'Réduit de 2 les dégâts subis à chaque tour',
    effect: 'passive',
    condition: 'always',
    rarity: CARD_RARITIES.COMMON,
    bonus: {
      type: 'damageReduction',
      value: 2,
      originalValue: 2,
    },
  },

  // Uncommon cards
  {
    id: 10,
    name: 'Double frappe',
    description: 'Augmente les dégâts de la Double paire de 5 points',
    effect: 'passive',
    condition: 'Two Pair',
    rarity: CARD_RARITIES.UNCOMMON,
    bonus: {
      type: 'damage',
      value: 5,
      originalValue: 5,
    },
  },
  {
    id: 11,
    name: 'Potion de soins',
    description: 'Récupérez 10 PV après avoir obtenu un Full House',
    effect: 'passive',
    condition: 'Full House',
    rarity: CARD_RARITIES.UNCOMMON,
    bonus: {
      type: 'heal',
      value: 10,
      originalValue: 10,
    },
  },
  {
    id: 12,
    name: 'Bouclier magique',
    description: 'Accorde 5 points de bouclier après un Flush',
    effect: 'passive',
    condition: 'Flush',
    rarity: CARD_RARITIES.UNCOMMON,
    bonus: {
      type: 'shield',
      value: 5,
      originalValue: 5,
    },
  },
  {
    id: 13,
    name: 'Frappe précise',
    description: 'Une fois par combat, augmentez vos dégâts de 7 points',
    effect: 'active',
    uses: 1,
    rarity: CARD_RARITIES.UNCOMMON,
    bonus: {
      type: 'damage',
      value: 7,
      originalValue: 7,
    },
  },
  {
    id: 14,
    name: 'Coup critique',
    description: 'Augmente les dégâts du Carré de 8 points',
    effect: 'passive',
    condition: 'Four of a Kind',
    rarity: CARD_RARITIES.UNCOMMON,
    bonus: {
      type: 'damage',
      value: 8,
      originalValue: 8,
    },
  },

  // Rare cards
  {
    id: 18,
    name: 'Chance du débutant',
    description: "Permet de défausser jusqu'à 3 cartes une fois par combat",
    effect: 'active',
    uses: 1,
    rarity: CARD_RARITIES.RARE,
    bonus: {
      type: 'discard',
      value: 3,
      originalValue: 3,
    },
  },
  {
    id: 19,
    name: 'Régénération',
    description: 'Récupérez 3 PV à chaque tour',
    effect: 'passive',
    condition: 'always',
    rarity: CARD_RARITIES.RARE,
    bonus: {
      type: 'heal',
      value: 3,
      originalValue: 3,
    },
  },
  {
    id: 20,
    name: 'Frappe dévastatrice',
    description: 'Augmente les dégâts du Straight Flush de 15 points',
    effect: 'passive',
    condition: 'Straight Flush',
    rarity: CARD_RARITIES.RARE,
    bonus: {
      type: 'damage',
      value: 15,
      originalValue: 15,
    },
  },
  {
    id: 21,
    name: 'Barrière',
    description: "Une fois par combat, évitez tous les dégâts d'une attaque",
    effect: 'active',
    uses: 1,
    rarity: CARD_RARITIES.RARE,
    bonus: {
      type: 'invulnerable',
    },
  },

  // Epic cards
  {
    id: 25,
    name: 'Main royale',
    description: 'Augmente les dégâts de la Quinte Flush Royale de 25 points',
    effect: 'passive',
    condition: 'Royal Flush',
    rarity: CARD_RARITIES.EPIC,
    bonus: {
      type: 'damage',
      value: 25,
      originalValue: 25,
    },
  },
  {
    id: 26,
    name: 'Aura de puissance',
    description: 'Augmente tous vos dégâts de 3 points',
    effect: 'passive',
    condition: 'always',
    rarity: CARD_RARITIES.EPIC,
    bonus: {
      type: 'damage',
      value: 3,
      originalValue: 3,
    },
  },
  {
    id: 27,
    name: 'Potion légendaire',
    description: 'Récupérez 20 PV une fois par combat',
    effect: 'active',
    uses: 1,
    rarity: CARD_RARITIES.EPIC,
    bonus: {
      type: 'heal',
      value: 20,
      originalValue: 20,
    },
  },

  // Legendary cards
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
  },
  {
    id: 31,
    name: 'Adrénaline',
    description: 'Lorsque vos PV sont inférieurs à 25%, tous vos dégâts sont augmentés de 50%',
    effect: 'passive',
    condition: 'lowHealth',
    rarity: CARD_RARITIES.LEGENDARY,
    bonus: {
      type: 'damageMultiplier',
      value: 1.5,
      originalValue: 1.5,
    },
  },
];
