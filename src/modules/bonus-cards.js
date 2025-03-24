// src/modules/BonusCardSystem.js
import { ALL_BONUS_CARDS, CARD_RARITIES } from '../data/bonus-cards';
import { HAND_TYPES } from '../core/hand-evaluation';

/**
 * Système de gestion des cartes bonus
 *
 * Gérer à la fois la collection permanente du joueur et les cartes actives
 * Permet d'appliquer les effets de cartes pendant les combats
 * Calcule les combinaisons de poker et leurs bonus
 */
export class BonusCardSystem {
  constructor(gameState) {
    this.gameState = gameState;
    this.allBonusCards = ALL_BONUS_CARDS;

    // Attacher le système de cartes bonus à l'état du jeu
    this.gameState.bonusCardSystem = this;
  }

  /**
   * Initialise la collection de cartes bonus pour une nouvelle partie
   */
  initBonusCardCollection() {
    // Cartes de départ - peut être personnalisé ultérieurement
    const startingCardIds = [1, 2, 10, 14, 18];

    this.gameState.bonusCardCollection = startingCardIds
      .map((id) => {
        const card = this.allBonusCards.find((card) => card.id === id);
        return card ? { ...card, owned: true, level: 1 } : null;
      })
      .filter((card) => card !== null);

    // Équiper initialement les 3 premières cartes (ou moins selon le nombre d'emplacements)
    const maxSlots = Math.min(3, this.gameState.maxBonusCardSlots || 3);
    this.gameState.activeBonusCards = this.gameState.bonusCardCollection
      .slice(0, maxSlots)
      .map((card) => ({ ...card, usesRemaining: card.uses || 0 }));
  }

  /**
   * Obtient les cartes bonus possédées
   * @returns {Array} - Tableau des cartes bonus possédées
   */
  getOwnedBonusCards() {
    if (!this.gameState.bonusCardCollection) {
      return [];
    }
    return this.gameState.bonusCardCollection.filter((card) => card.owned);
  }

  /**
   * Ajoute une carte bonus à la collection
   * @param {number} cardId - L'ID de la carte à ajouter
   * @returns {boolean} - true si la carte a été ajoutée, false sinon
   */
  addBonusCardToCollection(cardId) {
    if (!this.gameState.bonusCardCollection) {
      this.gameState.bonusCardCollection = [];
    }

    // Vérifier si la carte existe
    const newCardTemplate = this.allBonusCards.find((card) => card.id === cardId);
    if (!newCardTemplate) {
      console.error(`Card with ID ${cardId} not found in allBonusCards`);
      return false;
    }

    const cardIndex = this.gameState.bonusCardCollection.findIndex((card) => card.id === cardId);

    if (cardIndex === -1) {
      // Si la carte n'est pas dans la collection, l'ajouter
      const newCard = { ...newCardTemplate, owned: true, level: 1 };
      this.gameState.bonusCardCollection.push(newCard);

      // Ajouter au journal de combat
      if (this.gameState.combatLog) {
        this.gameState.combatLog.unshift(`Nouvelle carte bonus obtenue: ${newCard.name}!`);
      }

      // Feedback visuel
      if (this.gameState.setActionFeedback) {
        this.gameState.setActionFeedback(
          `Nouvelle carte obtenue: ${newCard.name}!`,
          'success',
          3000
        );
      }

      return true;
    } else if (!this.gameState.bonusCardCollection[cardIndex].owned) {
      // Si la carte existe mais n'est pas possédée, la marquer comme possédée
      this.gameState.bonusCardCollection[cardIndex].owned = true;

      // Ajouter au journal de combat
      if (this.gameState.combatLog) {
        this.gameState.combatLog.unshift(
          `Nouvelle carte bonus obtenue: ${this.gameState.bonusCardCollection[cardIndex].name}!`
        );
      }

      // Feedback visuel
      if (this.gameState.setActionFeedback) {
        this.gameState.setActionFeedback(
          `Nouvelle carte obtenue: ${this.gameState.bonusCardCollection[cardIndex].name}!`,
          'success',
          3000
        );
      }

      return true;
    }

    return false;
  }

  /**
   * Équipe une carte bonus
   * @param {number} cardId - L'ID de la carte à équiper
   * @returns {boolean} - true si la carte a été équipée, false sinon
   */
  equipBonusCard(cardId) {
    if (!this.gameState || !this.gameState.bonusCardCollection) {
      console.error('GameState ou collection de cartes non initialisé');
      return false;
    }

    // Vérifier si le joueur possède cette carte
    const card = this.gameState.bonusCardCollection.find(
      (card) => card.id === cardId && card.owned !== false
    );

    if (!card) {
      console.error('Card not found or not owned:', cardId);
      return false;
    }

    // S'assurer que activeBonusCards existe
    if (!this.gameState.activeBonusCards) {
      this.gameState.activeBonusCards = [];
    }

    // Vérifier si la carte est déjà équipée
    const isAlreadyEquipped = this.gameState.activeBonusCards.some(
      (activeCard) => activeCard.id === cardId
    );

    if (isAlreadyEquipped) {
      console.warn('Card is already equipped:', cardId);
      return false;
    }

    // Vérifier s'il y a de la place dans les emplacements de cartes bonus
    if (this.gameState.activeBonusCards.length >= this.gameState.maxBonusCardSlots) {
      console.warn('No space for more cards');

      // Feedback visuel pour l'utilisateur
      if (this.gameState.setActionFeedback) {
        this.gameState.setActionFeedback(
          "Aucun emplacement disponible. Retirez d'abord une carte.",
          'warning',
          2000
        );
      }

      return false;
    }

    // Ajouter la carte aux cartes bonus actives
    this.gameState.activeBonusCards.push({
      ...card,
      usesRemaining: card.uses || 0,
    });

    // Feedback visuel
    if (this.gameState.setActionFeedback) {
      this.gameState.setActionFeedback(`${card.name} équipée avec succès.`, 'success', 2000);
    }

    console.log('Card equipped successfully', card.name);
    return true;
  }

  /**
   * Retire une carte bonus équipée
   * @param {number} cardId - L'ID de la carte à retirer
   * @returns {boolean} - true si la carte a été retirée, false sinon
   */
  unequipBonusCard(cardId) {
    if (!this.gameState || !this.gameState.activeBonusCards) {
      console.error('GameState ou cartes actives non initialisé');
      return false;
    }

    const cardIndex = this.gameState.activeBonusCards.findIndex((card) => card.id === cardId);

    if (cardIndex !== -1) {
      // Récupère la carte pour le log
      const removedCard = this.gameState.activeBonusCards[cardIndex];

      // Supprime la carte des cartes actives
      this.gameState.activeBonusCards.splice(cardIndex, 1);

      // Feedback visuel
      if (this.gameState.setActionFeedback) {
        this.gameState.setActionFeedback(`${removedCard.name} retirée.`, 'info', 2000);
      }

      console.log('Card unequipped successfully', removedCard.name);
      return true;
    }

    console.warn('Card not found in active cards:', cardId);
    return false;
  }

  /**
   * Génère une récompense de carte bonus après un combat
   * @returns {number|null} - L'ID de la carte générée ou null si aucune carte n'est disponible
   */
  generateBonusCardReward() {
    const stage = this.gameState.stage || 1;
    const stageMultiplier = Math.min(stage / 10, 1);

    // Déterminer la rareté de la carte en fonction de la progression
    const rarityRoll = Math.random();
    let rarity;

    if (rarityRoll < 0.6 - 0.2 * stageMultiplier) {
      rarity = CARD_RARITIES.COMMON;
    } else if (rarityRoll < 0.9 - 0.1 * stageMultiplier) {
      rarity = CARD_RARITIES.UNCOMMON;
    } else if (rarityRoll < 0.99 - 0.04 * stageMultiplier) {
      rarity = CARD_RARITIES.RARE;
    } else {
      rarity = CARD_RARITIES.EPIC;
    }

    // Filtrer les cartes de la rareté sélectionnée que le joueur ne possède pas
    const possibleCards = this.allBonusCards.filter((card) => {
      // Vérifier si le joueur possède déjà cette carte
      const isOwned = this.gameState.bonusCardCollection.some(
        (playerCard) => playerCard.id === card.id && playerCard.owned
      );
      return card.rarity === rarity && !isOwned;
    });

    // Si aucune carte non possédée de cette rareté, essayer une autre rareté
    if (possibleCards.length === 0) {
      // Essayer toutes les raretés par ordre croissant
      const allRarities = [
        CARD_RARITIES.COMMON,
        CARD_RARITIES.UNCOMMON,
        CARD_RARITIES.RARE,
        CARD_RARITIES.EPIC,
        CARD_RARITIES.LEGENDARY,
      ];

      for (const tryRarity of allRarities) {
        if (tryRarity === rarity) continue; // Ignorer celle qu'on a déjà essayée

        const fallbackCards = this.allBonusCards.filter((card) => {
          // Vérifier si le joueur possède déjà cette carte
          const isOwned = this.gameState.bonusCardCollection.some(
            (playerCard) => playerCard.id === card.id && playerCard.owned
          );
          return card.rarity === tryRarity && !isOwned;
        });

        if (fallbackCards.length > 0) {
          // Sélectionner une carte aléatoire
          const randomCard = fallbackCards[Math.floor(Math.random() * fallbackCards.length)];
          return randomCard.id;
        }
      }

      // Si toujours aucune carte disponible, retourner null
      return null;
    }

    // Sélectionner une carte aléatoire
    const randomCard = possibleCards[Math.floor(Math.random() * possibleCards.length)];
    return randomCard.id;
  }

  /**
   * Standardise les noms de combinaison de poker pour les conditions de cartes bonus
   * @param {string} handName - Le nom de la combinaison de poker
   * @returns {string} - Le nom standardisé pour les conditions
   */
  mapHandTypeToCondition(handName) {
    // Vérifier que handName est une chaîne valide
    if (!handName || typeof handName !== 'string') {
      console.warn('handName invalide:', handName);
      return 'unknown';
    }

    // Table de correspondance pour standardiser les noms (anglais et français)
    // Utilisons l'anglais comme format standardisé
    const conditionMap = {
      // Noms anglais (format standard)
      'Royal Flush': 'Royal Flush',
      'Straight Flush': 'Straight Flush',
      'Four of a Kind': 'Four of a Kind',
      'Full House': 'Full House',
      Flush: 'Flush',
      Straight: 'Straight',
      'Three of a Kind': 'Three of a Kind',
      'Two Pair': 'Two Pair',
      Pair: 'Pair',
      'High Card': 'High Card',

      // Traductions françaises vers le format standard
      'Quinte Flush Royale': 'Royal Flush',
      'Quinte Flush': 'Straight Flush',
      Carré: 'Four of a Kind',
      Full: 'Full House',
      Couleur: 'Flush',
      Suite: 'Straight',
      Brelan: 'Three of a Kind',
      'Double Paire': 'Two Pair',
      Paire: 'Pair',
      'Carte Haute': 'High Card',

      // Cas spéciaux pour les attaques avec moins de 5 cartes
      '1 Carte': 'single',
      '2 Cartes': 'double',
      '3 Cartes': 'triple',
      '4 Cartes': 'quadruple',
    };

    // Retourner le nom standardisé ou le nom original s'il n'est pas dans la table
    return conditionMap[handName] || handName;
  }

  /**
   * Applique les effets des cartes bonus à une main
   * @param {number} handRank - Le rang de la main (0-9)
   * @param {string} handName - Le nom de la combinaison
   * @returns {Object} - Les dégâts modifiés et les effets bonus appliqués
   */
  applyBonusCardEffects(handRank, handName) {
    if (handRank === undefined || handRank === null) {
      console.warn('handRank non spécifié:', handRank);
      handRank = 0;
    }

    if (!handName) {
      console.warn('handName non spécifié');
      handName = 'High Card';
    }

    // Calcul de base des dégâts - 2^rang
    let baseDamage = Math.pow(2, handRank);

    // Pour les mains personnalisées comme "Paire de Roi", utiliser la valeur déjà calculée
    if (typeof handRank === 'number' && handName.includes('Paire de ')) {
      baseDamage = Math.pow(2, 1); // Rang d'une paire = 1
    }

    // Journal pour débogage - enregistrer les valeurs de départ
    console.log(
      `DEBUG - Avant application bonus: handRank=${handRank}, handName=${handName}, baseDamage=${baseDamage}`
    );

    let damage = baseDamage;
    let bonusEffects = [];

    // Map le nom de la main à la condition standardisée
    const condition = this.mapHandTypeToCondition(handName);
    console.log(`DEBUG - Condition pour bonus: ${condition}`);

    // Vérifier que activeBonusCards existe et est un tableau
    if (!this.gameState.activeBonusCards || !Array.isArray(this.gameState.activeBonusCards)) {
      console.warn('activeBonusCards non initialisé ou invalide');
      return { damage, bonusEffects };
    }

    try {
      // Appliquer les effets des cartes bonus actives
      console.log(`DEBUG - Nombre de bonus actifs: ${this.gameState.activeBonusCards.length}`);

      for (const bonusCard of this.gameState.activeBonusCards) {
        // Ignorer les cartes invalides
        if (!bonusCard) {
          console.log('DEBUG - Carte bonus ignorée car invalide');
          continue;
        }

        console.log(
          `DEBUG - Traitement de la carte: ${bonusCard.name}, effet: ${bonusCard.effect}, condition: ${bonusCard.condition}`
        );

        // Effets passifs qui s'appliquent à cette main ou toujours
        if (
          bonusCard.effect === 'passive' &&
          (bonusCard.condition === condition || bonusCard.condition === 'always')
        ) {
          console.log(`DEBUG - Condition valide pour ${bonusCard.name}`);

          switch (bonusCard.bonus?.type) {
            case 'damage':
              if (typeof bonusCard.bonus.value === 'number') {
                const previousDamage = damage;
                damage += bonusCard.bonus.value;
                console.log(
                  `DEBUG - Ajout bonus ${bonusCard.name}: ${previousDamage} + ${bonusCard.bonus.value} = ${damage}`
                );
                bonusEffects.push(`${bonusCard.name} added ${bonusCard.bonus.value} damage`);
              }
              break;

            case 'heal':
              if (!this.gameState.player) continue;

              if (typeof bonusCard.bonus.value === 'number') {
                const healAmount = Math.min(
                  bonusCard.bonus.value,
                  this.gameState.player.maxHealth - this.gameState.player.health
                );

                if (healAmount > 0) {
                  this.gameState.player.health += healAmount;
                  console.log(`DEBUG - Soin appliqué: ${healAmount}`);
                  bonusEffects.push(`${bonusCard.name} healed ${healAmount} HP`);
                }
              }
              break;

            case 'shield':
              if (!this.gameState.player) continue;

              if (typeof bonusCard.bonus.value === 'number') {
                this.gameState.player.shield =
                  (this.gameState.player.shield || 0) + bonusCard.bonus.value;

                console.log(`DEBUG - Bouclier ajouté: ${bonusCard.bonus.value}`);
                bonusEffects.push(`${bonusCard.name} gave ${bonusCard.bonus.value} shield`);
              }
              break;

            // DEBUG - Ajouter traitement pour tous les autres types de bonus
            default:
              console.log(`DEBUG - Type de bonus non géré: ${bonusCard.bonus?.type}`);
              break;
          }
        } else {
          console.log(`DEBUG - Condition non remplie pour ${bonusCard.name}`);
        }

        // Les autres types d'effets (comme 'damageTaken' et 'lowHealth') restent inchangés
      }

      // Appliquer le bonus de dégâts en attente
      if (this.gameState.pendingDamageBonus) {
        const prevDamage = damage;
        damage += this.gameState.pendingDamageBonus;
        console.log(
          `DEBUG - Bonus en attente appliqué: ${prevDamage} + ${this.gameState.pendingDamageBonus} = ${damage}`
        );
        bonusEffects.push(`Bonus damage: +${this.gameState.pendingDamageBonus}`);
        this.gameState.pendingDamageBonus = 0;
      }

      // Appliquer le multiplicateur de dégâts en attente
      if (this.gameState.pendingDamageMultiplier && this.gameState.pendingDamageMultiplier !== 1) {
        const baseValue = damage;
        damage = Math.floor(damage * this.gameState.pendingDamageMultiplier);
        console.log(
          `DEBUG - Multiplicateur appliqué: ${baseValue} × ${this.gameState.pendingDamageMultiplier} = ${damage}`
        );
        bonusEffects.push(
          `Damage multiplier: ×${this.gameState.pendingDamageMultiplier} (${baseValue} → ${damage})`
        );

        this.gameState.pendingDamageMultiplier = 1;
      }

      // IMPORTANT: S'assurer que les dégâts ne sont jamais inférieurs au calcul de base
      // Si c'est le cas, quelque chose va mal dans l'application des bonus
      if (damage < baseDamage) {
        console.error(
          `ERREUR: Les dégâts après bonus (${damage}) sont inférieurs aux dégâts de base (${baseDamage}). Correction automatique.`
        );
        damage = baseDamage;
      }

      // S'assurer que les dégâts totaux sont au moins égaux à 1
      damage = Math.max(1, damage);

      console.log(`DEBUG - Dégâts finaux après tous les bonus: ${damage}`);
    } catch (error) {
      console.error("Erreur lors de l'application des bonus:", error);
    }

    return { damage, bonusEffects };
  }
  /**
   * Utiliser une carte bonus active
   * @param {number} index - L'index de la carte dans activeBonusCards
   * @returns {Object} - Résultat de l'utilisation (succès, message)
   */
  useActiveBonus(index) {
    // Vérifications préliminaires
    if (!this.gameState || !this.gameState.activeBonusCards) {
      return {
        success: false,
        message: 'État du jeu non initialisé',
      };
    }

    // Vérifier que l'index est valide
    if (index < 0 || index >= this.gameState.activeBonusCards.length) {
      return {
        success: false,
        message: 'Carte bonus invalide',
      };
    }

    const bonusCard = this.gameState.activeBonusCards[index];

    // Vérifier que la carte existe
    if (!bonusCard) {
      return {
        success: false,
        message: 'Carte bonus non trouvée',
      };
    }

    // Vérifier que la carte est active et a des utilisations restantes
    if (bonusCard.effect !== 'active') {
      return {
        success: false,
        message: 'Cette carte a un effet passif',
      };
    }

    if (bonusCard.usesRemaining <= 0) {
      return {
        success: false,
        message: 'Cette carte a déjà été utilisée',
      };
    }

    // Vérifier que la carte a un bonus valide
    if (!bonusCard.bonus) {
      return {
        success: false,
        message: 'Carte bonus mal configurée',
      };
    }

    // Appliquer l'effet selon le type de carte
    let result = {
      success: true,
      message: `${bonusCard.name} utilisée`,
    };

    try {
      switch (bonusCard.bonus.type) {
        case 'damage':
          // Ajouter des dégâts pour la prochaine attaque
          this.gameState.pendingDamageBonus =
            (this.gameState.pendingDamageBonus || 0) + bonusCard.bonus.value;

          result.message = `Ajouté ${bonusCard.bonus.value} dégâts à votre prochaine attaque`;
          break;

        case 'damageMultiplier':
          // Multiplier les dégâts de la prochaine attaque
          this.gameState.pendingDamageMultiplier = bonusCard.bonus.value;

          result.message = `Votre prochaine attaque infligera ${bonusCard.bonus.value}x dégâts`;
          break;

        case 'heal':
          // Soin
          if (!this.gameState.player) {
            result.success = false;
            result.message = 'Joueur non initialisé';
            return result;
          }

          const healAmount = Math.min(
            bonusCard.bonus.value,
            this.gameState.player.maxHealth - this.gameState.player.health
          );

          this.gameState.player.health += healAmount;
          result.message = `Récupéré ${healAmount} PV`;
          break;

        case 'discard':
          // Permettre au joueur de défausser plus de cartes
          this.gameState.discardLimit = bonusCard.bonus.value;
          this.gameState.discardMode = true;

          result.message = `Vous pouvez maintenant défausser jusqu'à ${bonusCard.bonus.value} cartes ce tour`;
          break;

        case 'invulnerable':
          // Invulnérabilité pour la prochaine attaque ennemie
          this.gameState.invulnerableNextTurn = true;

          result.message = `Vous serez invulnérable à la prochaine attaque ennemie`;
          break;

        default:
          result.success = false;
          result.message = 'Effet de carte bonus inconnu';
          return result;
      }

      // Réduire le nombre d'utilisations restantes
      bonusCard.usesRemaining--;

      // Ajouter au journal de combat
      if (this.gameState.combatLog) {
        this.gameState.combatLog.unshift(result.message);
      }

      // Feedback visuel
      if (this.gameState.setActionFeedback) {
        this.gameState.setActionFeedback(result.message, 'success', 2000);
      }
    } catch (error) {
      console.error("Erreur lors de l'utilisation d'une carte bonus:", error);
      result.success = false;
      result.message = "Une erreur s'est produite lors de l'utilisation de la carte bonus";
    }

    return result;
  }

  /**
   * Améliore une carte bonus
   * @param {number} cardId - L'ID de la carte à améliorer
   * @param {Object} upgradeMaterials - Matériaux (or, etc.) nécessaires pour l'amélioration
   * @returns {Object} - Résultat de l'amélioration (succès, message, carte améliorée)
   */
  upgradeCard(cardId, upgradeMaterials = { goldCost: 50 }) {
    // Vérifications préliminaires
    if (!this.gameState || !this.gameState.bonusCardCollection) {
      return {
        success: false,
        message: 'État du jeu non initialisé',
      };
    }

    // Trouver la carte à améliorer
    const cardIndex = this.gameState.bonusCardCollection.findIndex(
      (card) => card && card.id === cardId && card.owned
    );

    if (cardIndex === -1) {
      return {
        success: false,
        message: 'Carte introuvable.',
      };
    }

    const card = this.gameState.bonusCardCollection[cardIndex];

    // Vérifier si la carte peut être améliorée
    if (card.level && card.level >= 3) {
      return {
        success: false,
        message: 'Cette carte est déjà au niveau maximum.',
      };
    }

    // Vérifier les matériaux d'amélioration (coût en or)
    if (this.gameState.player.gold < upgradeMaterials.goldCost) {
      return {
        success: false,
        message: "Pas assez d'or pour l'amélioration.",
      };
    }

    // Améliorer la carte
    if (!card.level) card.level = 1;
    card.level += 1;

    // Réduire l'or du joueur
    this.gameState.player.gold -= upgradeMaterials.goldCost;

    // Améliorer le bonus de la carte
    if (card.bonus) {
      // Sauvegarder la valeur originale si ce n'est pas déjà fait
      if (!card.bonus.originalValue) {
        card.bonus.originalValue = card.bonus.value;
      }

      // Augmenter la valeur du bonus de 20% par niveau
      card.bonus.value = Math.floor(card.bonus.originalValue * (1 + 0.2 * (card.level - 1)));

      // Mettre à jour la description
      if (card.description && card.description.includes(String(card.bonus.originalValue))) {
        card.description = card.description.replace(
          String(card.bonus.originalValue),
          String(card.bonus.value)
        );
      }
    }

    // Mettre à jour la carte active si elle est équipée
    const activeCardIndex = this.gameState.activeBonusCards.findIndex(
      (activeCard) => activeCard && activeCard.id === cardId
    );

    if (activeCardIndex !== -1) {
      this.gameState.activeBonusCards[activeCardIndex] = {
        ...card,
        usesRemaining: card.uses || 0,
      };
    }

    // Feedback visuel
    if (this.gameState.setActionFeedback) {
      this.gameState.setActionFeedback(
        `${card.name} améliorée au niveau ${card.level}!`,
        'success',
        3000
      );
    }

    return {
      success: true,
      message: `${card.name} améliorée au niveau ${card.level}!`,
      upgradedCard: card,
    };
  }

  /**
   * Réinitialise les utilisations restantes des cartes bonus actives
   * À appeler au début d'un combat
   */
  resetActiveBonusCardsUses() {
    if (!this.gameState.activeBonusCards) return;

    this.gameState.activeBonusCards.forEach((card) => {
      if (card.effect === 'active' && card.uses) {
        card.usesRemaining = card.uses;
      }
    });
  }
}
