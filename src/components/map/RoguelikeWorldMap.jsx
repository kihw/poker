// src/components/map/RoguelikeWorldMap.jsx - Optimized and Enhanced Version
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from '../ui/DesignSystem';

const RoguelikeWorldMap = ({
  currentFloor,
  maxFloors,
  nodes = [],
  currentNodeId,
  playerStats = {},
  onNodeSelect,
}) => {
  // ... [previous code remains the same] ...

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
