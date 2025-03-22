// src/components/combat/PlayerStatus.jsx
import React from 'react';
import { motion } from 'framer-motion';

const PlayerStatus = ({ hp, maxHp, gold, xp, level }) => {
  // Gestion des valeurs par défaut
  const safeHp = hp !== undefined ? hp : 0;
  const safeMaxHp = maxHp !== undefined ? maxHp : 1;
  const safeGold = gold !== undefined ? gold : 0;
  const safeXp = xp !== undefined ? xp : 0;
  const safeLevel = level !== undefined ? level : 1;

  // Calcul des pourcentages pour les barres
  const hpPercent = Math.min(100, Math.max(0, (safeHp / safeMaxHp) * 100));
  const xpPercent = Math.min(100, Math.max(0, (safeXp / 100) * 100)); // assuming 100 XP per level

  // Animation pour les barres de progression
  const barAnimation = {
    initial: { width: 0 },
    animate: (width) => ({ width: `${width}%` }),
    transition: { duration: 0.5 },
  };

  const xpBarAnimation = {
    initial: { width: 0 },
    animate: (width) => ({ width: `${width}%` }),
    transition: { duration: 0.5, delay: 0.2 },
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-md shadow-md transition-all">
      <h2 className="text-lg font-bold mb-2 flex items-center">
        <span className="mr-2">👤</span>Joueur (Niveau {safeLevel})
      </h2>

      {/* Barre de santé avec animation */}
      <div className="mb-1 flex justify-between">
        <span>PV :</span>
        <span
          className={safeHp < safeMaxHp * 0.3 ? 'text-red-500 font-bold' : ''}
        >
          {safeHp} / {safeMaxHp}
        </span>
      </div>
      <div className="w-40 bg-red-900 rounded-full h-2 mb-2 overflow-hidden">
        <motion.div
          className={`h-2 rounded-full ${
            safeHp < safeMaxHp * 0.3 ? 'bg-red-600' : 'bg-red-500'
          }`}
          custom={hpPercent}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5 }}
          style={{ width: `${hpPercent}%` }}
        ></motion.div>
      </div>

      {/* Barre d'XP avec animation */}
      <div className="mb-1 flex justify-between">
        <span>XP :</span>
        <span>{safeXp} / 100</span>
      </div>
      <div className="w-40 bg-blue-900 rounded-full h-2 mb-2 overflow-hidden">
        <motion.div
          className="bg-blue-500 h-2 rounded-full"
          custom={xpPercent}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ width: `${xpPercent}%` }}
        ></motion.div>
      </div>

      {/* Or */}
      <div className="flex items-center">
        <span className="text-yellow-400 mr-2">💰</span>
        <span>{safeGold}</span>
      </div>
    </div>
  );
};

// Optimisation avec React.memo pour éviter les re-rendus inutiles
export default React.memo(PlayerStatus);
