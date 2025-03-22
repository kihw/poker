// src/pages/CollectionPage.jsx - Migré vers Redux
import React from 'react';
import { useSelector } from 'react-redux';
import { selectIsGameOver } from '../redux/selectors/gameSelectors';
import BonusCardManager from '../components/card/BonusCardManager';
import Navigation from '../components/ui/Navigation';

const CollectionPage = () => {
  // Vérifier si le jeu est terminé (pour la gestion d'une éventuelle redirection)
  const isGameOver = useSelector(selectIsGameOver);

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <BonusCardManager />
      </div>
      <Navigation />
    </div>
  );
};

export default CollectionPage;
