// src/components/ui/ActionFeedback.jsx - Design System Enhanced
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { clearActionFeedback } from '../../redux/slices/uiSlice';
import { 
  DESIGN_TOKENS, 
  AnimationPresets 
} from './DesignSystem';

const ActionFeedback = () => {
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false);

  // Use Redux state for feedback
  const stateFeedback = useSelector((state) => state.ui.actionFeedback);

  // Determine feedback configurations
  const getFeedbackConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          bgColor: DESIGN_TOKENS.colors.success.main,
          borderColor: DESIGN_TOKENS.colors.success.dark,
          icon: '✅',
          textColor: 'white'
        };
      case 'error':
        return {
          bgColor: DESIGN_TOKENS.colors.danger.main,
          borderColor: DESIGN_TOKENS.colors.danger.dark,
          icon: '❌',
          textColor: 'white'
        };
      case 'warning':
        return {
          bgColor: DESIGN_TOKENS.colors.warning.main,
          borderColor: DESIGN_TOKENS.colors.warning.dark,
          icon: '⚠️',
          textColor: 'black'
        };
      default:
        return {
          bgColor: DESIGN_TOKENS.colors.primary.main,
          borderColor: DESIGN_TOKENS.colors.primary.dark,
          icon: 'ℹ️',
          textColor: 'white'
        };
    }
  };

  // Manage feedback visibility
  useEffect(() => {
    if (stateFeedback?.message) {
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        
        // Clear feedback after animation
        setTimeout(() => {
          dispatch(clearActionFeedback());
        }, 300);
      }, stateFeedback.duration || 2000);

      return () => clearTimeout(timer);
    }
  }, [stateFeedback, dispatch]);

  // No message, no render
  if (!stateFeedback?.message) return null;

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
              color: config.textColor
            }}
          >
            <span className="mr-3 text-xl">{config.icon}</span>
            <div className="flex-grow text-sm font-medium">
              {stateFeedback.message}
            </div>
            <button 
              onClick={() => setIsVisible(false)}
              className="ml-3 opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ActionFeedback;
