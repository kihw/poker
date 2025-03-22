// src/pages/EventPage.jsx - Migré vers Redux
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setGamePhase } from '../redux/slices/gameSlice';
import EventEncounter from '../components/event/EventEncounter';

const EventPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Sélecteur pour l'événement actuel
  const currentEvent = useSelector((state) => state.game.currentEvent);

  // Handle event close/completion
  const handleEventComplete = () => {
    // Retourner à la phase d'exploration après l'événement
    dispatch(setGamePhase('exploration'));
    navigate('/map');
  };

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">Aucun événement en cours</h2>
          <p>Retournez à la carte pour continuer votre aventure</p>
          <button
            onClick={() => navigate('/map')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
          >
            Retour à la carte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <EventEncounter event={currentEvent} onClose={handleEventComplete} />
    </div>
  );
};

export default EventPage;
