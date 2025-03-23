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

  // Reste de l'implémentation de l'événement
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
          {/* Contenu complet de l'événement */}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EventEncounter;
