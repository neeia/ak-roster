import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import { Ingredient } from "types/item";
import { OperatorData } from "types/operator";
import operatorsJson from "data/operators";

const getGoalIngredients = (goal: PlannerGoal): Ingredient[] => {
  const operator: OperatorData =
    operatorsJson[goal.operatorId];
  switch (goal.category) {
    case OperatorGoalCategory.Elite:
      return operator.eliteLevels[goal.eliteLevel - 1].ingredients;
    case OperatorGoalCategory.SkillLevel:
      return operator.skillLevels[goal.skillLevel - 2].ingredients;
    case OperatorGoalCategory.Mastery: {
      const skill = operator.skillData.find((sk) => sk.skillId === goal.skillId)!;
      return skill.masteries[goal.masteryLevel - 1].ingredients;
    }
    case OperatorGoalCategory.Module:
      return operator.moduleData.find((mod) => mod.moduleId === goal.moduleId)!
        .stages[goal.moduleLevel - 1].ingredients;
  }
};
export default getGoalIngredients;
