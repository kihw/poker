// src/components/combat/CombatInterface.jsx - Avec procédure d'enchaînement
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
import PlayerStatus from './PlayerStatus';

// Redux Actions
import {
  toggleCardSelection,
  dealHand,
  discardCards,
  toggleDiscardMode,
  setTurnPhase,
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
  const player = useSelector((state) => state.player);

  // Card Selection Handler
  const handleCardSelection = useCallback(
    (index) => {
      dispatch(toggleCardSelection(index));
    },
    [dispatch]
  );

  // Attack Handler - Enchaînement après attaque
  const handleAttack = useCallback(async () => {
    if (selectedCards.length === 0) return;

    // Effectuer l'attaque
    await dispatch(attackEnemy());

    // Faire attaquer l'ennemi
    if (enemy && enemy.health > 0) {
      await dispatch(processEnemyAttack());
    }

    // Vérifier la fin du combat
    const result = await dispatch(checkCombatEnd()).unwrap();

    // Si le combat n'est pas terminé, passer en phase "result"
    if (result.status === 'ongoing') {
      dispatch(setTurnPhase('result'));
    }
  }, [dispatch, selectedCards, enemy]);

  // Fonction pour passer à la main suivante
  const handleNextHand = useCallback(() => {
    dispatch(dealHand());
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

  // Log pour débogage
  console.log('État du combat:', {
    handLength: hand?.length || 0,
    enemyName: enemy?.name,
    phase: turnPhase,
    discardMode,
    discardUsed,
    selectedCards: selectedCards.length,
    playerHealth: player.health,
    playerMaxHealth: player.maxHealth,
  });

  return (
    <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-900 rounded-xl">
      {/* Section Ennemie */}
      <div className="md:col-span-2">
        <EnemyStatus
          name={enemy?.name}
          hp={enemy?.health}
          maxHp={enemy?.maxHealth}
          nextAttack={enemy?.attack}
        />
      </div>

      {/* Section Journal de Combat */}
      <div className="md:col-span-1 md:row-span-2">
        <CombatLog />
      </div>

      {/* Section Main de Combat */}
      <div className="md:col-span-2">
        <Card variant="elevated" className="p-4">
          {/* Phase d'affichage */}
          {turnPhase === 'result' ? (
            <div className="py-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 p-4 rounded-lg mb-4"
              >
                <h3 className="text-lg font-bold text-white mb-2">
                  {enemy && enemy.health <= 0
                    ? "Victoire! L'ennemi est vaincu!"
                    : 'Vous avez infligé des dégâts!'}
                </h3>
                {handResult && (
                  <p className="text-gray-300">
                    Votre {handResult.handName} a infligé {handResult.totalDamage} points de dégâts.
                  </p>
                )}
              </motion.div>

              <Button variant="primary" size="lg" onClick={handleNextHand} className="px-8 py-3">
                Continuer →
              </Button>
            </div>
          ) : (
            /* Phase de jeu normal */
            <>
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
                        <span className="mr-2">⚔️</span> Attaquer
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
            </>
          )}
        </Card>
      </div>

      {/* Section Résultat de main et Cartes Bonus */}
      <div className="md:col-span-2 space-y-4">
        <AnimatePresence>
          {handResult && turnPhase !== 'result' && (
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

      {/* Section pour le statut du joueur */}
      <div className="md:col-span-3 mt-4">
        <PlayerStatus
          hp={player.health}
          maxHp={player.maxHealth}
          gold={player.gold}
          xp={player.experience || 0}
          level={player.level || 1}
        />
      </div>
    </motion.div>
  );
});

export default CombatInterface;
