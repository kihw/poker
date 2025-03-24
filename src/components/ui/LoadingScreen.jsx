// src/components/ui/LoadingScreen.jsx - Enhanced with animations
import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loading screen with animation displayed when application is loading
 */
const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <motion.div
        animate={{
          rotate: 360,
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
        className="h-16 w-16 mb-4"
      >
        <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-xl font-medium"
      >
        Chargement du jeu...
      </motion.p>

      {/* Additional tips that rotate after a delay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="mt-8 text-gray-400 text-sm max-w-md text-center"
      >
        <p>
          Astuce: Les cartes bonus peuvent être améliorées pour obtenir des effets plus puissants.
        </p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
