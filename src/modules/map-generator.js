// src/modules/map-generator.js
/**
 * Générateur de carte roguelike pour Poker Solo RPG
 * Ce module s'occupe de la création de la carte du monde avec différents types de nœuds
 * et gère les connexions entre eux pour créer un itinéraire roguelike.
 */

/**
 * Génère une carte roguelike pour un étage donné
 * @param {number} stage - Niveau actuel du jeu
 * @param {number} width - Largeur de la carte (nombre max de nœuds par niveau)
 * @param {number} depth - Profondeur de la carte (nombre de niveaux)
 * @returns {Array} Tableau de nœuds représentant la carte
 */
export function generateRoguelikeMap(stage = 1, width = 4, depth = 5) {
  const nodes = [];
  let nodeId = 1;

  // Probabilités de chaque type de nœud en fonction de l'étage
  const nodeProbabilities = {
    combat: 0.6 - stage * 0.005, // Légèrement moins de combats aux étages supérieurs
    elite: 0.05 + stage * 0.01, // Plus d'élites aux étages supérieurs
    event: 0.2,
    shop: 0.1,
    rest: 0.15 - stage * 0.005, // Légèrement moins de repos aux étages supérieurs
  };

  // Créer le nœud de départ
  const startNode = {
    id: `${nodeId}`,
    type: 'start',
    parentIds: [],
    childIds: [],
    x: width / 2, // Position horizontale au milieu
    y: 0, // Premier niveau vertical
  };
  nodes.push(startNode);
  nodeId++;

  // Créer les nœuds intermédiaires niveau par niveau
  for (let level = 1; level < depth - 1; level++) {
    // Déterminer combien de nœuds pour ce niveau
    // Plus de variabilité aux niveaux intermédiaires
    const nodesInLevel = Math.max(
      2,
      Math.min(width, Math.floor(Math.random() * (width - 1)) + 2)
    );

    const levelNodes = [];
    // Créer les nœuds de ce niveau
    for (let i = 0; i < nodesInLevel; i++) {
      // Déterminer le type de nœud en fonction des probabilités
      const nodeType = getRandomNodeType(
        nodeProbabilities,
        level,
        depth,
        stage
      );

      // Créer le nœud
      const node = {
        id: `${nodeId}`,
        type: nodeType,
        parentIds: [], // Sera rempli plus tard
        childIds: [], // Sera rempli plus tard
        x: (i + 0.5) * (width / nodesInLevel), // Position horizontale répartie
        y: level, // Niveau vertical
      };

      // Ajouter des données spécifiques selon le type
      if (nodeType === 'event') {
        node.event = generateRandomEvent(stage);
      }
      if (nodeType === 'elite' || nodeType === 'combat') {
        node.rewards = generateCombatRewards(nodeType, stage);
      }

      levelNodes.push(node);
      nodes.push(node);
      nodeId++;
    }

    // Connecter avec le niveau précédent
    const prevLevelNodes = nodes.filter((n) => n.y === level - 1);

    // Assurer que chaque nœud a au moins une connexion entrante et sortante
    prevLevelNodes.forEach((prevNode) => {
      // Nombre de connexions sortantes par nœud (1-3)
      const numConnections = Math.floor(Math.random() * 2) + 1;

      // Sélectionner des nœuds du niveau actuel au hasard
      const selectedNodes = getRandomSubset(levelNodes, numConnections);

      // Créer les connexions
      selectedNodes.forEach((node) => {
        prevNode.childIds.push(node.id);
        node.parentIds.push(prevNode.id);
      });
    });

    // Vérifier que tous les nœuds du niveau actuel ont au moins un parent
    levelNodes.forEach((node) => {
      if (node.parentIds.length === 0) {
        // Connecter à un nœud aléatoire du niveau précédent
        const randomPrevNode =
          prevLevelNodes[Math.floor(Math.random() * prevLevelNodes.length)];
        randomPrevNode.childIds.push(node.id);
        node.parentIds.push(randomPrevNode.id);
      }
    });
  }

  // Créer le nœud boss (final)
  const bossNode = {
    id: `${nodeId}`,
    type: 'boss',
    parentIds: [],
    childIds: [],
    x: width / 2, // Position horizontale au milieu
    y: depth - 1, // Dernier niveau vertical
    rewards: generateCombatRewards('boss', stage),
  };
  nodes.push(bossNode);

  // Connecter les nœuds du niveau précédent au boss
  const preBossNodes = nodes.filter((n) => n.y === depth - 2);
  preBossNodes.forEach((node) => {
    node.childIds.push(bossNode.id);
    bossNode.parentIds.push(node.id);
  });

  return nodes;
}

/**
 * Sélectionne un type de nœud aléatoire basé sur les probabilités
 */
function getRandomNodeType(probabilities, level, depth, stage) {
  // Règles spécifiques basées sur la position
  if (level === 1) {
    // Premier niveau après le départ a une probabilité plus élevée de combat simple
    return Math.random() < 0.8 ? 'combat' : 'event';
  }

  if (level === depth - 2) {
    // Avant le boss, favoriser les sites de repos et boutiques
    const preBossProbabilities = {
      rest: 0.4,
      shop: 0.3,
      event: 0.2,
      elite: 0.1,
    };
    return getRandomWeightedChoice(preBossProbabilities);
  }

  // À partir du niveau 3, possibilité d'avoir des élites
  if (level >= 2) {
    return getRandomWeightedChoice(probabilities);
  }

  // Par défaut, combat standard
  return 'combat';
}

/**
 * Sélectionne un élément aléatoire en fonction des probabilités
 */
function getRandomWeightedChoice(probabilities) {
  const rand = Math.random();
  let sum = 0;

  for (const [type, probability] of Object.entries(probabilities)) {
    sum += probability;
    if (rand < sum) {
      return type;
    }
  }

  // Par défaut, retourner le type combat
  return 'combat';
}

/**
 * Sélectionne un sous-ensemble aléatoire d'éléments
 */
function getRandomSubset(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Génère un événement aléatoire adapté au niveau
 */
function generateRandomEvent(stage) {
  const eventTemplates = [
    {
      title: 'Marchand itinérant',
      description:
        'Vous croisez un marchand étrange avec des offres tentantes mais risquées.',
      choices: [
        {
          text: 'Acheter une potion mystérieuse (20 or)',
          goldCost: 20,
          resultText: 'La potion vous revigore complètement!',
          resultDetails: { healing: Math.floor(20 + stage * 5) },
          chance: 0.7,
        },
        {
          text: 'Acheter une carte bonus mystérieuse (50 or)',
          goldCost: 50,
          resultText: 'Vous obtenez une nouvelle carte bonus!',
          resultDetails: { card: { name: 'Carte mystérieuse' } }, // ID sera généré dans le contexte
          chance: 0.8,
        },
        {
          text: 'Partir sans rien acheter',
          resultText: 'Vous continuez votre chemin prudemment.',
        },
      ],
    },
    {
      title: 'Sanctuaire ancien',
      description:
        "Vous découvrez un autel ancien rayonnant d'énergie mystique.",
      choices: [
        {
          text: 'Faire une offrande (30 or)',
          goldCost: 30,
          resultText: "L'autel s'illumine et vous vous sentez revigoré!",
          resultDetails: { healing: Math.floor(15 + stage * 3), gold: 10 },
          chance: 0.9,
        },
        {
          text: "Méditer devant l'autel",
          resultText: 'Vous vous sentez calme et concentré.',
          resultDetails: { heal: Math.floor(5 + stage) },
          chance: 1.0,
        },
        {
          text: "Voler l'offrande présente sur l'autel",
          resultText:
            "Vous obtenez de l'or, mais vous sentez une malédiction vous frapper...",
          resultDetails: {
            gold: Math.floor(20 + stage * 10),
            healthCost: Math.floor(10 + stage * 2),
          },
          chance: 0.5,
        },
      ],
    },
    {
      title: 'Voyageur blessé',
      description:
        'Vous trouvez un voyageur blessé sur le chemin qui demande votre aide.',
      choices: [
        {
          text: 'Offrir un bandage et des soins',
          healthCost: Math.floor(5 + stage),
          resultText:
            'Reconnaissant, le voyageur vous offre un objet de valeur avant de partir.',
          resultDetails: { gold: Math.floor(15 + stage * 5) },
          chance: 0.9,
        },
        {
          text: 'Partager vos provisions',
          goldCost: 15,
          resultText:
            'Le voyageur vous remercie et partage une information précieuse.',
          resultDetails: { xp: Math.floor(10 + stage * 3) },
          chance: 1.0,
        },
        {
          text: 'Ignorer et continuer votre route',
          resultText:
            'Vous continuez sans vous arrêter, le regard du voyageur vous suit...',
          chance: 1.0,
        },
      ],
    },
  ];

  // Sélectionner un modèle d'événement au hasard
  const selectedTemplate =
    eventTemplates[Math.floor(Math.random() * eventTemplates.length)];

  // Ajuster les récompenses et coûts en fonction du niveau
  const event = JSON.parse(JSON.stringify(selectedTemplate)); // Deep copy

  return event;
}

/**
 * Génère des récompenses pour les combats en fonction du type et du niveau
 */
function generateCombatRewards(nodeType, stage) {
  let rewards = [];

  // Base de récompense d'or
  let goldBase = 0;
  switch (nodeType) {
    case 'combat':
      goldBase = 10 + stage * 5;
      break;
    case 'elite':
      goldBase = 25 + stage * 8;
      break;
    case 'boss':
      goldBase = 50 + stage * 15;
      break;
  }

  // Variabilité (+/- 20%)
  const goldVariance = goldBase * 0.2;
  const goldAmount = Math.floor(
    goldBase - goldVariance + Math.random() * goldVariance * 2
  );

  rewards.push(`${goldAmount} or`);

  // Chances de cartes bonus
  const bonusCardChance =
    nodeType === 'combat'
      ? 0.3
      : nodeType === 'elite'
        ? 0.6
        : nodeType === 'boss'
          ? 1.0
          : 0;

  if (Math.random() < bonusCardChance) {
    rewards.push('Carte bonus');
  }

  // XP
  const xpBase =
    nodeType === 'combat'
      ? 5 + stage * 2
      : nodeType === 'elite'
        ? 15 + stage * 3
        : nodeType === 'boss'
          ? 40 + stage * 5
          : 0;

  rewards.push(`${xpBase} XP`);

  return rewards;
}

/**
 * Valide la carte pour s'assurer que tous les nœuds sont accessibles
 */
export function validateMap(nodes) {
  // Vérifier que tous les nœuds ont au moins un parent (sauf le nœud de départ)
  const startNode = nodes.find((node) => node.type === 'start');
  const invalidNodes = nodes.filter(
    (node) => node.type !== 'start' && node.parentIds.length === 0
  );

  if (invalidNodes.length > 0) {
    console.error(
      "Carte invalide - certains nœuds n'ont pas de parents:",
      invalidNodes
    );
    return false;
  }

  // Vérifier que tous les chemins mènent au boss
  const bossNode = nodes.find((node) => node.type === 'boss');
  if (!bossNode) {
    console.error('Carte invalide - pas de nœud boss');
    return false;
  }

  // Vérifier la connectivité (que tous les nœuds mènent éventuellement au boss)
  const visited = new Set();
  const toVisit = [startNode.id];

  while (toVisit.length > 0) {
    const currentId = toVisit.shift();
    if (visited.has(currentId)) continue;

    visited.add(currentId);
    const currentNode = nodes.find((node) => node.id === currentId);

    if (currentNode && currentNode.childIds) {
      toVisit.push(...currentNode.childIds.filter((id) => !visited.has(id)));
    }
  }

  // S'assurer que tous les nœuds sont visités
  const unreachableNodes = nodes.filter((node) => !visited.has(node.id));
  if (unreachableNodes.length > 0) {
    console.error(
      'Carte invalide - certains nœuds sont inaccessibles:',
      unreachableNodes
    );
    return false;
  }

  return true;
}
