// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useGame } from './context/GameContext';

// Import pages
import GamePage from './pages/GamePage';
import ShopPage from './pages/ShopPage';
import MapPage from './pages/MapPage';
import CollectionPage from './pages/CollectionPage';
import EventPage from './pages/EventPage';
import RestPage from './pages/RestPage';
import LoadingScreen from './components/ui/LoadingScreen';
import ErrorScreen from './components/ui/ErrorScreen';

// Import du bouton de sauvegarde
import SaveButton from './components/ui/SaveButton';

function App() {
  const { gameState, loading, error } = useGame();

  // Debug logging
  useEffect(() => {
    console.log('App Component - GameState:', gameState);
    console.log('Loading:', loading);
    console.log('Error:', error);
  }, [gameState, loading, error]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  return (
    <>
      {/* Bouton de sauvegarde présent sur toutes les pages */}
      <SaveButton />

      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/event" element={<EventPage />} />
        <Route path="/rest" element={<RestPage />} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
