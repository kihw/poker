// src/pages/EventPage.jsx - Version corrigée
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setGamePhase } from '../redux/slices/gameSlice';
import {
  completeEvent,
  makeEventChoice,
  generateNewEvent,
} from '../redux/thunks/eventThunks';
import EventEncounter from '../components/event/EventEncounter';
import Navigation from '../components/ui/Navigation';
import { setActionFeedback } from '../redux/slices/uiSlice';

const EventPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Sélecteurs pour l'état de l'événement actuel
  const currentEvent = useSelector((state) => state.event.currentEvent);
  const gamePhase = useSelector((state) => state.game.gamePhase);
  const isLoading = useSelector((state) => state.event.loading);

  // Générer un événement aléatoire si nécessaire
  useEffect(() => {
    // Vérifier que nous sommes bien en phase 'event'
    if (gamePhase === 'event' && !currentEvent && !isLoading) {
      console.log("Génération d'un nouvel événement");
      dispatch(generateNewEvent())
        .unwrap()
        .then((event) => {
          if (!event) {
            // En cas d'échec de génération, revenir à la carte
            console.log("Échec de génération d'événement, retour à la carte");
            dispatch(
              setActionFeedback({
                message: 'Impossible de générer un événement',
                type: 'error',
              })
            );
            dispatch(setGamePhase('exploration'));
            navigate('/map');
          }
        })
        .catch((error) => {
          console.error("Erreur lors de la génération d'événement:", error);
          dispatch(setGamePhase('exploration'));
          navigate('/map');
        });
    }
  }, [currentEvent, gamePhase, dispatch, navigate, isLoading]);

  // Vérifier si on doit être sur cette page
  useEffect(() => {
    if (gamePhase !== 'event' && !isLoading) {
      navigate('/map');
    }
  }, [gamePhase, navigate, isLoading]);

  // Gérer le choix de l'utilisateur dans l'événement
  const handleEventChoice = (choiceIndex) => {
    if (!currentEvent) {
      console.error('Tentative de faire un choix sans événement actif');
      dispatch(
        setActionFeedback({
          message: "Pas d'événement actif",
          type: 'error',
        })
      );
      return;
    }

    dispatch(makeEventChoice({ choiceIndex }))
      .unwrap()
      .catch((error) => {
        console.error('Erreur lors du traitement du choix:', error);
        dispatch(
          setActionFeedback({
            message: 'Erreur lors du traitement du choix',
            type: 'error',
          })
        );
      });
  };

  // Gérer la fin de l'événement
  const handleEventComplete = () => {
    dispatch(completeEvent());
    navigate('/map');
  };

  // Gérer le retour forcé à la carte (bouton d'échappement)
  const handleForceBackToMap = () => {
    dispatch(setGamePhase('exploration'));
    navigate('/map');
  };

  // Afficher un écran de chargement si nécessaire
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-white text-xl">Chargement de l'événement...</div>
      </div>
    );
  }

  // Si aucun événement n'est en cours, afficher un message
  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">En attente d'événement...</h2>
          <p>Si rien ne se passe, vous pouvez retourner à la carte</p>
          <button
            onClick={handleForceBackToMap}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
          >
            Retour à la carte
          </button>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <EventEncounter
        event={currentEvent}
        onChoice={handleEventChoice}
        onClose={handleEventComplete}
      />
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <Navigation />
      </div>
    </div>
  );
};

export default EventPage;
