// src/components/ui/ErrorScreen.jsx - Enhanced error display
import React from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { clearError } from '../../redux/slices/uiSlice';

/**
 * Error screen displayed when a critical application error occurs
 * Provides error details and a way to recover
 */
const ErrorScreen = ({ message }) => {
  const dispatch = useDispatch();
  const error = useSelector((state) => state.ui.error) || message;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // Handle retry action
  const handleRetry = () => {
    dispatch(clearError());
    window.location.reload();
  };

  // Handle return to home
  const handleReturnHome = () => {
    dispatch(clearError());
    window.location.href = '/';
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="bg-red-900 p-6 rounded-lg max-w-md text-center mb-6 shadow-lg"
        variants={itemVariants}
      >
        <motion.h2
          className="text-2xl font-bold mb-4 flex items-center justify-center"
          variants={itemVariants}
        >
          <span className="mr-2">⚠️</span>
          Erreur
        </motion.h2>

        <motion.p className="mb-4" variants={itemVariants}>
          {error || "Une erreur inattendue s'est produite."}
        </motion.p>

        <motion.div
          className="bg-gray-800 p-3 rounded-md mt-4 text-sm text-gray-300"
          variants={itemVariants}
        >
          <p>
            Le problème a été enregistré. Vous pouvez essayer de recharger l'application ou
            retourner à l'accueil.
          </p>
        </motion.div>
      </motion.div>

      <motion.div className="flex space-x-4" variants={itemVariants}>
        <button
          onClick={handleRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Réessayer
        </button>

        <button
          onClick={handleReturnHome}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Retour à l'accueil
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ErrorScreen;
