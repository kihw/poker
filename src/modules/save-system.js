// src/modules/save-system.js - Système de sauvegarde unifié

import React, { useEffect } from 'react';
import { generateRoguelikeMap, validateMap } from './map-generator.js';
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
      version: '1.1', // Incrémenté pour indiquer le nouveau format
      timestamp: Date.now(),
      player: {
        health: gameState.player.health,
        maxHealth: gameState.player.maxHealth,
        gold: gameState.player.gold,
        level: gameState.player.level,
        experience: gameState.player.experience,
        inventory: gameState.player.inventory || [],
        shield: gameState.player.shield || 0,
      },
      progression: {
        stage: gameState.stage,
        currentFloor: gameState.currentFloor || 1,
        maxFloors: gameState.maxFloors || 10,
        gamePhase: gameState.gamePhase || 'exploration',
        currentNodeId: gameState.currentNodeId,
      },
      map: {
        path: gameState.path || [],
      },
      bonusCards: {
        collection: gameState.bonusCardCollection.map((card) => ({
          id: card.id,
          owned: card.owned !== false,
          level: card.level || 1,
        })),
        active: gameState.activeBonusCards.map((card) => ({
          id: card.id,
          usesRemaining: card.usesRemaining || 0,
        })),
        maxSlots: gameState.maxBonusCardSlots,
      },
      stats: gameState.stats || {
        enemiesDefeated: 0,
        totalDamageDealt: 0,
        highestDamage: 0,
        goldEarned: 0,
        cardsPlayed: 0,
      },
      itemsPurchased: gameState.itemsPurchased || {},
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
      gameState.player.shield = saveData.player.shield || 0;
    }

    // Appliquer les données de progression
    if (saveData.progression) {
      gameState.stage = saveData.progression.stage;
      gameState.currentFloor = saveData.progression.currentFloor || 1;
      gameState.maxFloors = saveData.progression.maxFloors || 10;
      gameState.gamePhase = saveData.progression.gamePhase || 'exploration';
      gameState.currentNodeId = saveData.progression.currentNodeId;
    }

    // Charger la carte du jeu si elle est présente
    if (saveData.map && saveData.map.path && saveData.map.path.length > 0) {
      gameState.path = saveData.map.path;
    } else {
      // Générer une nouvelle carte si nécessaire
      if (!gameState.path || gameState.path.length === 0) {
        // Utiliser la version du contexte si disponible
        if (gameState.generateMap) {
          console.log(
            'Utilisation de gameState.generateMap pour créer une nouvelle carte'
          );
          gameState.generateMap();
        } else {
          // Méthode alternative pour générer une carte si generateMap n'est pas disponible
          console.warn(
            "generateMap non disponible - utilisation d'une méthode alternative"
          );

          // Si une autre méthode est disponible dans l'état du jeu, l'utiliser
          if (
            gameState.progressionSystem &&
            gameState.progressionSystem.generateMap
          ) {
            gameState.progressionSystem.generateMap();
          } else {
            console.error(
              'Impossible de générer une nouvelle carte - aucune méthode disponible'
            );
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

      // Équiper les cartes actives
      gameState.activeBonusCards = [];

      if (saveData.bonusCards.active) {
        for (const activeCard of saveData.bonusCards.active) {
          const card = gameState.bonusCardCollection.find(
            (c) => c.id === activeCard.id && c.owned
          );

          if (card) {
            gameState.activeBonusCards.push({
              ...card,
              usesRemaining:
                activeCard.usesRemaining !== undefined
                  ? activeCard.usesRemaining
                  : card.uses || 0,
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

    // Appliquer les achats d'objets
    if (saveData.itemsPurchased) {
      gameState.itemsPurchased = { ...saveData.itemsPurchased };
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
 * Composant React pour gérer la sauvegarde automatique
 * Version unifiée qui remplace AutoSaveHandler et AutoSaveManager
 */
export function AutoSaveHandler({
  gameState,
  saveInterval = 60000,
  lastUpdate = null,
}) {
  useEffect(() => {
    if (!gameState) return;

    // Fonction pour sauvegarder l'état du jeu
    const performSave = () => {
      try {
        const success = saveGame(gameState);
        if (success) {
          console.log(
            'Sauvegarde automatique effectuée',
            new Date().toLocaleTimeString()
          );
        } else {
          console.error('Échec de la sauvegarde automatique');
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde automatique:', error);
      }
    };

    // Configurer la sauvegarde périodique
    const saveTimer = setInterval(performSave, saveInterval);

    // Sauvegarder lors des changements importants
    if (lastUpdate) {
      performSave();
    }

    // Nettoyage
    return () => clearInterval(saveTimer);
  }, [gameState, saveInterval, lastUpdate]);

  // Ce composant ne rend rien visuellement
  return null;
}
