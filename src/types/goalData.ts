import { Database } from "./supabase";
import { OperatorData } from "./operators/operator";
import { OperatorGoalCategory, PlannerGoal } from "./goal";
import operatorJson from "../data/operators";
import { MAX_LEVEL_BY_RARITY } from "../util/changeOperator";
import getNumSkills from "util/fns/getNumSkills";

type GoalsTable = Database["public"]["Tables"]["goals"];
type GoalData = Omit<GoalsTable["Row"], "user_id" | "modules_from" | "modules_to"> & {
  modules_from: Record<string, number> | null;
  modules_to: Record<string, number> | null;
};
export default GoalData;
export type GoalDataInsert = Omit<GoalsTable["Insert"], "user_id" | "modules_from" | "modules_to"> & {
  modules_from?: Record<string, number> | null;
  modules_to?: Record<string, number> | null;
};

const isNumber = (value: any) => typeof value === "number";

export function getGoalString(goal: GoalData, opData: OperatorData) {
  let goalArray: string[] = [];

  if (isNumber(goal.level_from) && isNumber(goal.level_to)) {
    if (isNumber(goal.elite_from) && isNumber(goal.elite_to)) {
      goalArray.push(`E${goal.elite_from} Lv${goal.level_from} → E${goal.elite_to} Lv${goal.level_to}`);
    } else {
      goalArray.push(`Lv${goal.level_from} → Lv${goal.level_to}`);
    }
  } else if (isNumber(goal.elite_from) && isNumber(goal.elite_to)) {
    goalArray.push(`E${goal.elite_from} → E${goal.elite_to}`);
  }
  if (goal.skill_level_from && goal.skill_level_to) {
    goalArray.push(`Sl${goal.skill_level_from} → Sl${goal.skill_level_to}`);
  }
  if (goal.masteries_from && goal.masteries_to) {
    goal.masteries_from.forEach((level, index) => {
      if (goal.masteries_to![index] > 0 && level < goal.masteries_to![index]) {
        goalArray.push(`S${index + 1}M${level} → M${goal.masteries_to![index]}`);
      }
    });
  }
  if (goal.modules_from && goal.modules_to) {
    Object.entries(goal.modules_to).forEach(([moduleId, moduleLevel]) => {
      const moduleData = opData.moduleData!.find((m) => m.moduleId === moduleId)!;
      const startingLevel = (goal.modules_from as Record<string, number>)![moduleId] ?? 0;
      goalArray.push(`Mod ${moduleData.typeName.split("-")[1]} S${startingLevel} → S${moduleLevel}`);
    });
  }

  return goalArray.join(", ");
}

export function getPlannerGoals(goal: GoalData, opData?: OperatorData) {
  let plannerGoals: PlannerGoal[] = [];
  if (!opData) {
    opData = operatorJson[goal.op_id];
  }

  if (goal.elite_from != null && goal.elite_to) {
    for (let i = goal.elite_from + 1; i <= goal.elite_to; i++) {
      const eliteGoal: PlannerGoal = {
        category: OperatorGoalCategory.Elite,
        eliteLevel: i,
        operatorId: goal.op_id,
      };
      plannerGoals.push(eliteGoal);
    }
  }

  if (goal.level_from && goal.level_to && goal.elite_from != null && goal.elite_to != null) {
    if (goal.elite_from === goal.elite_to) {
      const levelGoal: PlannerGoal = {
        category: OperatorGoalCategory.Level,
        eliteLevel: goal.elite_to,
        fromLevel: goal.level_from,
        toLevel: goal.level_to,
        operatorId: goal.op_id,
      };
      plannerGoals.push(levelGoal);
    } else {
      const maxEliteLevel = goal.level_to == 1 ? goal.elite_to - 1 : goal.elite_to;
      for (let i = goal.elite_from; i <= maxEliteLevel; i++) {
        const fromLevel = i === goal.elite_from ? goal.level_from : 1;
        const toLevel = i === goal.elite_to ? goal.level_to : MAX_LEVEL_BY_RARITY[opData.rarity][i];
        const eliteGoal: PlannerGoal = {
          category: OperatorGoalCategory.Level,
          fromLevel,
          toLevel,
          eliteLevel: i,
          operatorId: goal.op_id,
        };
        if (fromLevel !== toLevel) plannerGoals.push(eliteGoal);
      }
    }
  }

  if (goal.skill_level_from && goal.skill_level_to) {
    for (let i = goal.skill_level_from + 1; i <= goal.skill_level_to; i++) {
      const skillLevelGoal: PlannerGoal = {
        category: OperatorGoalCategory.SkillLevel,
        skillLevel: i,
        operatorId: goal.op_id,
      };
      plannerGoals.push(skillLevelGoal);
    }
  }
  if (goal.masteries_from && goal.masteries_to) {
    goal.masteries_to.forEach((level, skillIndex) => {
      if (level > 0) {
        for (let i = goal.masteries_from![skillIndex] + 1; i <= level; i++) {
          const masteriesGoal: PlannerGoal = {
            category: OperatorGoalCategory.Mastery,
            skillId: opData.skillData![skillIndex].skillId,
            masteryLevel: i,
            operatorId: goal.op_id,
          };
          plannerGoals.push(masteriesGoal);
        }
      }
    });
  }
  if (goal.modules_from && goal.modules_to) {
    Object.entries(goal.modules_to).forEach(([moduleId, moduleLevel]) => {
      for (let i = ((goal.modules_from as Record<string, number>)[moduleId] ?? 0) + 1; i <= moduleLevel; i++) {
        const masteriesGoal: PlannerGoal = {
          category: OperatorGoalCategory.Module,
          moduleId: moduleId,
          moduleLevel: i,
          operatorId: goal.op_id,
        };
        plannerGoals.push(masteriesGoal);
      }
    });
  }

  return plannerGoals;
}

export const plannerGoalToGoalData = (goal: PlannerGoal): Partial<GoalDataInsert> => {
  const opData = operatorJson[goal.operatorId];
  switch (goal.category) {
    case OperatorGoalCategory.Elite:
      return {
        elite_from: goal.eliteLevel - 1,
        elite_to: goal.eliteLevel,
      };
    case OperatorGoalCategory.Level:
      return {
        elite_from: goal.eliteLevel,
        elite_to: goal.eliteLevel,
        level_from: goal.fromLevel,
        level_to: goal.toLevel,
      };
    case OperatorGoalCategory.Mastery:
      const moduleIndex = opData.skillData?.findIndex((x) => x.skillId === goal.skillId);
      if (!isNumber(moduleIndex) || moduleIndex === -1) return {};

      const masteries_from = [...Array(getNumSkills(goal.operatorId))].fill(-1);
      const masteries_to = [...Array(getNumSkills(goal.operatorId))].fill(-1);
      masteries_from[moduleIndex] = goal.masteryLevel - 1;
      masteries_to[moduleIndex] = goal.masteryLevel;
      return {
        masteries_from,
        masteries_to,
      };
    case OperatorGoalCategory.Module:
      if (!opData?.moduleData) return {};

      const _modules_from = Object.fromEntries(opData.moduleData.map((mod) => [mod.moduleId, -1]));
      const _modules_to = { ..._modules_from };
      const modules_from = { ..._modules_from, [goal.moduleId]: goal.moduleLevel - 1 };
      const modules_to = { ..._modules_to, [goal.moduleId]: goal.moduleLevel };
      return {
        modules_from,
        modules_to,
      };
    case OperatorGoalCategory.SkillLevel:
      return {
        skill_level_from: goal.skillLevel - 1,
        skill_level_to: goal.skillLevel,
      };
  }
};
