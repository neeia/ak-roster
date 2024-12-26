import { Database } from "./supabase";
import { OperatorData } from "./operators/operator";
import { OperatorGoalCategory, PlannerGoal } from "./goal";
import operatorJson from "../data/operators";
import { MAX_LEVEL_BY_RARITY } from "../util/changeOperator";

type GoalsTable = Database["public"]["Tables"]["goals"];
type GoalData = Omit<GoalsTable["Row"], "user_id">;
export default GoalData;
export type GoalDataInsert = Omit<GoalsTable["Insert"], "user_id">;

export function getGoalString(goal: GoalData, opData: OperatorData) {
  let goalArray: string[] = [];

  if (goal.level_from && goal.level_to) {
    if (goal.elite_from && goal.elite_to) {
      goalArray.push(`LV${goal.level_from}(E${goal.elite_from}) → LV${goal.level_to}(E${goal.elite_to})`);
    } else {
      goalArray.push(`LV${goal.level_from} → LV${goal.level_to}`);
    }
  }
  if (goal.elite_from != null && goal.elite_to) {
    goalArray.push(`E${goal.elite_from} → E${goal.elite_to}`);
  }
  if (goal.skill_level_from && goal.skill_level_to) {
    goalArray.push(`SL${goal.skill_level_from} → SL${goal.skill_level_to}`);
  }
  if (goal.masteries_from && goal.masteries_to) {
    goal.masteries_from.forEach((level, index) => {
      if (goal.masteries_to![index] > 0 && level < goal.masteries_to![index]) {
        goalArray.push(`S${index + 1}M${level} → S${index + 1}M${goal.masteries_to![index]}`);
      }
    });
  }
  
  if (goal.modules_from && goal.modules_to) {
    Object.entries(goal.modules_to).forEach(([moduleId, moduleLevel]) => {
      const moduleData = opData.moduleData!.find((m) => m.moduleId === moduleId)!;
      const startingLevel = (goal.modules_from as Record<string, number>)![moduleId] ?? 0;
      goalArray.push(`MOD ${moduleData.typeName} (${moduleData.moduleName}) L${startingLevel} → L${moduleLevel}`);
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
    if (goal.elite_from == goal.elite_to) {
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
        const eliteGoal: PlannerGoal = {
          category: OperatorGoalCategory.Level,
          fromLevel: i == goal.elite_from ? goal.level_from : 1,
          toLevel: i == goal.elite_to ? goal.level_to : MAX_LEVEL_BY_RARITY[opData.rarity][i],
          eliteLevel: i,
          operatorId: goal.op_id,
        };
        plannerGoals.push(eliteGoal);
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
