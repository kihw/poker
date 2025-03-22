// src/components/ui/Navigation.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGame } from '../../context/gameHooks';

const Navigation = () => {
  const location = useLocation();
  const { gameState } = useGame();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-2 flex justify-center space-x-2 z-50">
      <Link
        to="/"
        className={`px-3 py-1 rounded-md text-sm ${
          location.pathname === '/'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-gray-300'
        }`}
      >
        Combat
      </Link>
      <Link
        to="/map"
        className={`px-3 py-1 rounded-md text-sm ${
          location.pathname === '/map'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-gray-300'
        }`}
      >
        Carte
      </Link>
      <Link
        to="/collection"
        className={`px-3 py-1 rounded-md text-sm ${
          location.pathname === '/collection'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-gray-300'
        }`}
      >
        Collection
      </Link>
      <div className="flex items-center text-xs text-gray-400 ml-2">
        <span className="mr-2">Niveau {gameState?.stage || 1}</span>
        <span>{gameState?.player?.gold || 0} Or</span>
      </div>
    </div>
  );
};

export default Navigation;
