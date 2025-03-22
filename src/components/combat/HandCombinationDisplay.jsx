// src/components/combat/HandCombinationDisplay.jsx
import React from 'react';
import EnhancedCard from '../card/EnhancedCard';

const HandCombinationDisplay = ({
  handName,
  baseDamage,
  totalDamage = null,
  bonusEffects = [],
  cards = [],
}) => {
  // Map of colors based on hand type
  const handColors = {
    'Royal Flush': 'bg-purple-700',
    'Straight Flush': 'bg-purple-600',
    'Four of a Kind': 'bg-indigo-600',
    'Full House': 'bg-indigo-500',
    Flush: 'bg-blue-600',
    Straight: 'bg-blue-500',
    'Three of a Kind': 'bg-green-600',
    'Two Pair': 'bg-green-500',
    Pair: 'bg-yellow-500',
    'High Card': 'bg-gray-500',
    // Pour les attaques avec moins de 5 cartes
    '1 Carte': 'bg-teal-500',
    '2 Cartes': 'bg-teal-500',
    '3 Cartes': 'bg-teal-500',
    '4 Cartes': 'bg-teal-500',
  };

  // Map bonus descriptions for display
  const getBonusDescription = (effect) => {
    if (effect.includes('added')) {
      return effect.replace('added', '→ +');
    }
    if (effect.includes('healed')) {
      return effect.replace('healed', '→ Soigne');
    }
    return effect;
  };

  // Use total damage if provided, otherwise just use base damage
  const displayDamage = totalDamage !== null ? totalDamage : baseDamage;

  // Determine if we should show damage formula
  const showFormula = totalDamage !== null && totalDamage !== baseDamage;

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span
            className={`inline-block w-3 h-3 rounded-full mr-2 ${handColors[handName] || 'bg-gray-500'}`}
          ></span>
          <h3 className="text-lg font-bold text-white">{handName}</h3>
        </div>
        <div className="flex items-center">
          {showFormula ? (
            <div className="text-right">
              <span className="text-sm text-gray-400">Base: {baseDamage}</span>
              <span className="mx-1 text-gray-400">→</span>
              <span className="text-xl font-bold text-red-500">
                {displayDamage}
              </span>
              <span className="ml-1 text-sm text-gray-400">dégâts</span>
            </div>
          ) : (
            <div>
              <span className="text-xl font-bold text-red-500">
                {displayDamage}
              </span>
              <span className="ml-1 text-sm text-gray-400">dégâts</span>
            </div>
          )}
        </div>
      </div>

      {/* Display cards used in the attack */}
      {cards && cards.length > 0 && (
        <div className="flex justify-center my-2 flex-wrap gap-1">
          {cards.map((card, index) => (
            <div key={index} className="transform scale-75 origin-center">
              <EnhancedCard
                value={card.value}
                suit={card.suit}
                selectionType="view"
              />
            </div>
          ))}
        </div>
      )}

      {bonusEffects.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <h4 className="text-xs uppercase font-semibold text-gray-400 mb-1">
            Bonus actifs
          </h4>
          <ul className="text-sm">
            {bonusEffects.map((effect, index) => (
              <li key={index} className="text-green-400 flex items-center">
                <span className="mr-1">•</span> {getBonusDescription(effect)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HandCombinationDisplay;
