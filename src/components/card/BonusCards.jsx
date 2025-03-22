// src/components/card/BonusCards.jsx - Migré vers Redux
import React from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { selectActiveBonusCards } from '../../redux/selectors/gameSelectors';
import { useCard } from '../../redux/slices/bonusCardsSlice';
import { setActionFeedback } from '../../redux/slices/uiSlice';

const BonusCards = () => {
  const dispatch = useDispatch();
  // Utiliser le sélecteur pour obtenir les cartes bonus actives
  const bonusCards = useSelector(selectActiveBonusCards);

  if (!bonusCards || bonusCards.length === 0) {
    return null;
  }

  // Animation des cartes bonus
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Récupérer la couleur en fonction de la rareté de la carte
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

  // Récupérer l'icône en fonction du type d'effet
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

  // Gérer l'utilisation d'une carte bonus
  const handleUseBonus = (index) => {
    const card = bonusCards[index];

    // Vérifier si la carte peut être utilisée
    if (
      card.effect !== 'active' ||
      card.usesRemaining <= 0 ||
      card.available === false
    ) {
      dispatch(
        setActionFeedback({
          message: 'Cette carte ne peut pas être utilisée actuellement',
          type: 'warning',
        })
      );
      return;
    }

    // Dispatche l'action pour utiliser la carte
    dispatch(useCard(index));

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
        variants={container}
        initial="hidden"
        animate="show"
      >
        {bonusCards.map((bonus, index) => (
          <motion.button
            key={index}
            variants={item}
            onClick={() => handleUseBonus(index)}
            className={`px-3 py-2 text-xs font-semibold rounded-md text-white
                        transition-all transform ${getRarityColor(bonus.rarity)}
                        ${
                          bonus.available === false ||
                          bonus.usesRemaining <= 0 ||
                          bonus.effect !== 'active'
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:scale-105'
                        }`}
            disabled={
              bonus.available === false ||
              bonus.usesRemaining <= 0 ||
              bonus.effect !== 'active'
            }
            title={bonus.description}
            aria-label={`${bonus.name} - ${bonus.description} - ${bonus.effect === 'active' ? 'Cliquer pour utiliser' : 'Effet passif'}`}
            whileHover={{
              scale:
                bonus.effect === 'active' && bonus.usesRemaining > 0 ? 1.05 : 1,
            }}
            whileTap={{
              scale:
                bonus.effect === 'active' && bonus.usesRemaining > 0 ? 0.95 : 1,
            }}
          >
            <div className="flex items-center">
              <span className="mr-1">{getEffectIcon(bonus)}</span>
              <span>{bonus.name}</span>
              {bonus.effect === 'active' && bonus.uses > 0 && (
                <span className="ml-2 bg-gray-700 px-1 rounded-md">
                  {bonus.usesRemaining}/{bonus.uses}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </motion.div>

      <div className="mt-2 text-xs text-gray-400">
        <p>
          Les effets passifs (🔄) s'activent automatiquement. Cliquez sur les
          effets actifs pour les utiliser.
        </p>
      </div>
    </div>
  );
};

export default React.memo(BonusCards);
