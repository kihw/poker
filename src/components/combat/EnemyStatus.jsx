// src/components/combat/EnemyStatus.jsx
<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const EnemyStatus = ({ name, hp, maxHp, nextAttack }) => {
  const hpPercent = (hp / maxHp) * 100;
  const controls = useAnimation();
  const [prevHp, setPrevHp] = useState(hp);

  // Effet d'animation quand les PV changent
  useEffect(() => {
    // Animation de "flash" quand l'ennemi prend des dégâts
    if (hp < prevHp) {
      controls.start({
        backgroundColor: ['rgba(220, 38, 38, 0.8)', 'rgba(127, 29, 29, 1)'],
        transition: { duration: 0.5 },
      });
    }

    setPrevHp(hp);
  }, [hp, prevHp, controls]);

  // Déterminer l'emoji approprié pour l'ennemi
  const getEnemyEmoji = () => {
    if (name.includes('Goblin')) return '👺';
    if (name.includes('Dragon')) return '🐉';
    if (name.includes('Squelette') || name.includes('Skeleton')) return '💀';
    if (name.includes('Orc')) return '👹';
    if (name.includes('Ghost') || name.includes('Fantôme')) return '👻';
    if (name.includes('Wolf') || name.includes('Loup')) return '🐺';
    if (name.includes('Spider') || name.includes('Araignée')) return '🕷️';
    if (name.includes('Troll')) return '👹';
    if (name.includes('Demon') || name.includes('Démon')) return '👿';
    return '👾'; // Emoji par défaut
  };

  // État de santé pour l'affichage
  const getHealthStatus = () => {
    if (hp <= maxHp * 0.25)
      return {
        text: 'Critique',
        class: 'text-red-500 font-bold animate-pulse',
      };
    if (hp <= maxHp * 0.5)
      return { text: 'Blessé', class: 'text-orange-500 font-bold' };
    if (hp <= maxHp * 0.75)
      return { text: 'Légèrement blessé', class: 'text-yellow-500' };
    return { text: 'En forme', class: 'text-green-500' };
  };

  const healthStatus = getHealthStatus();

  return (
    <motion.div
      className="p-4 bg-gray-800 text-white rounded-md shadow-lg relative overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image/Emoji de l'ennemi avec animation */}
      <motion.div
        className="absolute right-4 top-4 text-3xl"
        initial={{ opacity: 0.5, scale: 0.9 }}
        animate={{
          opacity: [0.5, 0.7, 0.5],
          scale: [0.9, 1, 0.9],
          transition: {
            repeat: Infinity,
            duration: 3,
            repeatType: 'mirror',
          },
        }}
      >
        {getEnemyEmoji()}
      </motion.div>

      <h2 className="text-lg font-bold mb-2 pr-10">Ennemi : {name}</h2>

      <div className="mb-1 flex justify-between items-center">
        <span>PV :</span>
        <div className="flex items-center">
          <span className={healthStatus.class}>{healthStatus.text}</span>
          <span className="ml-2">
            {hp} / {maxHp}
          </span>
        </div>
      </div>

      <div className="w-full bg-red-900 rounded-full h-3 mb-3 overflow-hidden relative">
        {/* Barre de PV précédents (pour effet visuel) */}
        {hp < prevHp && (
          <motion.div
            className="absolute bg-red-400 opacity-30 h-full"
            initial={{ width: `${(prevHp / maxHp) * 100}%` }}
            animate={{ width: `${hpPercent}%` }}
            transition={{ duration: 0.8 }}
          ></motion.div>
        )}

        {/* Barre de PV actuelle */}
        <motion.div
          className="bg-red-500 h-full"
          initial={{ width: prevHp === hp ? 0 : `${(prevHp / maxHp) * 100}%` }}
          animate={{ width: `${hpPercent}%` }}
          transition={{ duration: 0.5 }}
          animate={controls}
        ></motion.div>
      </div>

      {/* Information d'attaque avec animation de pulsation */}
      {nextAttack && (
        <div className="flex items-center">
          <motion.div
            className="flex items-center bg-red-800 rounded-md px-2 py-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              boxShadow: [
                '0 0 0 rgba(185, 28, 28, 0)',
                '0 0 8px rgba(185, 28, 28, 0.7)',
                '0 0 0 rgba(185, 28, 28, 0)',
              ],
            }}
            transition={{
              delay: 0.3,
              boxShadow: {
                repeat: Infinity,
                duration: 2,
              },
            }}
          >
            <span className="mr-2">⚔️</span>
            <span>
              Prochaine attaque: <strong>{nextAttack}</strong> dégâts
            </span>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

// Optimisation avec React.memo pour éviter les re-rendus inutiles
export default React.memo(EnemyStatus);
=======
import React from 'react';

const EnemyStatus = ({ name, hp, maxHp, nextAttack }) => {
  const hpPercent = (hp / maxHp) * 100;

  return (
    <div className="p-4 bg-gray-800 text-white rounded-md">
      <h2 className="text-lg font-bold mb-2">Ennemi : {name}</h2>
      <div className="mb-1">
        PV : {hp} / {maxHp}
      </div>
      <div className="w-full bg-red-900 rounded-full h-2 mb-2">
        <div
          className="bg-red-500 h-2 rounded-full"
          style={{ width: `${hpPercent}%` }}
        ></div>
      </div>
      {nextAttack && <div>Prochaine attaque : {nextAttack}</div>}
    </div>
  );
};

export default EnemyStatus;
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
