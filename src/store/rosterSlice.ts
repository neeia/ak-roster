import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import { Operator, OperatorData, OperatorId } from "types/operator";
import Roster, { initialState } from "types/operators/roster";
import operatorJson from "data/operators.json";

import { completeGoal } from "./goalsActions";
import type { RootState } from "./store";
import { defaultOperatorObject } from "util/changeOperator";

export const rosterSlice = createSlice({
  name: "roster",
  initialState,
  reducers: {
    addOperator: (state, action: PayloadAction<OperatorId>) => {
      const opId = action.payload;
      state[opId] = {
        id: opId,
        favorite: false,
        potential: 1,
        promotion: 0,
        level: 1,
        rank: 1,
        masteries: [],
        modules: []
      };
    },
    updateOperator: (state, action: PayloadAction<Operator>) => {
      const op = action.payload;
      state[op.id] = op;
    },
    deleteOperator: (state, action: PayloadAction<OperatorId>) => {
      const opId = action.payload;
      delete state[opId];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      completeGoal,
      (state, action: PayloadAction<PlannerGoal>) => {
        const goal = action.payload;
        const op = state[goal.operatorId];
        const opData =
          operatorJson[goal.operatorId];
        switch (goal.category) {
          case OperatorGoalCategory.Elite:
            state[op.id].promotion = Math.max(goal.eliteLevel, op.promotion);
            break;
          case OperatorGoalCategory.SkillLevel:
            state[op.id].rank = Math.max(goal.skillLevel, op.rank);
            break;
          case OperatorGoalCategory.Mastery:
            const skillIndex = opData.skillData.findIndex((sk) => sk.skillId === goal.skillId);
            state[op.id].masteries[skillIndex] = Math.max(goal.masteryLevel, op.masteries[skillIndex]);
            break;
          case OperatorGoalCategory.Module:
            const moduleIndex = opData.moduleData.findIndex(
              (m) => m.moduleId === goal.moduleId
            )!;
            state[op.id].modules[moduleIndex] = Math.max(goal.moduleLevel, op.masteries[moduleIndex]);
            break;
        }
      }
    );
  },
});

export const selectRoster = (state: RootState) => state.roster;
export const selectOperator = (id: OperatorId | undefined) => (state: RootState) => !id ? null : state.roster[id] ?? defaultOperatorObject(id);

export const { addOperator, updateOperator, deleteOperator } = rosterSlice.actions;

export default rosterSlice.reducer;
