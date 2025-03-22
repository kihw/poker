// src/pages/ShopPage.jsx
import React from "react";
import Navigation from "../components/ui/Navigation";
import { useGame } from "../context/GameContext";

const ShopPage = () => {
  const {} = useGame();
  const { purchaseShopItem, leaveShop, gameState } = useGame();

  // If shop is not available
  if (!gameState?.shopItems || gameState.shopItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">Boutique fermée</h2>
          <p>Revenez plus tard lorsque la boutique sera disponible</p>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-gray-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-white">Boutique</h2>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {gameState.shopItems.map((item, index) => (
            <div
              key={index}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600 flex justify-between items-start"
            >
              <div>
                <h3 className="text-lg font-bold text-white">{item.name}</h3>
                <p className="text-sm text-gray-300 mt-1">{item.description}</p>
                <div className="mt-2 text-yellow-400">{item.price} or</div>
              </div>
              <button
                className={`px-3 py-1 rounded ${
                  gameState.player.gold >= item.price
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-500 text-gray-300 cursor-not-allowed"
                }`}
                disabled={gameState.player.gold < item.price}
                onClick={() => purchaseShopItem(index)}
              >
                Acheter
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-white">
            <span className="text-yellow-400 mr-2">💰</span>
            Votre or: {gameState.player.gold}
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={() => leaveShop()}
          >
            Quitter la boutique
          </button>
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default ShopPage;
