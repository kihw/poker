// src/App.jsx - Migré vers Redux
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectGamePhase,
  selectIsGameOver,
} from './redux/selectors/gameSelectors';
import { selectPlayerHealth } from './redux/selectors/playerSelectors';
import { setLoading, setError } from './redux/slices/uiSlice';

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
  // Redux state
  const gamePhase = useSelector(selectGamePhase);
  const isGameOver = useSelector(selectIsGameOver);
  const loading = useSelector((state) => state.ui.loading);
  const error = useSelector((state) => state.ui.error);
  const playerHealth = useSelector(selectPlayerHealth); // Pour vérifier si le joueur est en vie

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('App Component - GamePhase:', gamePhase);
    console.log('Loading:', loading);
    console.log('Error:', error);
  }, [gamePhase, loading, error]);

  // Rediriger vers la carte si le jeu démarre en mode exploration
  useEffect(() => {
    if (gamePhase === 'exploration') {
      navigate('/map');
    } else if (gamePhase === 'gameOver' || isGameOver) {
      // Rediriger vers la page principale en cas de game over
      navigate('/');
    }
  }, [gamePhase, isGameOver, navigate]);

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
