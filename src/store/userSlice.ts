import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "./store";

export enum UserPreference {
  PLANNER_SORT_COMPLETE_ITEMS_TO_BOTTOM = "PLANNER_SORT_COMPLETE_ITEMS_TO_BOTTOM",
  HIDE_INCREMENT_DECREMENT_BUTTONS = "SHOW_INCREMENT_DECREMENT_BUTTONS",
  PLANNER_SHOW_INACTIVE_ITEMS = "PLANNER_SHOW_INACTIVE_ITEMS",
}

export interface UserState {
  preferences: { [preference: string]: boolean };
}

const initialState: UserState = {
  preferences: {},
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    togglePreference: (state, action: PayloadAction<UserPreference>) => {
      state.preferences[action.payload] = !state.preferences[action.payload];
    },
  },
});

export const selectPreference = createSelector(
  [
    (state: RootState) => state.user.preferences,
    (_state: RootState, preferenceKey: UserPreference) => preferenceKey,
  ],
  (preferences, preferenceKey) => preferences[preferenceKey]
);

export const { togglePreference } = userSlice.actions;

export default userSlice.reducer;
