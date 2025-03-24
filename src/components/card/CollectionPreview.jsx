// src/components/card/CollectionPreview.jsx - Enhanced Design System Collection View
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Badge, Button, Tooltip, DESIGN_TOKENS, Icons } from '../ui/DesignSystem';

// Définir la fonction getRarityColor localement au lieu de l'importer
const getRarityColor = (rarity) => {
  switch (rarity) {
    case 'common':
      return '#9CA3AF';
    case 'uncommon':
      return '#10B981';
    case 'rare':
      return '#3B82F6';
    case 'epic':
      return '#8B5CF6';
    case 'legendary':
      return '#F59E0B';
    default:
      return '#9CA3AF';
  }
};

const CollectionPreview = ({ readOnly = false }) => {
  const bonusCards = useSelector((state) => state.bonusCards?.collection || []);
  const [selectedRarity, setSelectedRarity] = useState('all');

  // Rarity filter options
  const rarityOptions = [
    { value: 'all', label: 'Toutes', icon: '🃏' },
    { value: 'common', label: 'Communes', icon: '⚪' },
    { value: 'uncommon', label: 'Peu Communes', icon: '🟢' },
    { value: 'rare', label: 'Rares', icon: '🔵' },
    { value: 'epic', label: 'Épiques', icon: '🟣' },
    { value: 'legendary', label: 'Légendaires', icon: '🟠' },
  ];

  // Filter and group cards by rarity
  const filteredCards = useMemo(() => {
    return bonusCards
      .filter((card) => selectedRarity === 'all' || card.rarity === selectedRarity)
      .sort((a, b) => {
        const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
      });
  }, [bonusCards, selectedRarity]);

  // Card Detail View
  const CardDetailModal = ({ card, onClose }) => {
    if (!card) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={onClose}
      >
        <motion.div
          className="bg-gray-800 rounded-xl p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold" style={{ color: getRarityColor(card.rarity) }}>
              {card.name}
            </h2>
            <Badge variant="primary">{card.rarity}</Badge>
          </div>

          <p className="text-gray-300 mb-4">{card.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-400">Effet</h3>
              <p>{card.bonus?.type || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400">Niveau</h3>
              <p>{card.level || 1}</p>
            </div>
          </div>

          <Button variant="outline" className="w-full mt-4" onClick={onClose}>
            Fermer
          </Button>
        </motion.div>
      </motion.div>
    );
  };

  // State for selected card
  const [selectedCard, setSelectedCard] = useState(null);

  return (
    <Card variant="elevated" className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <Icons.card className="mr-2" />
          Collection de Cartes Bonus
          {readOnly && (
            <span className="ml-2 text-xs bg-yellow-600 text-white px-2 py-1 rounded">
              Lecture seule
            </span>
          )}
        </h2>
        <div className="flex space-x-2">
          {rarityOptions.map((option) => (
            <Tooltip key={option.value} content={option.label}>
              <Button
                variant={selectedRarity === option.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedRarity(option.value)}
              >
                {option.icon}
              </Button>
            </Tooltip>
          ))}
        </div>
      </div>

      {filteredCards.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Aucune carte dans cette catégorie</div>
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {filteredCards.map((card) => (
              <motion.div
                key={card.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { type: 'spring', stiffness: 300 },
                  },
                }}
                whileHover={{ scale: readOnly ? 1.02 : 1.05 }}
                className={`cursor-${readOnly ? 'default' : 'pointer'}`}
                onClick={() => !readOnly && setSelectedCard(card)}
              >
                <Card
                  variant="elevated"
                  className="p-3 relative"
                  style={{
                    borderLeft: `4px solid ${getRarityColor(card.rarity)}`,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white">{card.name}</h3>
                    <Badge
                      variant="primary"
                      size="sm"
                      style={{
                        backgroundColor: getRarityColor(card.rarity),
                        color: 'white',
                      }}
                    >
                      Lv. {card.level || 1}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2">{card.description}</p>
                  {!readOnly && (
                    <div className="absolute bottom-1 right-1 text-xs text-gray-500">
                      Cliquer pour détails
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {selectedCard && !readOnly && (
          <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
        )}
      </AnimatePresence>
    </Card>
  );
};

export default React.memo(CollectionPreview);
