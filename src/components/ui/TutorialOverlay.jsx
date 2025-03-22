// src/components/ui/TutorialOverlay.jsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const TutorialOverlay = ({ step = 0, onNextStep, onComplete }) => {
  // Définition des étapes du tutoriel
  const tutorialSteps = [
    {
      target: '.card-hand',
      content:
        "Bienvenue dans votre aventure de carte! Sélectionnez jusqu'à 5 cartes pour attaquer. Les combinaisons comme au poker vous donneront des bonus de dégâts!",
      position: 'bottom',
    },
    {
      target: '.bonus-cards',
      content:
        "Utilisez vos cartes bonus pour obtenir des effets spéciaux pendant le combat. Certaines sont passives, d'autres doivent être activées.",
      position: 'top',
    },
    {
      target: '.hand-instructions',
      content:
        'Avec 5 cartes, vous pouvez former des mains de poker comme une paire, un brelan ou une quinte flush! Plus la main est forte, plus les dégâts sont élevés.',
      position: 'bottom',
    },
    {
      target: null, // Pas de cible spécifique
      content:
        "Après chaque combat, vous recevrez de l'or et de l'expérience. Vous pourrez également obtenir de nouvelles cartes bonus! Explorez la carte pour trouver des combats, des événements, des boutiques et des sites de repos.",
      position: 'center',
    },
  ];

  // Vérifier si nous avons terminé le tutoriel
  if (step >= tutorialSteps.length) {
    onComplete();
    return null;
  }

  // Désactiver le tutoriel lors du changement de page
  useEffect(() => {
    return () => {
      // S'assurer que le tutoriel est bien fermé quand on quitte la page
      localStorage.setItem('tutorialCompleted', 'true');
    };
  }, []);

  // IMPORTANT: S'assurer que l'overlay ne bloque pas les interactions sur d'autres pages
  useEffect(() => {
    const currentPath = window.location.pathname;

    // Si nous sommes sur la page de carte, désactiver automatiquement le tutoriel
    if (currentPath === '/map') {
      console.log('Tutoriel désactivé automatiquement sur la page de carte');
      onComplete();
    }
  }, [onComplete]);

  const currentStep = tutorialSteps[step];

  // Animation pour le highlight de la cible
  const highlightAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  // Animation pour la boîte de texte
  const textBoxAnimation = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { delay: 0.3, duration: 0.5 },
    },
  };

  // Positionner la boîte de texte en fonction de la position spécifiée
  const getTextBoxPosition = () => {
    if (!currentStep.target || currentStep.position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    // Pour les autres positions, calculer en fonction de la cible
    // (Dans une implémentation complète, on utiliserait getBoundingClientRect)
    return {
      position: 'absolute',
      [currentStep.position]: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center tutorial-overlay">
      {/* Fond translucide avec un trou pour la cible - IMPORTANT: pointer-events-auto */}
      <div
        className="absolute inset-0 pointer-events-auto"
        onClick={onComplete}
      />

      {/* Highlight de la cible si spécifiée */}
      {currentStep.target && (
        <motion.div
          variants={highlightAnimation}
          initial="hidden"
          animate="visible"
          className="absolute pointer-events-none"
          style={{
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            borderRadius: '4px',
            zIndex: 51,
          }}
        >
          {/* Cette div sera positionnée sur la cible via JS dans une implémentation réelle */}
        </motion.div>
      )}

      {/* Boîte de texte du tutoriel - IMPORTANT: pointer-events-auto */}
      <motion.div
        variants={textBoxAnimation}
        initial="hidden"
        animate="visible"
        className="bg-gray-800 border-2 border-blue-500 rounded-lg p-4 max-w-md text-white shadow-xl z-51 pointer-events-auto"
        style={getTextBoxPosition()}
      >
        <h3 className="text-lg font-bold mb-2">
          Tutoriel - Étape {step + 1}/{tutorialSteps.length}
        </h3>
        <p className="mb-4">{currentStep.content}</p>
        <div className="flex justify-between">
          <button
            onClick={onComplete}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded"
          >
            Ignorer
          </button>
          <button
            onClick={onNextStep}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded"
          >
            {step < tutorialSteps.length - 1 ? 'Suivant' : 'Terminer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TutorialOverlay;
