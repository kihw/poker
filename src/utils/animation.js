// src/utils/animation.js
import { useState, useCallback, useEffect } from 'react';
import { DESIGN_TOKENS } from '../components/ui/DesignSystem';

/**
 * Hook personnalisé pour gérer les animations de manière performante
 * @param {Function} animationLogic - Logique spécifique de l'animation
 * @param {Array} dependencies - Dépendances qui déclenchent l'animation
 */
export function usePerformanceAnimation(animationLogic, dependencies = []) {
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = useCallback(() => {
    const startTime = performance.now();
    setIsAnimating(true);

    animationLogic(() => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (duration > 50) {
        console.warn(`Slow animation detected: ${duration.toFixed(2)}ms`);
      }

      setIsAnimating(false);
    });
  }, dependencies);

  return { isAnimating, startAnimation };
}

/**
 * Générateur de variants d'animation réutilisables
 */
export const AnimationVariants = {
  /**
   * Variant de fade-in standard
   */
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { 
      duration: DESIGN_TOKENS.animations.duration.normal,
      ease: 'easeInOut'
    }
  },

  /**
   * Variant de glissement vers le haut
   */
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 20 
    }
  },

  /**
   * Variant de mise à l'échelle avec effet rebond
   */
  bounceScale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 10
      }
    },
    exit: { 
      scale: 0.9, 
      opacity: 0 
    }
  }
};

/**
 * Optimiseur de performance pour les animations répétitives
 * @param {Function} animationFunction - Fonction d'animation à optimiser
 * @param {number} throttleTime - Temps minimal entre deux animations
 */
export function throttleAnimation(animationFunction, throttleTime = 300) {
  let lastAnimationTime = 0;

  return (...args) => {
    const currentTime = Date.now();
    
    if (currentTime - lastAnimationTime > throttleTime) {
      animationFunction(...args);
      lastAnimationTime = currentTime;
    }
  };
}

/**
 * Créateur de hooks d'animation personnalisés
 * @param {Object} animationConfig - Configuration de l'animation
 */
export function createAnimationHook(animationConfig) {
  return () => {
    const [animationState, setAnimationState] = useState({
      isAnimating: false,
      progress: 0
    });

    const startAnimation = useCallback(() => {
      setAnimationState(prev => ({ ...prev, isAnimating: true }));
      
      // Logique d'animation personnalisée
      const animationDuration = animationConfig.duration || 500;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        setAnimationState({
          isAnimating: progress < 1,
          progress
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, []);

    return {
      ...animationState,
      startAnimation
    };
  };
}

export default {
  usePerformanceAnimation,
  AnimationVariants,
  throttleAnimation,
  createAnimationHook
};