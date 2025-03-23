// src/components/combat/CombatInterface.jsx - Amélioration de l'UI

import React, { useCallback, useMemo, useState } from 'react';
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
  Icons,
} from '../ui/DesignSystem';

// Component Imports
import Hand from '../card/Hand';
import BonusCards from '../card/BonusCards';
import EnemyStatus from './EnemyStatus';
import HandCombinationDisplay from './HandCombinationDisplay';
import CombatLog from './CombatLog';

// Redux Actions
import {
  toggleCardSelection,
  dealHand,
  discardCards,
  toggleDiscardMode,
} from '../../redux/slices/combatSlice';
import { attackEnemy, processEnemyAttack, checkCombatEnd } from '../../redux/thunks/combatThunks';

const CombatInterface = React.memo(() => {
  const dispatch = useDispatch();

  // Selectors and Performance Optimization
  const enemy = useSelector((state) => state.combat.enemy);
  const hand = useSelector((state) => state.combat.hand);
  const selectedCards = useSelector((state) => state.combat.selectedCards);
  const turnPhase = useSelector((state) => state.combat.turnPhase);
  const handResult = useSelector((state) => state.combat.handResult);
  const activeBonusCards = useSelector((state) => state.bonusCards.active);
  const discardLimit = useSelector((state) => state.combat.discardLimit);
  const discardUsed = useSelector((state) => state.combat.discardUsed);
  const discardMode = useSelector((state) => state.combat.discardMode);

  // Card Selection Handler
  const handleCardSelection = useCallback(
    (index) => {
      dispatch(toggleCardSelection(index));
    },
    [dispatch]
  );

  // Attack Handler
  const handleAttack = useCallback(async () => {
    await dispatch(attackEnemy());
    await dispatch(processEnemyAttack());
    await dispatch(checkCombatEnd());
  }, [dispatch]);

  // Discard Handler
  const handleDiscard = useCallback(() => {
    if (selectedCards.length > 0) {
      dispatch(discardCards(selectedCards));
    }
  }, [dispatch, selectedCards]);

  // Toggle Discard Mode Handler
  const handleToggleDiscardMode = useCallback(() => {
    dispatch(toggleDiscardMode());
  }, [dispatch]);

  // Best Hand Cards Memoization
  const bestHandCards = useMemo(() => {
    return handResult ? handResult.cards.map((card) => hand.indexOf(card)) : [];
  }, [handResult, hand]);

  // Ajout d'un log pour debugger
  console.log('État de la main actuelle:', {
    handLength: hand?.length || 0,
    enemyName: enemy?.name,
    phase: turnPhase,
    discardMode,
    discardUsed,
    selectedCards: selectedCards.length,
  });

  return (
    <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-900 rounded-xl">
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
          {/* Vérification que hand existe et a des cartes */}
          {hand && hand.length > 0 ? (
            <Hand
              cards={hand}
              onToggleSelect={handleCardSelection}
              bestHandCards={bestHandCards}
              maxSelectable={discardMode ? Math.min(discardLimit, 2) : 5}
              selectionMode={discardMode ? 'discard' : 'attack'}
            />
          ) : (
            <div className="py-6 text-center text-gray-400">Aucune carte disponible</div>
          )}

          {/* Attack and Discard Controls with Motion */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-between mt-4"
          >
            {/* Mode de défausse */}
            {discardMode ? (
              <>
                <Tooltip
                  content={`Défaussez jusqu'à ${Math.min(discardLimit, 2)} cartes et piochez-en autant`}
                >
                  <Button
                    variant="danger"
                    onClick={handleDiscard}
                    disabled={selectedCards.length === 0}
                  >
                    <span className="mr-2">🔄</span> Défausser {selectedCards.length} carte(s)
                  </Button>
                </Tooltip>
                <Button variant="outline" onClick={handleToggleDiscardMode}>
                  Annuler la défausse
                </Button>
              </>
            ) : (
              <>
                <Tooltip content="Attack with selected cards">
                  <Button
                    variant="primary"
                    onClick={handleAttack}
                    disabled={selectedCards.length === 0}
                  >
                    <span className="mr-2">⚔️</span> Attack
                  </Button>
                </Tooltip>
                <Tooltip
                  content={
                    discardUsed
                      ? 'Vous avez déjà défaussé ce tour'
                      : `Défaussez jusqu'à ${Math.min(discardLimit, 2)} cartes`
                  }
                >
                  <Button
                    variant="outline"
                    onClick={handleToggleDiscardMode}
                    disabled={discardUsed}
                  >
                    {discardUsed ? 'Défausse utilisée' : 'Défausser des cartes'}
                  </Button>
                </Tooltip>
              </>
            )}
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
