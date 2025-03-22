// src/pages/RestPage.jsx - Migré vers Redux
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectGamePhase,
  selectIsGameOver,
  selectBonusCardCollection,
} from '../redux/selectors/gameSelectors';
import {
  selectPlayerHealth,
  selectPlayerMaxHealth,
  selectPlayerGold,
} from '../redux/selectors/playerSelectors';
import { setGamePhase } from '../redux/slices/gameSlice';
import { heal, addShield } from '../redux/slices/playerSlice';
import { upgradeCard } from '../redux/slices/bonusCardsSlice';
import RestSite from '../components/rest/RestSite';

const RestPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Sélecteurs Redux
  const isGameOver = useSelector(selectIsGameOver);
  const playerHealth = useSelector(selectPlayerHealth);
  const playerMaxHealth = useSelector(selectPlayerMaxHealth);
  const playerGold = useSelector(selectPlayerGold);
  const bonusCards = useSelector(selectBonusCardCollection);

  // Objet player pour le composant RestSite
  const playerStats = {
    health: playerHealth,
    maxHealth: playerMaxHealth,
    gold: playerGold,
    level: useSelector((state) => state.player.level),
  };

  // Handle rest completion
  const handleRestComplete = (result) => {
    // Traiter les différents effets possibles du repos
    if (result && result.effect) {
      const { effect } = result;

      switch (effect.type) {
        case 'heal':
          // Soigner le joueur
          if (effect.value) {
            dispatch(heal(effect.value));
          }
          break;

        case 'upgrade':
          // Améliorer une carte
          if (effect.card) {
            dispatch(upgradeCard({ cardId: effect.card.id }));
          }
          break;

        case 'shield':
          // Ajouter un bouclier
          if (effect.value) {
            dispatch(addShield(effect.value));
          }
          break;

        case 'buff':
          // Appliquer un buff
          // Note: Les buffs nécessiteraient un reducer spécifique pour être gérés
          console.log('Buff appliqué:', effect.buff);
          break;

        default:
          break;
      }
    }

    // Changer la phase à exploration et retourner à la carte
    dispatch(setGamePhase('exploration'));
    navigate('/map');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <RestSite
        playerStats={playerStats}
        bonusCards={bonusCards}
        onRestComplete={handleRestComplete}
        onClose={() => {
          dispatch(setGamePhase('exploration'));
          navigate('/map');
        }}
      />
    </div>
  );
};

export default RestPage;
