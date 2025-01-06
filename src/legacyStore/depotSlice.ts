import { createSlice } from "@reduxjs/toolkit";

import type { RootState } from "./store";

export type StockState = { [itemId: string]: number };

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
  reducers: {},
});

export const selectStock = (state: RootState) => state.depot.stock;

export const {} = depotSlice.actions;

export default depotSlice.reducer;
