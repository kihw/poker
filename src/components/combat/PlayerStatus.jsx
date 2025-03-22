// src/components/combat/PlayerStatus.jsx
import React from 'react';
<<<<<<< HEAD
import { motion } from 'framer-motion';
=======
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c

const PlayerStatus = ({ hp, maxHp, gold, xp, level }) => {
  const hpPercent = (hp / maxHp) * 100;
  const xpPercent = (xp / 100) * 100; // assuming 100 XP per level for simplicity

<<<<<<< HEAD
  // Animation pour les barres de progression
  const barAnimation = {
    initial: { width: 0 },
    animate: { width: `${hpPercent}%` },
    transition: { duration: 0.5 },
  };

  const xpBarAnimation = {
    initial: { width: 0 },
    animate: { width: `${xpPercent}%` },
    transition: { duration: 0.5, delay: 0.2 },
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-md shadow-md transition-all">
      <h2 className="text-lg font-bold mb-2 flex items-center">
        <span className="mr-2">👤</span>Joueur (Niveau {level})
      </h2>

      {/* Barre de santé avec animation */}
      <div className="mb-1 flex justify-between">
        <span>PV :</span>
        <span className={hp < maxHp * 0.3 ? 'text-red-500 font-bold' : ''}>
          {hp} / {maxHp}
        </span>
      </div>
      <div className="w-40 bg-red-900 rounded-full h-2 mb-2 overflow-hidden">
        <motion.div
          className={`h-2 rounded-full ${
            hp < maxHp * 0.3 ? 'bg-red-600' : 'bg-red-500'
          }`}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5 }}
          style={{ width: `${hpPercent}%` }}
        ></motion.div>
      </div>

      {/* Barre d'XP avec animation */}
      <div className="mb-1 flex justify-between">
        <span>XP :</span>
        <span>{xp} / 100</span>
      </div>
      <div className="w-40 bg-blue-900 rounded-full h-2 mb-2 overflow-hidden">
        <motion.div
          className="bg-blue-500 h-2 rounded-full"
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ width: `${xpPercent}%` }}
        ></motion.div>
      </div>

      {/* Or */}
      <div className="flex items-center">
        <span className="text-yellow-400 mr-2">💰</span>
        <span>{gold}</span>
      </div>
=======
  return (
    <div className="p-4 bg-gray-800 text-white rounded-md">
      <h2 className="text-lg font-bold mb-2">Joueur</h2>
      <div className="mb-1">
        PV : {hp} / {maxHp}
      </div>
      <div className="w-32 bg-red-900 rounded-full h-2 mb-2">
        <div
          className="bg-red-500 h-2 rounded-full"
          style={{ width: `${hpPercent}%` }}
        ></div>
      </div>
      <div className="mb-1">Niveau : {level}</div>
      <div className="mb-1">XP : {xp} / 100</div>
      <div className="w-32 bg-blue-900 rounded-full h-2 mb-2">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${xpPercent}%` }}
        ></div>
      </div>
      <div>Or : {gold}</div>
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
    </div>
  );
};

<<<<<<< HEAD
// Optimisation avec React.memo pour éviter les re-rendus inutiles
export default React.memo(PlayerStatus);
=======
export default PlayerStatus;
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
