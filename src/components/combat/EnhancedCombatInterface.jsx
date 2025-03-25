// src/components/combat/EnhancedCombatInterface.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Card } from '../cards/Card';

// Combat Animation Component for damage/healing effects
const CombatAnimation = ({ type, value, position }) => {
  const animationVariants = {
    damage: {
      initial: { opacity: 0, y: 0, scale: 0.5 },
      animate: {
        opacity: 1,
        y: -50,
        scale: 1.2,
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
      initial: { opacity: 0, y: 0, scale: 0.5 },
      animate: {
        opacity: 1,
        y: -50,
        scale: 1.2,
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
    shield: {
      initial: { opacity: 0, scale: 0.8, rotate: -10 },
      animate: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: {
          type: 'spring',
          stiffness: 200,
          damping: 10,
        },
      },
      exit: {
        opacity: 0,
        scale: 1.2,
        rotate: 10,
        transition: { duration: 0.4 },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full rounded-lg overflow-hidden"
    >
      {/* Battle field */}
      <motion.div
        className="relative grid grid-cols-1 md:grid-cols-3 gap-4 p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl"
        variants={battlefieldVariants}
        animate={battleStatus || "idle"}
        initial="idle"
      >
        {/* Main battle area */}
        <div className="md:col-span-3 flex justify-between items-center mb-8 relative py-8">
          {/* Battle arena floor - a shadow/reflection effect */}
          <div className="absolute w-full bottom-0 h-10 bg-gray-800 rounded-full opacity-50 filter blur-md"></div>
          
          {/* Enemy side */}
          <div className="w-1/2 flex justify-center">
            <BattleCharacter
              name={enemy?.name || 'Enemy'}
              health={enemy?.health || 0}
              maxHealth={enemy?.maxHealth || 50}
              position="right"
              avatar={enemy?.image || '👹'}
              lastDamage={enemyLastDamage}
              isEnemy={true}
            />
          </div>

          {/* vs divider */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-yellow-500 bg-gray-800 bg-opacity-75 px-3 py-1 rounded-full">
            VS
          </div>

          {/* Player side */}
          <div className="w-1/2 flex justify-center">
            <BattleCharacter
              name="Joueur"
              health={player.health}
              maxHealth={player.maxHealth}
              position="left"
              shield={player.shield}
              lastDamage={playerLastDamage}
              lastHeal={playerLastHeal}
              lastShield={playerLastShield}
            />
          </div>
        </div>

        {/* Card Hand Area */}
        <div className="md:col-span-3">
          {combatState.playerHand && combatState.playerHand.length > 0 && (
            <CardHand 
              cards={combatState.playerHand} 
              selectedCards={selectedCards}
              onCardSelect={handleCardSelect}
              canDiscard={isDiscarding}
            />
          )}
          
          {/* Poker hand result display */}
          {combatState.handResult && (
            <div className="mt-4 flex justify-center">
              <PokerHandResult handResult={combatState.handResult} />
            </div>
          )}
        </div>

        {/* Battle actions area - only shown in active combat */}
        {!battleStatus && (
          <div className="mt-6 md:col-span-3">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm uppercase font-bold mb-3 text-gray-400">Actions</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {combatState.turnPhase === 'draw' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    onClick={handleDrawCards}
                  >
                    Tirer des cartes
                  </motion.button>
                )}
                
                {combatState.turnPhase === 'select' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                      disabled={selectedCards.length === 0}
                      onClick={handleAttack}
                    >
                      Attaquer
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 ${isDiscarding ? 'bg-yellow-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white rounded-lg font-medium`}
                      onClick={handleToggleDiscardMode}
                    >
                      {isDiscarding ? 'Annuler Défausse' : 'Défausser'}
                    </motion.button>
                    
                    {isDiscarding && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                        disabled={selectedCards.length === 0 || selectedCards.length > 2}
                        onClick={handleDiscard}
                      >
                        Confirmer Défausse ({selectedCards.length}/2)
                      </motion.button>
                    )}
                  </>
                )}
                
                {combatState.turnPhase === 'result' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                    onClick={handleNextTurn}
                  >
                    Tour suivant
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Combat information and status area */}
        <div className="md:col-span-3 mt-4">
          {/* Combat Phase Indicator */}
          <div className="text-center mb-4">
            <div className="inline-block px-4 py-2 bg-gray-800 rounded-lg">
              <span className="text-gray-400 mr-2">Phase:</span>
              <span className="font-bold text-white">
                {combatState.turnPhase === 'draw' && 'Pioche'}
                {combatState.turnPhase === 'select' && 'Sélection'}
                {combatState.turnPhase === 'result' && 'Résolution'}
                {!combatState.turnPhase && 'Préparation'}
              </span>
            </div>
          </div>

          {/* Active Bonus Card Combination */}
          {bonusCardCombination?.isActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-900 bg-opacity-30 text-blue-300 p-3 rounded-lg text-center mb-4"
            >
              <strong>Bonus Actif:</strong> {bonusCardCombination.description}
            </motion.div>
          )}

          {/* Battle Status Overlay - Victory or Defeat */}
          <AnimatePresence>
            {battleStatus && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`absolute inset-0 flex items-center justify-center z-10 ${
                  battleStatus === 'victory' ? 'bg-green-900' : 'bg-red-900'
                } bg-opacity-60`}
              >
                <motion.div
                  initial={{ y: -50 }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-gray-800 p-6 rounded-xl shadow-2xl text-center"
                >
                  <h2 className="text-4xl font-bold mb-4">
                    {battleStatus === 'victory' ? (
                      <span className="text-green-500">VICTOIRE!</span>
                    ) : (
                      <span className="text-red-500">DÉFAITE!</span>
                    )}
                  </h2>
                  <p className="text-white text-xl mb-6">
                    {battleStatus === 'victory' 
                      ? `Vous avez vaincu ${enemy?.name}!` 
                      : 'Vous avez été vaincu!'}
                  </p>
                  
                  {/* Show rewards if victory */}
                  {battleStatus === 'victory' && combatState.rewards && (
                    <div className="mb-6 bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-yellow-400 mb-2">Récompenses:</h3>
                      <ul className="text-white">
                        {combatState.rewards.xp && (
                          <li>+{combatState.rewards.xp} XP</li>
                        )}
                        {combatState.rewards.gold && (
                          <li>+{combatState.rewards.gold} Or</li>
                        )}
                        {combatState.rewards.bonusCard && (
                          <li>Nouvelle carte bonus: {combatState.rewards.bonusCard.name}</li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  <button 
                    className={`px-6 py-3 rounded-lg font-bold text-white ${
                      battleStatus === 'victory' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                    onClick={handleContinue}
                  >
                    {battleStatus === 'victory' ? 'Continuer' : 'Réessayer'}
                  </button>
                </motion.div>
              </motion.div>
            )}
          
    <motion.div
      variants={animationVariants[type]}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`
        absolute 
        z-50 
        text-4xl 
        font-bold 
        ${position}
        ${type === 'damage' ? 'text-red-500' : type === 'heal' ? 'text-green-500' : 'text-blue-400'}
        drop-shadow-lg
      `}
    >
      {type === 'damage' && `-${value}`}
      {type === 'heal' && `+${value}`}
      {type === 'shield' && `🛡️ +${value}`}
    </motion.div>
  );
};

export default EnhancedCombatInterface;
};

// Health Bar Component
const HealthBar = ({ current, max, entity }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const barColor = percentage > 50 ? 'bg-green-500' : percentage > 25 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
      <motion.div 
        className={`h-full rounded-full ${barColor}`}
        initial={{ width: 0 }}
        animate={{ 
          width: `${percentage}%`,
          transition: { duration: 0.5, ease: "easeOut" }
        }}
      />
      <div className="flex justify-between text-xs text-white">
        <span>{entity}</span>
        <span>{current}/{max} HP</span>
      </div>
    </div>
  );
};

// Battle Character Component
const BattleCharacter = ({
  name,
  health,
  maxHealth,
  position,
  avatar,
  shield = 0,
  lastDamage = null,
  lastHeal = null,
  lastShield = null,
  isEnemy = false,
}) => {
  const [animationQueue, setAnimationQueue] = useState([]);

  useEffect(() => {
    // Process damage animation
    if (lastDamage && lastDamage > 0) {
      setAnimationQueue((prev) => [...prev, { type: 'damage', value: lastDamage, id: Date.now() }]);
    }
    
    // Process healing animation
    if (lastHeal && lastHeal > 0) {
      setAnimationQueue((prev) => [...prev, { type: 'heal', value: lastHeal, id: Date.now() }]);
    }
    
    // Process shield animation
    if (lastShield && lastShield > 0) {
      setAnimationQueue((prev) => [...prev, { type: 'shield', value: lastShield, id: Date.now() }]);
    }

    // Clear animations after they've played
    if (animationQueue.length > 0) {
      const timer = setTimeout(() => {
        setAnimationQueue((prev) => prev.slice(1));
      }, 1200);
      
      return () => clearTimeout(timer);
    }
  }, [lastDamage, lastHeal, lastShield, animationQueue.length]);

  // Animation variants for the character itself
  const characterVariants = {
    idle: {
      y: [0, -5, 0],
      transition: {
        y: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        }
      }
    },
    hit: {
      x: [0, isEnemy ? -10 : 10, 0],
      rotate: [0, isEnemy ? -5 : 5, 0],
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    attack: {
      x: [0, isEnemy ? 15 : -15, 0],
      transition: {
        duration: 0.4,
        ease: "backInOut"
      }
    }
  };

  // Animations position  
  const animationPosition = isEnemy 
    ? "top-5 right-1/2 transform translate-x-1/2"
    : "bottom-24 left-1/2 transform -translate-x-1/2";

  return (
    <div className={`relative ${position === 'left' ? 'mr-8' : 'ml-8'}`}>
      {/* Health Bar */}
      <div className="mb-2 max-w-xs">
        <HealthBar current={health} max={maxHealth} entity={name} />
      </div>
      
      {/* Shield Display (if present) */}
      {shield > 0 && (
        <motion.div 
          className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 rounded-full text-sm z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
        >
          🛡️ {shield}
        </motion.div>
      )}

      {/* Character Avatar */}
      <motion.div
        className={`relative ${isEnemy ? 'w-40 h-40' : 'w-32 h-32'} rounded-full overflow-hidden`}
        variants={characterVariants}
        animate={lastDamage > 0 ? "hit" : "idle"}
      >
        {isEnemy ? (
          // Enemy monster
          <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-full">
            <span className="text-6xl">{avatar || '👹'}</span>
          </div>
        ) : (
          // Player character
          <div className="w-full h-full flex items-center justify-center bg-blue-900 rounded-full">
            <span className="text-6xl">🧙</span>
          </div>
        )}
      </motion.div>

      {/* Name label */}
      <div className="text-center mt-2 font-bold">
        {name}
      </div>

      {/* Damage/Heal animations */}
      <div className="absolute">
        <AnimatePresence>
          {animationQueue.map((anim) => (
            <CombatAnimation 
              key={anim.id} 
              type={anim.type} 
              value={anim.value} 
              position={animationPosition}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Status Effect Component
const StatusEffect = ({ effect }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="px-2 py-1 bg-gray-800 rounded-full text-sm m-1 flex items-center"
    >
      <span className="mr-1">{effect.icon}</span>
      <span>{effect.name}</span>
    </motion.div>
  );
};

// Card Hand Component
const CardHand = ({ cards, selectedCards, onCardSelect, canDiscard }) => {
  return (
    <div className="flex justify-center mt-4 flex-wrap">
      <AnimatePresence>
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 50, rotate: (index - Math.floor(cards.length / 2)) * 5 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              rotate: (index - Math.floor(cards.length / 2)) * 5,
              transition: { delay: index * 0.1 }
            }}
            exit={{ opacity: 0, y: 100 }}
            className={`relative ${index > 0 ? '-ml-6' : ''} transform hover:-translate-y-4 transition-transform cursor-pointer`}
            onClick={() => onCardSelect(card)}
          >
            <Card 
              card={card} 
              isSelected={selectedCards?.some(c => c.id === card.id)} 
              canSelect={canDiscard || !selectedCards?.some(c => c.id === card.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Poker Hand Component
const PokerHandResult = ({ handResult }) => {
  if (!handResult || !handResult.combination) return null;
  
  // Map combination names to nice display names and colors
  const combinationDisplay = {
    'HIGH_CARD': { name: 'Carte Haute', color: 'text-gray-400' },
    'PAIR': { name: 'Paire', color: 'text-blue-400' },
    'TWO_PAIR': { name: 'Double Paire', color: 'text-cyan-400' },
    'THREE_OF_A_KIND': { name: 'Brelan', color: 'text-indigo-400' },
    'STRAIGHT': { name: 'Suite', color: 'text-yellow-400' },
    'FLUSH': { name: 'Couleur', color: 'text-orange-400' },
    'FULL_HOUSE': { name: 'Full', color: 'text-red-400' },
    'FOUR_OF_A_KIND': { name: 'Carré', color: 'text-pink-400' },
    'STRAIGHT_FLUSH': { name: 'Quinte Flush', color: 'text-purple-400' },
    'ROYAL_FLUSH': { name: 'Quinte Flush Royale', color: 'text-yellow-300' }
  };
  
  const display = combinationDisplay[handResult.combination] || { name: handResult.combination, color: 'text-white' };
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800 bg-opacity-80 p-3 rounded-lg text-center"
    >
      <h4 className="text-gray-400 text-sm uppercase mb-1">Combinaison</h4>
      <p className={`text-xl font-bold ${display.color}`}>{display.name}</p>
      <p className="text-white font-semibold mt-1">{handResult.totalDamage} dégâts</p>
    </motion.div>
  );
};

// Main Combat Interface Component
const EnhancedCombatInterface = () => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const enemy = useSelector((state) => state.combat.enemy);
  const player = useSelector((state) => state.player);
  const combatState = useSelector((state) => state.combat);
  const bonusCardCombination = useSelector((state) => state.bonusCards.deckCombination);
  
  // Local state
  const [playerLastDamage, setPlayerLastDamage] = useState(null);
  const [playerLastHeal, setPlayerLastHeal] = useState(null);
  const [playerLastShield, setPlayerLastShield] = useState(null);
  const [enemyLastDamage, setEnemyLastDamage] = useState(null);
  const [battleStatus, setBattleStatus] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [isDiscarding, setIsDiscarding] = useState(false);
  
  // Handle card selection
  const handleCardSelect = (card) => {
    if (isDiscarding) {
      // Discarding mode - can select up to 2 cards
      if (selectedCards.some(c => c.id === card.id)) {
        setSelectedCards(selectedCards.filter(c => c.id !== card.id));
      } else if (selectedCards.length < 2) {
        setSelectedCards([...selectedCards, card]);
      }
    } else {
      // Normal selection - just toggle this card
      setSelectedCards(selectedCards.some(c => c.id === card.id) ? [] : [card]);
    }
  };
  
  // Handle combat log updates to trigger animations
  useEffect(() => {
    // If new combat log entries appear, check for damage or healing events
    if (combatState.combatLog && combatState.combatLog.length > 0) {
      const latestLog = combatState.combatLog[0]; // Most recent entry
      
      // Check for player taking damage
      if (latestLog.includes(`${enemy?.name} attaque`) || latestLog.includes('vous inflige')) {
        // Extract damage value from log message
        const damageMatch = latestLog.match(/(\d+) dégâts/);
        if (damageMatch && damageMatch[1]) {
          setPlayerLastDamage(parseInt(damageMatch[1]));
          // Reset after a delay
          setTimeout(() => setPlayerLastDamage(null), 2000);
        }
      }
      
      // Check for enemy taking damage
      if (latestLog.includes('infligez') || latestLog.includes('dégâts avec')) {
        // Extract damage value from log message
        const damageMatch = latestLog.match(/(\d+) dégâts/);
        if (damageMatch && damageMatch[1]) {
          setEnemyLastDamage(parseInt(damageMatch[1]));
          // Reset after a delay
          setTimeout(() => setEnemyLastDamage(null), 2000);
        }
      }
      
      // Check for healing
      if (latestLog.includes('récupérez') || latestLog.includes('PV')) {
        const healMatch = latestLog.match(/(\d+) PV/);
        if (healMatch && healMatch[1]) {
          setPlayerLastHeal(parseInt(healMatch[1]));
          // Reset after a delay
          setTimeout(() => setPlayerLastHeal(null), 2000);
        }
      }
      
      // Check for shield
      if (latestLog.includes('bouclier')) {
        const shieldMatch = latestLog.match(/(\d+) points de bouclier/);
        if (shieldMatch && shieldMatch[1]) {
          setPlayerLastShield(parseInt(shieldMatch[1]));
          // Reset after a delay
          setTimeout(() => setPlayerLastShield(null), 2000);
        }
      }
    }
    
    // Process hand result for enemy damage animation
    if (combatState.handResult && combatState.handResult.totalDamage) {
      setEnemyLastDamage(combatState.handResult.totalDamage);
      // Reset after a delay
      setTimeout(() => setEnemyLastDamage(null), 2000);
    }
  }, [combatState.combatLog, combatState.handResult, enemy?.name]);
  
  // Check for victory or defeat
  useEffect(() => {
    if (player.health <= 0) {
      setBattleStatus('defeat');
    } else if (enemy && enemy.health <= 0) {
      setBattleStatus('victory');
    } else {
      setBattleStatus(null);
    }
  }, [player.health, enemy?.health]);
  
  // Reset selected cards when turn phase changes
  useEffect(() => {
    setSelectedCards([]);
    setIsDiscarding(false);
  }, [combatState.turnPhase]);
  
  // Background and stage effects
  const battlefieldVariants = {
    idle: {
      backgroundPosition: ['0% 0%', '2% 2%', '0% 0%'],
      transition: {
        duration: 6,
        ease: "easeInOut",
        repeat: Infinity,
      }
    },
    victory: {
      backgroundPosition: ['0% 0%', '2% 2%', '0% 0%'],
      filter: "brightness(1.3) saturate(1.2)",
      transition: {
        duration: 1.5,
        ease: "easeOut",
      }
    },
    defeat: {
      backgroundPosition: ['0% 0%', '2% 2%', '0% 0%'],
      filter: "brightness(0.7) saturate(0.5)",
      transition: {
        duration: 1.5,
        ease: "easeOut",
      }
    }
  };

  // Combat action handlers
  const handleDrawCards = () => {
    // Dispatch action to draw cards
    dispatch({ type: 'COMBAT_DRAW_CARDS' });
  };
  
  const handleAttack = () => {
    // Dispatch action to attack with selected cards
    dispatch({ 
      type: 'COMBAT_ATTACK', 
      payload: { cards: selectedCards }
    });
  };
  
  const handleDiscard = () => {
    // Dispatch action to discard selected cards
    dispatch({ 
      type: 'COMBAT_DISCARD_CARDS', 
      payload: { cards: selectedCards }
    });
  };
  
  const handleNextTurn = () => {
    // Dispatch action to move to next turn
    dispatch({ type: 'COMBAT_NEXT_TURN' });
  };
  
  const handleToggleDiscardMode = () => {
    setIsDiscarding(!isDiscarding);
    setSelectedCards([]);
  };
  
  const handleContinue = () => {
    // Handle post-battle continuation
    if (battleStatus === 'victory') {
      dispatch({ type: 'COMBAT_COLLECT_REWARDS' });
    } else {
      dispatch({ type: 'GAME_LOAD_SAVE' });
    }
  };

  return (