// src/hooks/useCard.js
import { useDispatch } from 'react-redux';

/**
 * Hook personnalisé pour gérer l'utilisation des cartes bonus
 * Fournit une fonction pour utiliser une carte à un index donné
 */
export function useCard() {
  const dispatch = useDispatch();

  /**
   * Utilise une carte bonus
   * @param {number} index - Index de la carte dans le tableau des cartes actives
   */
  const useCardAtIndex = (index) => {
    dispatch({ type: 'bonusCards/useCard', payload: index });
  };

  return useCardAtIndex;
}
