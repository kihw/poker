// src/components/map/RoguelikeWorldMap.jsx - Migré vers Redux
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { handleNodeSelection } from '../../redux/thunks/mapThunks';
import { setActionFeedback } from '../../redux/slices/uiSlice';

const RoguelikeWorldMap = ({
  currentFloor,
  maxFloors,
  nodes = [], // Valeur par défaut pour éviter les erreurs
  currentNodeId,
  playerStats = {}, // Valeur par défaut pour éviter les erreurs
}) => {
  const dispatch = useDispatch();
  const svgRef = useRef(null);
  const [nodePositions, setNodePositions] = useState({});
  const [hoveredNode, setHoveredNode] = useState(null);

  // S'assurer que nodes est un tableau valide
  const safeNodes = Array.isArray(nodes) ? nodes : [];

  // Icons for each node type
  const nodeIcons = {
    start: '🏁',
    combat: '⚔️',
    elite: '🛡️',
    boss: '👑',
    shop: '🛒',
    rest: '🏕️',
    event: '❗',
  };

  // Colors for each node type
  const nodeColors = {
    start: 'from-blue-700 to-blue-900',
    combat: 'from-red-700 to-red-900',
    elite: 'from-purple-700 to-purple-900',
    boss: 'from-red-800 to-red-950',
    shop: 'from-green-700 to-green-900',
    rest: 'from-blue-700 to-blue-900',
    event: 'from-yellow-700 to-yellow-900',
  };

  // Organize nodes by levels using useMemo for better performance
  const nodesByLevels = useMemo(() => {
    const levels = {};

    // Place first node (start) at level 0
    const startNode = safeNodes.find(
      (node) => !node.parentIds || node.parentIds.length === 0
    );
    if (startNode) {
      levels[0] = [startNode.id];
    }

    // Recursive function to assign a level to each node
    const assignLevel = (nodeId, level) => {
      const node = safeNodes.find((n) => n.id === nodeId);
      if (!node || !node.childIds) return;

      node.childIds.forEach((childId) => {
        // Create level if it doesn't exist yet
        if (!levels[level]) {
          levels[level] = [];
        }

        // Add child node to corresponding level if not already there
        if (!levels[level].includes(childId)) {
          levels[level].push(childId);

          // Recursively assign levels to children
          assignLevel(childId, level + 1);
        }
      });
    };

    // Start with the start node
    if (startNode) {
      assignLevel(startNode.id, 1);
    }

    return levels;
  }, [safeNodes]);

  // Calculate node positions
  useEffect(() => {
    if (!svgRef.current || safeNodes.length === 0) return;

    const svgWidth = svgRef.current.clientWidth || 1000; // Valeur par défaut si clientWidth est 0
    const svgHeight = svgRef.current.clientHeight || 600; // Valeur par défaut si clientHeight est 0

    // Height of each level
    const levelCount = Object.keys(nodesByLevels).length || 1;
    const levelHeight = svgHeight / levelCount;

    // Calculate positions for each node
    const positions = {};

    Object.entries(nodesByLevels).forEach(([level, nodeIds]) => {
      const numNodes = nodeIds.length;
      const nodeSpacing = svgWidth / (numNodes + 1);

      nodeIds.forEach((nodeId, index) => {
        positions[nodeId] = {
          x: nodeSpacing * (index + 1),
          y: levelHeight * parseInt(level) + 50,
        };
      });
    });

    setNodePositions(positions);

    // Force redraw du SVG si nécessaire
    const svg = svgRef.current;
    if (svg) {
      // Trick pour forcer le redraw
      svg.style.display = 'none';
      // Utiliser requestAnimationFrame pour s'assurer que le changement précédent est appliqué
      requestAnimationFrame(() => {
        svg.style.display = 'block';
      });
    }
  }, [safeNodes, nodesByLevels]);

  // Check if a node is accessible
  const isNodeAccessible = (nodeId) => {
    // If no current node is selected (game just started),
    // only the start node is accessible
    if (!currentNodeId) {
      const startNode = safeNodes.find(
        (node) =>
          node.type === 'start' ||
          !node.parentIds ||
          node.parentIds.length === 0
      );
      return startNode && startNode.id === nodeId;
    }

    // Find the current node
    const currentNode = safeNodes.find((node) => node.id === currentNodeId);

    // A node is accessible if it's a child of the current node
    return (
      currentNode &&
      currentNode.childIds &&
      currentNode.childIds.includes(nodeId)
    );
  };

  // Generate connection lines between nodes
  const generateConnections = () => {
    if (Object.keys(nodePositions).length === 0) return null;

    return safeNodes.map((node) => {
      if (!node || !node.childIds || node.childIds.length === 0) return null;

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
            stroke={node.id === currentNodeId ? '#fcd34d' : '#4b5563'}
            strokeWidth={node.id === currentNodeId ? 3 : 2}
            strokeDasharray={node.id === currentNodeId ? 'none' : '5,5'}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1 }}
          />
        );
      });
    });
  };

  // Display node details on hover
  const NodeTooltip = ({ node, position }) => {
    if (!node || !position) return null;

    return (
      <motion.div
        className="absolute z-20 bg-gray-900 text-white rounded-md shadow-lg p-3 w-56"
        style={{
          left: position.x + 20,
          top: position.y - 30,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="font-bold text-md mb-1">
          {node.name ||
            `${node.type?.charAt(0).toUpperCase() + node.type?.slice(1) || 'Node'}`}
        </div>
        <div className="text-sm mb-2">{getNodeDescription(node.type)}</div>

        {node.rewards && (
          <div className="text-xs text-gray-300">
            <span className="font-semibold">Récompenses possibles :</span>
            <ul className="list-disc list-inside mt-1">
              {node.rewards.map((reward, idx) => (
                <li key={idx}>{reward}</li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    );
  };

  // Get a description for each node type
  const getNodeDescription = (type) => {
    switch (type) {
      case 'start':
        return 'Point de départ de votre aventure';
      case 'combat':
        return 'Combat contre un ennemi standard';
      case 'elite':
        return "Combat difficile contre un ennemi d'élite";
      case 'boss':
        return 'Affrontez le boss de cet étage';
      case 'shop':
        return 'Achetez des objets et améliorez votre deck';
      case 'rest':
        return 'Récupérez vos PV ou améliorez une carte bonus';
      case 'event':
        return 'Un événement aléatoire avec des choix à faire';
      default:
        return 'Nœud inconnu';
    }
  };

  // Handle node selection via Redux
  const handleNodeClick = (nodeId) => {
    if (!isNodeAccessible(nodeId) && nodeId !== currentNodeId) {
      // Afficher un message si le nœud n'est pas accessible
      dispatch(
        setActionFeedback({
          message:
            "Ce lieu n'est pas accessible depuis votre position actuelle",
          type: 'warning',
        })
      );
      return;
    }

    // Feedback visuel immédiat
    if (nodeId !== currentNodeId) {
      // Ajout d'un feedback visuel
      const nodeElement = document.getElementById(`node-${nodeId}`);
      if (nodeElement) {
        nodeElement.classList.add('node-flash');
        setTimeout(() => {
          nodeElement.classList.remove('node-flash');
        }, 300);
      }
    }

    // Appel de la fonction Redux pour sélectionner le nœud
    dispatch(handleNodeSelection(nodeId));
  };

  if (!safeNodes || safeNodes.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-4 shadow-xl w-full max-w-4xl mx-auto text-center text-gray-400 py-12">
        Aucune carte disponible pour le moment
      </div>
    );
  }

  // S'assurer que playerStats contient les propriétés nécessaires
  const safePlayerStats = {
    health: playerStats.health || 0,
    maxHealth: playerStats.maxHealth || 1,
    gold: playerStats.gold || 0,
    ...playerStats,
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 shadow-xl w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">
          Carte de l'étage {currentFloor || 1}/{maxFloors || 10}
        </h2>

        <div className="flex space-x-4">
          <div className="flex items-center text-white">
            <span className="text-red-500 mr-1">❤️</span>
            <span>
              {safePlayerStats.health}/{safePlayerStats.maxHealth}
            </span>
          </div>
          <div className="flex items-center text-white">
            <span className="text-yellow-500 mr-1">💰</span>
            <span>{safePlayerStats.gold}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-2 mb-4 text-sm text-gray-300">
        <p>
          Cliquez sur un nœud accessible pour vous y déplacer. Chaque nœud
          représente une rencontre différente.
        </p>
      </div>

      <div className="relative h-96 w-full">
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox="0 0 1000 600"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Connection lines */}
          {generateConnections()}

          {/* Nodes */}
          {Object.entries(nodePositions).map(([nodeId, position]) => {
            const node = safeNodes.find((n) => n.id === nodeId);
            if (!node) return null;

            const isAccessible = isNodeAccessible(nodeId);
            const isCurrent = nodeId === currentNodeId;
            const nodeType = node.type || 'unknown';

            return (
              <motion.g
                key={nodeId}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(nodeId)}
                className={`cursor-${isAccessible || nodeId === currentNodeId ? 'pointer' : 'not-allowed'}`}
                whileHover={{ scale: 1.1 }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                {/* Main node circle */}
                <circle
                  id={`node-${nodeId}`}
                  cx={position.x}
                  cy={position.y}
                  r={25}
                  className={`${
                    isCurrent ? 'stroke-yellow-400 stroke-[3px]' : 'stroke-none'
                  } ${isAccessible && !isCurrent ? 'animate-pulse' : ''}`}
                  opacity={isAccessible || isCurrent ? 1 : 0.5}
                  fill={`url(#gradient-${nodeType})`}
                />

                {/* Node text/icon */}
                <text
                  x={position.x}
                  y={position.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="16"
                  fill="white"
                  fontWeight="bold"
                >
                  {nodeIcons[nodeType] || '?'}
                </text>

                {/* Node label */}
                <text
                  x={position.x}
                  y={position.y + 40}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fill="white"
                >
                  {nodeType
                    ? nodeType.charAt(0).toUpperCase() + nodeType.slice(1)
                    : 'Node'}
                </text>
              </motion.g>
            );
          })}

          {/* Define gradients for node types */}
          <defs>
            {Object.entries(nodeColors).map(([type, gradient]) => {
              const [fromClass, toClass] = gradient.split(' ');
              const fromColor = fromClass.replace('from-', '');
              const toColor = toClass.replace('to-', '');

              // Ces valeurs sont simplifiées pour la démo - il faudrait les remplacer par les vraies couleurs Tailwind
              const colorMap = {
                'blue-700': '#1d4ed8',
                'blue-900': '#1e3a8a',
                'red-700': '#b91c1c',
                'red-900': '#7f1d1d',
                'red-950': '#450a0a',
                'purple-700': '#7e22ce',
                'purple-900': '#581c87',
                'green-700': '#15803d',
                'green-900': '#14532d',
                'yellow-700': '#a16207',
                'yellow-900': '#713f12',
              };

              const startColor = colorMap[fromColor] || '#374151';
              const endColor = colorMap[toColor] || '#111827';

              return (
                <linearGradient
                  key={`gradient-${type}`}
                  id={`gradient-${type}`}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={startColor} />
                  <stop offset="100%" stopColor={endColor} />
                </linearGradient>
              );
            })}
          </defs>
        </svg>

        {/* Hover tooltip */}
        {hoveredNode && (
          <NodeTooltip
            node={hoveredNode}
            position={nodePositions[hoveredNode.id]}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4 pt-3 border-t border-gray-700">
        {Object.entries(nodeIcons).map(([type, icon]) => {
          const nodeColor = nodeColors[type] || nodeColors.combat;

          return (
            <div key={type} className="flex items-center">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center mr-1"
                style={{ backgroundColor: nodeColor.background }}
              >
                <span className="text-xs">{icon}</span>
              </div>
              <span className="ml-2 text-sm text-white capitalize">{type}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(RoguelikeWorldMap);
