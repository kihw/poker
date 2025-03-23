// Modification pour src/redux/thunks/combatThunks.js
export * from './combatCycleThunks';
// Intégrer cette fonction dans le fichier pour évaluer correctement les mains de moins de 5 cartes
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setEnemy, startCombat } from '../slices/combatSlice';
import { setGamePhase } from '../slices/gameSlice';
import { generateEnemy } from '../../modules/combat-system-factory';

/**
 * Évalue une main de moins de 5 cartes
 * @param {Array} cards - Tableau de cartes (1-4 cartes)
 * @returns {Object} - Résultat de l'évaluation
 */
function evaluatePartialHand(cards) {
  if (!cards || cards.length === 0) {
    return {
      handName: 'Aucune carte',
      handRank: 0,
      baseDamage: 0,
    };
  }

  // Compter les valeurs pour identifier les paires, brelan, etc.
  const valueCount = {};
  for (const card of cards) {
    const value = card.numericValue;
    valueCount[value] = (valueCount[value] || 0) + 1;
  }

  const values = Object.keys(valueCount).map(Number);

  // Cas particuliers selon le nombre de cartes
  switch (cards.length) {
    case 1: // Une seule carte - la valeur de la carte est le dégât
      return {
        handName: '1 Carte',
        handRank: 0,
        baseDamage: cards[0].numericValue,
      };

    case 2: // Deux cartes - paire ou somme
      if (values.length === 1) {
        // Paire
        return {
          handName: `Paire de ${getCardNameFromValue(values[0])}`,
          handRank: 1,
          baseDamage: values[0] * 2 * 1.5, // Bonus de 50% pour une paire
        };
      } else {
        // Somme des valeurs
        return {
          handName: '2 Cartes',
          handRank: 0,
          baseDamage: cards.reduce((sum, card) => sum + card.numericValue, 0),
        };
      }

    case 3: // Trois cartes - brelan ou somme
      if (values.length === 1) {
        // Brelan
        return {
          handName: `Brelan de ${getCardNameFromValue(values[0])}`,
          handRank: 3,
          baseDamage: values[0] * 3 * 2, // Bonus de 100% pour un brelan
        };
      } else if (
        values.length === 2 &&
        (valueCount[values[0]] === 2 || valueCount[values[1]] === 2)
      ) {
        // Une paire + une carte
        const pairValue = valueCount[values[0]] === 2 ? values[0] : values[1];
        const singleValue = valueCount[values[0]] === 2 ? values[1] : values[0];
        return {
          handName: `Paire de ${getCardNameFromValue(pairValue)}`,
          handRank: 1,
          baseDamage: pairValue * 2 * 1.5 + singleValue,
        };
      } else {
        // Somme simple
        return {
          handName: '3 Cartes',
          handRank: 0,
          baseDamage: cards.reduce((sum, card) => sum + card.numericValue, 0),
        };
      }

    case 4: // Quatre cartes - carré, double paire, brelan+carte, ou somme
      if (values.length === 1) {
        // Carré
        return {
          handName: `Carré de ${getCardNameFromValue(values[0])}`,
          handRank: 7,
          baseDamage: values[0] * 4 * 3, // Bonus de 200% pour un carré
        };
      } else if (values.length === 2) {
        if (valueCount[values[0]] === 2 && valueCount[values[1]] === 2) {
          // Double paire
          const highPair = Math.max(values[0], values[1]);
          const lowPair = Math.min(values[0], values[1]);
          return {
            handName: `Double Paire de ${getCardNameFromValue(highPair)} et ${getCardNameFromValue(lowPair)}`,
            handRank: 2,
            baseDamage: (highPair + lowPair) * 2 * 1.3, // Bonus de 30% pour une double paire
          };
        } else {
          // Brelan + carte
          const brealanValue =
            valueCount[values[0]] === 3 ? values[0] : values[1];
          const singleValue =
            valueCount[values[0]] === 3 ? values[1] : values[0];
          return {
            handName: `Brelan de ${getCardNameFromValue(brealanValue)}`,
            handRank: 3,
            baseDamage: brealanValue * 3 * 1.8 + singleValue, // Bonus légèrement réduit
          };
        }
      } else if (
        values.length === 3 &&
        (valueCount[values[0]] === 2 ||
          valueCount[values[1]] === 2 ||
          valueCount[values[2]] === 2)
      ) {
        // Une paire + deux cartes
        let pairValue;
        for (const val of values) {
          if (valueCount[val] === 2) {
            pairValue = val;
            break;
          }
        }
        const totalNonPairValue = cards.reduce(
          (sum, card) =>
            card.numericValue !== pairValue ? sum + card.numericValue : sum,
          0
        );

        return {
          handName: `Paire de ${getCardNameFromValue(pairValue)}`,
          handRank: 1,
          baseDamage: pairValue * 2 * 1.3 + totalNonPairValue,
        };
      } else {
        // Simple somme
        return {
          handName: '4 Cartes',
          handRank: 0,
          baseDamage: cards.reduce((sum, card) => sum + card.numericValue, 0),
        };
      }
  }

  // Somme simple pour les autres cas
  return {
    handName: `${cards.length} Cartes`,
    handRank: 0,
    baseDamage: cards.reduce((sum, card) => sum + card.numericValue, 0),
  };
}

/**
 * Convertit une valeur numérique en nom de carte
 * @param {number} value - Valeur numérique (2-14)
 * @returns {string} - Nom de la carte
 */
function getCardNameFromValue(value) {
  const valueMap = {
    11: 'Valet',
    12: 'Dame',
    13: 'Roi',
    14: 'As',
  };

  return valueMap[value] || value.toString();
}

/**
 * Thunk pour démarrer un nouveau combat
 * @param {Object} options - Options pour le combat
 * @param {boolean} [options.isElite=false] - Si l'ennemi est d'élite
 * @param {boolean} [options.isBoss=false] - Si l'ennemi est un boss
 */
export const startNewCombat = createAsyncThunk(
  'combat/startNewCombat',
  async ({ isElite = false, isBoss = false }, { dispatch, getState }) => {
    try {
      // Récupérer le niveau actuel
      const stage = getState().game.stage || 1;

      // Générer un ennemi
      const enemy = generateEnemy(stage, isElite, isBoss);

      // Dispatcher l'action pour définir l'ennemi et commencer le combat
      dispatch(setEnemy(enemy));
      dispatch(startCombat(enemy));
      dispatch(setGamePhase('combat'));

      return enemy;
    } catch (error) {
      console.error('Erreur lors du démarrage du combat:', error);
      return null;
    }
  }
);

// Exporter les autres thunks existants
export * from './combatCycleThunks';
