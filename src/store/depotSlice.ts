import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import itemsJson from "data/items.json";
import { Item } from "types/item";
import getGoalIngredients from "util/getGoalIngredients";

import { completeGoal } from "./goalsActions";
import type { RootState } from "./store";

export type StockState = { [itemId: string]: number };

interface SetStockPayload {
  itemId: string;
  newQuantity: number;
}

export interface DepotState {
  stock: StockState;
  crafting: { [itemId: string]: boolean };
}

const initialState: DepotState = {
  stock: {},
  crafting: {},
};

export const depotSlice = createSlice({
  name: "depot",
  initialState,
  reducers: {
    subtractStock: (
      state,
      action: PayloadAction<{ itemId: string; amount?: number }>
    ) => {
      const { itemId, amount = 1 } = action.payload;
      state.stock[itemId] = Math.max((state.stock[itemId] ?? 0) - amount, 0);
    },
    addStock: (
      state,
      action: PayloadAction<{ itemId: string; amount?: number }>
    ) => {
      const { itemId, amount = 1 } = action.payload;
      state.stock[itemId] = (state.stock[itemId] ?? 0) + amount;
    },
    setStock: (state, action: PayloadAction<SetStockPayload>) => {
      const { itemId, newQuantity } = action.payload;
      state.stock[itemId] = newQuantity;
    },
    setCrafting: (
      state,
      action: PayloadAction<{ itemId: string; isCrafting: boolean }>
    ) => {
      const { itemId, isCrafting } = action.payload;
      state.crafting[itemId] = isCrafting;
    },
    toggleCrafting: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.crafting[itemId] = !state.crafting[itemId];
    },
    craftOneWithStock: (state, action: PayloadAction<string>) => {
      const { ingredients, yield: itemYield } = itemsJson[
        action.payload as keyof typeof itemsJson
      ] as Item;
      if (ingredients != null) {
        ingredients.forEach((ingr) => {
          state.stock[ingr.id] = Math.max(
            (state.stock[ingr.id] ?? 0) - ingr.quantity,
            0
          );
        });
        state.stock[action.payload] =
          (state.stock[action.payload] ?? 0) + (itemYield ?? 1);
      }
    },
    resetStock: (state) => {
      state.stock = {};
    },
    resetCrafting: (state) => {
      state.crafting = {};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(completeGoal, (state, action) => {
      const ingredients = getGoalIngredients(action.payload);
      ingredients.forEach((ingr) => {
        state.stock[ingr.id] = Math.max(
          (state.stock[ingr.id] ?? 0) - ingr.quantity,
          0
        );
      });
    });
  },
});

export const selectStock = (state: RootState) => state.depot.stock;
export const selectCrafting = (state: RootState) => state.depot.crafting;

export const {
  subtractStock,
  addStock,
  setStock,
  setCrafting,
  toggleCrafting,
  craftOneWithStock,
  resetStock,
  resetCrafting,
} = depotSlice.actions;

export default depotSlice.reducer;
