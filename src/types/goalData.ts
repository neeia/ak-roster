import { Database } from "./supabase";
import { useCallback } from "react";
import { OperatorData } from "./operator";
import { OperatorGoalCategory, PlannerGoal } from "./goal";

type GoalsTable = Database["public"]["Tables"]["goals"];
type GoalData = GoalsTable["Row"];
export default GoalData;
export type GoalDataInsert = Omit<GoalsTable["Insert"], "user_id">;

export function getGoalString(goal : GoalData, opData: OperatorData) {
  let goalArray : string[] = [];

  if (goal.elite)
  {
    goalArray.push(`E${goal.elite}`);
  }
  if (goal.skill_level)
  {
    goalArray.push(`SL${goal.skill_level}`);
  }
  if (goal.masteries)
  {
    goal.masteries.forEach((level, index) => {
      if (level > 0)
      {
        goalArray.push(`S${index}M${level}`);
      }
    })
  }
  if (goal.modules)
  {
    Object.entries(goal.modules).forEach(([moduleId, moduleLevel]) => {
      const moduleData = opData.moduleData!.find((m) => m.moduleId === moduleId)!;
      goalArray.push(`MOD ${moduleData.typeName} (${moduleData.moduleName}) L${moduleLevel}`)
    })
  }

  return goalArray.join(", ");
}

export function getPlannerGoals(goal : GoalData, opData: OperatorData){
  let plannerGoals : PlannerGoal[] = [];

  if (goal.elite)
  {
    const eliteGoal : PlannerGoal = {
      category: OperatorGoalCategory.Elite,
      eliteLevel: goal.elite,
      operatorId: goal.op_id,
    };
    plannerGoals.push(eliteGoal)
  }
  if (goal.skill_level)
  {
    const skillLevelGoal : PlannerGoal = {
      category: OperatorGoalCategory.SkillLevel,
      skillLevel: goal.skill_level,
      operatorId: goal.op_id,
    };
    plannerGoals.push(skillLevelGoal)
  }
  if (goal.masteries)
  {
    goal.masteries.forEach((level, skillIndex) => {
      if (level > 0)
      {
        const masteriesGoal : PlannerGoal = {
          category: OperatorGoalCategory.Mastery,
          skillId: opData.skillData![skillIndex].skillId,
          masteryLevel: level,
          operatorId: goal.op_id,
        };
        plannerGoals.push(masteriesGoal)
      }
    })
  }
  if (goal.modules)
  {
    Object.entries(goal.modules).forEach(([moduleId, moduleLevel]) => {
      const masteriesGoal : PlannerGoal = {
        category: OperatorGoalCategory.Module,
        moduleId: moduleId,
        moduleLevel: moduleLevel,
        operatorId: goal.op_id,
      };
      plannerGoals.push(masteriesGoal)
    })
  }

  return plannerGoals;
}