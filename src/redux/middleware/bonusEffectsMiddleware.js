// src/redux/middleware/bonusEffectsMiddleware.js
import {
  setPendingDamageBonus,
  setPendingDamageMultiplier,
  setInvulnerableNextTurn,
  addToCombatLog,
} from '../slices/combatSlice';
import { heal, addShield } from '../slices/playerSlice';
import { setActionFeedback } from '../slices/uiSlice';

// Configuration des types d'effets de cartes et leur mappage vers les actions Redux
const BONUS_EFFECT_HANDLERS = {
  damage: (store, card, value) => {
    store.dispatch(setPendingDamageBonus(value));
    store.dispatch(addToCombatLog(`${card.name} ajoute ${value} points de dégâts`));
    return `${card.name} a ajouté ${value} dégâts`;
  },
  damageMultiplier: (store, card, value) => {
    store.dispatch(setPendingDamageMultiplier(value));
    store.dispatch(addToCombatLog(`${card.name} multiplie les dégâts par ${value}`));
    return `${card.name} a multiplié les dégâts par ${value}`;
  },
  heal: (store, card, value) => {
    store.dispatch(heal(value));
    store.dispatch(addToCombatLog(`${card.name} restaure ${value} PV`));
    return `${card.name} a restauré ${value} PV`;
  },
  shield: (store, card, value) => {
    store.dispatch(addShield(value));
    store.dispatch(addToCombatLog(`${card.name} ajoute ${value} points de bouclier`));
    return `${card.name} a ajouté ${value} points de bouclier`;
  },
  invulnerable: (store, card) => {
    store.dispatch(setInvulnerableNextTurn(true));
    store.dispatch(addToCombatLog(`${card.name} vous rend invulnérable au prochain tour`));
    return `${card.name} vous rend invulnérable au prochain tour`;
  },
  discard: (store, card, value) => {
    // La logique de défausse est gérée séparément dans les thunks
    store.dispatch(addToCombatLog(`${card.name} vous permet de défausser jusqu'à ${value} cartes`));
    return `${card.name} vous permet de défausser jusqu'à ${value} cartes`;
  },
  damageReduction: (store, card, value) => {
    // Cet effet est appliqué lors de l'attaque de l'ennemi
    store.dispatch(addToCombatLog(`${card.name} réduira les dégâts subis de ${value} points`));
    return `${card.name} réduira les dégâts de ${value} points`;
  },
  fusionEffect: (store, effect) => {
    const { type, value } = effect;

    if (type === 'damage') {
      store.dispatch(setPendingDamageBonus(value));
      store.dispatch(addToCombatLog(`Fusion de cartes: +${value} points de dégâts`));
      return `Fusion de cartes: +${value} points de dégâts`;
    } else if (type === 'damageMultiplier') {
      store.dispatch(setPendingDamageMultiplier(value));
      store.dispatch(addToCombatLog(`Fusion de cartes: Dégâts multipliés par ${value}`));
      return `Fusion de cartes: Dégâts multipliés par ${value}`;
    } else if (type === 'heal') {
      store.dispatch(heal(value));
      store.dispatch(addToCombatLog(`Fusion de cartes: Récupération de ${value} PV`));
      return `Fusion de cartes: Récupération de ${value} PV`;
    } else if (type === 'shield') {
      store.dispatch(addShield(value));
      store.dispatch(addToCombatLog(`Fusion de cartes: +${value} points de bouclier`));
      return `Fusion de cartes: +${value} points de bouclier`;
    } else if (type === 'invulnerable') {
      store.dispatch(setInvulnerableNextTurn(true));
      store.dispatch(addToCombatLog(`Fusion de cartes: Invulnérabilité au prochain tour`));
      return `Fusion de cartes: Invulnérabilité au prochain tour`;
    }

    return null;
  },
};

/**
 * Applique les effets d'une carte bonus active
 * Cette fonction est exportée pour être utilisable par les thunks sans créer de dépendances circulaires
 * @param {Object} store - Le store Redux
 * @param {Object} card - La carte bonus à utiliser
 * @returns {String|null} - Message de feedback ou null
 */
export function applyCardEffect(store, card) {
  if (!card || !card.bonus || !card.bonus.type) {
    console.warn('Carte invalide ou sans effet défini:', card);
    return null;
  }

  const handler = BONUS_EFFECT_HANDLERS[card.bonus.type];
  if (!handler) {
    console.warn(`Handler not defined for effect type: ${card.bonus.type}`);
    return null;
  }

  try {
    return handler(store, card, card.bonus.value);
  } catch (error) {
    console.error(`Erreur lors de l'application de l'effet ${card.bonus.type}:`, error);
    return null;
  }
}

/**
 * Fonction pour standardiser et normaliser les noms des combinaisons de poker
 * @param {string} handName - Nom de la combinaison de poker
 * @returns {string} - Nom standardisé
 */
function standardizeHandName(handName) {
  if (!handName) return '';

  // Table de correspondance pour standardiser les noms (anglais et français)
  const nameMappings = {
    // Noms anglais (format standard)
    'royal flush': 'Royal Flush',
    'straight flush': 'Straight Flush',
    'four of a kind': 'Four of a Kind',
    'full house': 'Full House',
    flush: 'Flush',
    straight: 'Straight',
    'three of a kind': 'Three of a Kind',
    'two pair': 'Two Pair',
    pair: 'Pair',
    'high card': 'High Card',

    // Traductions françaises vers le format standard
    'quinte flush royale': 'Royal Flush',
    'quinte flush': 'Straight Flush',
    carré: 'Four of a Kind',
    full: 'Full House',
    couleur: 'Flush',
    suite: 'Straight',
    brelan: 'Three of a Kind',
    'double paire': 'Two Pair',
    paire: 'Pair',
    'carte haute': 'High Card',

    // Formats partiels ou avec des préfixes/suffixes
    'paire de': 'Pair',
    'brelan de': 'Three of a Kind',
  };

  // Convertir en minuscules pour la recherche insensible à la casse
  const lowerCaseName = handName.toLowerCase();

  // Rechercher une correspondance exacte d'abord
  if (nameMappings[lowerCaseName]) {
    return nameMappings[lowerCaseName];
  }

  // Sinon, rechercher si le nom contient l'une des clés
  for (const [key, value] of Object.entries(nameMappings)) {
    if (lowerCaseName.includes(key)) {
      return value;
    }
  }

  // Si aucune correspondance n'est trouvée, retourner le nom original
  return handName;
}

/**
 * Middleware qui intercepte les actions liées aux cartes bonus
 * et applique leurs effets à l'état du jeu
 */
const bonusEffectsMiddleware = (store) => (next) => (action) => {
  // Gestion de l'utilisation d'une carte bonus active
  if (action.type === 'bonusCards/useCard') {
    const state = store.getState();
    const cardIndex = action.payload;

    // Vérifier si state.bonusCards et state.bonusCards.active existent avant d'y accéder
    if (state.bonusCards && Array.isArray(state.bonusCards.active)) {
      const card = state.bonusCards.active[cardIndex];

      console.log(`Tentative d'utilisation de la carte à l'index ${cardIndex}:`, card);

      // Vérifier si la carte peut être utilisée
      if (card && card.effect === 'active' && card.usesRemaining > 0) {
        console.log(`La carte ${card.name} est utilisable, application de l'effet...`);
        const effectMessage = applyCardEffect(store, card);

        // Afficher le feedback si nécessaire
        if (effectMessage) {
          store.dispatch(
            setActionFeedback({
              message: effectMessage,
              type: 'success',
            })
          );
        }
      } else {
        if (card) {
          console.log(`La carte ${card.name} ne peut pas être utilisée:`, {
            effect: card.effect,
            usesRemaining: card.usesRemaining,
          });
        } else {
          console.warn(`Aucune carte trouvée à l'index ${cardIndex}`);
        }
      }
    }
  }

  // Gestion de l'attaque du joueur pour appliquer les bonus passifs
  if (action.type === 'combat/attackEnemy/pending') {
    const state = store.getState();

    // Vérifier si les propriétés d'état requises existent
    if (!state.bonusCards || !state.combat) {
      console.log('État requis manquant pour les bonus passifs');
      return next(action);
    }

    const activeBonusCards = state.bonusCards.active || [];
    const currentHandName = state.combat.handResult?.handName;
    console.log(`Main actuelle: "${currentHandName}"`);

    const standardizedHandName = standardizeHandName(currentHandName);
    console.log(`Main standardisée: "${standardizedHandName}"`);

    const playerDamagedLastTurn = state.combat.playerDamagedLastTurn;

    const bonusMessages = [];

    // Appliquer les effets passifs conditionnels
    activeBonusCards.forEach((card) => {
      if (!card || card.effect !== 'passive') return;

      console.log(`Vérification de la carte passive: ${card.name}, condition: ${card.condition}`);

      let shouldApply = false;
      let conditionType = '';

      // Vérifier la condition
      if (card.condition === 'always') {
        shouldApply = true;
        conditionType = 'always';
        console.log(`-> Condition 'always' validée`);
      } else if (card.condition === 'damageTaken' && playerDamagedLastTurn) {
        shouldApply = true;
        conditionType = 'damageTaken';
        console.log(`-> Condition 'damageTaken' validée`);
      } else if (card.condition === 'lowHealth' && state.player) {
        const player = state.player;
        shouldApply = player.health < player.maxHealth * 0.25;
        conditionType = 'lowHealth';
        console.log(`-> Condition 'lowHealth' ${shouldApply ? 'validée' : 'non validée'}`);
      } else {
        // Vérifier si la condition correspond à la main actuelle (après standardisation)
        const standardizedCondition = standardizeHandName(card.condition);
        console.log(`-> Comparaison: "${standardizedCondition}" vs "${standardizedHandName}"`);

        if (standardizedCondition === standardizedHandName) {
          shouldApply = true;
          conditionType = 'handMatch';
          console.log(`-> Condition 'handMatch' validée pour ${standardizedCondition}`);
        }
      }

      // Appliquer l'effet si la condition est remplie
      if (shouldApply) {
        console.log(`Application de l'effet de ${card.name}...`);
        const effectMessage = applyCardEffect(store, card);
        if (effectMessage) {
          bonusMessages.push({
            message: effectMessage,
            condition: conditionType,
            card: card.name,
          });
        }
      }
    });

    // Envoyer un feedback pour chaque effet appliqué
    if (bonusMessages.length > 0) {
      // Log des effets pour débogage
      console.log('Bonus effects applied:', bonusMessages);

      // Message regroupé pour l'utilisateur
      const mainMessage = `${bonusMessages.length} effet${bonusMessages.length > 1 ? 's' : ''} bonus appliqué${bonusMessages.length > 1 ? 's' : ''}`;

      store.dispatch(
        setActionFeedback({
          message: mainMessage,
          type: 'info',
        })
      );
    } else {
      console.log('Aucun effet bonus appliqué pour cette main');
    }
  }

  return next(action);
};

export default bonusEffectsMiddleware;
