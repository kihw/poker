// src/components/event/EventEncounter.jsx - Migré vers Redux
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { addGold, heal, takeDamage } from '../../redux/slices/playerSlice';
import { addCard } from '../../redux/slices/bonusCardsSlice';
import { setActionFeedback } from '../../redux/slices/uiSlice';

const EventEncounter = ({ event, onClose }) => {
  const dispatch = useDispatch();

  // Sélectionner les données du joueur depuis Redux
  const player = useSelector((state) => state.player);

  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  if (!event) return null;

  // Animation for the event card
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
  };

  // Animation for choice buttons
  const choiceVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.2 + i * 0.1, duration: 0.3 },
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
    if (
      choice.requiresItem &&
      (!player.inventory || !player.inventory.includes(choice.requiresItem))
    ) {
      return false;
    }
    return true;
  };

  const handleEventComplete = () => {
    if (onClose) {
      // Vérifier que result existe avant de l'utiliser
      onClose(result || { message: 'Événement terminé' });
    }
  };

  // Dans la méthode render de EventEncounter, ligne ~202
  // Ajouter une vérification pour éviter l'erreur
  const resultMessage =
    result && result.message ? result.message : 'Résultat indisponible';

  // Make a choice and display the result
  const handleChoice = async (choiceIndex) => {
    setSelectedChoice(choiceIndex);

    // Wait a bit for animation
    setTimeout(() => {
      // Get the selected choice
      const choice = event.choices[choiceIndex];

      // Determine if the choice succeeds or fails based on chance
      const isSuccess = Math.random() <= (choice.chance || 1.0);

      // Create result object
      const choiceResult = {
        success: isSuccess,
        message: isSuccess
          ? choice.resultText
          : choice.failText ||
            "Le résultat n'est pas celui que vous espériez...",
        details: isSuccess
          ? { ...(choice.resultDetails || {}) }
          : { ...(choice.failDetails || {}) },
      };

      // Apply effects to the player via Redux
      const details = choiceResult.details;

      if (details) {
        // Handle gold changes
        if (details.gold) {
          if (details.gold > 0) {
            dispatch(addGold(details.gold));
          } else if (details.gold < 0) {
            dispatch(addGold(details.gold)); // negative value will be handled in the reducer
          }
        }

        // Handle healing
        if (details.healing && details.healing > 0) {
          dispatch(heal(details.healing));
        }

        // Handle damage (health cost)
        if (details.healthCost && details.healthCost > 0) {
          dispatch(takeDamage(details.healthCost));
        }

        // Handle bonus card rewards
        if (details.card && details.card.id) {
          dispatch(addCard(details.card.id));
        } else if (details.card && details.card.name === 'Carte mystérieuse') {
          // Generate a random card ID between 1 and 31 (from the available bonus cards)
          const randomCardId = Math.floor(Math.random() * 31) + 1;
          dispatch(addCard(randomCardId));

          // Update the result with the card info for UI
          details.card = {
            ...details.card,
            id: randomCardId,
          };
        }

        // Handle item rewards
        if (details.item) {
          // Add item to inventory (would require a dedicated action)
          dispatch(
            setActionFeedback({
              message: `Obtenu: ${details.item.name}`,
              type: 'success',
            })
          );
        }
      }

      setResult(choiceResult);
      setShowResult(true);

      // Send feedback
      dispatch(
        setActionFeedback({
          message: choiceResult.message,
          type: choiceResult.success ? 'success' : 'warning',
        })
      );
    }, 500);
  };

  // Continue after seeing the result
  const handleContinue = () => {
    if (onClose) {
      onClose(result);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 event-popup">
      <AnimatePresence>
        <motion.div
          className="bg-gray-900 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Event header */}
          <div className="bg-gradient-to-r from-indigo-800 to-purple-900 p-4">
            <h2 className="text-xl font-bold text-white">{event.title}</h2>
          </div>

          {/* Event illustration image (optional) */}
          {event.image && (
            <div className="h-48 overflow-hidden flex items-center justify-center bg-gray-800">
              <img
                src={event.image}
                alt={event.title}
                className="w-full object-cover"
              />
            </div>
          )}

          {/* Event description */}
          <div className="p-6">
            <p className="text-gray-200 mb-6">{event.description}</p>

            {/* Display either choices or result */}
            {!showResult ? (
              <div className="space-y-3">
                <h3 className="text-gray-400 text-sm font-semibold uppercase">
                  Que faites-vous ?
                </h3>

                {event.choices.map((choice, index) => {
                  const isAvailable = isChoiceAvailable(choice);

                  return (
                    <motion.button
                      key={index}
                      className={`w-full text-left p-3 rounded-md transition-colors relative 
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
                    >
                      <div className="font-medium text-white">
                        {choice.text}

                        {/* Display costs/conditions */}
                        {choice.goldCost && (
                          <span
                            className={`ml-2 text-xs px-2 py-0.5 rounded-full ${isAvailable ? 'bg-yellow-800' : 'bg-red-900'}`}
                          >
                            {choice.goldCost} Or
                          </span>
                        )}

                        {choice.healthCost && (
                          <span
                            className={`ml-2 text-xs px-2 py-0.5 rounded-full ${isAvailable ? 'bg-red-800' : 'bg-red-900'}`}
                          >
                            {choice.healthCost} PV
                          </span>
                        )}

                        {choice.requiresItem && (
                          <span
                            className={`ml-2 text-xs px-2 py-0.5 rounded-full ${isAvailable ? 'bg-blue-800' : 'bg-red-900'}`}
                          >
                            Nécessite: {choice.requiresItem}
                          </span>
                        )}
                      </div>

                      {/* Unavailability message */}
                      {!isAvailable && (
                        <div className="text-xs text-red-400 mt-1">
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
                        <div className="absolute right-3 top-3 text-xs">
                          {choice.chance >= 0.75 ? (
                            <span className="text-green-400">
                              Très probable
                            </span>
                          ) : choice.chance >= 0.5 ? (
                            <span className="text-yellow-400">Probable</span>
                          ) : (
                            <span className="text-red-400">Risqué</span>
                          )}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800 p-4 rounded-md"
              >
                <h3 className="text-lg font-bold mb-2 text-white">Résultat</h3>
                <p className="text-gray-300 mb-4">{result.message}</p>

                {/* Display choice consequences */}
                {result.details && (
                  <div className="space-y-2 mb-4">
                    {result.details.gold && (
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-2">💰</span>
                        <span
                          className={
                            result.details.gold > 0
                              ? 'text-green-400'
                              : 'text-red-400'
                          }
                        >
                          {result.details.gold > 0 ? '+' : ''}
                          {result.details.gold} Or
                        </span>
                      </div>
                    )}

                    {result.details.healing && (
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">❤️</span>
                        <span className="text-green-400">
                          +{result.details.healing} PV
                        </span>
                      </div>
                    )}

                    {result.details.item && (
                      <div className="flex items-center">
                        <span className="text-blue-500 mr-2">🎒</span>
                        <span className="text-blue-400">
                          Obtenu: {result.details.item.name}
                        </span>
                      </div>
                    )}

                    {result.details.card && (
                      <div className="flex items-center">
                        <span className="text-purple-500 mr-2">🃏</span>
                        <span className="text-purple-400">
                          Nouvelle carte bonus: {result.details.card.name}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleContinue}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mt-4"
                >
                  Continuer
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EventEncounter;
