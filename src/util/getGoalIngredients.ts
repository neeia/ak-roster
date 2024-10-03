import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import { Ingredient } from "types/item";
import { OperatorData } from "types/operator";
import operatorsJson from "data/operators";
import { COST_BY_RARITY } from "./changeOperator";

const getGoalIngredients = (goal: PlannerGoal): Ingredient[] => {
  const operator: OperatorData =
    operatorsJson[goal.operatorId];
  switch (goal.category) {
    case OperatorGoalCategory.Level:
      const lmdCost = COST_BY_RARITY.expCostByElite[goal.eliteLevel].slice(goal.fromLevel - 1, goal.toLevel - 1).reduce((total, current) => total + current);
      const lmdIngredient: Ingredient = {
        quantity: lmdCost,
        id: "4001",
      };
      return [lmdIngredient];
    case OperatorGoalCategory.Elite:
      return operator.eliteLevels[goal.eliteLevel - 1].ingredients;
    case OperatorGoalCategory.SkillLevel:
      return operator.skillLevels[goal.skillLevel - 2].ingredients;
    case OperatorGoalCategory.Mastery: {
      const skill = operator.skillData?.find((sk) => sk.skillId === goal.skillId)!;
      return skill?.masteries[goal.masteryLevel - 1].ingredients ?? [];
    }
    case OperatorGoalCategory.Module:
      return operator.moduleData?.find((mod) => mod.moduleId === goal.moduleId)!.stages[goal.moduleLevel - 1].ingredients ?? [];
  }
};
export default getGoalIngredients;
