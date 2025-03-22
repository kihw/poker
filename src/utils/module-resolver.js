// src/utils/module-resolver.js
/**
 * Ce module implémente un système de registre de modules pour résoudre les références circulaires
 * et améliorer la modularité du code.
 *
 * Problème:
 * Les références circulaires (module A importe module B, module B importe module A)
 * causent des problèmes à l'exécution et rendent le code difficile à maintenir.
 *
 * Solution:
 * - Utiliser un registre de modules centralisé
 * - Inverser les dépendances (dependency inversion)
 * - Initialiser les modules dans un ordre déterminé
 */

// Registre global des modules
const moduleRegistry = {};

// Registre des dépendances
const moduleDependencies = {};

/**
 * Enregistre un module dans le registre
 * @param {string} moduleName - Nom du module
 * @param {Object|Function} moduleInstance - Instance du module ou fonction factory
 * @param {Array<string>} dependencies - Noms des modules dont ce module dépend
 */
export function registerModule(moduleName, moduleInstance, dependencies = []) {
  // Vérifier si le module existe déjà
  if (moduleRegistry[moduleName]) {
    console.warn(
      `Module "${moduleName}" est déjà enregistré. Il sera remplacé.`
    );
  }

  // Enregistrer le module et ses dépendances
  moduleRegistry[moduleName] = moduleInstance;
  moduleDependencies[moduleName] = dependencies;

  console.log(
    `Module "${moduleName}" enregistré avec dépendances: [${dependencies.join(', ')}]`
  );
}

/**
 * Récupère un module du registre
 * @param {string} moduleName - Nom du module à récupérer
 * @returns {Object} - Instance du module
 */
export function getModule(moduleName) {
  const module = moduleRegistry[moduleName];

  if (!module) {
    throw new Error(`Module "${moduleName}" n'est pas enregistré.`);
  }

  return module;
}

/**
 * Initialise tous les modules enregistrés dans le bon ordre
 * en respectant leurs dépendances
 */
export function initializeModules() {
  const initialized = new Set();
  const initializing = new Set();

  // Fonction récursive pour initialiser un module et ses dépendances
  function initModule(moduleName) {
    // Détecter les dépendances circulaires
    if (initializing.has(moduleName)) {
      console.error(
        `Dépendance circulaire détectée pour le module "${moduleName}"`
      );
      return;
    }

    // Si le module est déjà initialisé, ne rien faire
    if (initialized.has(moduleName)) {
      return;
    }

    // Marquer le module comme en cours d'initialisation
    initializing.add(moduleName);

    // Initialiser d'abord les dépendances
    const dependencies = moduleDependencies[moduleName] || [];
    for (const dependency of dependencies) {
      initModule(dependency);
    }

    // Récupérer le module
    const module = moduleRegistry[moduleName];

    // Si le module est une fonction, l'exécuter avec ses dépendances résolues
    if (typeof module === 'function') {
      const resolvedDependencies = dependencies.map(
        (dep) => moduleRegistry[dep]
      );
      moduleRegistry[moduleName] = module(...resolvedDependencies);
    }

    // Marquer comme initialisé et retirer de la liste en cours d'initialisation
    initialized.add(moduleName);
    initializing.delete(moduleName);

    console.log(`Module "${moduleName}" initialisé avec succès`);
  }

  // Initialiser tous les modules
  for (const moduleName in moduleRegistry) {
    initModule(moduleName);
  }

  console.log(
    `Initialisation terminée: ${initialized.size} modules initialisés`
  );
  return Array.from(initialized);
}

/**
 * Réinitialise le registre des modules
 * Utile pour les tests ou hot-reloading
 */
export function resetModuleRegistry() {
  for (const moduleName in moduleRegistry) {
    delete moduleRegistry[moduleName];
  }
  for (const moduleName in moduleDependencies) {
    delete moduleDependencies[moduleName];
  }
  console.log('Registre des modules réinitialisé');
}

/**
 * Crée un module avec injection de dépendances
 * @param {Function} factory - Fonction factory qui reçoit les dépendances et retourne le module
 * @param {Array<string>} dependencies - Liste des noms des modules dont ce module dépend
 * @returns {Function} - Fonction factory avec les dépendances configurées
 */
export function createModule(factory, dependencies = []) {
  return function registerAndCreate(moduleName) {
    registerModule(moduleName, factory, dependencies);
    return {
      name: moduleName,
      dependencies,
    };
  };
}

/**
 * Fonction pour résoudre les références circulaires entre les modules du jeu
 */
export function setupGameModules() {
  // Réinitialiser le registre (au cas où)
  resetModuleRegistry();

  // === 1. Enregistrer les modules de base ===
  // Ces modules n'ont pas de dépendances

  // Module pour le système de cartes de base
  registerModule('deckSystem', {
    createDeck: () => {
      /* ... */
    },
    shuffleDeck: (deck) => {
      /* ... */
    },
    drawCards: (deck, count) => {
      /* ... */
    },
  });

  // Module pour l'évaluation des mains
  registerModule('handEvaluationSystem', {
    evaluateHand: (cards) => {
      /* ... */
    },
    calculateDamage: (hand) => {
      /* ... */
    },
  });

  // === 2. Enregistrer les modules avec dépendances ===

  // Système de cartes bonus (dépend du système de combat)
  registerModule(
    'bonusCardsSystem',
    (combatSystem) => ({
      applyBonusEffects: (handResult) => {
        /* ... */
      },
      equipCard: (cardId) => {
        /* ... */
      },
      unequipCard: (cardId) => {
        /* ... */
      },
    }),
    ['combatSystem']
  );

  // Système de combat (dépend du système de cartes bonus)
  registerModule(
    'combatSystem',
    (bonusCardsSystem) => ({
      startCombat: () => {
        /* ... */
      },
      endCombat: () => {
        /* ... */
      },
    }),
    ['bonusCardsSystem']
  );

  // === 3. Initialiser les modules ===
  initializeModules();

  // Retourner les modules initialisés pour utilisation
  return {
    deckSystem: getModule('deckSystem'),
    handEvaluationSystem: getModule('handEvaluationSystem'),
    bonusCardsSystem: getModule('bonusCardsSystem'),
    combatSystem: getModule('combatSystem'),
  };
}

// Exporter une fonction pour obtenir les modules du jeu
let gameModules = null;

export function getGameModules() {
  if (!gameModules) {
    gameModules = setupGameModules();
  }
  return gameModules;
}
