// src/App.jsx - Migration Redux complétée
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Import pages
import GamePage from './pages/GamePage';
import ShopPage from './pages/ShopPage';
import MapPage from './pages/MapPage';
import CollectionPage from './pages/CollectionPage';
import EventPage from './pages/EventPage';
import RestPage from './pages/RestPage';

// Import components
import GameManager from './components/core/GameManager';
import LoadingScreen from './components/ui/LoadingScreen';
import ErrorScreen from './components/ui/ErrorScreen';
import SaveButton from './components/ui/SaveButton';

function App() {
  // Redux state
  const loading = useSelector((state) => state.ui.loading);
  const error = useSelector((state) => state.ui.error);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  return (
    <GameManager>
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
    </GameManager>
  );
}

export default App;
