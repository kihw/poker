// src/components/combat/CombatInterface.jsx - Design System Enhanced
import React, { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

// Design System Imports
import { 
  Button, 
  Card, 
  Badge, 
  Tooltip,
  DESIGN_TOKENS,
  AnimationPresets,
  Icons 
} from '../ui/DesignSystem';

// Component Imports
import Hand from '../card/Card';
import BonusCards from '../card/BonusCards';
import EnemyStatus from './EnemyStatus';
import HandCombinationDisplay from './HandCombinationDisplay';
import CombatLog from './CombatLog';

// Redux Actions
import { 
  toggleCardSelection, 
  dealHand, 
  discardCards 
} from '../../redux/slices/combatSlice';
import { 
  attackEnemy, 
  processEnemyAttack, 
  checkCombatEnd 
} from '../../redux/thunks/combatThunks';

const CombatInterface = React.memo(() => {
  const dispatch = useDispatch();

  // Selectors and Performance Optimization
  const enemy = useSelector(state => state.combat.enemy);
  const hand = useSelector(state => state.combat.hand);
  const selectedCards = useSelector(state => state.combat.selectedCards);
  const turnPhase = useSelector(state => state.combat.turnPhase);
  const handResult = useSelector(state => state.combat.handResult);
  const activeBonusCards = useSelector(state => state.bonusCards.active);

  // Card Selection Handler
  const handleCardSelection = useCallback((index) => {
    dispatch(toggleCardSelection(index));
  }, [dispatch]);

  // Attack Handler
  const handleAttack = useCallback(async () => {
    await dispatch(attackEnemy());
    await dispatch(processEnemyAttack());
    await dispatch(checkCombatEnd());
  }, [dispatch]);

  // Best Hand Cards Memoization
  const bestHandCards = useMemo(() => {
    return handResult ? handResult.cards.map(card => hand.indexOf(card)) : [];
  }, [handResult, hand]);

  // Advanced Animations
  const combatAnimations = {
    initial: { opacity: 0, y: 50 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring', 
        stiffness: 100,
        damping: 10 
      }
    },
    exit: { 
      opacity: 0, 
      y: 50,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      {...combatAnimations}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-900 rounded-xl"
    >
      {/* Enemy Section */}
      <div className="md:col-span-2">
        <EnemyStatus 
          name={enemy?.name} 
          hp={enemy?.health} 
          maxHp={enemy?.maxHealth} 
          nextAttack={enemy?.attack} 
        />
      </div>

      {/* Combat Log Section */}
      <div className="md:col-span-1 md:row-span-2">
        <CombatLog />
      </div>

      {/* Combat Hand Section */}
      <div className="md:col-span-2">
        <Card variant="elevated" className="p-4">
          <Hand 
            cards={hand} 
            onToggleSelect={handleCardSelection}
            bestHandCards={bestHandCards}
            maxSelectable={5}
          />
          
          {/* Attack and Discard Controls with Motion */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-between mt-4"
          >
            <Tooltip content="Attack with selected cards">
              <Button 
                variant="primary" 
                onClick={handleAttack}
                disabled={selectedCards.length === 0}
              >
                {Icons.combat} Attack
              </Button>
            </Tooltip>
            <Tooltip content="Discard selected cards">
              <Button 
                variant="outline"
                onClick={() => dispatch(discardCards(selectedCards))}
              >
                Discard Selected
              </Button>
            </Tooltip>
          </motion.div>
        </Card>
      </div>

      {/* Hand Result and Bonus Cards Section */}
      <div className="md:col-span-2 space-y-4">
        <AnimatePresence>
          {handResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <HandCombinationDisplay
                handName={handResult.handName}
                baseDamage={handResult.baseDamage}
                totalDamage={handResult.totalDamage}
                bonusEffects={handResult.bonusEffects}
                cards={handResult.cards}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <BonusCards />
      </div>
    </motion.div>
  );
});

export default CombatInterface;