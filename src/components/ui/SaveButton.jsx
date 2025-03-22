// src/components/ui/SaveButton.jsx - Migré vers Redux
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import SaveLoadMenu from './SaveLoadMenu';

/**
 * Bouton flottant pour accéder aux fonctions de sauvegarde/chargement
 */
const SaveButton = () => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <>
      <motion.button
        className="fixed bottom-20 right-4 z-40 bg-blue-600 text-white rounded-full p-3 shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMenu}
        aria-label="Sauvegarder/Charger"
        title="Sauvegarder/Charger"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
          />
        </svg>
      </motion.button>

      <SaveLoadMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />
    </>
  );
};

export default SaveButton;
