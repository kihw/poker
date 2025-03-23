// src/pages/CollectionPage.jsx - Enhanced Collection View
import React from 'react';
import { useSelector } from 'react-redux';
import { selectIsGameOver } from '../redux/selectors/gameSelectors';
import { motion } from 'framer-motion';

import CollectionPreview from '../components/card/CollectionPreview';
import CombatLog from '../components/combat/CombatLog';
import Navigation from '../components/ui/Navigation';
import { 
  Card, 
  DESIGN_TOKENS, 
  Icons 
} from '../components/ui/DesignSystem';

const CollectionPage = () => {
  // Vérifier si le jeu est terminé (pour la gestion d'une éventuelle redirection)
  const isGameOver = useSelector(selectIsGameOver);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-900 p-4 flex flex-col"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
        {/* Collection Preview */}
        <div className="md:col-span-2">
          <CollectionPreview />
        </div>

        {/* Combat Log */}
        <div>
          <CombatLog />
        </div>

        {/* Bonus Card Statistics */}
        <div className="md:col-span-3">
          <Card variant="elevated" className="p-4">
            <div className="flex items-center mb-4">
              <Icons.card className="mr-2" />
              <h2 className="text-xl font-bold">
                Statistiques des Cartes Bonus
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBlock 
                label="Total de Cartes" 
                value="Loading..." 
                icon="🃏" 
              />
              <StatBlock 
                label="Cartes Légendaires" 
                value="Loading..." 
                icon="🟠" 
              />
              <StatBlock 
                label="Niveau Moyen" 
                value="Loading..." 
                icon="📊" 
              />
              <StatBlock 
                label="Effet Total" 
                value="Loading..." 
                icon="✨" 
              />
            </div>
          </Card>
        </div>
      </div>

      <Navigation />
    </motion.div>
  );
};

// Stat Block Component
const StatBlock = ({ label, value, icon }) => (
  <div 
    className="bg-gray-800 p-4 rounded-lg flex items-center space-x-4"
    style={{ 
      boxShadow: DESIGN_TOKENS.shadows.sm,
      borderLeft: `4px solid ${DESIGN_TOKENS.colors.primary.main}`
    }}
  >
    <div className="text-3xl">{icon}</div>
    <div>
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  </div>
);

export default CollectionPage;