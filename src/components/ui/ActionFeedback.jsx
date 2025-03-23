// src/components/ui/ActionFeedback.jsx - Comprehensive Feedback Component
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { clearActionFeedback } from '../../redux/slices/uiSlice';
import { COLORS, SHADOWS } from './DesignSystem';

const ActionFeedback = ({ message, type, duration }) => {
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false);

  // Use parameters or Redux state
  const stateFeedback = useSelector((state) => state.ui.actionFeedback);

  const feedbackMessage = 
    message || (stateFeedback ? stateFeedback.message : '');
  const feedbackType = 
    type || (stateFeedback ? stateFeedback.type : 'info');
  const feedbackDuration = 
    duration || (stateFeedback ? stateFeedback.duration : 2000);

  // Manage feedback visibility and clearing
  useEffect(() => {
    if (!feedbackMessage) {
      setIsVisible(false);
      return;
    }

    // Show feedback
    setIsVisible(true);

    // Schedule feedback clearing
    const timer = setTimeout(() => {
      setIsVisible(false);

      // Clear feedback from Redux after animation
      setTimeout(() => {
        if (stateFeedback) {
          dispatch(clearActionFeedback());
        }
      }, 300);
    }, feedbackDuration);

    return () => clearTimeout(timer);
  }, [feedbackMessage, feedbackDuration, dispatch, stateFeedback]);

  // No message, no render
  if (!feedbackMessage) return null;

  // Configuration for different feedback types
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

  // Pulse animation for background
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
      {isVisible && (
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
          {/* Pulsing background effect */}
          <motion.div
            className="absolute inset-0 rounded-lg -z-10"
            animate={pulseAnimation}
          />

          {/* Feedback icon */}
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

          {/* Feedback message */}
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

          {/* Close button */}
          <button
            onClick={() => dispatch(clearActionFeedback())}
            className="ml-3 text-white opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ActionFeedback;
