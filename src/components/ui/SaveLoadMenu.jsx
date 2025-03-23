// src/components/ui/SaveLoadMenu.jsx - Design System Enhanced
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { saveGame, loadGame, deleteSave } from '../../redux/thunks/saveThunks';

import { Button, Card, Badge, Icons, DESIGN_TOKENS, AnimationPresets } from './DesignSystem';
const hasSave = () => {
  return localStorage.getItem('pokerSoloRpgSave') !== null;
};
const SaveLoadMenu = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  // Selectors for player and game state
  const player = useSelector((state) => state.player);
  const gameState = useSelector((state) => state.game);

  // Local state for save management
  const [saveExists, setSaveExists] = useState(false);
  const [saveInfo, setSaveInfo] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  // Check for existing save on open
  useEffect(() => {
    if (isOpen) {
      const exists = hasSave();
      setSaveExists(exists);

      if (exists) {
        try {
          const savedData = localStorage.getItem('pokerSoloRpgSave');
          if (savedData) {
            const data = JSON.parse(savedData);
            setSaveInfo(data);
          }
        } catch (error) {
          console.error('Save data parsing error:', error);
          setSaveInfo(null);
        }
      }
    }
  }, [isOpen]);

  // Save Game Handler
  const handleSave = async () => {
    try {
      await dispatch(saveGame());
      setActionResult({
        type: 'success',
        message: 'Partie sauvegardée avec succès!',
      });
      setSaveExists(true);
    } catch (error) {
      setActionResult({
        type: 'error',
        message: 'Erreur lors de la sauvegarde',
      });
    }
  };

  // Load Game Handler
  const handleLoad = async () => {
    try {
      await dispatch(loadGame());
      onClose();
    } catch (error) {
      setActionResult({
        type: 'error',
        message: 'Erreur lors du chargement',
      });
    }
  };

  // Delete Save Handler
  const handleDelete = async () => {
    if (confirmDelete) {
      try {
        await dispatch(deleteSave());
        setActionResult({
          type: 'success',
          message: 'Sauvegarde supprimée avec succès!',
        });
        setSaveExists(false);
        setConfirmDelete(false);
      } catch (error) {
        setActionResult({
          type: 'error',
          message: 'Erreur lors de la suppression',
        });
      }
    } else {
      setConfirmDelete(true);
    }
  };

  // Animation Configurations
  const menuVariants = {
    ...AnimationPresets.slideUp,
    initial: {
      opacity: 0,
      scale: 0.9,
      y: 50,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 50,
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            {...menuVariants}
            className="w-full max-w-md bg-gray-800 rounded-xl p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Sauvegarde & Gestion</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>

            {/* Saved Game Information */}
            {saveExists && saveInfo && (
              <Card variant="elevated" className="mb-6 p-4 bg-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-white">Dernière Sauvegarde</h3>

                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between">
                    <span>Niveau:</span>
                    <Badge variant="primary">{saveInfo.player?.level || 1}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Or:</span>
                    <span>{saveInfo.player?.gold || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PV:</span>
                    <span>
                      {saveInfo.player?.health || 0} /{saveInfo.player?.maxHealth || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Étage:</span>
                    <span>{saveInfo.game?.currentFloor || 1}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button variant="primary" size="lg" className="w-full" onClick={handleSave}>
                💾 Sauvegarder
              </Button>

              <Button
                variant="success"
                size="lg"
                className="w-full"
                disabled={!saveExists}
                onClick={handleLoad}
              >
                📂 Charger
              </Button>

              <Button
                variant={confirmDelete ? 'danger' : 'outline'}
                size="lg"
                className="w-full"
                disabled={!saveExists}
                onClick={handleDelete}
              >
                {confirmDelete ? '⚠️ Confirmer la suppression?' : '🗑️ Supprimer la sauvegarde'}
              </Button>
            </div>

            {/* Action Result Feedback */}
            {actionResult && (
              <motion.div
                {...AnimationPresets.fadeIn}
                className={`
                  mt-4 p-3 rounded-md text-center
                  ${
                    actionResult.type === 'success'
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                  }
                `}
              >
                {actionResult.message}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SaveLoadMenu;
