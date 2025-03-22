// src/modules/save-system.js
/**
 * Système de sauvegarde et chargement
 * Ce module gère la sauvegarde de la progression du joueur et son chargement
 */
import React from 'react';
const SAVE_KEY = 'pokerSoloRpgSave';

/**
 * Sauvegarde l'état du jeu dans le localStorage
 * @param {Object} gameState - L'état du jeu à sauvegarder
 * @returns {boolean} - true si la sauvegarde a réussi, false sinon
 */
export function saveGame(gameState) {
  if (!gameState) {
    console.error('Impossible de sauvegarder: gameState est null ou undefined');
    return false;
  }

  try {
    // Créer un objet de sauvegarde avec les données essentielles
    const saveData = {
      version: '1.0',
      timestamp: Date.now(),
      player: {
        health: gameState.player.health,
        maxHealth: gameState.player.maxHealth,
        gold: gameState.player.gold,
        level: gameState.player.level,
        experience: gameState.player.experience,
        inventory: gameState.player.inventory || [],
      },
      progression: {
        stage: gameState.stage,
        currentFloor: gameState.currentFloor,
        maxFloors: gameState.maxFloors,
      },
      bonusCards: {
        collection: gameState.bonusCardCollection.map((card) => ({
          id: card.id,
          owned: card.owned !== false, // Par défaut true si non spécifié
          level: card.level || 1,
        })),
        active: gameState.activeBonusCards.map((card) => card.id),
        maxSlots: gameState.maxBonusCardSlots,
      },
      stats: gameState.stats || {
        enemiesDefeated: 0,
        totalDamageDealt: 0,
        highestDamage: 0,
        goldEarned: 0,
        cardsPlayed: 0,
      },
    };

    // Sauvegarder dans le localStorage
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    console.log('Jeu sauvegardé avec succès:', saveData);
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du jeu:', error);
    return false;
  }
}

/**
 * Charge l'état du jeu depuis le localStorage
 * @returns {Object|null} - L'état du jeu chargé ou null si aucune sauvegarde
 */
export function loadGame() {
  try {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) {
      console.log('Aucune sauvegarde trouvée');
      return null;
    }

    const saveData = JSON.parse(savedData);
    console.log('Sauvegarde chargée:', saveData);
    return saveData;
  } catch (error) {
    console.error('Erreur lors du chargement de la sauvegarde:', error);
    return null;
  }
}

/**
 * Applique les données de sauvegarde à l'état du jeu actuel
 * @param {Object} gameState - L'état du jeu à mettre à jour
 * @param {Object} saveData - Les données de sauvegarde
 * @returns {boolean} - true si l'application a réussi, false sinon
 */
export function applySaveData(gameState, saveData) {
  if (!gameState || !saveData) {
    console.error('gameState ou saveData invalide');
    return false;
  }

  try {
    // Appliquer les données du joueur
    if (saveData.player) {
      gameState.player.health = saveData.player.health;
      gameState.player.maxHealth = saveData.player.maxHealth;
      gameState.player.gold = saveData.player.gold;
      gameState.player.level = saveData.player.level;
      gameState.player.experience = saveData.player.experience;
      gameState.player.inventory = saveData.player.inventory || [];
    }

    // Appliquer les données de progression
    if (saveData.progression) {
      gameState.stage = saveData.progression.stage;
      gameState.currentFloor = saveData.progression.currentFloor;
      gameState.maxFloors = saveData.progression.maxFloors;

      // Forcer le mode exploration si ce n'est pas défini dans la sauvegarde
      if (!saveData.gamePhase) {
        gameState.gamePhase = 'exploration';

        // Générer une nouvelle carte si nécessaire
        if (!gameState.path || gameState.path.length === 0) {
          // Importer directement la fonction de génération de carte
          const { generateRoguelikeMap } = require('./map-generator.js');

          const mapOptions = {
            width: 3 + Math.min(2, Math.floor(gameState.currentFloor / 3)),
            depth: 5 + Math.min(3, Math.floor(gameState.currentFloor / 2)),
          };

          const mapNodes = generateRoguelikeMap(
            gameState.stage,
            mapOptions.width,
            mapOptions.depth
          );

          gameState.path = mapNodes;

          // Définir le nœud de départ
          const startNode = mapNodes.find((node) => node.type === 'start');
          if (startNode) {
            gameState.currentNodeId = startNode.id;
          }
        }
      }
    }

    // Appliquer les données de cartes bonus si le système est initialisé
    if (saveData.bonusCards && gameState.bonusCardSystem) {
      // Réinitialiser la collection
      gameState.bonusCardCollection = [];

      // Reconstituer la collection
      if (saveData.bonusCards.collection) {
        for (const savedCard of saveData.bonusCards.collection) {
          const cardTemplate = gameState.bonusCardSystem.allBonusCards.find(
            (card) => card.id === savedCard.id
          );

          if (cardTemplate) {
            // Créer une copie du modèle avec les attributs sauvegardés
            const card = {
              ...cardTemplate,
              owned: savedCard.owned !== false,
              level: savedCard.level || 1,
            };

            // Ajuster la valeur du bonus en fonction du niveau
            if (card.bonus && card.bonus.originalValue) {
              card.bonus.value = Math.floor(
                card.bonus.originalValue * (1 + 0.2 * (card.level - 1))
              );
            }

            gameState.bonusCardCollection.push(card);
          }
        }
      }

      // Equipper les cartes actives
      gameState.activeBonusCards = [];
      if (saveData.bonusCards.active) {
        for (const cardId of saveData.bonusCards.active) {
          const card = gameState.bonusCardCollection.find(
            (c) => c.id === cardId && c.owned
          );
          if (card) {
            gameState.activeBonusCards.push({
              ...card,
              usesRemaining: card.uses || 0,
            });
          }
        }
      }

      // Mettre à jour le nombre max d'emplacements
      if (saveData.bonusCards.maxSlots) {
        gameState.maxBonusCardSlots = saveData.bonusCards.maxSlots;
      }
    }

    // Appliquer les statistiques
    if (saveData.stats) {
      gameState.stats = { ...saveData.stats };
    }

    console.log('Données de sauvegarde appliquées avec succès');
    return true;
  } catch (error) {
    console.error(
      "Erreur lors de l'application des données de sauvegarde:",
      error
    );
    return false;
  }
}

/**
 * Supprime la sauvegarde du localStorage
 * @returns {boolean} - true si la suppression a réussi, false sinon
 */
export function deleteSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
    console.log('Sauvegarde supprimée');
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la sauvegarde:', error);
    return false;
  }
}

/**
 * Vérifie si une sauvegarde existe
 * @returns {boolean} - true si une sauvegarde existe, false sinon
 */
export function hasSave() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Gère la sauvegarde automatique
 * @param {Object} gameState - L'état du jeu à sauvegarder
 * @param {number} interval - Intervalle en millisecondes entre chaque sauvegarde
 */
export class AutoSaveManager {
  constructor(gameState, interval = 60000) {
    this.gameState = gameState;
    this.interval = interval;
    this.timerId = null;
    this.lastSaveTime = 0;
  }

  /**
   * Démarre la sauvegarde automatique
   */
  start() {
    // Arrêter le timer existant s'il y en a un
    this.stop();

    // Démarrer un nouveau timer
    this.timerId = setInterval(() => {
      this.save();
    }, this.interval);

    console.log(
      `AutoSave démarré (intervalle: ${this.interval / 1000} secondes)`
    );
  }

  /**
   * Arrête la sauvegarde automatique
   */
  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
      console.log('AutoSave arrêté');
    }
  }

  /**
   * Effectue une sauvegarde
   * @returns {boolean} - true si la sauvegarde a réussi, false sinon
   */
  save() {
    if (!this.gameState) {
      console.warn('AutoSave: gameState non défini');
      return false;
    }

    this.lastSaveTime = Date.now();
    const result = saveGame(this.gameState);

    if (result) {
      console.log(
        `AutoSave: jeu sauvegardé à ${new Date(this.lastSaveTime).toLocaleTimeString()}`
      );
    }

    return result;
  }
}

/**
 * Composant React pour gérer la sauvegarde automatique
 */
export function AutoSaveHandler({ gameState, saveInterval, lastUpdate }) {
  React.useEffect(() => {
    // Fonction pour sauvegarder l'état du jeu
    const saveGame = () => {
      try {
        // Créer une version simplifiée pour la sauvegarde
        const saveData = {
          player: gameState.player,
          stage: gameState.stage,
          currentFloor: gameState.currentFloor,
          bonusCardCollection: gameState.bonusCardCollection,
          activeBonusCards: gameState.activeBonusCards.map((card) => card.id),
          maxBonusCardSlots: gameState.maxBonusCardSlots,
          stats: gameState.stats,
          timestamp: Date.now(),
        };

        // Sauvegarder dans le localStorage
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        console.log(
          'Jeu sauvegardé automatiquement',
          new Date().toLocaleTimeString()
        );
      } catch (error) {
        console.error('Erreur lors de la sauvegarde automatique:', error);
      }
    };

    // Configurer la sauvegarde périodique
    const saveTimer = setInterval(saveGame, saveInterval);

    // Sauvegarder lors des changements importants
    if (lastUpdate) {
      saveGame();
    }

    // Nettoyage
    return () => clearInterval(saveTimer);
  }, [gameState, saveInterval, lastUpdate]);

  // Ce composant ne rend rien visuellement
  return null;
}
