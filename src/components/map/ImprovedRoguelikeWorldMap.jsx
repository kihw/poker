// src/components/map/ImprovedRoguelikeMap.jsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from '../ui/DesignSystem';

const ImprovedRoguelikeMap = ({
  currentFloor,
  maxFloors,
  nodes = [],
  currentNodeId,
  playerStats = {},
  onNodeSelect,
}) => {
  const svgRef = useRef(null);
  const [nodePositions, setNodePositions] = useState({});
  const [hoveredNode, setHoveredNode] = useState(null);
  const [mapSize, setMapSize] = useState({ width: 1000, height: 600 });

  // S'assurer que nodes est un tableau valide
  const safeNodes = Array.isArray(nodes) ? nodes : [];

  // Icônes pour chaque type de nœud
  const nodeIcons = {
    start: '🏁',
    combat: '⚔️',
    elite: '🛡️',
    boss: '👑',
    shop: '🛒',
    rest: '🏕️',
    event: '❗',
  };

  // Couleurs pour chaque type de nœud
  const nodeColors = {
    start: {
      background: '#1d4ed8', // COLORS.primary.dark
      border: '#3b82f6', // COLORS.primary.light
      glow: 'rgba(59, 130, 246, 0.5)', // blue glow
    },
    combat: {
      background: '#b91c1c', // red-700
      border: '#ef4444', // red-500
      glow: 'rgba(239, 68, 68, 0.5)', // red glow
    },
    elite: {
      background: '#7e22ce', // purple-700
      border: '#a855f7', // purple-500
      glow: 'rgba(168, 85, 247, 0.5)', // purple glow
    },
    boss: {
      background: '#991b1b', // red-800
      border: '#ef4444', // red-500
      glow: 'rgba(239, 68, 68, 0.6)', // stronger red glow
    },
    shop: {
      background: '#15803d', // green-700
      border: '#22c55e', // green-500
      glow: 'rgba(34, 197, 94, 0.5)', // green glow
    },
    rest: {
      background: '#1d4ed8', // blue-700
      border: '#3b82f6', // blue-500
      glow: 'rgba(59, 130, 246, 0.5)', // blue glow
    },
    event: {
      background: '#a16207', // yellow-700
      border: '#facc15', // yellow-400
      glow: 'rgba(250, 204, 21, 0.5)', // yellow glow
    },
  };

  // Organiser les nœuds par niveaux pour un meilleur placement
  const nodesByLevels = useMemo(() => {
    const levels = {};

    // Placer le premier nœud (départ) au niveau 0
    const startNode = safeNodes.find(
      (node) => !node.parentIds || node.parentIds.length === 0
    );
    if (startNode) {
      levels[0] = [startNode.id];
    }

    // Fonction récursive pour assigner un niveau à chaque nœud
    const assignLevel = (nodeId, level) => {
      const node = safeNodes.find((n) => n.id === nodeId);
      if (!node || !node.childIds) return;

      node.childIds.forEach((childId) => {
        // Créer le niveau s'il n'existe pas encore
        if (!levels[level]) {
          levels[level] = [];
        }

        // Ajouter le nœud enfant au niveau correspondant s'il n'est pas déjà présent
        if (!levels[level].includes(childId)) {
          levels[level].push(childId);

          // Assigner récursivement des niveaux aux enfants
          assignLevel(childId, level + 1);
        }
      });
    };

    // Commencer par le nœud de départ
    if (startNode) {
      assignLevel(startNode.id, 1);
    }

    return levels;
  }, [safeNodes]);

  // Calculer les positions des nœuds
  useEffect(() => {
    if (!svgRef.current || safeNodes.length === 0) return;

    // Obtenir les dimensions réelles du conteneur SVG
    const svgRect = svgRef.current.getBoundingClientRect();
    const svgWidth = svgRect.width || 1000;
    const svgHeight = svgRect.height || 600;

    setMapSize({ width: svgWidth, height: svgHeight });

    // Hauteur de chaque niveau
    const levelCount = Object.keys(nodesByLevels).length || 1;
    const levelHeight = svgHeight / levelCount;

    // Calculer les positions pour chaque nœud
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
  }, [safeNodes, nodesByLevels]);

  // Vérifier si un nœud est accessible
  const isNodeAccessible = (nodeId) => {
    // Si aucun nœud courant n'est sélectionné (début de jeu),
    // seul le nœud de départ est accessible
    if (!currentNodeId) {
      const startNode = safeNodes.find(
        (node) =>
          node.type === 'start' ||
          !node.parentIds ||
          node.parentIds.length === 0
      );
      return startNode && startNode.id === nodeId;
    }

    // Trouver le nœud courant
    const currentNode = safeNodes.find((node) => node.id === currentNodeId);

    // Un nœud est accessible s'il est un enfant du nœud actuel
    return (
      currentNode &&
      currentNode.childIds &&
      currentNode.childIds.includes(nodeId)
    );
  };

  // Générer les connexions entre les nœuds
  const generateConnections = () => {
    if (Object.keys(nodePositions).length === 0) return null;

    return safeNodes.map((node) => {
      if (!node || !node.childIds || node.childIds.length === 0) return null;

      return node.childIds.map((childId) => {
        const startPos = nodePositions[node.id];
        const endPos = nodePositions[childId];

        if (!startPos || !endPos) return null;

        const isActive = node.id === currentNodeId && isNodeAccessible(childId);

        return (
          <motion.path
            key={`${node.id}-${childId}`}
            d={`M ${startPos.x} ${startPos.y} L ${endPos.x} ${endPos.y}`}
            stroke={isActive ? '#fcd34d' : '#4b5563'}
            strokeWidth={isActive ? 3 : 2}
            strokeDasharray={isActive ? 'none' : '5,5'}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: 1,
              strokeWidth: isActive ? [2, 3, 2] : 2,
            }}
            transition={{
              duration: 1,
              strokeWidth: {
                repeat: isActive ? Infinity : 0,
                duration: 1.5,
              },
            }}
          />
        );
      });
    });
  };

  // Obtenir une description pour chaque type de nœud
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

  // Composant pour afficher une info-bulle au survol d'un nœud
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

  // Gérer le clic sur un nœud
  const handleNodeClick = (nodeId) => {
    if (onNodeSelect && isNodeAccessible(nodeId)) {
      onNodeSelect(nodeId);
    }
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
              {playerStats.health}/{playerStats.maxHealth}
            </span>
          </div>
          <div className="flex items-center text-white">
            <span className="text-yellow-500 mr-1">💰</span>
            <span>{playerStats.gold}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-3 mb-4 text-sm text-gray-300">
        <p>
          Cliquez sur un nœud accessible pour vous y déplacer. Chaque nœud
          représente une rencontre différente.
        </p>
      </div>

      <div className="relative h-96 w-full">
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox={`0 0 ${mapSize.width} ${mapSize.height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Lignes de connexion */}
          {generateConnections()}

          {/* Nœuds */}
          {Object.entries(nodePositions).map(([nodeId, position]) => {
            const node = safeNodes.find((n) => n.id === nodeId);
            if (!node) return null;

            const isAccessible = isNodeAccessible(nodeId);
            const isCurrent = nodeId === currentNodeId;
            const nodeType = node.type || 'unknown';
            const nodeColor = nodeColors[nodeType] || nodeColors.combat;

            return (
              <g
                key={nodeId}
                onClick={() => handleNodeClick(nodeId)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{
                  cursor: isAccessible || isCurrent ? 'pointer' : 'not-allowed',
                }}
              >
                {/* Cercle de fond avec glow pour les nœuds accessibles */}
                {(isAccessible || isCurrent) && (
                  <motion.circle
                    cx={position.x}
                    cy={position.y}
                    r={30}
                    fill="none"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0.3, 0.7, 0.3],
                      r: [25, 30, 25],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                    }}
                    style={{
                      filter: `drop-shadow(0 0 5px ${nodeColor.glow})`,
                      stroke: nodeColor.border,
                      strokeWidth: 1,
                    }}
                  />
                )}

                {/* Cercle principal du nœud */}
                <motion.circle
                  id={`node-${nodeId}`}
                  cx={position.x}
                  cy={position.y}
                  r={22}
                  fill={nodeColor.background}
                  stroke={isCurrent ? '#fcd34d' : nodeColor.border}
                  strokeWidth={isCurrent ? 3 : 1.5}
                  opacity={isAccessible || isCurrent ? 1 : 0.5}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: isAccessible || isCurrent ? 1 : 0.5,
                    strokeWidth: isCurrent ? [2, 3, 2] : 1.5,
                  }}
                  transition={{
                    type: 'spring',
                    duration: 0.5,
                    strokeWidth: {
                      repeat: isCurrent ? Infinity : 0,
                      duration: 1.5,
                    },
                  }}
                  whileHover={{
                    scale: isAccessible || isCurrent ? 1.1 : 1,
                    transition: { duration: 0.2 },
                  }}
                />

                {/* Icône du nœud */}
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

                {/* Étiquette du nœud */}
                <motion.text
                  x={position.x}
                  y={position.y + 36}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  fill="white"
                  opacity={0.8}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ delay: 0.3 }}
                >
                  {nodeType
                    ? nodeType.charAt(0).toUpperCase() + nodeType.slice(1)
                    : 'Node'}
                </motion.text>
              </g>
            );
          })}
        </svg>

        {/* Info-bulle au survol */}
        <AnimatePresence>
          {hoveredNode && (
            <NodeTooltip
              node={hoveredNode}
              position={nodePositions[hoveredNode.id]}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Légende */}
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
              <span className="text-sm text-white capitalize">{type}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImprovedRoguelikeMap;
