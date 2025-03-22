// src/data/progression.js

// Expérience requise pour monter de niveau
export const LEVEL_XP_REQUIREMENTS = [
  0, // Niveau 0 -> 1
  100, // Niveau 1 -> 2
  250, // Niveau 2 -> 3
  500, // Niveau 3 -> 4
  1000, // Niveau 4 -> 5
  1500, // Niveau 5 -> 6
  2500, // Niveau 6 -> 7
  4000, // Niveau 7 -> 8
  6000, // Niveau 8 -> 9
  10000, // Niveau 9 -> 10
];

// Récompenses pour chaque niveau
export const LEVEL_REWARDS = {
  1: {
    maxHealth: 10,
    gold: 50,
    bonusCardSlot: 0,
  },
  2: {
    maxHealth: 15,
    gold: 75,
    bonusCardSlot: 0,
  },
  3: {
    maxHealth: 20,
    gold: 100,
    bonusCardSlot: 1,
  },
  4: {
    maxHealth: 25,
    gold: 125,
    bonusCardSlot: 0,
  },
  5: {
    maxHealth: 30,
    gold: 150,
    bonusCardSlot: 1,
  },
  6: {
    maxHealth: 40,
    gold: 200,
    bonusCardSlot: 0,
  },
  7: {
    maxHealth: 50,
    gold: 250,
    bonusCardSlot: 0,
  },
  8: {
    maxHealth: 60,
    gold: 300,
    bonusCardSlot: 1,
  },
  9: {
    maxHealth: 70,
    gold: 350,
    bonusCardSlot: 0,
  },
  10: {
    maxHealth: 100,
    gold: 500,
    bonusCardSlot: 1,
  },
};

// Articles de la boutique
export const SHOP_ITEMS = [
  // Articles consommables
  {
    id: 'potion_small',
    name: 'Petite potion',
    description: 'Récupère 15 points de vie',
    price: 20,
    type: 'consumable',
    usableInCombat: true,
    effect: {
      type: 'heal',
      value: 15,
    },
  },
  {
    id: 'potion_medium',
    name: 'Potion moyenne',
    description: 'Récupère 30 points de vie',
    price: 40,
    type: 'consumable',
    usableInCombat: true,
    effect: {
      type: 'heal',
      value: 30,
    },
  },
  {
    id: 'potion_large',
    name: 'Grande potion',
    description: 'Récupère 50 points de vie',
    price: 70,
    type: 'consumable',
    usableInCombat: true,
    effect: {
      type: 'heal',
      value: 50,
    },
  },
  {
    id: 'shield_potion',
    name: 'Potion de bouclier',
    description: 'Accorde 10 points de bouclier',
    price: 30,
    type: 'consumable',
    usableInCombat: true,
    effect: {
      type: 'shield',
      value: 10,
    },
  },
  {
    id: 'damage_potion',
    name: 'Potion de force',
    description: 'Augmente les dégâts de votre prochaine attaque de 10',
    price: 25,
    type: 'consumable',
    usableInCombat: true,
    effect: {
      type: 'tempDamage',
      value: 10,
      duration: 1,
    },
  },

  // Articles permanents
  {
    id: 'heart_crystal',
    name: 'Cristal de vie',
    description: 'Augmente définitivement vos PV maximum de 10',
    price: 100,
    type: 'permanent',
    effect: {
      type: 'maxHealth',
      value: 10,
    },
  },
  {
    id: 'card_slot',
    name: 'Porte-cartes amélioré',
    description: "Permet d'équiper une carte bonus supplémentaire",
    price: 150,
    type: 'permanent',
    maxPurchases: 2,
    effect: {
      type: 'bonusCardSlot',
      value: 1,
    },
  },

  // Packs de cartes bonus
  {
    id: 'card_pack_basic',
    name: 'Pack de cartes bonus basique',
    description:
      'Ajoute 2 cartes bonus communes ou peu communes à votre collection',
    price: 50,
    type: 'bonus_card_pack',
    count: 2,
    rarityPool: ['common', 'uncommon'],
  },
  {
    id: 'card_pack_advanced',
    name: 'Pack de cartes bonus avancé',
    description: 'Ajoute 2 cartes bonus dont au moins une rare',
    price: 100,
    type: 'bonus_card_pack',
    count: 2,
    rarityPool: ['uncommon', 'rare'],
  },
  {
    id: 'card_pack_elite',
    name: "Pack de cartes bonus d'élite",
    description: 'Ajoute 2 cartes bonus rares ou épiques à votre collection',
    price: 200,
    type: 'bonus_card_pack',
    count: 2,
    rarityPool: ['rare', 'epic'],
  },
];
