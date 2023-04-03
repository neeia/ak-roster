import { createAction } from "@reduxjs/toolkit";
import { PlannerGoal } from "types/goal";

// This is in its own file because both depotSlice and goalsSlice rely on it
export const completeGoal = createAction<PlannerGoal>("completeGoal");
