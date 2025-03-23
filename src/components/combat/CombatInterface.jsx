// src/components/combat/CombatInterface.jsx - Optimized with Design System
import React, { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

// Design System Imports
import { 
  Button, 
  Card, 
  Badge, 
  ProgressBar, 
  Tooltip,
  DESIGN_TOKENS,
  Icons 
} from '../ui/DesignSystem';

// Component Imports
import Hand from '../card/Hand';
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

const CombatInterface = () => {
  const dispatch = useDispatch();

  // Memoized Selectors for Performance
  const enemy = useSelector(state => state.combat.enemy);
  const hand = useSelector(state => state.combat.hand);
  const selectedCards = useSelector(state => state.combat.selectedCards);
  const turnPhase = useSelector(state => state.combat.turnPhase);
  const handResult = useSelector(state => state.combat.handResult);
  const activeBonusCards = useSelector(state => state.bonusCards.active);

  // Memoized Callbacks for Performance
  const handleCardSelection = useCallback((index) => {
    dispatch(toggleCardSelection(index));
  }, [dispatch]);

  const handleAttack = useCallback(async () => {
    await dispatch(attackEnemy());
    await dispatch(processEnemyAttack());
    await dispatch(checkCombatEnd());
  }, [dispatch]);

  // Determine best hand cards memoized
  const bestHandCards = useMemo(() => {
    if (!handResult) return [];
    return handResult.cards.map(card => hand.indexOf(card));
  }, [handResult, hand]);

  // Animations
  const combatAnimations = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto p-4 bg-gray-900 rounded-xl shadow-2xl"
      {...combatAnimations}
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
            <Button 
              variant="primary" 
              onClick={handleAttack}
              disabled={selectedCards.length === 0}
            >
              Attack
            </Button>
            <Button 
              variant="outline"
              onClick={() => dispatch(discardCards(selectedCards))}
            >
              Discard Selected
            </Button>
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
};

export default React.memo(CombatInterface);
