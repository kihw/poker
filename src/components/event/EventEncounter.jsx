// src/components/event/EventEncounter.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { makeEventChoice } from '../../redux/thunks/eventThunks';
import { setActionFeedback } from '../../redux/slices/uiSlice';
import { COLORS } from '../ui/DesignSystem';

const EventEncounter = ({ event, onClose }) => {
  const dispatch = useDispatch();

  // Sélectionner les données du joueur et les résultats d'événements depuis Redux
  const player = useSelector(state => state.player);
  const eventResult = useSelector(state => state.event.eventResult);

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

  // Check if a choice is available (e.g., enough gold, HP, etc.)
  const isChoiceAvailable = (choice) => {
    if (choice.goldCost && player.gold < choice.goldCost) {
      return false;
    }
    if (choice.healthCost && player.health <= choice.healthCost) {
      return false;
    }
    if (choice.requiresItem && (!player.inventory || !player.inventory.includes(choice.requiresItem))) {
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
            message: 'Une erreur est survenue lors du traitement de votre choix',
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
          <div className="bg-gradient-to-r from-indigo-800 to-purple-900 p-5">
            <h2 className="text-xl font-bold text-white">{event.title}</h2>
          </div>

          {/* Event description */}
          <div className="p-6">
            <p className="text-gray-200 mb-6 leading-relaxed">
              {event.description}
            </p>

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
                      </div>
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
                <h3 className="text-lg font-bold mb-3 text-white">
                  Résultat
                </h3>
                <p className="text-gray-300 mb-5 leading-relaxed">
                  {eventResult?.message || 'Résultat indisponible'}
                </p>

                <motion.button
                  onClick={handleContinue}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
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

export default EventEncounter;
