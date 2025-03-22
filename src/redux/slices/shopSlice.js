// src/redux/slices/shopSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { SHOP_ITEMS } from '../../data/progression';

const initialState = {
  items: [],
  itemsPurchased: {},
};

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    initShop: (state, action) => {
      // Filtrer les items disponibles en fonction des achats précédents
      const eligibleItems = SHOP_ITEMS.filter((item) => {
        // Vérifier si l'item a une limite d'achat et si elle a été atteinte
        if (item.maxPurchases) {
          const purchases = state.itemsPurchased[item.id] || 0;
          return purchases < item.maxPurchases;
        }
        return true;
      });

      // Sélectionner aléatoirement 4 items
      const availableItems = [];
      while (
        availableItems.length < 4 &&
        eligibleItems.length > availableItems.length
      ) {
        const randomIndex = Math.floor(Math.random() * eligibleItems.length);
        const item = eligibleItems[randomIndex];

        if (!availableItems.some((i) => i.id === item.id)) {
          availableItems.push(item);
        }
      }

      state.items = availableItems;
    },
    purchaseItem: (state, action) => {
      const { itemIndex } = action.payload;

      if (itemIndex >= 0 && itemIndex < state.items.length) {
        const item = state.items[itemIndex];

        // Enregistrer l'achat
        state.itemsPurchased[item.id] =
          (state.itemsPurchased[item.id] || 0) + 1;

        // Retirer l'article du magasin
        state.items.splice(itemIndex, 1);
      }
    },
    resetShop: () => initialState,
  },
});

export const { initShop, purchaseItem, resetShop } = shopSlice.actions;

export default shopSlice.reducer;
