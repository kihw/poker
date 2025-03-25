const BonusCard = ({
  card,
  onClick,
  isSelected = false,
  onUpgrade,
  onEquip,
  onUnequip,
  disabled = false,
}) => {
  const rarityColor = getRarityColor(card.rarity);
  const isRed = card.cardSuit === 'hearts' || card.cardSuit === 'diamonds';

  return (
    <motion.div
      className="relative w-48 h-72 bg-white rounded-lg shadow-lg overflow-hidden"
      style={{
        transform: 'perspective(1000px) rotateY(0deg)',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
      }}
      onClick={onClick}
    >
      {/* Partie supérieure (valeur de la carte) */}
      <div
        className={`absolute top-2 left-2 text-4xl font-bold ${isRed ? 'text-red-600' : 'text-black'}`}
      >
        {card.cardValue}
      </div>
      <div
        className={`absolute top-2 right-2 text-4xl font-bold ${isRed ? 'text-red-600' : 'text-black'}`}
      >
        {getSuitSymbol(card.cardSuit)}
      </div>

      {/* Partie inférieure (description et effet) */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-gray-800 text-white p-3"
        style={{
          transform: 'translateZ(10px)',
        }}
      >
        <h3 className="font-bold text-sm mb-1">{card.name}</h3>

        <div
          className="text-xs text-gray-300 mb-2"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {card.description.split('\n')[0]}
        </div>

        <div className="flex justify-between items-center">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              backgroundColor: rarityColor,
              color: 'white',
            }}
          >
            {card.level ? `Lv.${card.level}` : card.rarity}
          </span>
          {card.effect === 'active' && (
            <span className="text-xs text-gray-400">{card.uses || 1} utilisations</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Card;
