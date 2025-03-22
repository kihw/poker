// src/components/ui/ActionFeedback.jsx - Fixed version
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { clearActionFeedback } from '../../redux/slices/uiSlice';

/**
 * Composant pour afficher un feedback visuel temporaire sur une action
 * @param {string} message - Message à afficher (optionnel, utilise le state Redux si non fourni)
 * @param {string} type - Type de feedback ('success', 'error', 'info', 'warning') (optionnel)
 * @param {number} duration - Durée d'affichage en ms (optionnel)
 */
const ActionFeedback = ({ message, type, duration }) => {
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false);

  // Utiliser les paramètres fournis ou l'état Redux
  const stateFeedback = useSelector((state) => state.ui.actionFeedback);

  const feedbackMessage =
    message || (stateFeedback ? stateFeedback.message : '');
  const feedbackType = type || (stateFeedback ? stateFeedback.type : 'info');
  const feedbackDuration =
    duration || (stateFeedback ? stateFeedback.duration : 2000);

  // Si aucun message n'est présent, ne rien afficher
  useEffect(() => {
    if (!feedbackMessage) {
      setIsVisible(false);
      return;
    }

    // Rendre le message visible
    setIsVisible(true);

    // Programmer la disparition
    const timer = setTimeout(() => {
      setIsVisible(false);

      // Attendre la fin de l'animation avant de nettoyer le feedback
      setTimeout(() => {
        if (stateFeedback) {
          dispatch(clearActionFeedback());
        }
      }, 300); // Durée de l'animation de sortie
    }, feedbackDuration);

    return () => clearTimeout(timer);
  }, [feedbackMessage, feedbackDuration, dispatch, stateFeedback]);

  // Si aucun message à afficher, ne rien rendre
  if (!feedbackMessage) return null;

  // Styles et classes basés sur le type
  const getTypeStyles = () => {
    switch (feedbackType) {
      case 'success':
        return 'bg-green-600 border-green-800 shadow-green-900/30';
      case 'error':
        return 'bg-red-600 border-red-800 shadow-red-900/30';
      case 'warning':
        return 'bg-yellow-600 border-yellow-800 shadow-yellow-900/30';
      case 'info':
      default:
        return 'bg-blue-600 border-blue-800 shadow-blue-900/30';
    }
  };

  // Icône basée sur le type
  const getTypeIcon = () => {
    switch (feedbackType) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  // Animation pour le pulse de fond selon le type de message
  const getPulseAnimation = () => {
    let baseColor, pulseColor;

    switch (feedbackType) {
      case 'success':
        baseColor = 'rgba(22, 163, 74, 0.1)'; // green-600 avec alpha
        pulseColor = 'rgba(22, 163, 74, 0.3)'; // green-600 avec plus d'alpha
        break;
      case 'error':
        baseColor = 'rgba(220, 38, 38, 0.1)'; // red-600 avec alpha
        pulseColor = 'rgba(220, 38, 38, 0.3)'; // red-600 avec plus d'alpha
        break;
      case 'warning':
        baseColor = 'rgba(202, 138, 4, 0.1)'; // yellow-600 avec alpha
        pulseColor = 'rgba(202, 138, 4, 0.3)'; // yellow-600 avec plus d'alpha
        break;
      case 'info':
      default:
        baseColor = 'rgba(37, 99, 235, 0.1)'; // blue-600 avec alpha
        pulseColor = 'rgba(37, 99, 235, 0.3)'; // blue-600 avec plus d'alpha
    }

    return {
      boxShadow: [
        `0 0 0 ${baseColor}`,
        `0 0 15px ${pulseColor}`,
        `0 0 0 ${baseColor}`,
      ],
      transition: {
        boxShadow: {
          repeat: Infinity,
          duration: 2,
          repeatType: 'loop',
        },
      },
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
      transition={{
        duration: 0.3,
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-md border ${getTypeStyles()} text-white font-bold shadow-lg flex items-center`}
      role="alert"
      aria-live="assertive"
    >
      {/* Effet de pulsation autour du message */}
      <motion.div
        className="absolute inset-0 rounded-md -z-10"
        animate={getPulseAnimation()}
      />

      {/* Icône avec une petite animation */}
      <motion.span
        className="mr-2 inline-block"
        initial={{ scale: 0.8 }}
        animate={{
          scale: [0.8, 1.2, 1],
          transition: { duration: 0.5 },
        }}
      >
        {getTypeIcon()}
      </motion.span>

      {/* Message */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { delay: 0.1, duration: 0.3 },
        }}
      >
        {feedbackMessage}
      </motion.span>
    </motion.div>
  );
};

export default ActionFeedback;
