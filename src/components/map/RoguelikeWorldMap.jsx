// src/components/map/RoguelikeWorldMap.jsx - Enhanced Design System Integration
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { handleNodeSelection } from '../../redux/thunks/mapThunks';
import { setActionFeedback } from '../../redux/slices/uiSlice';
import { 
  DESIGN_TOKENS, 
  Tooltip, 
  Badge, 
  Icons 
} from '../ui/DesignSystem';

const RoguelikeWorldMap = ({
  currentFloor,
  maxFloors,
  nodes = [], 
  currentNodeId,
  playerStats = {}, 
}) => {
  const dispatch = useDispatch();
  const svgRef = useRef(null);
  const [nodePositions, setNodePositions] = useState({});
  const [hoveredNode, setHoveredNode] = useState(null);

  // Vérifier si la navigation est bloquée
  const exploreEnabled = useSelector((state) => state.game.exploreEnabled);
  const gamePhase = useSelector((state) => state.game.gamePhase);

  // Enhanced Node Styling
  const nodeStyles = {
    start: { 
      gradient: ['#3B82F6', '#1E40AF'], // Blue gradient
      icon: '🏁',
      description: 'Your journey begins here'
    },
    combat: { 
      gradient: ['#EF4444', '#B91C1C'], // Red gradient
      icon: '⚔️',
      description: 'Standard enemy encounter'
    },
    elite: { 
      gradient: ['#8B5CF6', '#6D28D9'], // Purple gradient
      icon: '🛡️', 
      description: 'Challenging elite enemy'
    },
    boss: { 
      gradient: ['#F59E0B', '#B45309'], // Amber gradient
      icon: '👑',
      description: 'Boss battle awaits!'
    },
    shop: { 
      gradient: ['#10B981', '#047857'], // Green gradient
      icon: '🛒',
      description: 'Buy items and upgrades'
    },
    rest: { 
      gradient: ['#6366F1', '#4338CA'], // Indigo gradient
      icon: '🏕️',
      description: 'Recover and heal'
    },
    event: { 
      gradient: ['#EC4899', '#BE185D'], // Pink gradient
      icon: '❗',
      description: 'Random event encounter'
    }
  };

  // Enhanced Tooltips with Motion
  const TooltipContent = ({ node }) => {
    const style = nodeStyles[node.type];
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-gray-800 text-white p-3 rounded-lg shadow-xl"
      >
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-2">{style.icon}</span>
          <h3 className="font-bold capitalize">{node.type}</h3>
        </div>
        <p className="text-sm text-gray-300">{style.description}</p>
        {node.rewards && (
          <div className="mt-2">
            <Badge variant="warning" size="sm">Possible Rewards</Badge>
            <ul className="text-xs text-gray-400 mt-1">
              {node.rewards.map((reward, idx) => (
                <li key={idx}>{reward}</li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    );
  };

  // Implémenter la logique de sélection de nœud avec des restrictions
  const handleNodeClick = (nodeId) => {
    // Vérifier si l'exploration est bloquée
    if (!exploreEnabled) {
      dispatch(
        setActionFeedback({
          message: 'Navigation bloquée pendant le combat',
          type: 'warning',
        })
      );
      return;
    }

    dispatch(handleNodeSelection(nodeId));
  };

  // Reste du code de RoguelikeWorldMap inchangé...

  return (
    <div 
      className="bg-gray-900 rounded-xl p-4 shadow-2xl relative"
      style={{ minHeight: '500px' }}
    >
      {/* Si la navigation est bloquée, afficher un overlay */}
      {!exploreEnabled && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-xl bg-red-600 p-4 rounded-lg">
            Navigation bloquée pendant le combat
          </div>
        </div>
      )}

      {/* Code existant de la carte */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">
          Floor {currentFloor}/{maxFloors}
        </h2>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <Icons.health className="mr-2" />
            <span>{playerStats.health}/{playerStats.maxHealth}</span>
          </div>
          <div className="flex items-center">
            <Icons.gold className="mr-2" />
            <span>{playerStats.gold}</span>
          </div>
        </div>
      </div>

      <svg 
        ref={svgRef}
        viewBox="0 0 1000 600"
        className="w-full h-full"
      >
        {/* Nodes rendering with considering exploreEnabled */}
        <AnimatePresence>
          {Object.entries(nodePositions).map(([nodeId, position]) => {
            const node = nodes.find(n => n.id === nodeId);
            if (!node) return null;

            const style = nodeStyles[node.type] || nodeStyles.combat;
            const isAccessible = 
              exploreEnabled && 
              (currentNodeId 
                ? node.parentIds.includes(currentNodeId)
                : node.type === 'start');

            return (
              <motion.g
                key={nodeId}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: isAccessible ? 1 : 0.5, 
                  scale: 1 
                }}
                whileHover={{ scale: 1.1 }}
                onHoverStart={() => setHoveredNode(node)}
                onHoverEnd={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(nodeId)}
                className={`cursor-${isAccessible ? 'pointer' : 'not-allowed'}`}
              >
                {/* Existing node rendering code */}
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* Existing SVG definitions and other elements */}
      </svg>

      {/* Tooltip Overlay */}
      <AnimatePresence>
        {hoveredNode && (
          <Tooltip 
            content={<TooltipContent node={hoveredNode} />}
            className="absolute z-50"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(RoguelikeWorldMap);
