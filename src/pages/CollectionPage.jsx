// src/pages/CollectionPage.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';

import CollectionPreview from '../components/card/CollectionPreview';
import CombatLog from '../components/combat/CombatLog';
import Navigation from '../components/ui/Navigation';
import { Card, DESIGN_TOKENS, Icons } from '../components/ui/DesignSystem';
import { useNavigate } from 'react-router-dom';

// Fixed StatBlock Component
const StatBlock = ({ label, value, icon }) => (
  <div
    className="bg-gray-800 p-4 rounded-lg flex items-center space-x-4"
    style={{
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      borderLeft: '4px solid #3B82F6',
    }}
  >
    <div className="text-3xl">{icon}</div>
    <div>
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  </div>
);

const CollectionPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get card collection from Redux state
  const bonusCardCollection = useSelector((state) => state.bonusCards?.collection || []);
  const gamePhase = useSelector((state) => state.game.gamePhase);
  const collectionAccessLevel = useSelector((state) => state.game.collectionAccessLevel);

  const [statsData, setStatsData] = useState({
    totalCards: 0,
    legendaryCards: 0,
    averageLevel: 0,
    totalEffect: 0,
  });

  // Handling access restrictions
  useEffect(() => {
    if (gamePhase === 'combat' && collectionAccessLevel !== 'readonly') {
      navigate('/');
    }
  }, [gamePhase, collectionAccessLevel, navigate]);

  // Calculate statistics when collection changes
  useEffect(() => {
    if (bonusCardCollection.length > 0) {
      const totalCards = bonusCardCollection.length;
      const legendaryCards = bonusCardCollection.filter(
        (card) => card.rarity === 'legendary'
      ).length;

      // Calculate average level
      let totalLevels = 0;
      bonusCardCollection.forEach((card) => {
        totalLevels += card.level || 1;
      });
      const averageLevel = (totalLevels / totalCards).toFixed(1);

      // Calculate total effect
      let totalEffect = 0;
      bonusCardCollection.forEach((card) => {
        if (card.bonus && card.bonus.value) {
          totalEffect += card.bonus.value;
        }
      });

      setStatsData({
        totalCards,
        legendaryCards,
        averageLevel,
        totalEffect,
      });
    }
  }, [bonusCardCollection]);

  const renderContent = () => {
    if (collectionAccessLevel === 'disabled') {
      return (
        <div className="h-full flex items-center justify-center text-gray-400">
          Collection inaccessible
        </div>
      );
    }

    return (
      <>
        {collectionAccessLevel === 'readonly' && (
          <div className="absolute top-0 left-0 right-0 bg-yellow-600 text-white text-center p-2 z-10">
            Vue limitée en combat
          </div>
        )}
        <CollectionPreview 
          readOnly={collectionAccessLevel === 'readonly'} 
        />
      </>
    );
  };

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
          {renderContent()}
        </div>

        {/* Combat Log */}
        <div>
          <CombatLog />
        </div>

        {/* Bonus Card Statistics */}
        <div className="md:col-span-3">
          <Card variant="elevated" className="p-4">
            <div className="flex items-center mb-4">
              <div className="mr-2 text-2xl">🃏</div>
              <h2 className="text-xl font-bold">Statistiques des Cartes Bonus</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBlock label="Total de Cartes" value={statsData.totalCards} icon="🃏" />
              <StatBlock label="Cartes Légendaires" value={statsData.legendaryCards} icon="🟠" />
              <StatBlock label="Niveau Moyen" value={statsData.averageLevel} icon="📊" />
              <StatBlock label="Effet Total" value={statsData.totalEffect} icon="✨" />
            </div>
          </Card>
        </div>
      </div>

      <Navigation />
    </motion.div>
  );
};

export default CollectionPage;
