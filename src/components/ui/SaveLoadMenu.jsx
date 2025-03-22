// src/components/ui/SaveLoadMenu.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSaveGame } from '../../context/gameHooks';

/**
 * Composant pour afficher un menu de sauvegarde et chargement
 */
const SaveLoadMenu = ({ isOpen, onClose }) => {
  const { saveGame, loadGame, deleteSave, hasSave } = useSaveGame();
  const [saveExists, setSaveExists] = useState(false);
  const [saveInfo, setSaveInfo] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(null);

  // Vérifier l'existence d'une sauvegarde
  useEffect(() => {
    if (isOpen) {
      const exists = hasSave();
      setSaveExists(exists);

      if (exists) {
        try {
          // Récupérer les informations de la sauvegarde
          const savedData = localStorage.getItem('pokerSoloRpgSave');
          if (savedData) {
            const data = JSON.parse(savedData);
            setSaveInfo(data);
          }
        } catch (error) {
          console.error(
            'Erreur lors de la lecture des informations de sauvegarde:',
            error
          );
          setSaveInfo(null);
        }
      } else {
        setSaveInfo(null);
      }
    }
  }, [isOpen, hasSave, actionCompleted]);

  // Gérer les actions
  const handleSave = () => {
    saveGame();
    setActionCompleted(`save-${Date.now()}`);
    setTimeout(() => {
      setActionCompleted(null);
    }, 2000);
  };

  const handleLoad = () => {
    loadGame();
    onClose();
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteSave();
      setConfirmDelete(false);
      setActionCompleted(`delete-${Date.now()}`);
      setTimeout(() => {
        setActionCompleted(null);
      }, 2000);
    } else {
      setConfirmDelete(true);
    }
  };

  // Formatter la date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue';

    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Animation d'entrée/sortie
  const menuVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  };

  // Rendu conditionnel
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence>
        <motion.div
          className="bg-gray-900 rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
          variants={menuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4">
            <h2 className="text-xl font-bold text-white">
              Sauvegarde & Chargement
            </h2>
          </div>

          <div className="p-6">
            {/* Informations de sauvegarde */}
            {saveExists && saveInfo && (
              <div className="bg-gray-800 rounded-md p-4 mb-6">
                <h3 className="text-lg font-bold text-white mb-2">
                  Sauvegarde existante
                </h3>

                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{formatDate(saveInfo.timestamp)}</span>
                  </div>

                  {saveInfo.player && (
                    <>
                      <div className="flex justify-between">
                        <span>Niveau du joueur:</span>
                        <span>{saveInfo.player.level || 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Or:</span>
                        <span>{saveInfo.player.gold || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PV:</span>
                        <span>
                          {saveInfo.player.health || 0}/
                          {saveInfo.player.maxHealth || 0}
                        </span>
                      </div>
                    </>
                  )}

                  {saveInfo.progression && (
                    <div className="flex justify-between">
                      <span>Étage:</span>
                      <span>{saveInfo.progression.currentFloor || 1}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="space-y-3">
              <button
                onClick={handleSave}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded"
              >
                Sauvegarder la partie
              </button>

              <button
                onClick={handleLoad}
                disabled={!saveExists}
                className={`w-full font-bold py-3 px-4 rounded ${
                  saveExists
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Charger la partie
              </button>

              <button
                onClick={handleDelete}
                disabled={!saveExists}
                className={`w-full font-bold py-3 px-4 rounded ${
                  saveExists
                    ? confirmDelete
                      ? 'bg-red-700 hover:bg-red-800 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {confirmDelete
                  ? 'Confirmer la suppression?'
                  : 'Supprimer la sauvegarde'}
              </button>

              <button
                onClick={onClose}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded mt-6"
              >
                Fermer
              </button>
            </div>

            {/* Message d'information */}
            {!saveExists && (
              <div className="mt-4 text-sm text-gray-400 text-center">
                Aucune sauvegarde disponible
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default SaveLoadMenu;
