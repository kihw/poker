// src/pages/RestPage.jsx - Mise à jour pour utiliser Redux
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setGamePhase } from '../redux/slices/gameSlice';
import { applyRestOption, completeRest } from '../redux/thunks/restThunks';
import RestSite from '../components/rest/RestSite';
import Navigation from '../components/ui/Navigation';

const RestPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Sélecteurs Redux
  const isGameOver = useSelector((state) => state.game.isGameOver);
  const playerHealth = useSelector((state) => state.player.health);
  const playerMaxHealth = useSelector((state) => state.player.maxHealth);
  const playerGold = useSelector((state) => state.player.gold);
  const bonusCards = useSelector((state) => state.bonusCards.collection);
  const gamePhase = useSelector((state) => state.game.gamePhase);

  // Objet player pour le composant RestSite
  const playerStats = {
    health: playerHealth,
    maxHealth: playerMaxHealth,
    gold: playerGold,
    level: useSelector((state) => state.player.level),
  };

  // Vérifier si nous sommes dans la bonne phase de jeu
  React.useEffect(() => {
    if (gamePhase !== 'rest' && !isGameOver) {
      navigate('/map');
    }
  }, [gamePhase, isGameOver, navigate]);

  // Gérer l'application d'une option de repos (ex: soin, amélioration de carte)
  const handleRestOption = (option, cardId) => {
    return dispatch(applyRestOption({ option, cardId })).unwrap();
  };

  // Gérer la fin du repos
  const handleRestComplete = (result) => {
    dispatch(completeRest());
    navigate('/map');
  };

  // Gérer le retour forcé à la carte
  const handleForceBackToMap = () => {
    dispatch(setGamePhase('exploration'));
    navigate('/map');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <RestSite
        playerStats={playerStats}
        bonusCards={bonusCards}
        onRestOption={handleRestOption}
        onRestComplete={handleRestComplete}
        onClose={handleForceBackToMap}
      />
      <div className="fixed bottom-4 left-0 right-0 z-50">
        <Navigation />
      </div>
    </div>
  );
};

export default RestPage;
