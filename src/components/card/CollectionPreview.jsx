import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { getSuitSymbol, getCardDisplayName } from '../../utils/cardValuesGenerator';
import { Card, Badge, Button, Tooltip, DESIGN_TOKENS, Icons } from '../ui/DesignSystem';
import BonusCard from './BonusCard';

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
  const [selectedCard, setSelectedCard] = useState(null);

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

  // Card Detail Modal
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
          className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold" style={{ color: getRarityColor(card.rarity) }}>
              {card.name}
            </h2>
            <Badge variant="primary">{card.rarity}</Badge>
          </div>

          <div className="mb-4 flex items-center justify-center">
            <div className="text-4xl">
              {card.cardValue}
              {getSuitSymbol(card.cardSuit)}
            </div>
          </div>

          <p className="text-gray-700 mb-4">{card.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-600">Type</h3>
              <p>{card.bonus?.type || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600">Niveau</h3>
              <p>{card.level || 1}</p>
            </div>
            <div className="col-span-2">
              <h3 className="text-sm font-semibold text-gray-600">Effet</h3>
              <p className="text-gray-700">
                {card.bonus ? `${card.bonus.type}: ${card.bonus.value}` : 'Aucun effet spécifique'}
              </p>
            </div>
          </div>

          <Button variant="outline" className="w-full mt-4" onClick={onClose}>
            Fermer
          </Button>
        </motion.div>
      </motion.div>
    );
  };

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
                <BonusCard
                  card={card}
                  disabled={readOnly}
                  onClick={() => !readOnly && setSelectedCard(card)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Card Details Modal */}
      <AnimatePresence>
        {selectedCard && !readOnly && (
          <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
        )}
      </AnimatePresence>
    </Card>
  );
};

export default React.memo(CollectionPreview);
