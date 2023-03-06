import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isEqual } from "lodash";
import { OperatorGoalCategory, PlannerGoal } from "types/goal";

import { completeGoal } from "./goalsActions";
import type { RootState } from "./store";

export type GoalsState = PlannerGoal[];

const initialState: GoalsState = [];

const getGoalKey = (goal: PlannerGoal) => {
  switch (goal.category) {
    case OperatorGoalCategory.Elite:
      return `${goal.operatorId}-${goal.category}-${goal.eliteLevel}`;
    case OperatorGoalCategory.SkillLevel:
      return `${goal.operatorId}-${goal.category}-${goal.skillLevel}`;
    case OperatorGoalCategory.Mastery:
      return `${goal.operatorId}-${goal.category}-${goal.skillId}-${goal.masteryLevel}`;
    case OperatorGoalCategory.Module:
      return `${goal.operatorId}-${goal.category}-${goal.moduleId}-${goal.moduleLevel}`;
  }
};

export const goalsSlice = createSlice({
  name: "goals",
  initialState,
  reducers: {
    addGoals: (state, action: PayloadAction<PlannerGoal[]>) => {
      const existingKeys = new Set(state.map(getGoalKey));
      const newGoals = action.payload;
      const goalsToAdd = newGoals.filter(
        (goal) => !existingKeys.has(getGoalKey(goal))
      );
      state.unshift(...goalsToAdd);
    },
    deleteGoal: (state, action: PayloadAction<PlannerGoal>) => {
      state.forEach((goal, i) => {
        if (isEqual(goal, action.payload)) {
          state.splice(i, 1);
        }
      });
    },
    clearAllGoals: () => {
      return initialState;
    },
    reorderGoal: (
      state,
      action: PayloadAction<{ oldIndex: number; newIndex: number }>
    ) => {
      const { oldIndex, newIndex } = action.payload;
      const goal = state[oldIndex];
      state.splice(oldIndex, 1);
      state.splice(newIndex, 0, goal);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      completeGoal,
      (state, action: PayloadAction<PlannerGoal>) => {
        // same as deleteGoal: remove it from goals, and let depotSlice handle removing mats
        state.forEach((goal, i) => {
          if (isEqual(goal, action.payload)) {
            state.splice(i, 1);
          }
        });
      }
    );
  },
});

export const selectGoals = (state: RootState) => state.goals;

export const { addGoals, deleteGoal, clearAllGoals, reorderGoal } =
  goalsSlice.actions;

export default goalsSlice.reducer;
