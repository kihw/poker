// src/modules/combat-fixes.js
import { createDeck, shuffleDeck, drawCards } from '../core/deck.js';
import {
  evaluateHand,
  calculateDamage,
  findBestHand,
  HAND_TYPES,
} from '../core/hand-evaluation.js';

export function fixedToggleCardSelection(index) {
  // Vérification de la validité de l'index
  if (index < 0 || index >= this.hand.length) {
    console.error(`Invalid card index: ${index}`);
    return false;
  }

  // Simplification: On inverse simplement l'état isSelected de la carte
  // Si isSelected n'existe pas, on l'initialise à false avant de l'inverser
  if (this.hand[index].isSelected === undefined) {
    this.hand[index].isSelected = false;
  }
  this.hand[index].isSelected = !this.hand[index].isSelected;

  // Reconstruire le tableau selectedCards à partir des propriétés isSelected
  this.selectedCards = this.hand
    .map((card, idx) => (card.isSelected ? idx : -1))
    .filter((idx) => idx !== -1);

  console.log(
    `Card ${index} is now ${this.hand[index].isSelected ? 'selected' : 'deselected'}`
  );
  console.log(`Selected cards indices: ${this.selectedCards}`);

  return true;
}

export function gameOverStateGuard(gameState) {
  // Appliquer cette garde à toutes les fonctions qui manipulent gamePhase
  const originalNextStage = gameState.nextStage;
  gameState.nextStage = function (...args) {
    // Ne pas permettre de changer d'étape si le jeu est terminé
    if (this.gamePhase === 'gameOver' || this.isGameOver) {
      console.warn('Action empêchée: le jeu est terminé');
      return false;
    }
    return originalNextStage.apply(this, args);
  };

  // Similaire pour selectNode si elle existe
  if (gameState.selectNode) {
    const originalSelectNode = gameState.selectNode;
    gameState.selectNode = function (...args) {
      if (this.gamePhase === 'gameOver' || this.isGameOver) {
        console.warn('Sélection de nœud empêchée: le jeu est terminé');
        return false;
      }
      return originalSelectNode.apply(this, args);
    };
  }

  // Pour les autres fonctions qui pourraient ignorer l'état game over...

  console.log("Protection de l'état Game Over activée");
}
export function applyDeathHandlingFixes(gameState, combatSystem) {
  if (!gameState || !combatSystem) {
    console.warn(
      'gameState ou combatSystem non définis pour applyDeathHandlingFixes'
    );
    return;
  }

  // Remplacer la méthode checkCombatEnd par notre version améliorée
  combatSystem.checkCombatEnd = improvedCheckCombatEnd.bind(combatSystem);

  // S'assurer que la fonction enemyAction gère correctement la mort du joueur
  const originalEnemyAction = combatSystem.enemyAction;
  combatSystem.enemyAction = function () {
    // Ne pas exécuter l'action ennemie si le joueur est déjà mort
    if (gameState.gamePhase === 'gameOver' || gameState.isGameOver) {
      console.log('Action ennemie ignorée: le jeu est terminé');
      return;
    }

    // Exécuter l'action originale
    originalEnemyAction.call(this);

    // Vérifier immédiatement si le joueur est mort après l'attaque ennemie
    if (gameState.player.health <= 0) {
      this.checkCombatEnd();
    }
  };

  // Ajouter la protection de l'état game over
  gameOverStateGuard(gameState);

  console.log('Correctifs de gestion de la mort appliqués avec succès');
}
/**
 * Vérification supplémentaire pour la mort du joueur qui est appelée après l'action ennemie
 */
export function checkPlayerDeath(gameState) {
  if (!gameState || !gameState.player) return false;

  // Vérifier si le joueur est mort
  if (gameState.player.health <= 0) {
    console.log('Détection de mort du joueur');

    // Mettre la santé à zéro pour éviter les valeurs négatives
    gameState.player.health = 0;

    // Changer la phase de jeu
    gameState.gamePhase = 'gameOver';
    gameState.isGameOver = true;

    // Ajouter au journal de combat
    if (gameState.combatLog) {
      gameState.combatLog.unshift('Game Over! Vous avez été vaincu.');
    }

    // Feedback visuel
    if (gameState.setActionFeedback) {
      gameState.setActionFeedback(
        'Game Over! Vous avez été vaincu.',
        'error',
        5000
      );
    }

    console.log('État Game Over activé');
    return true;
  }

  return false;
}
export function improvedCheckCombatEnd() {
  // Vérifier que les propriétés nécessaires existent
  if (!this.gameState || !this.gameState.player) {
    console.error('gameState ou player non défini dans checkCombatEnd');
    return false;
  }

  // Vérifier si le joueur est mort (santé <= 0)
  if (this.gameState.player.health <= 0) {
    // Sécurité pour éviter que la santé soit négative
    this.gameState.player.health = 0;

    // Mettre à jour le journal de combat
    if (this.gameState.combatLog) {
      this.gameState.combatLog.unshift('Game Over! Vous avez été vaincu.');
    }

    // Changer la phase du jeu à "gameOver" et forcer une sauvegarde immédiate
    this.gameState.gamePhase = 'gameOver';

    // Ajouter un drapeau spécial pour éviter toute modification ultérieure
    this.gameState.isGameOver = true;

    // Envoyer un feedback visuel si disponible
    if (this.gameState.setActionFeedback) {
      this.gameState.setActionFeedback(
        'Game Over! Vous avez été vaincu.',
        'error',
        5000
      );
    }

    // Sauvegarder immédiatement l'état de game over si possible
    if (typeof saveGame === 'function' && this.gameState) {
      try {
        saveGame(this.gameState);
        console.log('État Game Over sauvegardé');
      } catch (error) {
        console.error(
          "Erreur lors de la sauvegarde de l'état Game Over",
          error
        );
      }
    }

    console.log('Joueur vaincu - Game Over');
    return false;
  }
  // Vérifier si le joueur est mort (santé <= 0)
  if (this.player && this.player.health <= 0) {
    // Forcer le passage à game over
    checkPlayerDeath(this);

    // Si un système de combat est disponible, utiliser également sa vérification
    if (this.combatSystem && this.combatSystem.checkCombatEnd) {
      this.combatSystem.checkCombatEnd();
    }
  }
  // Vérifier si l'ennemi est mort (santé <= 0)
  if (this.gameState.enemy && this.gameState.enemy.health <= 0) {
    // Sécurité pour éviter que la santé soit négative
    this.gameState.enemy.health = 0;

    // Mettre à jour le journal de combat
    if (this.gameState.combatLog) {
      this.gameState.combatLog.unshift(
        `Vous avez vaincu ${this.gameState.enemy.name}!`
      );
    }

    // Changer la phase du jeu à "reward"
    this.gameState.gamePhase = 'reward';

    // Traiter les récompenses du combat
    this.processCombatRewards();

    console.log('Ennemi vaincu - Combat terminé');
    return true;
  }

  // Si personne n'est mort, le combat continue
  return null;
}

/**
 * Évalue une main de cartes, même avec moins de 5 cartes
 * Détecte les combinaisons comme les paires
 * @param {Array} selectedCards - Les cartes sélectionnées
 * @returns {Object} Résultat de l'évaluation
 */
export function evaluatePartialHand(selectedCards) {
  if (!selectedCards || selectedCards.length === 0) {
    return {
      handName: 'Aucune carte',
      handRank: 0,
      baseDamage: 0,
    };
  }

  // Compter les occurrences de chaque valeur
  const valueCounts = {};
  for (const card of selectedCards) {
    const val = card.numericValue;
    valueCounts[val] = (valueCounts[val] || 0) + 1;
  }

  // Vérifier les différentes combinaisons possibles
  const values = Object.keys(valueCounts).map(Number);
  const counts = Object.values(valueCounts);

  // 1. Vérifier une paire (2 cartes de même valeur)
  if (selectedCards.length === 2 && counts.includes(2)) {
    // C'est une paire
    const pairValue = parseInt(
      Object.keys(valueCounts).find((key) => valueCounts[key] === 2)
    );
    return {
      handName: `Paire de ${getCardNameForValue(pairValue)}`,
      handRank: 1, // Rang d'une paire
      baseDamage: pairValue * 2 * 1.5, // Bonus de 50% pour une paire
    };
  }

  // 2. Vérifier un brelan (3 cartes de même valeur)
  if (selectedCards.length === 3 && counts.includes(3)) {
    const tripletValue = parseInt(
      Object.keys(valueCounts).find((key) => valueCounts[key] === 3)
    );
    return {
      handName: `Brelan de ${getCardNameForValue(tripletValue)}`,
      handRank: 3, // Rang d'un brelan
      baseDamage: tripletValue * 3 * 2, // Bonus de 100% pour un brelan
    };
  }

  // 3. Vérifier un carré (4 cartes de même valeur)
  if (selectedCards.length === 4 && counts.includes(4)) {
    const quadValue = parseInt(
      Object.keys(valueCounts).find((key) => valueCounts[key] === 4)
    );
    return {
      handName: `Carré de ${getCardNameForValue(quadValue)}`,
      handRank: 7, // Rang d'un carré
      baseDamage: quadValue * 4 * 3, // Bonus de 200% pour un carré
    };
  }

  // 4. Vérifier deux paires (4 cartes, 2 paires différentes)
  if (
    selectedCards.length === 4 &&
    counts.filter((c) => c === 2).length === 2
  ) {
    const pairValues = Object.keys(valueCounts)
      .filter((key) => valueCounts[key] === 2)
      .map((key) => parseInt(key))
      .sort((a, b) => b - a);

    return {
      handName: `Double paire de ${getCardNameForValue(pairValues[0])} et ${getCardNameForValue(pairValues[1])}`,
      handRank: 2, // Rang d'une double paire
      baseDamage: (pairValues[0] + pairValues[1]) * 2, // Valeur totale des paires
    };
  }

  // Si aucune combinaison spéciale n'est trouvée, calculer la valeur simple
  let totalValue = selectedCards.reduce(
    (sum, card) => sum + card.numericValue,
    0
  );

  return {
    handName: `${selectedCards.length} Carte${selectedCards.length > 1 ? 's' : ''}`,
    handRank: 0,
    baseDamage: totalValue,
  };
}

/**
 * Convertit une valeur numérique en nom de carte
 * @param {number} value - Valeur numérique (2-14)
 * @returns {string} Nom de la carte
 */
function getCardNameForValue(value) {
  const valueMap = {
    11: 'Valet',
    12: 'Dame',
    13: 'Roi',
    14: 'As',
  };

  return valueMap[value] || value.toString();
}

/**
 * Version améliorée de evaluateSelectedHand qui détecte les combinaisons
 * même avec moins de 5 cartes
 */
export function enhancedEvaluateSelectedHand() {
  if (!this.hand || !Array.isArray(this.hand)) {
    console.error("La main n'est pas initialisée");
    return null;
  }

  // Synchroniser selectedCards avec les cartes marquées comme isSelected
  this.selectedCards = this.hand
    .map((card, index) => (card.isSelected ? index : -1))
    .filter((index) => index !== -1);

  // Vérifier qu'on a au moins 1 carte sélectionnée
  if (this.selectedCards.length < 1) {
    console.error('Aucune carte sélectionnée');
    return null;
  }

  // Extraire les cartes sélectionnées
  const selectedCardsData = this.selectedCards
    .map((index) => this.hand[index])
    .filter((card) => card); // Filtrer les cartes non définies

  let result;

  // Si moins de 5 cartes sont sélectionnées, utiliser notre fonction spéciale
  if (this.selectedCards.length < 5) {
    result = evaluatePartialHand(selectedCardsData);

    // Stocker le résultat
    this.handResult = {
      handName: result.handName,
      handRank: result.handRank,
      baseDamage: result.baseDamage,
      totalDamage: result.baseDamage,
      bonusEffects: [],
      cards: selectedCardsData,
    };

    console.log(
      `Main évaluée (< 5 cartes): ${result.handName}, dégâts de base: ${result.baseDamage}`
    );
  }
  // Si 5 cartes sont sélectionnées, utiliser l'évaluateur standard
  else {
    try {
      // Trouver la meilleure main
      const bestHand = findBestHand(selectedCardsData);

      // Sauvegarder les indices des cartes qui forment la meilleure main
      this.bestHandCards = bestHand.indices.map((relativeIndex) => {
        // Convertir les indices relatifs en indices absolus dans la main complète
        return this.selectedCards[relativeIndex];
      });

      // Calculer les dégâts de base
      const baseDamage = calculateDamage(bestHand.evaluation);

      // Stocker le résultat
      this.handResult = {
        handName: bestHand.evaluation.type.name,
        handRank: bestHand.evaluation.type.rank,
        baseDamage: baseDamage,
        totalDamage: baseDamage,
        bonusEffects: [],
        cards: selectedCardsData,
      };

      console.log(
        `Main évaluée (5 cartes): ${this.handResult.handName}, dégâts de base: ${baseDamage}`
      );
    } catch (error) {
      console.error(
        "Erreur lors de l'évaluation de la main de 5 cartes:",
        error
      );
      return null;
    }
  }

  // Appliquer les bonus si disponibles
  if (this.bonusCardSystem && this.handResult) {
    try {
      const bonusResult = this.bonusCardSystem.applyBonusCardEffects(
        this.handResult.handRank,
        this.handResult.handName
      );

      this.handResult.totalDamage = bonusResult.damage;
      this.handResult.bonusEffects = bonusResult.bonusEffects;

      console.log(
        `Après application des bonus: ${this.handResult.totalDamage} dégâts totaux`
      );
    } catch (error) {
      console.error("Erreur lors de l'application des bonus:", error);
    }
  }

  // Appliquer les dégâts à l'ennemi si on est en combat
  if (this.enemy && this.gamePhase === 'combat' && this.handResult) {
    const oldHealth = this.enemy.health;
    this.enemy.health = Math.max(
      0,
      this.enemy.health - this.handResult.totalDamage
    );
    const actualDamage = oldHealth - this.enemy.health;

    // Mettre à jour les statistiques
    if (this.stats) {
      this.stats.totalDamageDealt =
        (this.stats.totalDamageDealt || 0) + actualDamage;
      this.stats.cardsPlayed =
        (this.stats.cardsPlayed || 0) + this.selectedCards.length;
    }

    // Ajouter au journal de combat
    if (this.combatLog) {
      let logEntry = `Vous infligez ${actualDamage} dégâts avec ${this.handResult.handName}`;
      this.combatLog.unshift(logEntry);

      // Ajouter les effets bonus au journal
      if (
        this.handResult.bonusEffects &&
        this.handResult.bonusEffects.length > 0
      ) {
        this.combatLog.unshift(
          `Effets bonus: ${this.handResult.bonusEffects.join(', ')}`
        );
      }

      // Vérifier si l'ennemi est vaincu
      if (this.enemy.health <= 0) {
        this.combatLog.unshift(`Vous avez vaincu ${this.enemy.name}!`);
        if (this.stats) {
          this.stats.enemiesDefeated = (this.stats.enemiesDefeated || 0) + 1;
        }

        // Vérifier la fin du combat
        if (this.combatSystem && this.combatSystem.checkCombatEnd) {
          this.combatSystem.checkCombatEnd();
        }
      }
    }
  }

  // Passer en phase "result"
  this.turnPhase = 'result';

  return this.handResult;
}

/**
 * Version corrigée de la méthode evaluateSelectedHand
 * Cette version s'assure que selectedCards est toujours synchronisé avec
 * les propriétés isSelected des cartes
 */
export function fixedEvaluateSelectedHand() {
  // Redirige vers la version améliorée qui gère aussi les mains partielles
  return enhancedEvaluateSelectedHand.call(this);
}

/**
 * Version corrigée de la méthode discardCards
 * Cette version gère correctement les propriétés isSelected des nouvelles cartes
 */
export function fixedDiscardCards(indices) {
  if (!indices || !Array.isArray(indices) || indices.length === 0) {
    console.warn('Aucune carte à défausser');
    return this.hand;
  }

  // Vérification de la validité des indices
  if (indices.some((idx) => idx < 0 || idx >= this.hand.length)) {
    console.error('Indices de défausse invalides:', indices);
    return this.hand;
  }

  // Marquer la défausse comme utilisée
  this.discardUsed = true;

  // Trier les indices en ordre décroissant pour éviter les problèmes lors de la suppression
  const sortedIndices = [...indices].sort((a, b) => b - a);

  // Sauvegarder les cartes défaussées
  if (!this.discard) {
    this.discard = [];
  }

  const discardedCards = sortedIndices.map((index) => {
    const card = this.hand[index];
    console.log(
      `Défausse de la carte ${card.value} de ${card.suit} à l'index ${index}`
    );
    return card;
  });

  this.discard.push(...discardedCards);

  // Créer une nouvelle main sans les cartes défaussées
  const newHand = [...this.hand];
  sortedIndices.forEach((index) => {
    if (index >= 0 && index < newHand.length) {
      newHand.splice(index, 1);
    }
  });

  // Nombre de cartes à tirer
  const drawCount = indices.length;

  // Si le deck est trop petit, on recycle la défausse (sauf les cartes qu'on vient de défausser)
  if (this.deck.length < drawCount) {
    const oldDiscard = [...this.discard];
    this.deck = shuffleDeck([...this.deck, ...oldDiscard]);
    this.discard = discardedCards; // On garde seulement les cartes qu'on vient de défausser

    // Si c'est toujours insuffisant, on recrée un deck
    if (this.deck.length < drawCount) {
      this.initializeDeck();
    }
  }

  // Tirer de nouvelles cartes
  const newCards = drawCards(this.deck, drawCount);

  // S'assurer que les nouvelles cartes ont isSelected = false
  newCards.forEach((card) => {
    card.isSelected = false;
  });

  // Mettre à jour le deck
  this.deck = this.deck.slice(drawCount);

  // Mise à jour de la main
  this.hand = [...newHand, ...newCards];

  // Reset des cartes sélectionnées
  this.selectedCards = [];

  // Désactiver le mode défausse
  this.discardMode = false;

  return this.hand;
}

/**
 * Version corrigée de la méthode dealHand
 * Cette version s'assure que toutes les nouvelles cartes ont isSelected = false
 * et que selectedCards est correctement réinitialisé
 */
export function fixedDealHand() {
  // Garder les cartes non sélectionnées du tour précédent
  const keptCards = [];
  if (this.hand.length > 0 && this.selectedCards.length > 0) {
    // Filtrer les cartes qui n'ont pas été sélectionnées
    for (let i = 0; i < this.hand.length; i++) {
      if (!this.selectedCards.includes(i)) {
        // S'assurer que la carte n'est pas marquée comme sélectionnée
        this.hand[i].isSelected = false;
        keptCards.push(this.hand[i]);
      }
    }
  }

  // Nombre de nouvelles cartes à tirer
  const drawCount = 7 - keptCards.length;

  // Si le deck est vide ou n'a pas assez de cartes, recréer un deck
  if (this.deck.length < drawCount) {
    this.deck = [...this.deck, ...this.discard];
    this.discard = [];
    this.deck = shuffleDeck(this.deck);

    // Si le deck est toujours trop petit, on le recrée complètement
    if (this.deck.length < drawCount) {
      this.initializeDeck();
    }
  }

  // Tirer les nouvelles cartes
  const drawnCards = drawCards(this.deck, drawCount);

  // S'assurer que toutes les nouvelles cartes ont isSelected = false
  drawnCards.forEach((card) => {
    card.isSelected = false;
  });

  // Mettre à jour la main avec les cartes gardées et les nouvelles cartes
  this.hand = [...keptCards, ...drawnCards];

  // Retirer les cartes du deck
  this.deck = this.deck.slice(drawCount);

  // Reset des cartes sélectionnées et des résultats
  this.selectedCards = [];
  this.bestHandCards = [];
  this.handResult = null;
  this.discardUsed = false;

  // Passer en phase "select"
  this.turnPhase = 'select';

  return this.hand;
}

/**
 * Fonction corrigée pour la défausse des cartes
 */
export function improvedDiscardCards(indices) {
  console.log('Défausse des cartes aux indices:', indices);

  if (!indices || !Array.isArray(indices) || indices.length === 0) {
    console.warn('Aucune carte à défausser');
    return this.hand;
  }

  // Vérifier la validité des indices
  if (indices.some((idx) => idx < 0 || idx >= this.hand.length)) {
    console.error('Indices de défausse invalides:', indices);
    return this.hand;
  }

  // Marquer la défausse comme utilisée
  this.discardUsed = true;

  // Créer une copie de la main actuelle
  const currentHand = [...this.hand];

  // Trier les indices en ordre décroissant pour éviter les problèmes lors de la suppression
  const sortedIndices = [...indices].sort((a, b) => b - a);

  // Sauvegarder les cartes défaussées
  if (!this.discard) {
    this.discard = [];
  }

  const discardedCards = sortedIndices.map((index) => {
    const card = currentHand[index];
    console.log(
      `Défausse de la carte ${card.value} de ${card.suit} à l'index ${index}`
    );
    return card;
  });

  this.discard.push(...discardedCards);

  // Créer une nouvelle main sans les cartes défaussées
  let newHand = [...currentHand];

  // Retirer les cartes dans l'ordre inverse pour éviter les décalages d'indices
  sortedIndices.forEach((index) => {
    if (index >= 0 && index < newHand.length) {
      newHand.splice(index, 1);
    } else {
      console.error(
        `Tentative de suppression d'une carte à l'indice invalide: ${index}`
      );
    }
  });

  // Nombre de cartes à tirer
  const drawCount = indices.length;

  // Si le deck est trop petit, on recycle la défausse (sauf les cartes qu'on vient de défausser)
  if (!this.deck || this.deck.length < drawCount) {
    // Sauvegarde temporaire des cartes défaussées
    const tempDiscardedCards = [...discardedCards];

    // Créer un nouveau deck à partir du deck existant et de la défausse
    if (!this.deck) this.deck = [];
    this.deck = [...this.deck, ...this.discard];

    // Réinitialiser la défausse avec seulement les cartes nouvellement défaussées
    this.discard = tempDiscardedCards;

    // Mélanger le deck
    if (typeof shuffleDeck === 'function') {
      this.deck = shuffleDeck(this.deck);
    } else {
      console.warn(
        "La fonction shuffleDeck n'est pas disponible, le deck ne sera pas mélangé"
      );
    }

    // Si c'est toujours insuffisant, on recrée un deck complet
    if (this.deck.length < drawCount && typeof createDeck === 'function') {
      this.initializeDeck();
    }
  }

  // Tirer de nouvelles cartes
  let newCards = [];

  if (typeof drawCards === 'function') {
    newCards = drawCards(this.deck, drawCount);
  } else {
    // Fallback si drawCards n'est pas disponible
    console.warn("La fonction drawCards n'est pas disponible, tirage manuel");
    newCards = this.deck.slice(0, drawCount);

    if (newCards.length < drawCount) {
      console.error(
        `Impossible de tirer ${drawCount} cartes, seulement ${newCards.length} disponibles`
      );
    }
  }

  // S'assurer que les nouvelles cartes ont isSelected = false
  newCards.forEach((card) => {
    if (card) card.isSelected = false;
  });

  // Mettre à jour le deck
  this.deck = this.deck.slice(drawCount);

  // Mise à jour de la main
  this.hand = [...newHand, ...newCards];

  console.log(
    'Nouvelle main après défausse:',
    this.hand.map((card) => `${card.value} de ${card.suit}`)
  );

  // Reset des cartes sélectionnées
  this.selectedCards = [];

  // Réinitialiser le mode de défausse
  this.discardMode = false;

  return this.hand;
}

/**
 * Cette fonction applique tous les correctifs aux classes appropriées
 * @param {Object} gameState - L'état du jeu à corriger
 */
export function applyCombatFixes(gameState) {
  if (!gameState) return;

  // Appliquer les correctifs à la classe GameState
  if (gameState.toggleCardSelection) {
    gameState.toggleCardSelection = fixedToggleCardSelection.bind(gameState);
  }

  if (gameState.evaluateSelectedHand) {
    // Utiliser notre version améliorée qui détecte aussi les combinaisons avec moins de 5 cartes
    gameState.evaluateSelectedHand =
      enhancedEvaluateSelectedHand.bind(gameState);
  }

  if (gameState.discardCards) {
    gameState.discardCards = improvedDiscardCards.bind(gameState);
  }

  if (gameState.dealHand) {
    gameState.dealHand = fixedDealHand.bind(gameState);
  }

  console.log('Correctifs du système de combat appliqués avec succès');
}
