import React from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

const BonusDeckCombination = () => {
  const activeBonusCards = useSelector((state) => state.bonusCards.active || []);
  const deckCombination = useSelector((state) => state.bonusCards.deckCombination);

  // Si aucune carte n'est équipée, ne rien afficher
  if (activeBonusCards.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 
                    bg-gray-800 rounded-l-lg p-2 
                    border-l-4 border-blue-500 
                    shadow-lg z-10"
      >
        <div className="flex flex-col items-center">
          {activeBonusCards.map((card, index) => (
            <div key={card.id} className="mb-1 last:mb-0 text-center">
              <div className="text-sm font-bold text-white">{card.name}</div>
              <div className="text-xs text-gray-400">{card.description.split('\n')[0]}</div>
            </div>
          ))}

          {deckCombination?.isActive && (
            <div className="mt-2 text-center">
              <div className="text-xs font-semibold text-blue-400">
                {deckCombination.combination?.name}
              </div>
              <div className="text-xs text-gray-300">{deckCombination.description}</div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(BonusDeckCombination);
