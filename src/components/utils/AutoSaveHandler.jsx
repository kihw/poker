// src/components/utils/AutoSaveHandler.jsx
import React, { useEffect } from 'react';
import { saveGame } from '../../modules/save-system';

/**
 * Composant pour gérer la sauvegarde automatique
 */
const AutoSaveHandler = ({ gameState, saveInterval = 60000, lastUpdate }) => {
  useEffect(() => {
    if (!gameState) return;

    // Sauvegarde périodique
    const intervalId = setInterval(() => {
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
    }, saveInterval);

    // Sauvegarde lors des changements importants (si lastUpdate change)
    if (lastUpdate) {
      try {
        saveGame(gameState);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde après mise à jour:', error);
      }
    }

    // Nettoyage: arrêter l'intervalle
    return () => clearInterval(intervalId);
  }, [gameState, saveInterval, lastUpdate]);

  // Ce composant ne rend rien visuellement
  return null;
};

export default AutoSaveHandler;
