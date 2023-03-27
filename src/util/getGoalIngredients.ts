import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import { Ingredient } from "types/item";
import { OperatorData } from "types/operator";
import operatorsJson from "../data/operators.json";

const getGoalIngredients = (goal: PlannerGoal): Ingredient[] => {
  const operator: OperatorData =
    operatorsJson[goal.operatorId as keyof typeof operatorsJson];
  switch (goal.category) {
    case OperatorGoalCategory.Elite:
      return operator.elite[goal.eliteLevel - 1].ingredients;
    case OperatorGoalCategory.SkillLevel:
      return operator.skillLevels[goal.skillLevel - 2].ingredients;
    case OperatorGoalCategory.Mastery: {
      const skill = operator.skills.find((sk) => sk.skillId === goal.skillId)!;
      return skill.masteries[goal.masteryLevel - 1].ingredients;
    }
    case OperatorGoalCategory.Module:
      return operator.modules.find((mod) => mod.moduleId === goal.moduleId)!
        .stages[goal.moduleLevel - 1].ingredients;
  }
};
export default getGoalIngredients;
