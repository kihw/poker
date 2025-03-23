// src/components/ui/SaveButton.jsx - Design System Enhanced
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';

import { 
  Button, 
  Tooltip, 
  Icons, 
  DESIGN_TOKENS, 
  AnimationPresets 
} from './DesignSystem';

import SaveLoadMenu from './SaveLoadMenu';

const SaveButton = React.memo(() => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 10 
        }}
        className="fixed bottom-20 right-4 z-50"
      >
        <Tooltip content="Sauvegarder/Charger">
          <Button
            variant="primary"
            size="lg"
            className="rounded-full p-3 shadow-lg"
            onClick={toggleMenu}
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
          </Button>
        </Tooltip>
      </motion.div>

      <AnimatePresence>
        {showMenu && (
          <SaveLoadMenu 
            isOpen={showMenu} 
            onClose={() => setShowMenu(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
});

export default SaveButton;
