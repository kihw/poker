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

  // Path Connection Animation
  const PathConnections = React.memo(({ nodes, nodePositions }) => {
    return nodes.flatMap((node) => {
      if (!node.childIds) return [];
      
      return node.childIds.map((childId) => {
        const startPos = nodePositions[node.id];
        const endPos = nodePositions[childId];

        if (!startPos || !endPos) return null;

        return (
          <motion.line
            key={`${node.id}-${childId}`}
            x1={startPos.x}
            y1={startPos.y}
            x2={endPos.x}
            y2={endPos.y}
            stroke="#4B5563" // Neutral-700
            strokeWidth={2}
            strokeDasharray="5,5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ 
              duration: 1, 
              type: 'spring',
              stiffness: 50 
            }}
          />
        );
      });
    });
  });

  // Implémentation de la logique de positionnement des nœuds
  useEffect(() => {
    if (!nodes || nodes.length === 0) return;

    // Déterminer les niveaux (profondeur) du graphe
    const levels = {};
    nodes.forEach((node) => {
      levels[node.y] = levels[node.y] || [];
      levels[node.y].push(node);
    });

    // Calculer les positions pour chaque nœud
    const positions = {};
    const svgWidth = 1000;
    const svgHeight = 600;
    const paddingX = 100;
    const paddingY = 80;

    // Calculer pour chaque niveau
    const maxLevel = Math.max(...Object.keys(levels).map(Number));
    
    Object.entries(levels).forEach(([level, levelNodes]) => {
      const numNodes = levelNodes.length;
      const availableWidth = svgWidth - (paddingX * 2);
      const nodeSpacing = availableWidth / (numNodes + 1);
      
      // Position Y basée sur le niveau
      const levelY = (parseInt(level) / maxLevel) * (svgHeight - (paddingY * 2)) + paddingY;
      
      // Positionner les nœuds horizontalement
      levelNodes.forEach((node, index) => {
        let xPos = 0;
        
        // Si le nœud a une position X prédéfinie, l'utiliser
        if (node.x !== undefined) {
          xPos = (node.x / 8) * availableWidth + paddingX; // Supposons que la valeur max de x est 8
        } else {
          // Sinon, distribuer uniformément
          xPos = ((index + 1) * nodeSpacing) + paddingX;
        }
        
        positions[node.id] = { x: xPos, y: levelY };
      });
    });

    // Fixer les positions de départ et de fin
    const startNode = nodes.find(n => n.type === 'start');
    const bossNode = nodes.find(n => n.type === 'boss');
    
    if (startNode) {
      positions[startNode.id] = { 
        ...positions[startNode.id],
        x: svgWidth / 2
      };
    }
    
    if (bossNode) {
      positions[bossNode.id] = { 
        ...positions[bossNode.id], 
        x: svgWidth / 2
      };
    }

    // Mettre à jour les positions
    setNodePositions(positions);
  }, [nodes]);

  // Node Selection Handler
  const handleNodeClick = (nodeId) => {
    dispatch(handleNodeSelection(nodeId));
  };

  return (
    <div 
      className="bg-gray-900 rounded-xl p-4 shadow-2xl relative"
      style={{ minHeight: '500px' }}
    >
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
        {/* Path Connections */}
        <PathConnections nodes={nodes} nodePositions={nodePositions} />

        {/* Nodes */}
        <AnimatePresence>
          {Object.entries(nodePositions).map(([nodeId, position]) => {
            const node = nodes.find(n => n.id === nodeId);
            if (!node) return null;

            const style = nodeStyles[node.type] || nodeStyles.combat;
            const isAccessible = currentNodeId 
              ? node.parentIds.includes(currentNodeId)
              : node.type === 'start';

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
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={25}
                  fill={`url(#${node.type}-gradient)`}
                  opacity={isAccessible ? 1 : 0.5}
                />
                <text
                  x={position.x}
                  y={position.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="16"
                >
                  {style.icon}
                </text>
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* Gradient Definitions */}
        <defs>
          {Object.entries(nodeStyles).map(([type, style]) => (
            <linearGradient 
              key={`${type}-gradient`} 
              id={`${type}-gradient`}
              x1="0%" y1="0%" x2="0%" y2="100%"
            >
              <stop offset="0%" stopColor={style.gradient[0]} />
              <stop offset="100%" stopColor={style.gradient[1]} />
            </linearGradient>
          ))}
        </defs>
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