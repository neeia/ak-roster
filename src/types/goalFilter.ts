import { OperatorGoalCategory, PlannerGoal } from "./goal";

export type GoalFilterFunction = (goal: PlannerGoal) => boolean;

export type GoalFilter = {
  search: string;
  completable?: boolean;
  craftable?: boolean;
  uncompletable?: boolean;
  category: OperatorGoalCategory[];
  materials: string[];
};
