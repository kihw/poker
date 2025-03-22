// src/pages/EventPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import EventEncounter from '../components/event/EventEncounter';
import { useGame } from '../context/GameContext';

const EventPage = () => {
  const { gameState } = useGame();
  const navigate = useNavigate();

  // Handle event close/completion
  const handleEventComplete = () => {
    navigate('/map');
  };

  if (!gameState?.currentEvent) {
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
      <EventEncounter
        event={gameState.currentEvent}
        onClose={handleEventComplete}
      />
    </div>
  );
};

export default EventPage;
