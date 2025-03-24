// src/components/card/ActiveBonusCards.jsx
import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { setActionFeedback } from '../../redux/slices/uiSlice';

/**
 * Composant optimisé pour afficher et gérer les cartes bonus actives pendant le combat
 * Permet l'activation des cartes avec des effets actifs
 * Montre le statut des cartes passives
 */
const ActiveBonusCards = () => {
  const dispatch = useDispatch();

  // Obtenir les cartes bonus actives du state Redux
  const activeBonusCards = useSelector((state) => state.bonusCards.active || []);
  const gamePhase = useSelector((state) => state.game.gamePhase);
  const combatPhase = useSelector((state) => state.combat.turnPhase);

  // Animations
  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Si aucune carte active, ne rien afficher
  if (!activeBonusCards || activeBonusCards.length === 0) {
    return null;
  }

  // Obtention de la couleur en fonction de la rareté
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-600 hover:bg-gray-700';
      case 'uncommon':
        return 'bg-green-600 hover:bg-green-700';
      case 'rare':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'epic':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'legendary':
        return 'bg-yellow-600 hover:bg-yellow-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  // Obtention de l'icône en fonction du type d'effet
  const getEffectIcon = (card) => {
    if (card.effect === 'passive') {
      return '🔄'; // Effet passif
    }

    if (!card.bonus) return '🎮'; // Cas par défaut

    switch (card.bonus.type) {
      case 'damage':
        return '⚔️'; // Dégâts
      case 'heal':
        return '❤️'; // Soin
      case 'shield':
        return '🛡️'; // Bouclier
      case 'discard':
        return '🔄'; // Défausse
      case 'invulnerable':
        return '✨'; // Invulnérabilité
      case 'damageMultiplier':
        return '🔥'; // Multiplicateur
      default:
        return '🎮'; // Cas par défaut
    }
  };

  // Gestion de l'utilisation d'une carte bonus
  const handleUseBonus = (index) => {
    const card = activeBonusCards[index];

    // Vérifier si la carte peut être utilisée
    if (card.effect !== 'active' || card.usesRemaining <= 0 || card.available === false) {
      dispatch(
        setActionFeedback({
          message: 'Cette carte ne peut pas être utilisée actuellement',
          type: 'warning',
        })
      );
      return;
    }

    // En dehors du combat ou en phase de pioche, ne pas permettre l'activation
    if (gamePhase !== 'combat' || combatPhase === 'draw') {
      dispatch(
        setActionFeedback({
          message: "Les cartes ne peuvent être utilisées qu'en combat",
          type: 'warning',
        })
      );
      return;
    }

    // Dispatch l'action pour utiliser la carte
    dispatch({ type: 'bonusCards/useCard', payload: index });

    // Feedback visuel
    dispatch(
      setActionFeedback({
        message: `${card.name} activée`,
        type: 'success',
      })
    );
  };

  return (
    <div className="p-4 bg-gray-800 rounded-md">
      <h2 className="font-bold mb-2 text-white">Cartes Bonus</h2>
      <motion.div
        className="flex flex-wrap gap-2"
        variants={containerAnimation}
        initial="hidden"
        animate="show"
      >
        {activeBonusCards.map((card, index) => (
          <motion.button
            key={`bonus-card-${card.id}-${index}`}
            variants={itemAnimation}
            onClick={() => handleUseBonus(index)}
            className={`
              px-3 py-2 text-xs font-semibold rounded-md text-white
              transition-all transform ${getRarityColor(card.rarity)}
              ${
                card.available === false ||
                card.usesRemaining <= 0 ||
                card.effect !== 'active' ||
                gamePhase !== 'combat' ||
                combatPhase === 'draw'
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105'
              }
            `}
            disabled={
              card.available === false ||
              card.usesRemaining <= 0 ||
              card.effect !== 'active' ||
              gamePhase !== 'combat' ||
              combatPhase === 'draw'
            }
            title={card.description}
            aria-label={`${card.name} - ${card.description} - ${card.effect === 'active' ? 'Cliquer pour utiliser' : 'Effet passif'}`}
            whileHover={{
              scale:
                card.effect === 'active' && card.usesRemaining > 0 && gamePhase === 'combat'
                  ? 1.05
                  : 1,
            }}
            whileTap={{
              scale:
                card.effect === 'active' && card.usesRemaining > 0 && gamePhase === 'combat'
                  ? 0.95
                  : 1,
            }}
          >
            <div className="flex items-center">
              <span className="mr-1">{getEffectIcon(card)}</span>
              <span>{card.name}</span>
              {card.effect === 'active' && card.uses > 0 && (
                <span className="ml-2 bg-gray-700 px-1 rounded-md">
                  {card.usesRemaining}/{card.uses}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </motion.div>

      <div className="mt-2 text-xs text-gray-400">
        <p>
          Les effets passifs (🔄) s'activent automatiquement. Cliquez sur les effets actifs pour les
          utiliser.
        </p>
      </div>
    </div>
  );
};

export default React.memo(ActiveBonusCards);
