// src/components/ui/ImprovedActionFeedback.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { clearActionFeedback } from '../../redux/slices/uiSlice';
import { COLORS, SHADOWS } from './DesignSystem';

/**
 * Composant amélioré pour afficher un feedback visuel temporaire sur une action
 * @param {string} message - Message à afficher (optionnel, utilise le state Redux si non fourni)
 * @param {string} type - Type de feedback ('success', 'error', 'info', 'warning') (optionnel)
 * @param {number} duration - Durée d'affichage en ms (optionnel)
 */
const ImprovedActionFeedback = ({ message, type, duration }) => {
  const dispatch = useDispatch();

  // Utiliser les paramètres fournis ou l'état Redux
  const stateFeedback = useSelector((state) => state.ui.actionFeedback);

  const feedbackMessage =
    message || (stateFeedback ? stateFeedback.message : '');
  const feedbackType = type || (stateFeedback ? stateFeedback.type : 'info');
  const feedbackDuration =
    duration || (stateFeedback ? stateFeedback.duration : 2000);

  // Si aucun message n'est présent, ne rien afficher
  useEffect(() => {
    if (!feedbackMessage) return;

    // Programmer la disparition
    const timer = setTimeout(() => {
      if (stateFeedback) {
        dispatch(clearActionFeedback());
      }
    }, feedbackDuration);

    return () => clearTimeout(timer);
  }, [feedbackMessage, feedbackDuration, dispatch, stateFeedback]);

  // Si aucun message à afficher, ne rien rendre
  if (!feedbackMessage) return null;

  // Obtenir les styles selon le type de feedback
  const getTypeConfig = () => {
    switch (feedbackType) {
      case 'success':
        return {
          bgColor: COLORS.success.main,
          borderColor: COLORS.success.dark,
          shadowColor: 'rgba(34, 197, 94, 0.3)',
          icon: '✅',
        };
      case 'error':
        return {
          bgColor: COLORS.danger.main,
          borderColor: COLORS.danger.dark,
          shadowColor: 'rgba(239, 68, 68, 0.3)',
          icon: '❌',
        };
      case 'warning':
        return {
          bgColor: COLORS.warning.main,
          borderColor: COLORS.warning.dark,
          shadowColor: 'rgba(245, 158, 11, 0.3)',
          icon: '⚠️',
        };
      case 'info':
      default:
        return {
          bgColor: COLORS.primary.main,
          borderColor: COLORS.primary.dark,
          shadowColor: 'rgba(37, 99, 235, 0.3)',
          icon: 'ℹ️',
        };
    }
  };

  const { bgColor, borderColor, shadowColor, icon } = getTypeConfig();

  // Animation pour le pulse de fond
  const pulseAnimation = {
    boxShadow: [
      `0 0 0 ${shadowColor}`,
      `0 0 15px ${shadowColor}`,
      `0 0 0 ${shadowColor}`,
    ],
    transition: {
      boxShadow: {
        repeat: Infinity,
        duration: 2,
        repeatType: 'loop',
      },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{
          duration: 0.3,
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center"
        style={{
          backgroundColor: bgColor,
          borderLeft: `4px solid ${borderColor}`,
        }}
        role="alert"
        aria-live="assertive"
      >
        {/* Effet de pulsation autour du message */}
        <motion.div
          className="absolute inset-0 rounded-lg -z-10"
          animate={pulseAnimation}
        />

        {/* Icône avec une petite animation */}
        <motion.span
          className="mr-3 inline-block"
          initial={{ scale: 0.8 }}
          animate={{
            scale: [0.8, 1.2, 1],
            transition: { duration: 0.5 },
          }}
        >
          {icon}
        </motion.span>

        {/* Message */}
        <motion.div
          className="text-white font-medium"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { delay: 0.1, duration: 0.3 },
          }}
        >
          {feedbackMessage}
        </motion.div>

        {/* Bouton de fermeture */}
        <button
          onClick={() => dispatch(clearActionFeedback())}
          className="ml-3 text-white opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImprovedActionFeedback;
