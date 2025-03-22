// src/core/game-state.js
import { createDeck, shuffleDeck, drawCards } from './deck.js';
import {
  evaluateHand,
  calculateDamage,
  findBestHand,
  HAND_TYPES,
} from './hand-evaluation.js';

/**
 * Classe principale qui gère l'état global du jeu
 */
export class GameState {
  constructor() {
    // Game progression
    this.stage = 1;
    this.currentFloor = 1;
    this.maxFloors = 10;
    this.gamePhase = 'exploration'; // combat, reward, shop, rest, event, gameOver, exploration
    this.turnPhase = 'draw'; // draw, select, result

    // Player state
    this.player = {
      health: 50,
      maxHealth: 50,
      gold: 100,
      level: 1,
      experience: 0,
      shield: 0,
      inventory: [],
    };

    // Path/map state
    this.path = null;
    this.currentNodeId = null;

    // Combat state
    this.enemy = {
      name: 'Aucun ennemi',
      health: 0,
      maxHealth: 0,
      attack: 0,
      image: '👺',
    };
    this.hand = []; // Toutes les cartes en main (7 cartes)
    this.selectedCards = []; // Indices des cartes sélectionnées pour l'attaque (1-5)
    this.deck = [];
    this.discard = [];
    this.discardLimit = 2;
    this.discardUsed = false;
    this.discardMode = false; // Nouvel état pour le mode défausse
    this.bestHandCards = [];
    this.combatLog = [];
    this.handResult = null;
    this.playerDamagedLastTurn = false;
    this.invulnerableNextTurn = false;
    this.pendingDamageBonus = 0;
    this.pendingDamageMultiplier = 1;

    // Bonus card state
    this.bonusCardCollection = [];
    this.activeBonusCards = [];
    this.maxBonusCardSlots = 3;

    // Current event
    this.currentEvent = null;
    this.eventResult = null;

    // Shop state
    this.shopItems = [];
    this.itemsPurchased = {};

    // Statistiques
    this.stats = {
      enemiesDefeated: 0,
      totalDamageDealt: 0,
      highestDamage: 0,
      goldEarned: 0,
      cardsPlayed: 0,
    };

    // UI feedback states
    this.actionFeedback = null;
    this.tutorialStep = 0;
    this.showTutorial = true;

    // Historique des phases
    this.phaseHistory = [];

    // Initialize the deck
    this.initializeDeck();
  }

  /**
   * Initialise un nouveau deck
   */
  initializeDeck() {
    this.deck = shuffleDeck(createDeck());
    this.discard = [];
  }

  /**
   * Ajoute un feedback d'action temporaire
   * @param {string} message - Message à afficher
   * @param {string} type - Type de feedback ('success', 'error', 'info', 'warning')
   * @param {number} duration - Durée en ms
   */
  setActionFeedback(message, type = 'info', duration = 2000) {
    this.actionFeedback = { message, type, timestamp: Date.now() };

    // Réinitialiser le feedback après la durée spécifiée
    setTimeout(() => {
      if (
        this.actionFeedback &&
        this.actionFeedback.timestamp + duration <= Date.now()
      ) {
        this.actionFeedback = null;
      }
    }, duration);
  }

  /**
   * Distribue une nouvelle main jusqu'à avoir 7 cartes
   * Version corrigée avec meilleure gestion des cartes
   */
  dealHand() {
    // S'assurer que les tableaux nécessaires existent
    if (!this.hand) this.hand = [];
    if (!this.deck) this.initializeDeck();
    if (!this.discard) this.discard = [];
    if (!this.selectedCards) this.selectedCards = [];

    // Garder les cartes non sélectionnées du tour précédent
    const keptCards = [];
    if (this.hand.length > 0 && this.selectedCards.length > 0) {
      // Filtrer les cartes qui n'ont pas été sélectionnées
      for (let i = 0; i < this.hand.length; i++) {
        if (!this.selectedCards.includes(i)) {
          // S'assurer que la carte n'est pas marquée comme sélectionnée
          const card = { ...this.hand[i], isSelected: false };
          keptCards.push(card);
        }
      }
    }

    // Nombre de nouvelles cartes à tirer
    const drawCount = 7 - keptCards.length;

    // Tirer les nouvelles cartes
    const drawnCards = drawCards(this.deck, drawCount);

    // Mettre à jour la main avec les cartes gardées et les nouvelles cartes
    this.hand = [...keptCards, ...drawnCards];

    // Retirer les cartes du deck
    this.deck = this.deck.slice(drawCount);

    // Reset des cartes sélectionnées et des résultats
    this.selectedCards = [];
    this.bestHandCards = [];
    this.handResult = null;
    this.discardUsed = false;
    this.discardMode = false;

    // Passer en phase "select"
    this.turnPhase = 'select';

    // Feedback
    this.setActionFeedback('Nouvelles cartes distribuées', 'info');

    return this.hand;
  }

  /**
   * Marque une carte comme sélectionnée ou non
   * Version corrigée avec synchronisation des états
   * @param {number} index L'index de la carte dans la main
   * @returns {boolean} true si l'opération a réussi, false sinon
   */
  toggleCardSelection(index) {
    // Vérification de la validité de l'index
    if (index < 0 || index >= this.hand.length) {
      console.error(`Invalid card index: ${index}`);
      return false;
    }

    // Créer une copie de la main actuelle pour éviter les mutations directes
    const updatedHand = [...this.hand];

    // Vérifier le nombre de cartes déjà sélectionnées
    const currentSelectedCount = updatedHand.filter(
      (card) => card.isSelected
    ).length;

    // Si la carte n'est pas sélectionnée et qu'on a déjà atteint le max (5),
    // on empêche la sélection sauf si on est en mode défausse
    if (
      !updatedHand[index].isSelected &&
      currentSelectedCount >= 5 &&
      this.turnPhase === 'select' &&
      !this.discardMode
    ) {
      return false;
    }

    // Inverser l'état de sélection de la carte
    updatedHand[index] = {
      ...updatedHand[index],
      isSelected: !updatedHand[index].isSelected,
    };

    // Mettre à jour la main
    this.hand = updatedHand;

    // IMPORTANT: Reconstruire le tableau selectedCards pour synchroniser avec les isSelected
    this.selectedCards = updatedHand
      .map((card, idx) => (card.isSelected ? idx : -1))
      .filter((idx) => idx !== -1);

    // Log pour débogage
    console.log(
      `Card ${index} is now ${updatedHand[index].isSelected ? 'selected' : 'deselected'}`
    );
    console.log(`Selected cards indices: ${this.selectedCards}`);

    return true;
  }

  /**
   * Réinitialise les sélections de cartes
   */
  resetCardSelections() {
    // Réinitialiser les propriétés isSelected de toutes les cartes
    if (this.hand && Array.isArray(this.hand)) {
      this.hand = this.hand.map((card) => ({
        ...card,
        isSelected: false,
      }));
    }

    // Vider le tableau des indices
    this.selectedCards = [];
  }

  /**
   * Active ou désactive le mode défausse
   * @param {boolean} enabled - true pour activer, false pour désactiver
   */
  setDiscardMode(enabled) {
    this.discardMode = enabled;

    // Réinitialiser les sélections lors du changement de mode
    this.resetCardSelections();
  }

  /**
   * Évalue la main sélectionnée et calcule les dégâts
   * Version corrigée avec meilleures vérifications et gestion d'erreurs
   * @returns {Object|null} Le résultat de l'évaluation ou null en cas d'erreur
   */
  evaluateSelectedHand() {
    if (!this.hand || !Array.isArray(this.hand)) {
      console.error("La main n'est pas initialisée");
      return null;
    }

    // Synchroniser selectedCards avec les cartes marquées comme isSelected
    this.selectedCards = this.hand
      .map((card, index) => (card.isSelected ? index : -1))
      .filter((index) => index !== -1);

    // Vérifier qu'on a entre 1 et 5 cartes sélectionnées
    if (this.selectedCards.length < 1 || this.selectedCards.length > 5) {
      console.error(
        `Nombre de cartes sélectionnées invalide: ${this.selectedCards.length}`
      );
      return null;
    }

    // Si moins de 5 cartes sont sélectionnées, on attaque avec la valeur simple
    if (this.selectedCards.length < 5) {
      // Calculer la somme des valeurs numériques des cartes
      let totalValue = 0;
      const selectedCardsData = [];

      for (const index of this.selectedCards) {
        const card = this.hand[index];
        if (!card) {
          console.error(`Carte non trouvée à l'index ${index}`);
          continue;
        }
        totalValue += card.numericValue || 0;
        selectedCardsData.push(card);
      }

      // Stocker le résultat
      this.handResult = {
        handName: `${this.selectedCards.length} Carte${this.selectedCards.length > 1 ? 's' : ''}`,
        handRank: 0, // Rang de base
        baseDamage: totalValue,
        totalDamage: totalValue,
        bonusEffects: [],
        cards: selectedCardsData,
      };

      // Si une fonction de bonus est disponible, l'appliquer
      if (this.bonusCardSystem) {
        try {
          const bonusResult = this.bonusCardSystem.applyBonusCardEffects(
            0, // Rang 0 pour les attaques avec moins de 5 cartes
            this.handResult.handName
          );

          this.handResult.totalDamage = bonusResult.damage;
          this.handResult.bonusEffects = bonusResult.bonusEffects;
        } catch (error) {
          console.error("Erreur lors de l'application des bonus:", error);
        }
      }
    }
    // Si 5 cartes sont sélectionnées, on utilise l'évaluateur de main de poker
    else {
      // Extraire les 5 cartes sélectionnées
      const selectedCardsData = this.selectedCards
        .map((index) => this.hand[index])
        .filter((card) => card); // Filtrer les cartes non définies

      if (selectedCardsData.length !== 5) {
        console.error("Impossible d'extraire les 5 cartes sélectionnées");
        return null;
      }

      // Trouver la meilleure main
      let result;
      try {
        // Importation doit être disponible via gameState ou directement
        const findBestHandFunc = this.findBestHand || findBestHand;
        result = findBestHandFunc(selectedCardsData);
      } catch (error) {
        console.error("Erreur lors de l'évaluation de la main:", error);
        return null;
      }

      // Sauvegarder les indices des cartes qui forment la meilleure main
      this.bestHandCards = result.indices.map((relativeIndex) => {
        // Convertir les indices relatifs en indices absolus dans la main complète
        return this.selectedCards[relativeIndex];
      });

      // Calculer les dégâts de base
      const calculateDamageFunc = this.calculateDamage || calculateDamage;
      const baseDamage = calculateDamageFunc(result.evaluation);

      // Si une fonction de bonus est disponible, l'appliquer
      let bonusEffects = [];
      let totalDamage = baseDamage;

      if (this.bonusCardSystem) {
        try {
          const bonusResult = this.bonusCardSystem.applyBonusCardEffects(
            result.evaluation.type.rank,
            result.evaluation.type.name
          );

          totalDamage = bonusResult.damage;
          bonusEffects = bonusResult.bonusEffects;
        } catch (error) {
          console.error("Erreur lors de l'application des bonus:", error);
        }
      }

      // Stocker le résultat
      this.handResult = {
        handName: result.evaluation.type.name,
        handRank: result.evaluation.type.rank,
        baseDamage: baseDamage,
        totalDamage: totalDamage,
        bonusEffects: bonusEffects,
        cards: selectedCardsData,
      };
    }

    // Appliquer les dégâts à l'ennemi si on est en combat
    if (this.enemy && this.gamePhase === 'combat') {
      const oldHealth = this.enemy.health;
      this.enemy.health = Math.max(
        0,
        this.enemy.health - this.handResult.totalDamage
      );
      const actualDamage = oldHealth - this.enemy.health;

      // Mettre à jour les statistiques
      this.stats.totalDamageDealt += actualDamage;
      if (actualDamage > (this.stats.highestDamage || 0)) {
        this.stats.highestDamage = actualDamage;
      }
      this.stats.cardsPlayed += this.selectedCards.length;

      // Ajouter au journal de combat
      if (!this.combatLog) {
        this.combatLog = [];
      }

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
        this.stats.enemiesDefeated++;

        // Notification pour notifier la victoire
        if (this.setActionFeedback) {
          this.setActionFeedback(
            `Victoire! ${this.enemy.name} vaincu`,
            'success',
            3000
          );
        }
      }
    }

    // Passer en phase "result"
    this.turnPhase = 'result';

    return this.handResult;
  }

  /**
   * Défausse les cartes sélectionnées et tire de nouvelles cartes
   * Version corrigée qui gère correctement les indices
   * @param {Array} indices Les indices des cartes à défausser
   * @returns {Array} La nouvelle main de cartes
   */
  discardCards(indices) {
    if (!indices || !Array.isArray(indices) || indices.length === 0) {
      console.warn('Aucune carte à défausser');
      return this.hand;
    }

    // Vérifier que l'on n'essaie pas de défausser plus que la limite
    if (indices.length > this.discardLimit) {
      console.warn(
        `Tentative de défausser ${indices.length} cartes alors que la limite est de ${this.discardLimit}`
      );
      indices = indices.slice(0, this.discardLimit);
    }

    // Marquer la défausse comme utilisée
    this.discardUsed = true;

    // Trier les indices en ordre décroissant pour éviter les problèmes lors de la suppression
    const sortedIndices = [...indices].sort((a, b) => b - a);

    // Sauvegarder les cartes défaussées
    if (!this.discard) {
      this.discard = [];
    }

    const discardedCards = sortedIndices
      .map((index) => this.hand[index])
      .filter((card) => card); // Filtrer les cartes non définies

    this.discard.push(...discardedCards);

    // Créer une nouvelle main sans les cartes défaussées
    let newHand = [...this.hand];
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

    // Feedback
    this.setActionFeedback(`${indices.length} cartes défaussées`, 'info');

    // Désactiver le mode défausse
    this.discardMode = false;

    return this.hand;
  }

  /**
   * Applique les dégâts de l'ennemi au joueur
   * @returns {Object} Informations sur l'attaque
   */
  applyEnemyDamage() {
    if (!this.enemy) {
      console.warn("Pas d'ennemi pour appliquer des dégâts");
      return { damage: 0, reduced: 0, blocked: 0 };
    }

    // Vérifier si le joueur est invulnérable ce tour
    if (this.invulnerableNextTurn) {
      this.invulnerableNextTurn = false;
      this.playerDamagedLastTurn = false;

      // Ajouter au journal
      if (this.combatLog) {
        this.combatLog.unshift(
          `Vous êtes invulnérable à l'attaque de ${this.enemy.name}.`
        );
      }

      return {
        damage: 0,
        reduced: this.enemy.attack,
        blocked: this.enemy.attack,
      };
    }

    // Dégâts de base de l'ennemi
    let damage = this.enemy.attack;
    let reducedDamage = 0;
    let shieldBlocked = 0;

    // Appliquer le bouclier s'il y en a
    if (this.player.shield > 0) {
      const absorbed = Math.min(this.player.shield, damage);
      damage -= absorbed;
      shieldBlocked = absorbed;
      this.player.shield -= absorbed;

      // Ajouter au journal
      if (absorbed > 0 && this.combatLog) {
        this.combatLog.unshift(`Votre bouclier absorbe ${absorbed} dégâts.`);
      }
    }

    // Appliquer les réductions de dégâts des cartes bonus
    if (this.activeBonusCards) {
      for (const bonusCard of this.activeBonusCards) {
        if (
          bonusCard.effect === 'passive' &&
          bonusCard.condition === 'always' &&
          bonusCard.bonus?.type === 'damageReduction'
        ) {
          const reduction = Math.min(damage, bonusCard.bonus.value);
          if (reduction > 0) {
            damage -= reduction;
            reducedDamage += reduction;

            // Ajouter au journal
            if (this.combatLog) {
              this.combatLog.unshift(
                `${bonusCard.name} a réduit les dégâts de ${reduction}.`
              );
            }
          }
        }
      }
    }

    // Appliquer les dégâts au joueur
    if (damage > 0) {
      this.player.health = Math.max(0, this.player.health - damage);
      this.playerDamagedLastTurn = true;

      // Ajouter au journal
      if (this.combatLog) {
        this.combatLog.unshift(
          `${this.enemy.name} vous inflige ${damage} dégâts.`
        );
      }
    } else {
      this.playerDamagedLastTurn = false;
    }

    // Vérifier si le joueur est vaincu
    if (this.player.health <= 0) {
      this.gamePhase = 'gameOver';

      // Ajouter au journal
      if (this.combatLog) {
        this.combatLog.unshift('Game Over! Vous avez été vaincu.');
      }

      // Notification
      if (this.setActionFeedback) {
        this.setActionFeedback(
          'Game Over! Vous avez été vaincu.',
          'error',
          3000
        );
      }
    }

    // Retourner les informations sur l'attaque
    return {
      damage: damage,
      reduced: reducedDamage,
      blocked: shieldBlocked,
      total: this.enemy.attack,
    };
  }

  /**
   * Vérifie et applique les montées de niveau
   * Version corrigée utilisant une boucle au lieu de récursion
   * @returns {number} Nombre de niveaux gagnés
   */
  checkLevelUp() {
    // Nombre maximum de niveaux pour éviter les boucles infinies
    const MAX_LEVELS = 100;
    let levelsGained = 0;

    // Utiliser une boucle while au lieu de la récursion
    while (levelsGained < MAX_LEVELS && this.player.level < MAX_LEVELS) {
      const currentLevel = this.player.level;
      const nextLevel = currentLevel + 1;
      const xpForNextLevel = nextLevel * 100; // Formule simple: niveau * 100

      // Vérifier si le joueur a assez d'XP pour monter de niveau
      if (this.player.experience >= xpForNextLevel) {
        // Montée de niveau
        this.player.level = nextLevel;
        this.player.experience -= xpForNextLevel;
        levelsGained++;

        // Augmentation des stats
        this.player.maxHealth += 10;
        this.player.health += 10;

        // Bonus d'emplacement de carte tous les 3 niveaux
        if (nextLevel % 3 === 0) {
          this.maxBonusCardSlots += 1;
        }

        // Ajouter au journal de combat
        if (this.combatLog) {
          this.combatLog.unshift(
            `Niveau supérieur! Vous êtes maintenant niveau ${nextLevel}.`
          );
        }

        // Feedback visuel
        if (this.setActionFeedback) {
          this.setActionFeedback(
            `Niveau supérieur! Vous êtes maintenant niveau ${nextLevel}.`,
            'success',
            3000
          );
        }
      } else {
        // Pas assez d'XP pour un autre niveau, sortir de la boucle
        break;
      }
    }

    // Si des niveaux ont été gagnés, logger le résultat
    if (levelsGained > 0) {
      console.log(`Le joueur a gagné ${levelsGained} niveau(x)!`);
    }

    return levelsGained;
  }

  /**
   * Passe à l'étape suivante du jeu
   * @param {Object} options - Options pour la prochaine étape
   * @returns {boolean} - true si la transition a réussi, false sinon
   */
  nextStage(options = {}) {
    // Si nous avons un gestionnaire de phases, l'utiliser
    if (this.phaseManager) {
      return this.phaseManager.nextStage(options);
    }

    // Implémentation basique pour la compatibilité
    if (this.gamePhase === 'reward') {
      // Augmenter l'étage
      this.stage++;

      // Choix aléatoire entre shop et combat suivant
      const goToShop = Math.random() < 0.3;

      if (goToShop) {
        this.gamePhase = 'shop';
        if (this.progressionSystem) {
          this.progressionSystem.initShop();
        }

        // Message de journal
        if (this.combatLog) {
          this.combatLog.unshift('Vous avez trouvé un marchand itinérant.');
        }
      } else {
        // Créer un nouvel ennemi
        if (this.combatSystem) {
          this.enemy = this.combatSystem.generateEnemy(
            false,
            this.stage % 5 === 0 // Boss tous les 5 niveaux
          );
        }

        // Réinitialiser pour le prochain combat
        this.gamePhase = 'combat';
        this.turnPhase = 'draw';

        // Message de journal
        if (this.combatLog) {
          this.combatLog = [
            `Niveau ${this.stage}: Vous rencontrez un ${this.enemy.name}!`,
          ];
        }

        // Soins légers entre les étages
        const healAmount = Math.floor(this.player.maxHealth * 0.2);
        this.player.health = Math.min(
          this.player.maxHealth,
          this.player.health + healAmount
        );

        // Message de journal
        if (this.combatLog) {
          this.combatLog.unshift(`Vous avez récupéré ${healAmount} PV.`);
        }
      }

      return true;
    } else if (this.gamePhase === 'exploration') {
      // Passage de l'exploration au combat/événement/etc.

      // Si un nodeId est spécifié, l'utiliser
      if (options.nodeId) {
        this.currentNodeId = options.nodeId;
      }

      // Trouver le nœud actuel
      const currentNode =
        this.path && this.path.find((node) => node.id === this.currentNodeId);

      if (currentNode) {
        // Transition basée sur le type de nœud
        switch (currentNode.type) {
          case 'combat':
            this.gamePhase = 'combat';
            this.turnPhase = 'draw';

            // Générer un ennemi si nécessaire
            if (this.combatSystem && (!this.enemy || this.enemy.health <= 0)) {
              this.enemy = this.combatSystem.generateEnemy(false, false);
            }
            break;

          case 'elite':
            this.gamePhase = 'combat';
            this.turnPhase = 'draw';

            // Générer un ennemi d'élite
            if (this.combatSystem) {
              this.enemy = this.combatSystem.generateEnemy(true, false);
            }
            break;

          case 'boss':
            this.gamePhase = 'combat';
            this.turnPhase = 'draw';

            // Générer un boss
            if (this.combatSystem) {
              this.enemy = this.combatSystem.generateEnemy(false, true);
            }
            break;

          case 'shop':
            this.gamePhase = 'shop';
            if (this.progressionSystem) {
              this.progressionSystem.initShop();
            }
            break;

          case 'rest':
            this.gamePhase = 'rest';
            break;

          case 'event':
            this.gamePhase = 'event';
            break;

          default:
            // Rester en exploration
            break;
        }

        return true;
      }
    }

    return false;
  }
}
