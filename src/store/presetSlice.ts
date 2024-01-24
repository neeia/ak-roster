import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import { Operator, OperatorData, OperatorId } from "types/operator";
import Preset, { initialState } from "types/operators/presets";
import operatorJson from "data/operators.json";

import { completeGoal } from "./goalsActions";
import type { RootState } from "./store";
import { defaultOperatorObject } from "util/changeOperator";

export const presetSlice = createSlice({
  name: "presets",
  initialState,
  reducers: {
    addPreset: (state, action: PayloadAction<Preset>) => {
      const preset = action.payload;
      state = [...state, preset];
    },
    updatePreset: (state, action: PayloadAction<Preset>) => {
      const preset = action.payload;
    },
    deleteOperator: (state, action: PayloadAction<OperatorId>) => {
      const opId = action.payload;
      delete state[opId];
    },
  },
});