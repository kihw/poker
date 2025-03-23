// src/components/combat/ImprovedCombatInterface.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Import des composants améliorés
import { ImprovedHand } from '../card/ImprovedCard';
import { Button, Card, Badge, ProgressBar, COLORS } from '../ui/DesignSystem';

// Import des actions Redux
import {
  toggleCardSelection,
  dealHand,
  discardCards,
} from '../../redux/slices/combatSlice';
import {
  attackEnemy,
  processCombatVictory,
  processEnemyAttack,
  checkCombatEnd,
} from '../../redux/thunks/combatThunks';
import { setActionFeedback } from '../../redux/slices/uiSlice';
import {
  setGamePhase,
  setTutorialStep,
  completeTutorial,
} from '../../redux/slices/gameSlice';

// Composant pour afficher l'état de l'ennemi
const ImprovedEnemyStatus = ({ name, hp, maxHp, nextAttack, enemyType = 'monster' }) => {
  const percentage = (hp / maxHp) * 100;
  
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
        color: COLORS.danger.main,
        animate: true
      };
    if (hp <= maxHp * 0.5)
      return { 
        text: 'Blessé', 
        color: COLORS.warning.main 
      };
    if (hp <= maxHp * 0.75)
      return { 
        text: 'Légèrement blessé', 
        color: COLORS.warning.light 
      };
    return { 
      text: 'En forme', 
      color: COLORS.success.main 
    };
  };
  
  const healthStatus = getHealthStatus();

  return (
    <Card className="p-4 relative overflow-hidden">
      <motion.div
        className="absolute right-4 top-4 text-3xl"
        initial={{ opacity: 0.7, scale: 0.9 }}
        animate={{
          opacity: [0.7, 1, 0.7],
          scale: [0.9, 1.05, 0.9],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          repeatType: 'mirror',
        }}
      >
        {getEnemyEmoji()}
      </motion.div>

      <h2 className="text-lg font-bold mb-2 pr-10 text-white">Ennemi : {name}</h2>

      <div className="mb-1 flex justify-between items-center">
        <span className="text-gray-300">PV :</span>
        <div className="flex items-center">
          <motion.span 
            className="mr-2"
            style={{ color: healthStatus.color }}
            animate={healthStatus.animate ? { 
              opacity: [1, 0.7, 1],
              scale: [1, 1.05, 1],
            } : {}}
            transition={{ 
              repeat: healthStatus.animate ? Infinity : 0, 
              duration: 1.5 
            }}
          >
            {healthStatus.text}
          </motion.span>
          <span className="text-white">
            {hp} / {maxHp}
          </span>
        </div>
      </div>

      <div className="w-full mb-3 overflow-hidden relative">
        <ProgressBar value={hp} maxValue={maxHp} color="health" height="0.75rem" />
      </div>

      {/* Information d'attaque avec animation de pulsation */}
      {nextAttack && (
        <motion.div
          className="flex items-center bg-red-800 bg-opacity-50 rounded-md px-3 py-2 mt-2"
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
          <span className="text-white">
            Prochaine attaque: <strong>{nextAttack}</strong> dégâts
          </span>
        </motion.div>
      )}
    </Card>
  );
};

// Composant pour afficher l'état du joueur
const ImprovedPlayerStatus = ({ hp, maxHp, gold, xp, level, shield = 0 }) => {
  return (
    <Card className="p-4 text-white">
      <h2 className="text-lg font-bold mb-2 flex items-center">
        <span className="mr-2">👤</span>Joueur (Niveau {level})
      </h2>

      {/* Barre de santé */}
      <div className="mb-1 flex justify-between">
        <span>PV :</span>
        <span
          className={hp < maxHp * 0.3 ? 'text-red-500 font-bold' : 'text-white'}
        >
          {hp} / {maxHp}
        </span>
      </div>
      <div className="mb-3">
        <ProgressBar value={hp} maxValue={maxHp} color="health" />
      </div>

      {/* Barre d'XP */}
      <div className="mb-1 flex justify-between">
        <span>XP :</span>
        <span>{xp} / 100</span>
      </div>
      <div className="mb-3">
        <ProgressBar value={xp} maxValue={100} color="experience" />
      </div>

      {/* Affichage du bouclier s'il est présent */}
      {shield > 0 && (
        <div className="flex items-center mb-2">
          <span className="text-blue-400 mr-2">🛡️</span>
          <span>{shield} points de bouclier</span>
        </div>
      )}

      {/* Or */}
      <div className="flex items-center">
        <span className="text-yellow-400 mr-2">💰</span>
        <span>{gold}</span>
      </div>
    </Card>
  );
};

// Composant pour afficher le résultat d'une combinaison de cartes
const ImprovedHandCombinationDisplay = ({
  handName,
  baseDamage,
  totalDamage = null,
  bonusEffects = [],
  cards = [],
}) => {
  // Map de couleurs basée sur le type de main
  const handColors = {
    'Royal Flush': '#7e22ce',      // purple-700
    'Straight Flush': '#9333ea',   // purple-600
    'Four of a Kind': '#4f46e5',   // indigo-600
    'Full House': '#6366f1',       // indigo-500
    Flush: '#2563eb',              // blue-600
    Straight: '#3b82f6',           // blue-500
    'Three of a Kind': '#16a34a',  // green-600
    'Two Pair': '#22c55e',         // green-500
    Pair: '#f59e0b',               // amber-500
    'High Card': '#6b7280',        // gray-500
    // Pour les attaques avec moins de 5 cartes
    '1 Carte': '#14b8a6',          // teal-500
    '2 Cartes': '#14b8a6',         // teal-500
    '3 Cartes': '#14b8a6',         // teal-500
    '4 Cartes': '#14b8a6',         // teal-500
  };

  // Map bonus descriptions pour l'affichage
  const getBonusDescription = (effect) => {
    if (effect.includes('added')) {
      return effect.replace('added', '→ +');
    }
    if (effect.includes('healed')) {
      return effect.replace('healed', '→ Soigne');
    }
    return effect;
  };

  // Utiliser les dégâts totaux s'ils sont fournis, sinon les dégâts de base
  const displayDamage = totalDamage !== null ? totalDamage : baseDamage;

  // Déterminer si on doit afficher la formule de dégâts
  const showFormula = totalDamage !== null && totalDamage !== baseDamage;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span
            className="inline-block w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: handColors[handName] || '#6b7280' }}
          ></span>
          <h3 className="text-lg font-bold text-white">{handName}</h3>
        </div>
        <div className="flex items-center">
          {showFormula ? (
            <div className="text-right">
              <span className="text-sm text-gray-400">Base: {baseDamage}</span>
              <span className="mx-1 text-gray-400">→</span>
              <span className="text-xl font-bold text-red-500">
                {displayDamage}
              </span>
              <span className="ml-1 text-sm text-gray-400">dégâts</span>
            </div>
          ) : (
            <div>
              <span className="text-xl font-bold text-red-500">
                {displayDamage}
              </span>
              <span className="ml-1 text-sm text-gray-400">dégâts</span>
            </div>
          )}
        </div>
      </div>

      {/* Affichage des cartes utilisées dans l'attaque */}
      {cards && cards.length > 0 && (
        <div className="flex justify-center my-2 flex-wrap gap-1">
          {cards.map((card, index) => (
            <div key={index} className="transform scale-75 origin-center">
              <ImprovedCard
                value={card.value}
                suit={card.suit}
                selectionType="view"
                scale={0.8}
              />
            </div>
          ))}
        </div>
      )}

      {bonusEffects.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <h4 className="text-xs uppercase font-semibold text-gray-400 mb-1">
            Bonus actifs
          </h4>
          <ul className="text-sm">
            {bonusEffects.map((effect, index) => (
              <li key={index} className="text-green-400 flex items-center">
                <span className="mr-1">•</span> {getBonusDescription(effect)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

// Composant pour afficher les cartes bonus
const ImprovedBonusCards = ({ bonusCards = [] }) => {
  const dispatch = useDispatch();

  if (!bonusCards || bonusCards.length === 0) {
    return null;
  }

  // Récupérer la couleur en fonction de la rareté de la carte
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-600 hover:bg-gray-700';
      case 'uncommon':
        return 'bg-green-600 hover:bg-green-700';
      case 'rare':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'epic':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'legendary':
        return 'bg-yellow-600 hover:bg-yellow-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  // Récupérer l'icône en fonction du type d'effet
  const getEffectIcon = (card) => {
    if (card.effect === 'passive') {
      return '🔄'; // Effet passif
    }

    if (!card.bonus) return '🎮'; // Cas par défaut

    switch (card.bonus.type) {
      case 'damage':
        return '⚔️'; // Dégâts
      case 'heal':
        return '❤️'; // Soin
      case 'shield':
        return '🛡️'; // Bouclier
      case 'discard':
        return '🔄'; // Défausse
      case 'invulnerable':
        return '✨'; // Invulnérabilité
      case 'damageMultiplier':
        return '🔥'; // Multiplicateur
      default:
        return '🎮'; // Cas par défaut
    }
  };

  // Gérer l'utilisation d'une carte bonus
  const handleUseBonus = (index) => {
    const card = bonusCards[index];

    // Vérifier si la carte peut être utilisée
    if (
      card.effect !== 'active' ||
      card.usesRemaining <= 0 ||
      card.available === false
    ) {
      dispatch(
        setActionFeedback({
          message: 'Cette carte ne peut pas être utilisée actuellement',
          type: 'warning',
        })
      );
      return;
    }

    // Dispatche l'action pour utiliser la carte
    dispatch({ type: 'bonusCards/useCard', payload: index });

    // Feedback visuel
    dispatch(
      setActionFeedback({
        message: `${card.name} activée`,
        type: 'success',
      })
    );
  };

  return (
    <Card className="p-4">
      <h2 className="font-bold mb-2 text-white">Cartes Bonus</h2>
      <motion.div
        className="flex flex-wrap gap-2"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
      >
        {bonusCards.map((bonus, index) => (
          <motion.button
            key={index}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
            onClick={() => handleUseBonus(index)}
            className={`px-3 py-2 text-xs font-semibold rounded-md text-white
                      transition-all transform ${getRarityColor(bonus.rarity)}
                      ${
                        bonus.available === false ||
                        bonus.usesRemaining <= 0 ||
                        bonus.effect !== 'active'
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:scale-105'
                      }`}
            disabled={
              bonus.available === false ||
              bonus.usesRemaining <= 0 ||
              bonus.effect !== 'active'
            }
            title={bonus.description}
            aria-label={`${bonus.name} - ${bonus.description} - ${bonus.effect === 'active' ? 'Cliquer pour utiliser' : 'Effet passif'}`}
            whileHover={{
              scale:
                bonus.effect === 'active' && bonus.usesRemaining > 0 ? 1.05 : 1,
            }}
            whileTap={{
              scale:
                bonus.effect === 'active' && bonus.usesRemaining > 0 ? 0.95 : 1,
            }}
          >
            <div className="flex items-center">
              <span className="mr-1">{getEffectIcon(bonus)}</span>
              <span>{bonus.name}</span>
              {bonus.effect === 'active' && bonus.uses > 0 && (
                <span className="ml-2 bg-gray-700 px-1 rounded-md">
                  {bonus.usesRemaining}/{bonus.uses}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </motion.div>

      <div className="mt-2 text-xs text-gray-400">
        <p>
          Les effets passifs (🔄) s'activent automatiquement. Cliquez sur les
          effets actifs pour les utiliser.
        </p>
      </div>
    </Card>
  );
};

// Composant principal d'interface de combat
const ImprovedCombatInterface = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const enemy = useSelector((state) => state.combat.enemy);
  const hand = useSelector((state) => state.combat.hand);
  const selectedCards = useSelector((state) => state.combat.selectedCards);
  const turnPhase = useSelector((state) => state.combat.turnPhase);
  const discardLimit = useSelector((state) => state.combat.discardLimit);
  const discardUsed = useSelector((state) => state.combat.discardUsed);
  const handResult = useSelector((state) => state.combat.handResult);
  const combatLog = useSelector((state) => state.combat.combatLog);
  const gamePhase = useSelector((state) => state.game.gamePhase);
  const activeBonusCards = useSelector((state) => state.bonusCards.active);
  const stage = useSelector((state) => state.game.stage);
  const playerGold = useSelector((state) => state.player.gold);
  const playerHealth = useSelector((state) => state.player.health);
  const playerMaxHealth = useSelector((state) => state.player.maxHealth);
  const playerShield = useSelector((state) => state.player.shield);
  const tutorialStep = useSelector((state) => state.game.tutorialStep);
  const playerExperience = useSelector((state) => state.player.experience);
  const playerLevel = useSelector((state) => state.player.level);

  // États locaux pour les animations
  const [showDamageEffect, setShowDamageEffect] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isProcessingContinue, setIsProcessingContinue] = useState(false);

  // Vérifier si le tutoriel a déjà été vu
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('tutorialCompleted');
    setShowTutorial(!tutorialCompleted);
  }, []);

  // Détecter les changements d'état qui déclenchent des animations
  useEffect(() => {
    if (turnPhase === 'result' && enemy && enemy.health > 0) {
      // Animation de dégâts
      setShowDamageEffect(true);
      setTimeout(() => setShowDamageEffect(false), 700);
    }
  }, [turnPhase, enemy]);

  // Détection automatique de victoire
  useEffect(() => {
    if (
      enemy &&
      enemy.health <= 0 &&
      gamePhase === 'combat' &&
      turnPhase === 'result' &&
      !isProcessingContinue
    ) {
      const victoryTimer = setTimeout(() => {
        handleContinue();
      }, 1500);

      return () => clearTimeout(victoryTimer);
    }
  }, [enemy?.health, gamePhase, turnPhase, isProcessingContinue]);

  // Préparer les cartes à afficher selon le mode
  const getDisplayCards = () => {
    if (!hand) return [];

    return hand.map((card, idx) => ({
      ...card,
      isSelected: turnPhase === 'result' ? card.isSelected : selectedCards.includes(idx),
    }));
  };

  // Handler pour les actions sur les cartes
  const handleCardAction = (index) => {
    // Mode attaque normal
    const currentSelectedCount = selectedCards.length;
    if (currentSelectedCount >= 5 && !selectedCards.includes(index)) {
      dispatch(
        setActionFeedback({
          message: 'Vous ne pouvez sélectionner que 5 cartes maximum',
          type: 'warning',
        })
      );
      return;
    }
    dispatch(toggleCardSelection(index));
  };

  // Lancer l'attaque
  const handleAttack = () => {
    if (selectedCards.length === 0 || selectedCards.length > 5) {
      dispatch(
        setActionFeedback({
          message: 'Sélectionnez 1 à 5 cartes pour attaquer',
          type: 'warning',
        })
      );
      return;
    }

    // Utiliser attackEnemy qui gère l'attaque du joueur
    dispatch(attackEnemy())
      .unwrap()
      .then((result) => {
        // Vérifier si l'ennemi est encore en vie APRÈS l'attaque du joueur
        if (enemy && enemy.health > 0) {
          // Utiliser processEnemyAttack pour gérer l'attaque de l'ennemi et les dégâts au joueur
          dispatch(processEnemyAttack());
        }

        // Vérifier si le combat est terminé
        dispatch(checkCombatEnd());
      })
      .catch((error) => {
        console.error("Erreur lors de l'attaque:", error);
      });
  };

  // Défausser les cartes sélectionnées
  const handleDiscard = () => {
    if (selectedCards.length === 0) {
      dispatch(
        setActionFeedback({
          message: 'Sélectionnez des cartes à défausser',
          type: 'warning',
        })
      );
      return;
    }

    if (selectedCards.length > discardLimit) {
      dispatch(
        setActionFeedback({
          message: `Vous ne pouvez défausser que ${discardLimit} cartes`,
          type: 'warning',
        })
      );
      return;
    }

    if (discardUsed) {
      dispatch(
        setActionFeedback({
          message: 'Vous avez déjà utilisé la défausse ce tour',
          type: 'warning',
        })
      );
      return;
    }

    // Défausser directement les cartes sélectionnées
    dispatch(discardCards(selectedCards));
  };

  // Gérer la continuation après un combat
  const handleContinue = () => {
    if (isProcessingContinue) {
      return;
    }

    setIsProcessingContinue(true);

    try {
      if (enemy && enemy.health <= 0) {
        // Process victory
        dispatch(processCombatVictory())
          .unwrap()
          .then(() => {
            dispatch(setGamePhase('exploration'));
            setTimeout(() => navigate('/map'), 300);
          })
          .finally(() => {
            setTimeout(() => {
              setIsProcessingContinue(false);
            }, 1000);
          });
      } else {
        if (!window._dealHandLock) {
          window._dealHandLock = true;
          dispatch(dealHand());

          setTimeout(() => {
            window._dealHandLock = false;
            setIsProcessingContinue(false);
          }, 500);
        } else {
          setIsProcessingContinue(false);
        }
      }
    } catch (error) {
      console.error('Erreur dans handleContinue:', error);
      setIsProcessingContinue(false);
    }
  };

  // Messages d'interface conditionnels
  const getInterfaceMessage = () => {
    if (turnPhase === 'draw') {
      return 'Préparation du combat...';
    }
    if (turnPhase === 'select') {
      return "Sélectionnez 1 à 5 cartes pour attaquer l'ennemi";
    }
    if (turnPhase === 'result') {
      return enemy?.health <= 0
        ? 'Victoire ! Cliquez sur Continuer'
        : 'Regardez les résultats de votre attaque';
    }
    return '';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-900 rounded-xl shadow-2xl relative overflow-hidden">
      {/* Effet de dommages */}
      <AnimatePresence>
        {showDamageEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-600 pointer-events-none z-50"
            style={{ mixBlendMode: 'overlay' }}
          />
        )}
      </AnimatePresence>

      {/* En-tête de combat */}
      <div className="mb-6 text-center relative">
        <h2 className="text-2xl font-bold text-white">
          Niveau {stage} - {gamePhase === 'combat' ? 'Combat' : 'Récompense'}
        </h2>
        <div className="absolute right-0 top-0 bg-yellow-600 text-black font-bold px-3 py-1 rounded-full text-sm">
          {playerGold} <span className="text-xs">or</span>
        </div>
      </div>

      {/* Message d'interface */}
      <div className="text-center mb-4 text-white text-lg">
        {getInterfaceMessage()}
      </div>

      {/* Zone ennemie */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-4"
      >
        {enemy && (
          <ImprovedEnemyStatus
            name={enemy.name}
            hp={enemy.health}
            maxHp={enemy.maxHealth}
            nextAttack={enemy.attack}
          />
        )}
      </motion.div>

      {/* Journal de combat */}
      <div className="bg-gray-800 rounded-md p-3 max-h-32 overflow-y-auto mb-6 text-sm">
        <h3 className="text-gray-400 uppercase text-xs font-bold mb-2">
          Journal de combat
        </h3>
        {combatLog &&
          combatLog.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={`mb-1 pb-1 ${index !== combatLog.length - 1 ? 'border-b border-gray-700' : ''}`}
            >
              {entry}
            </motion.div>
          ))}
      </div>

      {/* Zone des cartes bonus */}
      <div className="mb-6">
        <ImprovedBonusCards bonusCards={activeBonusCards} />
      </div>

      {/* Résultat de la main (si disponible) */}
      {turnPhase === 'result' && handResult && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6"
        >
          <ImprovedHandCombinationDisplay
            handName={handResult.handName}
            baseDamage={handResult.baseDamage}
            totalDamage={handResult.totalDamage}
            bonusEffects={handResult.bonusEffects}
            cards={handResult.cards}
          />
        </motion.div>
      )}

      {/* Main du joueur */}
      <div className="mb-6">
        {hand && hand.length > 0 && (
          <>
            <div className="combat-hand">
              <ImprovedHand
                cards={getDisplayCards()}
                onToggleSelect={handleCardAction}
                maxSelectable={5}
                selectionMode={turnPhase === 'select' ? 'attack' : 'view'}
              />
            </div>
            {/* Actions de combat - Boutons d'attaque et de défausse */}
            {turnPhase === 'select' && (
              <div className="flex justify-center space-x-6 mt-6">
                <Button
                  variant={selectedCards.length > 0 && selectedCards.length <= 5 ? 'danger' : 'outline'}
                  size="lg"
                  onClick={handleAttack}
                  disabled={selectedCards.length === 0 || selectedCards.length > 5}
                >
                  Attaquer ({selectedCards.length})
                </Button>

                <Button
                  variant={!discardUsed && selectedCards.length > 0 && selectedCards.length <= discardLimit ? 'warning' : 'outline'}
                  size="lg"
                  onClick={handleDiscard}
                  disabled={selectedCards.length === 0 || selectedCards.length > discardLimit || discardUsed}
                >
                  Défausser ({selectedCards.length}/{discardLimit})
                </Button>
              </div>
            )}
            {/* Bouton Continuer */}
            {turnPhase === 'result' && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="success"
                  size="lg"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleContinue();
                  }}
                >
                  Continuer
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions du joueur */}
      <div className="flex justify-between items-center mb-6">
        <ImprovedPlayerStatus
          hp={playerHealth}
          maxHp={playerMaxHealth}
          gold={playerGold}
          xp={playerExperience || 0}
          level={playerLevel}
          shield={playerShield}
        />
      </div>
    </Card>
  );
};

export default ImprovedCombatInterface;