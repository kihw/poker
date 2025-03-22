// src/components/rest/RestSite.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const RestSite = ({ playerStats, bonusCards, onRestComplete, onClose }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showCardUpgrade, setShowCardUpgrade] = useState(false);
  const [selectedCardForUpgrade, setSelectedCardForUpgrade] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [restResult, setRestResult] = useState(null);

  // Options de repos disponibles
  const restOptions = [
    {
      id: 'heal',
      name: 'Repos complet',
      description: `Récupérez 30% de vos PV maximum (${Math.floor(playerStats.maxHealth * 0.3)} PV)`,
      icon: '💤',
      effect: {
        type: 'heal',
        value: Math.floor(playerStats.maxHealth * 0.3),
      },
    },
    {
      id: 'upgrade',
      name: 'Amélioration de carte',
      description:
        'Améliorez une de vos cartes bonus pour la rendre plus puissante',
      icon: '⬆️',
      effect: {
        type: 'upgrade',
      },
    },
    {
      id: 'remove_weakness',
      name: 'Méditation',
      description: 'Augmentez vos chances pour la prochaine main',
      icon: '🧘',
      effect: {
        type: 'buff',
        value: 'nextHand',
      },
    },
  ];

  // Sélectionner une option de repos
  const handleSelectOption = (option) => {
    setSelectedOption(option);

    if (option.id === 'upgrade') {
      setShowCardUpgrade(true);
    } else {
      handleProcessRest(option);
    }
  };

  // Sélectionner une carte à améliorer
  const handleSelectCard = (card) => {
    setSelectedCardForUpgrade(card);
  };

  // Confirmer l'amélioration d'une carte
  const confirmUpgrade = () => {
    if (!selectedCardForUpgrade) return;

    handleProcessRest({
      ...selectedOption,
      card: selectedCardForUpgrade,
    });
  };

  // Traiter l'action de repos
  const handleProcessRest = (option) => {
    setIsProcessing(true);

    // Simuler un traitement asynchrone
    setTimeout(() => {
      let result = {
        message: '',
        effect: null,
      };

      switch (option.id) {
        case 'heal':
          const healAmount = Math.min(
            option.effect.value,
            playerStats.maxHealth - playerStats.health
          );
          result = {
            message: `Vous vous reposez et récupérez ${healAmount} points de vie.`,
            effect: {
              type: 'heal',
              value: healAmount,
            },
          };
          break;

        case 'upgrade':
          if (option.card) {
            // Simuler une amélioration de carte
            const upgradedCard = {
              ...option.card,
              level: (option.card.level || 1) + 1,
              bonus: {
                ...option.card.bonus,
                value: option.card.bonus
                  ? Math.floor(option.card.bonus.value * 1.2)
                  : 0,
              },
            };

            result = {
              message: `Vous avez amélioré ${option.card.name} au niveau ${upgradedCard.level}.`,
              effect: {
                type: 'upgrade',
                card: upgradedCard,
              },
            };
          }
          break;

        case 'remove_weakness':
          result = {
            message:
              'Vous méditez et vous sentez plus concentré pour le prochain combat.',
            effect: {
              type: 'buff',
              buff: {
                id: 'betterHand',
                duration: 1,
                description: 'Meilleures chances à la prochaine main',
              },
            },
          };
          break;
      }

      setRestResult(result);
      setIsProcessing(false);

      // Après un certain délai, appeler le callback de fin
      setTimeout(() => {
        if (onRestComplete) {
          onRestComplete(result);
        }
      }, 2000);
    }, 1000);
  };

  // Afficher la carte du site de repos
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-gray-900 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4">
          <h2 className="text-xl font-bold text-white">Site de repos</h2>
        </div>

        {/* Image d'ambiance */}
        <div className="h-40 overflow-hidden flex items-center justify-center bg-gray-800">
          <img
            src="/api/placeholder/800/300"
            alt="Campement"
            className="w-full object-cover opacity-70"
          />
          <div className="absolute text-4xl">🏕️</div>
        </div>

        {/* Contenu principal */}
        <div className="p-6">
          {!selectedOption && !restResult && (
            <>
              <p className="text-gray-300 mb-6">
                Vous avez trouvé un endroit sûr pour vous reposer. Que
                souhaitez-vous faire ?
              </p>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                {restOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg text-left transition-colors flex flex-col h-full"
                    onClick={() => handleSelectOption(option)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <h3 className="font-bold text-white mb-1">{option.name}</h3>
                    <p className="text-sm text-gray-400">
                      {option.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </>
          )}

          {/* Écran de sélection de carte pour l'amélioration */}
          {showCardUpgrade && !restResult && (
            <>
              <div className="mb-4 flex items-center">
                <button
                  onClick={() => {
                    setShowCardUpgrade(false);
                    setSelectedOption(null);
                  }}
                  className="mr-2 bg-gray-700 hover:bg-gray-600 rounded-full p-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <h3 className="text-lg font-bold">
                  Sélectionnez une carte à améliorer
                </h3>
              </div>

              <div className="grid gap-3 grid-cols-1 md:grid-cols-2 max-h-80 overflow-y-auto">
                {bonusCards.map((card) => (
                  <motion.div
                    key={card.id}
                    className={`
                      border rounded-lg p-3 cursor-pointer
                      ${selectedCardForUpgrade?.id === card.id ? 'border-yellow-500 bg-gray-700' : 'border-gray-700 bg-gray-800'}
                      ${card.level >= 3 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}
                    `}
                    onClick={() => card.level < 3 && handleSelectCard(card)}
                    whileHover={card.level < 3 ? { scale: 1.02 } : {}}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold">{card.name}</h4>
                      {card.level && (
                        <span className="bg-yellow-600 text-black text-xs font-bold px-2 py-0.5 rounded">
                          Nv. {card.level}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-300 mb-2">
                      {card.description}
                    </p>

                    {card.level >= 3 ? (
                      <p className="text-xs text-red-400">
                        Niveau maximum atteint
                      </p>
                    ) : (
                      <div className="text-xs text-gray-400">
                        <span className="font-semibold">
                          Après amélioration :
                        </span>
                        <p className="text-green-400 mt-1">
                          {card.bonus && typeof card.bonus.value === 'number'
                            ? `${card.bonus.type === 'damage' ? 'Dégâts' : 'Effet'} +${Math.floor(card.bonus.value * 1.2)}`
                            : "Amélioration de l'effet"}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={confirmUpgrade}
                  disabled={!selectedCardForUpgrade}
                  className={`px-4 py-2 rounded font-bold ${
                    selectedCardForUpgrade
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Améliorer cette carte
                </button>
              </div>
            </>
          )}

          {/* Affichage du résultat */}
          {restResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">
                {restResult.effect?.type === 'heal'
                  ? '💤'
                  : restResult.effect?.type === 'upgrade'
                    ? '⬆️'
                    : '🧘'}
              </div>

              <h3 className="text-xl font-bold mb-3">{restResult.message}</h3>

              {restResult.effect?.type === 'heal' && (
                <div className="mb-4 text-green-400">
                  +{restResult.effect.value} PV
                </div>
              )}

              {restResult.effect?.type === 'upgrade' &&
                restResult.effect.card && (
                  <div className="mb-4 p-3 bg-gray-800 rounded-lg inline-block">
                    <div className="font-bold">
                      {restResult.effect.card.name}
                    </div>
                    <div className="text-green-400 text-sm">
                      Niveau {restResult.effect.card.level}
                    </div>
                  </div>
                )}

              <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded mt-4"
              >
                Continuer
              </button>
            </motion.div>
          )}

          {/* Affichage de l'état du joueur */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center text-sm text-gray-400">
              <div className="flex items-center">
                <span className="text-red-500 mr-1">❤️</span>
                <span>
                  {playerStats.health}/{playerStats.maxHealth} PV
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">💰</span>
                <span>{playerStats.gold} Or</span>
              </div>
              <div className="flex items-center">
                <span className="text-blue-500 mr-1">📊</span>
                <span>Niveau {playerStats.level}</span>
              </div>
            </div>
          </div>

          {/* État en cours de traitement */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RestSite;
