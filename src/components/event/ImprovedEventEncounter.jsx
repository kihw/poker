// src/components/event/ImprovedEventEncounter.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { makeEventChoice } from '../../redux/thunks/eventThunks';
import { setActionFeedback } from '../../redux/slices/uiSlice';
import { COLORS } from '../ui/DesignSystem';

const ImprovedEventEncounter = ({ event, onClose }) => {
  const dispatch = useDispatch();

  // Sélectionner les données du joueur et les résultats d'événements depuis Redux
  const player = useSelector((state) => state.player);
  const eventResult = useSelector((state) => state.event.eventResult);

  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showResult, setShowResult] = useState(false);

  if (!event) return null;

  // Animation pour la carte d'événement
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        duration: 0.5,
        bounce: 0.3,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: { duration: 0.3 },
    },
  };

  // Animation pour les boutons de choix
  const choiceVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.3 + i * 0.1, duration: 0.4, type: 'spring' },
    }),
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  };

  // Effet pour l'icône d'événement
  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: [0.8, 1.2, 1],
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.6,
      },
    },
  };

  // Check if a choice is available (e.g., enough gold, HP, etc.)
  const isChoiceAvailable = (choice) => {
    if (choice.goldCost && player.gold < choice.goldCost) {
      return false;
    }
    if (choice.healthCost && player.health <= choice.healthCost) {
      return false;
    }
    if (
      choice.requiresItem &&
      (!player.inventory || !player.inventory.includes(choice.requiresItem))
    ) {
      return false;
    }
    return true;
  };

  // Make a choice and display the result
  const handleChoice = async (choiceIndex) => {
    setSelectedChoice(choiceIndex);

    // Dispatch l'action Redux pour traiter le choix
    dispatch(makeEventChoice({ choiceIndex }))
      .then(() => {
        // Attendre un peu pour l'animation
        setTimeout(() => {
          setShowResult(true);
        }, 500);
      })
      .catch((error) => {
        console.error('Erreur lors du traitement du choix:', error);
        dispatch(
          setActionFeedback({
            message:
              'Une erreur est survenue lors du traitement de votre choix',
            type: 'error',
          })
        );
      });
  };

  // Continue after seeing the result
  const handleContinue = () => {
    if (onClose) {
      onClose(eventResult);
    }
  };

  // Obtenir une couleur de fond pour l'entête basée sur le type d'événement
  const getHeaderBackground = () => {
    if (event.title.includes('Marchand') || event.title.includes('Boutique')) {
      return 'from-green-800 to-emerald-900';
    }
    if (event.title.includes('Combat') || event.title.includes('Monstre')) {
      return 'from-red-800 to-rose-900';
    }
    if (event.title.includes('Trésor') || event.title.includes('Or')) {
      return 'from-yellow-700 to-amber-900';
    }
    if (event.title.includes('Magique') || event.title.includes('Mystique')) {
      return 'from-purple-800 to-indigo-900';
    }
    // Default
    return 'from-indigo-800 to-purple-900';
  };

  // Calculer la probabilité de succès de manière visuelle
  const getChanceIndicator = (chance) => {
    if (!chance) return null;

    const percentage = chance * 100;
    let color = '';
    let label = '';

    if (percentage >= 90) {
      color = COLORS.success.main;
      label = 'Presque certain';
    } else if (percentage >= 75) {
      color = COLORS.success.light;
      label = 'Très probable';
    } else if (percentage >= 50) {
      color = COLORS.warning.main;
      label = 'Probable';
    } else if (percentage >= 30) {
      color = COLORS.warning.dark;
      label = 'Incertain';
    } else {
      color = COLORS.danger.main;
      label = 'Risqué';
    }

    return (
      <div className="flex items-center">
        <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-xs ml-2" style={{ color }}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 event-popup">
      <AnimatePresence mode="wait">
        <motion.div
          className="bg-gray-900 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Event header */}
          <div className={`bg-gradient-to-r ${getHeaderBackground()} p-5`}>
            <h2 className="text-xl font-bold text-white">{event.title}</h2>
          </div>

          {/* Event illustration image */}
          <div className="h-48 overflow-hidden flex items-center justify-center bg-gray-800 relative">
            {event.image && (
              <motion.div
                className="text-6xl"
                variants={iconVariants}
                initial="hidden"
                animate="visible"
              >
                {event.image}
              </motion.div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 opacity-50"></div>
          </div>

          {/* Event description */}
          <div className="p-6">
            <motion.p
              className="text-gray-200 mb-6 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.3 } }}
            >
              {event.description}
            </motion.p>

            {/* Display either choices or result */}
            {!showResult ? (
              <div className="space-y-4">
                <h3 className="text-gray-400 text-sm font-semibold uppercase">
                  Que faites-vous ?
                </h3>

                {event.choices.map((choice, index) => {
                  const isAvailable = isChoiceAvailable(choice);

                  return (
                    <motion.button
                      key={index}
                      className={`w-full text-left p-4 rounded-md transition-colors relative 
                                 ${
                                   isAvailable
                                     ? 'bg-gray-800 hover:bg-gray-700 cursor-pointer'
                                     : 'bg-gray-800 opacity-60 cursor-not-allowed'
                                 }`}
                      disabled={!isAvailable || selectedChoice !== null}
                      onClick={() => isAvailable && handleChoice(index)}
                      variants={choiceVariants}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      whileHover={isAvailable ? { scale: 1.02 } : {}}
                    >
                      <div className="font-medium text-white">
                        {choice.text}

                        {/* Display costs/conditions */}
                        <div className="flex flex-wrap gap-2 mt-1">
                          {choice.goldCost && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center ${isAvailable ? 'bg-yellow-800' : 'bg-red-900'}`}
                            >
                              <span className="mr-1">💰</span> {choice.goldCost}{' '}
                              Or
                            </span>
                          )}

                          {choice.healthCost && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center ${isAvailable ? 'bg-red-800' : 'bg-red-900'}`}
                            >
                              <span className="mr-1">❤️</span>{' '}
                              {choice.healthCost} PV
                            </span>
                          )}

                          {choice.requiresItem && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center ${isAvailable ? 'bg-blue-800' : 'bg-red-900'}`}
                            >
                              <span className="mr-1">🎒</span>{' '}
                              {choice.requiresItem}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Unavailability message */}
                      {!isAvailable && (
                        <div className="text-xs text-red-400 mt-2">
                          {choice.goldCost &&
                            player.gold < choice.goldCost &&
                            "Pas assez d'or. "}
                          {choice.healthCost &&
                            player.health <= choice.healthCost &&
                            'Pas assez de PV. '}
                          {choice.requiresItem &&
                            (!player.inventory ||
                              !player.inventory.includes(
                                choice.requiresItem
                              )) &&
                            'Objet requis manquant.'}
                        </div>
                      )}

                      {/* Success probability */}
                      {choice.chance && isAvailable && (
                        <div className="mt-2">
                          {getChanceIndicator(choice.chance)}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800 p-5 rounded-lg"
              >
                <motion.h3
                  className="text-lg font-bold mb-3 text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Résultat
                </motion.h3>
                <motion.p
                  className="text-gray-300 mb-5 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {eventResult?.message || 'Résultat indisponible'}
                </motion.p>

                {/* Display choice consequences */}
                {eventResult?.details && (
                  <motion.div
                    className="space-y-3 mb-5 bg-gray-900 p-3 rounded-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {eventResult.details.gold && (
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-2">💰</span>
                        <span
                          className={
                            eventResult.details.gold > 0
                              ? 'text-green-400'
                              : 'text-red-400'
                          }
                        >
                          {eventResult.details.gold > 0 ? '+' : ''}
                          {eventResult.details.gold} Or
                        </span>
                      </div>
                    )}

                    {eventResult.details.healing && (
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">❤️</span>
                        <span className="text-green-400">
                          +{eventResult.details.healing} PV
                        </span>
                      </div>
                    )}

                    {eventResult.details.healthCost && (
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">💔</span>
                        <span className="text-red-400">
                          -{eventResult.details.healthCost} PV
                        </span>
                      </div>
                    )}

                    {eventResult.details.item && (
                      <div className="flex items-center">
                        <span className="text-blue-500 mr-2">🎒</span>
                        <span className="text-blue-400">
                          Obtenu: {eventResult.details.item.name}
                        </span>
                      </div>
                    )}

                    {eventResult.details.card && (
                      <div className="flex items-center">
                        <span className="text-purple-500 mr-2">🃏</span>
                        <span className="text-purple-400">
                          Nouvelle carte bonus: {eventResult.details.card.name}
                        </span>
                      </div>
                    )}

                    {eventResult.details.experience && (
                      <div className="flex items-center">
                        <span className="text-blue-500 mr-2">✨</span>
                        <span className="text-blue-400">
                          +{eventResult.details.experience} XP
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}

                <motion.button
                  onClick={handleContinue}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continuer
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ImprovedEventEncounter;
