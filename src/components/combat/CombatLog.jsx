// src/components/combat/CombatLog.jsx - Enhanced Design System Combat Log
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { 
  Card, 
  DESIGN_TOKENS, 
  Icons 
} from '../ui/DesignSystem';

const CombatLogEntry = React.memo(({ entry, index }) => {
  // Determine the icon and color based on the entry type
  const getEntryStyle = (entry) => {
    if (entry.includes('dégâts')) return { icon: '⚔️', color: DESIGN_TOKENS.colors.danger.main };
    if (entry.includes('récupéré')) return { icon: '❤️', color: DESIGN_TOKENS.colors.success.main };
    if (entry.includes('Carte bonus')) return { icon: '🃏', color: DESIGN_TOKENS.colors.secondary.main };
    return { icon: 'ℹ️', color: DESIGN_TOKENS.colors.neutral[500] };
  };

  const { icon, color } = getEntryStyle(entry);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.1 
      }}
      className="flex items-center space-x-2 py-2 border-b border-gray-700 last:border-b-0"
    >
      <div 
        className="w-8 h-8 flex items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}20` }}
      >
        <span>{icon}</span>
      </div>
      <span 
        className="text-sm flex-grow"
        style={{ color: DESIGN_TOKENS.colors.neutral[300] }}
      >
        {entry}
      </span>
    </motion.div>
  );
});

const CombatLog = () => {
  const combatLog = useSelector((state) => state.combat.combatLog || []);

  // Limit the number of entries and reverse to show most recent first
  const visibleEntries = useMemo(() => {
    return combatLog.slice(0, 10).reverse();
  }, [combatLog]);

  return (
    <Card 
      variant="elevated" 
      className="h-full overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold flex items-center">
          <Icons.combat className="mr-2" />
          Journal de Combat
        </h3>
        <span className="text-sm text-gray-400">
          {visibleEntries.length} entrées
        </span>
      </div>

      <div className="max-h-64 overflow-y-auto p-2">
        <AnimatePresence>
          {visibleEntries.length > 0 ? (
            visibleEntries.map((entry, index) => (
              <CombatLogEntry 
                key={`${entry}-${index}`} 
                entry={entry} 
                index={index} 
              />
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              Aucune entrée dans le journal
            </div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default React.memo(CombatLog);