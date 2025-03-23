// src/components/combat/CombatInterface.jsx - Design System Optimized
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

// Performance Utilities
import { 
  usePerformanceMemo, 
  performanceDebounce 
} from '../../utils/performance';

// Component Imports
import Hand from '../card/Card';
import BonusCards from '../card/BonusCards';
import EnemyStatus from './EnemyStatus';
import HandCombinationDisplay from './HandCombinationDisplay';

// Redux Actions and Thunks
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

  // Memoized Selectors for Performance
  const enemy = usePerformanceMemo(
    () => useSelector(state => state.combat.enemy),
    []
  );
  const hand = usePerformanceMemo(
    () => useSelector(state => state.combat.hand),
    []
  );
  const selectedCards = usePerformanceMemo(
    () => useSelector(state => state.combat.selectedCards),
    []
  );
  const turnPhase = usePerformanceMemo(
    () => useSelector(state => state.combat.turnPhase),
    []
  );
  const handResult = usePerformanceMemo(
    () => useSelector(state => state.combat.handResult),
    []
  );
  const activeBonusCards = usePerformanceMemo(
    () => useSelector(state => state.bonusCards.active),
    []
  );

  // Performance-aware Callbacks
  const handleCardSelection = useCallback(
    performanceDebounce((index) => {
      dispatch(toggleCardSelection(index));
    }, 100),
    [dispatch]
  );

  const handleAttack = useCallback(
    performanceDebounce(async () => {
      await dispatch(attackEnemy());
      await dispatch(processEnemyAttack());
      await dispatch(checkCombatEnd());
    }, 200),
    [dispatch]
  );

  // Determine best hand cards memoized
  const bestHandCards = useMemo(() => {
    if (!handResult) return [];
    return handResult.cards.map(card => hand.indexOf(card));
  }, [handResult, hand]);

  // Rendering variants for animations
  const interfaceAnimations = {
    ...AnimationPresets.fadeIn,
    transition: { 
      duration: 0.5, 
      type: 'spring',
      stiffness: 100 
    }
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto p-4 bg-gray-900 rounded-xl shadow-2xl"
      {...interfaceAnimations}
    >
      {/* Enemy Section */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <EnemyStatus 
          name={enemy?.name} 
          hp={enemy?.health} 
          maxHp={enemy?.maxHealth} 
          nextAttack={enemy?.attack} 
        />
      </motion.div>

      {/* Hand and Combat Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hand Section */}
        <Card variant="elevated" className="p-4">
          <Hand 
            cards={hand} 
            onToggleSelect={handleCardSelection}
            bestHandCards={bestHandCards}
            maxSelectable={5}
          />
          
          {/* Attack and Discard Controls */}
          <div className="flex justify-between mt-4">
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
          </div>
        </Card>

        {/* Hand Result and Bonus Cards */}
        <div className="space-y-4">
          {handResult && (
            <HandCombinationDisplay
              handName={handResult.handName}
              baseDamage={handResult.baseDamage}
              totalDamage={handResult.totalDamage}
              bonusEffects={handResult.bonusEffects}
              cards={handResult.cards}
            />
          )}

          <BonusCards />
        </div>
      </div>
    </motion.div>
  );
});

export default CombatInterface;
