import { createAction } from "@reduxjs/toolkit";
import { PlannerGoal } from "types/goal";

export const completeGoal = createAction<PlannerGoal>("completeGoal");
