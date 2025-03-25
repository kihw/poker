// src/components/combat/CombatInterface.jsx - Version améliorée avec animations de combat
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';

// Composant d'animation pour les dégâts/soins
const CombatAnimation = ({ type, value }) => {
  const animationVariants = {
    damage: {
      initial: { opacity: 0, y: -20, scale: 0.5 },
      animate: {
        opacity: 1,
        y: -50,
        scale: 1,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 10,
        },
      },
      exit: {
        opacity: 0,
        y: -100,
        scale: 0.5,
        transition: { duration: 0.5 },
      },
    },
    heal: {
      initial: { opacity: 0, y: -20, scale: 0.5, color: 'green' },
      animate: {
        opacity: 1,
        y: -50,
        scale: 1,
        color: 'green',
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 10,
        },
      },
      exit: {
        opacity: 0,
        y: -100,
        scale: 0.5,
        transition: { duration: 0.5 },
      },
    },
  };

  return (
    <motion.div
      variants={animationVariants[type]}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`
        absolute 
        z-50 
        text-3xl 
        font-bold 
        ${type === 'damage' ? 'text-red-500' : 'text-green-500'}
      `}
    >
      {type === 'damage' ? `-${value}` : `+${value}`}
    </motion.div>
  );
};

// Composant de personnage de combat
const BattleCharacter = ({
  name,
  hp,
  maxHp,
  position = 'left',
  avatar,
  lastDamage = null,
  lastHeal = null,
}) => {
  const [animationQueue, setAnimationQueue] = useState([]);

  useEffect(() => {
    if (lastDamage) {
      setAnimationQueue((prev) => [...prev, { type: 'damage', value: lastDamage }]);
    }
    if (lastHeal) {
      setAnimationQueue((prev) => [...prev, { type: 'heal', value: lastHeal }]);
    }

    const timer = setTimeout(() => {
      setAnimationQueue((prev) => prev.slice(1));
    }, 1500);

    return () => clearTimeout(timer);
  }, [lastDamage, lastHeal]);

  const hpPercentage = (hp / maxHp) * 100;

  return (
    <div
      className={`
        relative 
        flex flex-col 
        items-center 
        ${position === 'left' ? 'mr-8' : 'ml-8'}
      `}
    >
      <div
        className={`
          relative 
          w-48 h-48 
          rounded-full 
          flex items-center 
          justify-center 
          overflow-hidden 
          ${position === 'left' ? 'self-start' : 'self-end'}
          ${hp <= maxHp * 0.2 ? 'animate-pulse' : ''}
        `}
      >
        <img
          src={avatar || '/api/placeholder/200/200'}
          alt={name}
          className="w-full h-full object-cover"
        />

        {/* Barre de vie */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-red-900" style={{ width: '100%' }}>
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${hpPercentage}%` }}
          />
        </div>
      </div>

      <div className="text-center mt-2">
        <h3 className="text-xl font-bold">{name}</h3>
        <p>
          {hp}/{maxHp} PV
        </p>
      </div>

      {/* Animations de dégâts/soins */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
        <AnimatePresence>
          {animationQueue.length > 0 &&
            animationQueue.map((anim, index) => (
              <CombatAnimation key={index} type={anim.type} value={anim.value} />
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Interface de combat principale
const CombatInterface = () => {
  const dispatch = useDispatch();

  // Sélecteurs Redux
  const enemy = useSelector((state) => state.combat.enemy);
  const player = useSelector((state) => state.player);
  const gamePhase = useSelector((state) => state.game.gamePhase);
  const combatState = useSelector((state) => state.combat);
  const bonusCardCombination = useSelector((state) => state.bonusCards.deckCombination);

  // États pour les animations de dégâts
  const [playerLastDamage, setPlayerLastDamage] = useState(null);
  const [enemyLastDamage, setEnemyLastDamage] = useState(null);

  // Effet pour suivre les dégâts
  useEffect(() => {
    // Logique pour suivre les dégâts infligés et reçus
    if (combatState.handResult && combatState.handResult.totalDamage) {
      setEnemyLastDamage(combatState.handResult.totalDamage);
    }
  }, [combatState.handResult]);

  // Vérifier si l'ennemi ou le joueur est vaincu
  const isGameOver = player.health <= 0 || (enemy && enemy.health <= 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-900 rounded-xl"
    >
      {/* Zone du joueur */}
      <div className="md:col-span-2 flex items-center justify-between">
        <BattleCharacter
          name="Joueur"
          hp={player.health}
          maxHp={player.maxHealth}
          position="left"
          avatar="/api/placeholder/200/200"
          lastDamage={playerLastDamage}
        />

        <div className="text-4xl text-white">VS</div>

        <BattleCharacter
          name={enemy?.name || 'Ennemi'}
          hp={enemy?.health || 0}
          maxHp={enemy?.maxHealth || 50}
          position="right"
          avatar="/api/placeholder/200/200"
          lastDamage={enemyLastDamage}
        />
      </div>

      {/* Journal de combat */}
      <div className="md:col-span-1">
        <div className="bg-gray-800 p-4 rounded-lg h-full overflow-y-auto">
          <h3 className="text-xl font-bold mb-4 text-white">Journal de Combat</h3>
          {combatState.combatLog &&
            combatState.combatLog.slice(0, 10).map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-gray-300 mb-2 border-b border-gray-700 pb-2 last:border-b-0"
              >
                {entry}
              </motion.div>
            ))}
        </div>
      </div>

      {/* Bonus de combinaison de cartes */}
      {bonusCardCombination.isActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-3 bg-blue-900 bg-opacity-30 text-blue-300 p-3 rounded-lg text-center"
        >
          <strong>Combinaison Bonus:</strong> {bonusCardCombination.description}
        </motion.div>
      )}

      {/* État de fin de combat */}
      {isGameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-3 bg-red-900 bg-opacity-50 text-white p-6 text-center rounded-lg"
        >
          <h2 className="text-2xl font-bold mb-4">
            {player.health <= 0 ? 'Vous avez été vaincu!' : 'Victoire!'}
          </h2>
        </motion.div>
      )}
    </motion.div>
  );
};

export default React.memo(CombatInterface);
