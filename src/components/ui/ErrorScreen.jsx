// src/components/ui/ErrorScreen.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearError } from '../../redux/slices/uiSlice';

const ErrorScreen = () => {
  const error = useSelector((state) => state.ui.error);
  const dispatch = useDispatch();

  const handleRetry = () => {
    dispatch(clearError());
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      <div className="bg-red-900 p-4 rounded-lg max-w-md text-center mb-6">
        <h2 className="text-xl font-bold mb-2">Erreur</h2>
        <p>{error || "Une erreur inattendue s'est produite."}</p>
      </div>
      <button
        onClick={handleRetry}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
      >
        Réessayer
      </button>
    </div>
  );
};

export default ErrorScreen;
