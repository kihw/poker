import { useGameOverCheck } from '../hooks/useGameOverCheck';

const GamePage = () => {
  const { isGameOver } = useGameOverCheck();
  const { gameState, resetGame } = useGame();
  const navigate = useNavigate();

  // Check if we're in a combat phase or game over
  const isInCombat =
    gameState?.gamePhase === 'combat' || gameState?.gamePhase === 'reward';

  // Si on est en mode exploration, rediriger vers la carte
  React.useEffect(() => {
    if (gameState?.gamePhase === 'exploration') {
      navigate('/map');
    }
  }, [gameState?.gamePhase, navigate]);

  // Fonction de redémarrage du jeu
  const handleRestart = () => {
    if (resetGame) {
      resetGame();
    } else {
      // Fallback si resetGame n'est pas disponible
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
      {isGameOver && (
        <div className="text-white text-center">
          <h2 className="text-3xl mb-4 text-red-500 font-bold">GAME OVER</h2>
          <p className="mb-6">Vous avez été vaincu!</p>
          <button
            onClick={handleRestart}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded"
          >
            Recommencer une nouvelle partie
          </button>
        </div>
      )}

      <Navigation />
    </div>
  );
};

export default GamePage;
