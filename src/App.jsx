// src/App.jsx - Migration Redux complétée - Correctifs d'affichage
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

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

// Import for Redux initialization
import { initCollection } from './redux/slices/bonusCardsSlice';
import { generateNewMap } from './redux/thunks/mapThunks';
import { loadGame } from './redux/thunks/saveThunks';

// Optionally import the debug component
// import { injectColorDebug } from './components/debug/ColorDebugComponent';

function App() {
  const dispatch = useDispatch();

  // Redux state
  const loading = useSelector((state) => state.ui.loading);
  const error = useSelector((state) => state.ui.error);

  // Initialize app on first load
  useEffect(() => {
    const initializeApp = async () => {
      // Check if a save exists
      const savedGame = localStorage.getItem('pokerSoloRpgSave');

      if (savedGame) {
        // Load existing game
        await dispatch(loadGame());
      } else {
        // Initialize a new game
        dispatch(initCollection());
        await dispatch(generateNewMap({}));
      }
    };

    initializeApp();
  }, [dispatch]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <GameManager>
        {/* Bouton de sauvegarde présent sur toutes les pages */}
        <SaveButton />

        {/* Debug color component - uncomment to test colors 
        {injectColorDebug()} */}

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
    </div>
  );
}

export default App;
