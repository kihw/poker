// src/components/combat/CombatPhaseIndicator.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { DESIGN_TOKENS } from '../ui/DesignSystem';

/**
 * Composant pour afficher la phase actuelle du combat
 * avec des indicateurs visuels et des transitions fluides.
 */
const CombatPhaseIndicator = ({ currentPhase }) => {
  // Configuration des phases
  const phases = [
    { id: 'draw', label: 'Draw Cards', description: 'Draw or keep cards from your hand' },
    { id: 'select', label: 'Select Cards', description: 'Select cards to play your move' },
    { id: 'result', label: 'Result', description: 'See the outcome of your play' }
  ];

  // Trouver l'index de la phase actuelle
  const currentIndex = phases.findIndex(phase => phase.id === currentPhase);
  
  // Obtenir la configuration des couleurs pour chaque phase
  const getPhaseColors = (phaseId) => {
    switch(phaseId) {
      case 'draw':
        return {
          active: DESIGN_TOKENS.colors.primary.main,
          text: 'text-blue-400',
          bg: 'bg-blue-500',
          border: 'border-blue-400',
          activeBg: 'bg-blue-600'
        };
      case 'select':
        return {
          active: DESIGN_TOKENS.colors.success.main,
          text: 'text-green-400',
          bg: 'bg-green-500',
          border: 'border-green-400',
          activeBg: 'bg-green-600'
        };
      case 'result':
        return {
          active: DESIGN_TOKENS.colors.secondary.main,
          text: 'text-purple-400',
          bg: 'bg-purple-500',
          border: 'border-purple-400',
          activeBg: 'bg-purple-600'
        };
      default:
        return {
          active: DESIGN_TOKENS.colors.neutral[500],
          text: 'text-gray-400',
          bg: 'bg-gray-500',
          border: 'border-gray-400',
          activeBg: 'bg-gray-600'
        };
    }
  };

  return (
    <div className="mb-6">
      {/* Label de la phase actuelle avec animation */}
      <motion.div 
        className="mb-2 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        key={currentPhase}
      >
        <h2 className={`text-xl font-bold ${getPhaseColors(currentPhase).text}`}>
          {phases[currentIndex]?.label || 'Combat Phase'}
        </h2>
        <p className="text-sm text-gray-400">
          {phases[currentIndex]?.description || 'Choose your next action'}
        </p>
      </motion.div>

      {/* Indicateur de progrès */}
      <div className="flex justify-between items-center px-4 py-2">
        {phases.map((phase, index) => {
          const colors = getPhaseColors(phase.id);
          const isActive = phase.id === currentPhase;
          const isPast = index < currentIndex;
          
          return (
            <React.Fragment key={phase.id}>
              {/* Cercle d'étape */}
              <motion.div 
                className={`rounded-full h-10 w-10 flex items-center justify-center border-2 ${colors.border} ${isActive ? colors.activeBg : isPast ? 'bg-gray-700' : 'bg-gray-800'}`}
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  borderColor: isActive ? colors.active : isPast ? DESIGN_TOKENS.colors.neutral[400] : DESIGN_TOKENS.colors.neutral[700]
                }}
                transition={{ duration: 0.3, type: 'spring' }}
              >
                <span className={`text-sm font-bold ${isActive ? 'text-white' : isPast ? 'text-gray-300' : 'text-gray-500'}`}>
                  {index + 1}
                </span>
              </motion.div>
              
              {/* Ligne de connexion (sauf pour le dernier élément) */}
              {index < phases.length - 1 && (
                <motion.div 
                  className="flex-1 h-1 mx-2 rounded"
                  initial={{ backgroundColor: DESIGN_TOKENS.colors.neutral[700] }}
                  animate={{ 
                    backgroundColor: index < currentIndex 
                      ? colors.active 
                      : DESIGN_TOKENS.colors.neutral[700]
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(CombatPhaseIndicator);
