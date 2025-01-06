import { Ingredient } from "./item";

export enum OperatorGoalCategory {
  Elite = 0,
  Mastery,
  SkillLevel,
  Module,
  Level,
}

interface BaseOperatorGoal {
  name: string;
  category: OperatorGoalCategory;
  ingredients: Ingredient[];
}

export interface SkillLevelGoal extends BaseOperatorGoal {
  category: OperatorGoalCategory.SkillLevel;
  skillLevel: number;
}

export interface EliteGoal extends BaseOperatorGoal {
  category: OperatorGoalCategory.Elite;
  eliteLevel: number;
}

export interface MasteryGoal extends BaseOperatorGoal {
  category: OperatorGoalCategory.Mastery;
  masteryLevel: number;
}

export interface ModuleGoal extends BaseOperatorGoal {
  category: OperatorGoalCategory.Module;
  moduleLevel: number;
}

export type OperatorGoal =
  | SkillLevelGoal
  | MasteryGoal
  | ModuleGoal
  | EliteGoal;

interface BasePlannerGoal {
  operatorId: string;
  category: OperatorGoalCategory;
}

interface PlannerEliteGoal extends BasePlannerGoal {
  category: OperatorGoalCategory.Elite;
  eliteLevel: number;
}

interface PlannerLevelGoal extends BasePlannerGoal {
  category: OperatorGoalCategory.Level;
  fromLevel: number;
  toLevel: number;
  eliteLevel: number;
}

interface PlannerMasteryGoal extends BasePlannerGoal {
  category: OperatorGoalCategory.Mastery;
  skillId: string;
  masteryLevel: number;
}

interface PlannerModuleGoal extends BasePlannerGoal {
  category: OperatorGoalCategory.Module;
  moduleId: string;
  moduleLevel: number;
}

interface PlannerSkillLevelGoal extends BasePlannerGoal {
  category: OperatorGoalCategory.SkillLevel;
  skillLevel: number;
}

export type PlannerGoal =
  | PlannerEliteGoal
  | PlannerMasteryGoal
  | PlannerModuleGoal
  | PlannerSkillLevelGoal
  | PlannerLevelGoal;
