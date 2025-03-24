// src/components/map/RoguelikeWorldMap.jsx - Fixed rendering issues
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { handleNodeSelection } from '../../redux/thunks/mapThunks';
import { setActionFeedback } from '../../redux/slices/uiSlice';

// Node style configuration
const nodeStyles = {
  start: {
    fill: '#3B82F6',
    stroke: '#1E40AF',
    icon: '🏁',
    textColor: 'white',
    description: 'Your journey begins here',
  },
  combat: {
    fill: '#EF4444',
    stroke: '#B91C1C',
    icon: '⚔️',
    textColor: 'white',
    description: 'Standard enemy encounter',
  },
  elite: {
    fill: '#8B5CF6',
    stroke: '#6D28D9',
    icon: '🛡️',
    textColor: 'white',
    description: 'Challenging elite enemy',
  },
  boss: {
    fill: '#F59E0B',
    stroke: '#B45309',
    icon: '👑',
    textColor: 'white',
    description: 'Boss battle awaits!',
  },
  shop: {
    fill: '#10B981',
    stroke: '#047857',
    icon: '🛒',
    textColor: 'white',
    description: 'Buy items and upgrades',
  },
  rest: {
    fill: '#6366F1',
    stroke: '#4338CA',
    icon: '🏕️',
    textColor: 'white',
    description: 'Recover and heal',
  },
  event: {
    fill: '#EC4899',
    stroke: '#BE185D',
    icon: '❗',
    textColor: 'white',
    description: 'Random event encounter',
  },
};

const RoguelikeWorldMap = ({
  currentFloor = 1,
  maxFloors = 10,
  nodes = [],
  currentNodeId,
  playerStats = {},
}) => {
  const dispatch = useDispatch();
  const svgRef = useRef(null);
  // Use useMemo for node positions calculation
  const nodePositions = useMemo(() => {
    if (!nodes || nodes.length === 0) return {};

    console.log('Calculating node positions for', nodes.length, 'nodes');

    // Get max depth and width for scaling
    const maxDepth = Math.max(...nodes.map((node) => node.y)) || 1;
    const maxWidth = Math.max(...nodes.map((node) => node.x)) || 1;

    // Scale factors
    const width = mapSize.width;
    const height = mapSize.height;
    const horizontalScale = width / (maxWidth + 1);
    const verticalScale = height / (maxDepth + 1);

    // Calculate positions
    const positions = {};
    nodes.forEach((node) => {
      const x = (node.x + 0.5) * horizontalScale;
      const y = (node.y + 0.5) * verticalScale;
      positions[node.id] = { x, y };
    });

    console.log('Node positions calculated:', Object.keys(positions).length);
    return positions;
  }, [nodes, mapSize]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [mapSize, setMapSize] = useState({ width: 1000, height: 600 });

  // Check if exploration is enabled
  const exploreEnabled = useSelector((state) => state.game.exploreEnabled !== false);
  const gamePhase = useSelector((state) => state.game.gamePhase);

  // Calculate node positions
  useEffect(() => {
    if (!nodes || nodes.length === 0) return;

    console.log('Calculating node positions for', nodes.length, 'nodes');

    // Get max depth and width for scaling
    const maxDepth = Math.max(...nodes.map((node) => node.y)) || 1;
    const maxWidth = Math.max(...nodes.map((node) => node.x)) || 1;

    // Scale factors
    const width = mapSize.width;
    const height = mapSize.height;
    const horizontalScale = width / (maxWidth + 1);
    const verticalScale = height / (maxDepth + 1);

    // Calculate positions
    const positions = {};
    nodes.forEach((node) => {
      const x = (node.x + 0.5) * horizontalScale;
      const y = (node.y + 0.5) * verticalScale;
      positions[node.id] = { x, y };
    });

    console.log('Node positions calculated:', Object.keys(positions).length);
    setNodePositions(positions);
  }, [nodes, mapSize]);

  // Handle node selection
  const handleNodeClick = (nodeId) => {
    // Verify if exploration is enabled
    if (!exploreEnabled) {
      dispatch(
        setActionFeedback({
          message: 'Navigation bloquée pendant le combat',
          type: 'warning',
        })
      );
      return;
    }

    console.log('Node clicked:', nodeId);
    dispatch(handleNodeSelection(nodeId));
  };

  // Draw path connections
  const renderConnections = useMemo(() => {
    const connections = [];

    // Draw connections between nodes
    nodes.forEach((node) => {
      if (node.childIds && node.childIds.length > 0 && nodePositions[node.id]) {
        const startPos = nodePositions[node.id];

        node.childIds.forEach((childId) => {
          if (nodePositions[childId]) {
            const endPos = nodePositions[childId];

            // Create a unique key for this connection
            const key = `${node.id}-${childId}`;

            connections.push(
              <path
                key={key}
                d={`M ${startPos.x} ${startPos.y} L ${endPos.x} ${endPos.y}`}
                stroke="#4B5563"
                strokeWidth={2}
                strokeDasharray={currentNodeId && node.id === currentNodeId ? 'none' : '5,5'}
                opacity={0.7}
              />
            );
          }
        });
      }
    });

    return connections;
  }, [nodes, nodePositions, currentNodeId]);

  // Render tooltip
  const renderTooltip = () => {
    if (!hoveredNode) return null;

    const position = nodePositions[hoveredNode.id];
    if (!position) return null;

    const style = nodeStyles[hoveredNode.type] || nodeStyles.combat;

    return (
      <foreignObject x={position.x + 20} y={position.y - 20} width={200} height={100}>
        <div className="bg-gray-800 text-white p-3 rounded-lg shadow-xl">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-2">{style.icon}</span>
            <h3 className="font-bold capitalize">{hoveredNode.type}</h3>
          </div>
          <p className="text-sm text-gray-300">{style.description}</p>
        </div>
      </foreignObject>
    );
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 shadow-2xl relative">
      {/* Show warning overlay if navigation is blocked */}
      {!exploreEnabled && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-xl">
          <div className="text-white text-xl bg-red-600 p-4 rounded-lg">
            Navigation bloquée pendant le combat
          </div>
        </div>
      )}

      {/* Map header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">
          Floor {currentFloor}/{maxFloors}
        </h2>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <span className="mr-2">❤️</span>
            <span className="text-white">
              {playerStats.health}/{playerStats.maxHealth}
            </span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">💰</span>
            <span className="text-white">{playerStats.gold}</span>
          </div>
        </div>
      </div>

      {/* SVG Map */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${mapSize.width} ${mapSize.height}`}
        className="w-full h-full bg-gray-800 rounded-lg"
        style={{ minHeight: '400px' }}
      >
        {/* Draw connections between nodes */}
        {renderConnections}

        {/* Draw nodes */}
        {Object.entries(nodePositions).map(([nodeId, position]) => {
          const node = nodes.find((n) => n.id === nodeId);
          if (!node) return null;

          const style = nodeStyles[node.type] || nodeStyles.combat;

          // Check if node is accessible
          const isAccessible =
            exploreEnabled &&
            (currentNodeId ? node.parentIds.includes(currentNodeId) : node.type === 'start');

          // Check if this is current node
          const isCurrent = node.id === currentNodeId;

          return (
            <g
              key={nodeId}
              onClick={() => handleNodeClick(nodeId)}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: isAccessible ? 'pointer' : 'not-allowed' }}
            >
              {/* Node circle */}
              <circle
                cx={position.x}
                cy={position.y}
                r={isCurrent ? 25 : 20}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={isCurrent ? 4 : 2}
                opacity={isAccessible || isCurrent ? 1 : 0.5}
              />

              {/* Node icon */}
              <text
                x={position.x}
                y={position.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={18}
                fill={style.textColor}
              >
                {style.icon}
              </text>

              {/* Current node indicator */}
              {isCurrent && (
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={30}
                  fill="none"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  opacity={0.7}
                  strokeDasharray="4,4"
                >
                  <animate
                    attributeName="r"
                    from="30"
                    to="35"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.7"
                    to="0.3"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}

        {/* Tooltip */}
        {hoveredNode && renderTooltip()}
      </svg>

      {/* Map legend */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center text-gray-300 text-sm">
        <span className="flex items-center">
          <span className="mr-1">⚔️</span> Combat
        </span>
        <span className="flex items-center">
          <span className="mr-1">🛡️</span> Elite
        </span>
        <span className="flex items-center">
          <span className="mr-1">👑</span> Boss
        </span>
        <span className="flex items-center">
          <span className="mr-1">🛒</span> Shop
        </span>
        <span className="flex items-center">
          <span className="mr-1">🏕️</span> Rest
        </span>
        <span className="flex items-center">
          <span className="mr-1">❗</span> Event
        </span>
      </div>
    </div>
  );
};

export default React.memo(RoguelikeWorldMap);
