// src/modules/event-system.js
/**
 * Système de gestion des événements aléatoires
 * Ce module génère et gère les événements rencontrés dans le jeu
 */

/**
 * Banque d'événements disponibles dans le jeu
 * Chaque événement a un titre, une description, et des choix qui peuvent
 * avoir des coûts, des récompenses et des chances de succès
 */
export const EVENT_TEMPLATES = [
  {
    id: 'merchant',
    title: 'Marchand itinérant',
    description:
      'Vous croisez un marchand étrange avec des offres tentantes mais risquées.',
    image: '🛒',
    choices: [
      {
        text: 'Acheter une potion mystérieuse (20 or)',
        goldCost: 20,
        resultText: 'La potion vous revigore complètement!',
        resultDetails: { gold: -20, healing: 20 },
        chance: 0.7,
      },
      {
        text: 'Acheter une carte bonus mystérieuse (50 or)',
        goldCost: 50,
        resultText: 'Vous obtenez une nouvelle carte bonus!',
        resultDetails: { gold: -50, card: { name: 'Carte mystérieuse' } },
        chance: 0.8,
      },
      {
        text: 'Partir sans rien acheter',
        resultText: 'Vous continuez votre chemin prudemment.',
        chance: 1.0,
      },
    ],
  },
  {
    id: 'shrine',
    title: 'Sanctuaire ancien',
    description: "Vous découvrez un autel ancien rayonnant d'énergie mystique.",
    image: '🏛️',
    choices: [
      {
        text: 'Faire une offrande (30 or)',
        goldCost: 30,
        resultText: "L'autel s'illumine et vous vous sentez revigoré!",
        resultDetails: { gold: -30, healing: 15, maxHealthBonus: 5 },
        chance: 0.9,
      },
      {
        text: "Méditer devant l'autel",
        resultText:
          'Vous vous sentez calme et concentré pour votre prochain combat.',
        resultDetails: { nextHandBonus: 2 },
        chance: 1.0,
      },
      {
        text: "Voler l'offrande présente sur l'autel",
        resultText:
          "Vous obtenez de l'or, mais vous sentez une malédiction vous frapper...",
        resultDetails: { gold: 50, healthCost: 10, curse: 'nextHandPenalty' },
        chance: 0.5,
      },
    ],
  },
  {
    id: 'traveler',
    title: 'Voyageur blessé',
    description:
      'Vous trouvez un voyageur blessé sur le chemin qui demande votre aide.',
    image: '🧙',
    choices: [
      {
        text: 'Offrir un bandage et des soins',
        healthCost: 5,
        resultText:
          'Reconnaissant, le voyageur vous offre un objet de valeur avant de partir.',
        resultDetails: {
          healthCost: 5,
          gold: 25,
          item: { name: 'Amulette de protection' },
        },
        chance: 0.9,
      },
      {
        text: 'Partager vos provisions',
        goldCost: 15,
        resultText:
          'Le voyageur vous remercie et partage une information précieuse sur le chemin à venir.',
        resultDetails: { gold: -15, mapReveal: true },
        chance: 1.0,
      },
      {
        text: 'Ignorer et continuer votre route',
        resultText:
          'Vous continuez sans vous arrêter, le regard du voyageur vous suit...',
        resultDetails: { karma: -1 },
        chance: 1.0,
      },
    ],
  },
  {
    id: 'chest',
    title: 'Coffre mystérieux',
    description:
      'Un coffre étrangement orné se trouve au milieu du chemin. Il émane une aura étrange.',
    image: '🧰',
    choices: [
      {
        text: 'Ouvrir le coffre prudemment',
        resultText: 'Le coffre contient un trésor précieux!',
        resultDetails: { gold: 40, card: { rarity: 'uncommon' } },
        chance: 0.6,
      },
      {
        text: 'Forcer la serrure (nécessite de la dextérité)',
        resultText:
          'Vous parvenez à crocheter la serrure et obtenez un trésor rare!',
        resultDetails: { gold: 70, card: { rarity: 'rare' } },
        chance: 0.4,
      },
      {
        text: 'Ignorer le coffre',
        resultText:
          'Vous passez votre chemin, préférant éviter les pièges potentiels.',
        chance: 1.0,
      },
    ],
  },
  {
    id: 'gambler',
    title: 'Joueur de cartes',
    description:
      "Un homme avec un jeu de cartes vous propose une partie avec mise. Ses yeux brillent d'une lueur étrange.",
    image: '🎲',
    choices: [
      {
        text: 'Jouer avec une petite mise (15 or)',
        goldCost: 15,
        resultText:
          'Vous gagnez la partie! Le joueur vous donne votre récompense à contrecœur.',
        failText:
          'Vous perdez la partie. Le joueur empoche votre or avec un sourire.',
        resultDetails: { gold: 30 },
        failDetails: { gold: -15 },
        chance: 0.5,
      },
      {
        text: 'Jouer avec une grosse mise (40 or)',
        goldCost: 40,
        resultText:
          'Vous remportez le gros lot! Le joueur semble surpris par votre talent.',
        failText:
          'Vous perdez tout votre argent. Le joueur rit en ramassant votre mise.',
        resultDetails: { gold: 100 },
        failDetails: { gold: -40 },
        chance: 0.4,
      },
      {
        text: 'Refuser poliment',
        resultText:
          "Vous déclinez l'offre et continuez votre route. Le joueur vous observe partir.",
        chance: 1.0,
      },
    ],
  },
  {
    id: 'fountain',
    title: 'Fontaine mystique',
    description:
      "Une fontaine aux eaux scintillantes se trouve devant vous. L'eau semble avoir des propriétés magiques.",
    image: '⛲',
    choices: [
      {
        text: "Boire l'eau de la fontaine",
        resultText: "L'eau vous revigore et apaise vos blessures.",
        failText: "L'eau a un goût étrange et vous vous sentez nauséeux.",
        resultDetails: { healing: 30 },
        failDetails: { healthCost: 5, debuff: 'poisoned' },
        chance: 0.7,
      },
      {
        text: 'Se laver les mains et le visage',
        resultText: 'Vous vous sentez rafraîchi et plus lucide.',
        resultDetails: { nextHandBonus: 3 },
        chance: 0.9,
      },
      {
        text: "Jeter une pièce d'or dans la fontaine (5 or)",
        goldCost: 5,
        resultText: 'Vous sentez que la fortune vous sourit après ce geste.',
        resultDetails: { gold: -5, buff: 'lucky' },
        chance: 1.0,
      },
    ],
  },
];

/**
 * Génère un événement aléatoire basé sur le niveau actuel et l'état du jeu
 * @param {number} stage - Le niveau actuel du jeu
 * @param {Object} gameState - L'état actuel du jeu
 * @returns {Object} Un événement aléatoire
 */
export function generateRandomEvent(stage = 1, gameState = null) {
  // Sélectionner un événement aléatoire
  const eventIndex = Math.floor(Math.random() * EVENT_TEMPLATES.length);
  const eventTemplate = EVENT_TEMPLATES[eventIndex];

  // Créer une copie profonde de l'événement
  const event = JSON.parse(JSON.stringify(eventTemplate));

  // Ajuster les récompenses et les coûts en fonction du niveau
  const scaleFactor = 1 + stage * 0.1;

  event.choices.forEach((choice) => {
    // Adapter les coûts
    if (choice.goldCost) {
      choice.goldCost = Math.floor(choice.goldCost * scaleFactor);
    }
    if (choice.healthCost) {
      choice.healthCost = Math.floor(choice.healthCost * scaleFactor);
    }

    // Adapter les récompenses
    if (choice.resultDetails) {
      if (choice.resultDetails.gold && choice.resultDetails.gold > 0) {
        choice.resultDetails.gold = Math.floor(
          choice.resultDetails.gold * scaleFactor
        );
      }
      if (choice.resultDetails.healing) {
        choice.resultDetails.healing = Math.floor(
          choice.resultDetails.healing * scaleFactor
        );
      }
    }

    // Adapter les échecs
    if (choice.failDetails) {
      if (choice.failDetails.gold && choice.failDetails.gold < 0) {
        choice.failDetails.gold = Math.floor(
          choice.failDetails.gold * scaleFactor
        );
      }
      if (choice.failDetails.healthCost) {
        choice.failDetails.healthCost = Math.floor(
          choice.failDetails.healthCost * scaleFactor
        );
      }
    }
  });

  // Ajouter un ID unique pour cet événement
  event.uniqueId = Date.now() + '-' + Math.floor(Math.random() * 1000);

  return event;
}

/**
 * Traite le résultat d'un choix d'événement
 * @param {Object} event - L'événement actuel
 * @param {number} choiceIndex - L'index du choix fait par le joueur
 * @param {Object} gameState - L'état actuel du jeu
 * @returns {Object} Le résultat du choix (succès/échec et effets)
 */
export function processEventChoice(event, choiceIndex, gameState) {
  const choice = event.choices[choiceIndex];

  // Vérifier si le choix est valide
  if (!choice) {
    return {
      success: false,
      message: 'Choix invalide',
      details: {},
    };
  }

  // Déterminer si le choix réussit ou échoue basé sur la chance
  const rollResult = Math.random();
  const isSuccess = rollResult <= (choice.chance || 1.0);

  // Déterminer le message de résultat
  const resultMessage = isSuccess
    ? choice.resultText
    : choice.failText || "Le résultat n'est pas celui que vous espériez...";

  // Déterminer les détails du résultat
  const resultDetails = isSuccess
    ? { ...(choice.resultDetails || {}) }
    : { ...(choice.failDetails || {}) };

  // Appliquer les effets au joueur
  if (gameState && gameState.player) {
    // Gestion de l'or
    if (resultDetails.gold) {
      gameState.player.gold = Math.max(
        0,
        gameState.player.gold + resultDetails.gold
      );
    }

    // Gestion des soins
    if (resultDetails.healing && resultDetails.healing > 0) {
      const healAmount = Math.min(
        resultDetails.healing,
        gameState.player.maxHealth - gameState.player.health
      );
      if (healAmount > 0) {
        gameState.player.health += healAmount;
        resultDetails.healing = healAmount; // Mettre à jour pour le message
      }
    }

    // Gestion des dégâts
    if (resultDetails.healthCost && resultDetails.healthCost > 0) {
      gameState.player.health = Math.max(
        1,
        gameState.player.health - resultDetails.healthCost
      );
    }

    // Gestion des bonus aux stats max
    if (resultDetails.maxHealthBonus && resultDetails.maxHealthBonus > 0) {
      gameState.player.maxHealth += resultDetails.maxHealthBonus;
      gameState.player.health += resultDetails.maxHealthBonus;
    }

    // Gestion des bonus pour la prochaine main
    if (resultDetails.nextHandBonus) {
      if (!gameState.playerBuffs) {
        gameState.playerBuffs = [];
      }
      gameState.playerBuffs.push({
        id: 'nextHandBonus',
        value: resultDetails.nextHandBonus,
        duration: 1,
        description: `+${resultDetails.nextHandBonus} à la prochaine main`,
      });
    }

    // Gestion des cartes bonus
    if (resultDetails.card && gameState.bonusCardSystem) {
      if (resultDetails.card.name === 'Carte mystérieuse') {
        // Générer une carte aléatoire basée sur la rareté spécifiée ou aléatoire
        const rarityLevels = [
          'common',
          'uncommon',
          'rare',
          'epic',
          'legendary',
        ];
        const rarityIndex = resultDetails.card.rarity
          ? rarityLevels.indexOf(resultDetails.card.rarity)
          : Math.floor(Math.random() * 3); // Par défaut entre common et rare

        const eligibleCards = gameState.bonusCardSystem.allBonusCards.filter(
          (card) => card.rarity === rarityLevels[rarityIndex]
        );

        if (eligibleCards.length > 0) {
          const randomCard =
            eligibleCards[Math.floor(Math.random() * eligibleCards.length)];
          resultDetails.card = {
            id: randomCard.id,
            name: randomCard.name,
            rarity: randomCard.rarity,
          };
          gameState.bonusCardSystem.addBonusCardToCollection(randomCard.id);
        }
      }
    }

    // Gestion des items
    if (resultDetails.item) {
      // Initialiser l'inventaire si nécessaire
      if (!gameState.inventory) {
        gameState.inventory = [];
      }

      // Ajouter l'item à l'inventaire
      gameState.inventory.push(resultDetails.item);
    }

    // Gestion des malédictions
    if (resultDetails.curse) {
      if (!gameState.playerDebuffs) {
        gameState.playerDebuffs = [];
      }

      gameState.playerDebuffs.push({
        id: resultDetails.curse,
        duration: 3, // Par défaut 3 tours
        description: `Malédiction: ${resultDetails.curse}`,
      });
    }

    // Ajouter au journal de combat si disponible
    if (gameState.combatLog) {
      gameState.combatLog.unshift(resultMessage);
    }
  }

  return {
    success: isSuccess,
    message: resultMessage,
    details: resultDetails,
  };
}
