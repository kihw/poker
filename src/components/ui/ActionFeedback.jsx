// src/components/ui/ActionFeedback.jsx - Fixed and enhanced
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { clearActionFeedback } from '../../redux/slices/uiSlice';
import { DESIGN_TOKENS, AnimationPresets } from './DesignSystem';

/**
 * Component for displaying transient action feedback to the user
 * Includes proper animations and cleanup
 */
const ActionFeedback = () => {
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false);

  // Use Redux state for feedback
  const stateFeedback = useSelector((state) => state.ui.actionFeedback);

  // Memoized function to determine feedback configuration based on type
  const getFeedbackConfig = useCallback((type) => {
    switch (type) {
      case 'success':
        return {
          bgColor: DESIGN_TOKENS.colors.success.main,
          borderColor: DESIGN_TOKENS.colors.success.dark,
          icon: '✅',
          textColor: 'white',
        };
      case 'error':
        return {
          bgColor: DESIGN_TOKENS.colors.danger.main,
          borderColor: DESIGN_TOKENS.colors.danger.dark,
          icon: '❌',
          textColor: 'white',
        };
      case 'warning':
        return {
          bgColor: DESIGN_TOKENS.colors.warning.main,
          borderColor: DESIGN_TOKENS.colors.warning.dark,
          icon: '⚠️',
          textColor: 'black',
        };
      default:
        return {
          bgColor: DESIGN_TOKENS.colors.primary.main,
          borderColor: DESIGN_TOKENS.colors.primary.dark,
          icon: 'ℹ️',
          textColor: 'white',
        };
    }
  }, []);

  // Manage feedback visibility with proper cleanup
  useEffect(() => {
    if (!stateFeedback?.message) {
      setIsVisible(false);
      return;
    }

    // Show the feedback
    setIsVisible(true);

    // Set a timer to hide it after the specified duration
    const timer = setTimeout(() => {
      setIsVisible(false);

      // Clear feedback from Redux after animation completes
      const cleanupTimer = setTimeout(() => {
        dispatch(clearActionFeedback());
      }, 300); // Animation duration

      // Clean up the nested timer if component unmounts
      return () => clearTimeout(cleanupTimer);
    }, stateFeedback.duration || 2000);

    // Clean up the timer if component unmounts or feedback changes
    return () => clearTimeout(timer);
  }, [stateFeedback, dispatch]);

  // If there's no message, render nothing
  if (!stateFeedback?.message) return null;

  // Get the style configuration for the current feedback type
  const config = getFeedbackConfig(stateFeedback.type);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          {...AnimationPresets.slideUp}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div
            className="px-4 py-3 rounded-lg shadow-lg flex items-center max-w-md"
            style={{
              backgroundColor: config.bgColor,
              borderLeft: `4px solid ${config.borderColor}`,
              color: config.textColor,
            }}
          >
            <span className="mr-3 text-xl">{config.icon}</span>
            <div className="flex-grow text-sm font-medium">{stateFeedback.message}</div>
            <button
              onClick={() => setIsVisible(false)}
              className="ml-3 opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Optimize with React.memo to prevent unnecessary re-renders
export default React.memo(ActionFeedback);
