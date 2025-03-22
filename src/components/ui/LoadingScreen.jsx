// src/components/ui/LoadingScreen.jsx
import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-xl">Chargement du jeu...</p>
    </div>
  );
};

export default LoadingScreen;
