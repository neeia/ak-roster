import { createSlice } from "@reduxjs/toolkit";
import { PlannerGoal } from "types/goal";

import type { RootState } from "./store";

export type GoalsState = PlannerGoal[];

const initialState: GoalsState = [];

export const goalsSlice = createSlice({
  name: "goals",
  initialState,
  reducers: {},
});

export const selectGoals = (state: RootState) => state.goals;

export const {} = goalsSlice.actions;

export default goalsSlice.reducer;
