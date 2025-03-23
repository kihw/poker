// src/utils/apiUtils.js - Utilitaires pour les appels d'API
import { setActionFeedback } from '../redux/slices/uiSlice';

/**
 * Fonction générique pour effectuer des appels API avec gestion des erreurs
 * @param {Function} apiCall - La fonction d'API à exécuter
 * @param {Object} options - Options supplémentaires
 * @param {Function} dispatch - Fonction dispatch de Redux
 * @returns {Promise} La promesse résultant de l'appel API
 */
export const fetchData = async (apiCall, options = {}, dispatch) => {
  const {
    errorMessage = 'Une erreur est survenue lors de la requête',
    successMessage = null,
    onSuccess = () => {},
    onError = () => {},
  } = options;

  try {
    const result = await apiCall();
    
    // Message de succès si fourni
    if (successMessage && dispatch) {
      dispatch(
        setActionFeedback({
          message: successMessage,
          type: 'success',
        })
      );
    }
    
    // Exécuter la fonction de callback en cas de succès
    onSuccess(result);
    
    return result;
  } catch (error) {
    console.error(`API Error: ${errorMessage}`, error);
    
    // Envoyer le feedback d'erreur si dispatch est disponible
    if (dispatch) {
      dispatch(
        setActionFeedback({
          message: errorMessage,
          type: 'error',
        })
      );
    }
    
    // Exécuter la fonction de callback en cas d'erreur
    onError(error);
    
    // Propager l'erreur pour permettre au composant de la gérer
    throw error;
  }
};

/**
 * Vérifie et nettoie les données API
 * @param {any} data - Les données à vérifier
 * @param {Object} defaultValue - Valeur par défaut à utiliser si null/undefined
 * @returns {any} Les données nettoyées
 */
export const sanitizeApiData = (data, defaultValue = {}) => {
  return data === null || data === undefined ? defaultValue : data;
};

export default {
  fetchData,
  sanitizeApiData,
};
