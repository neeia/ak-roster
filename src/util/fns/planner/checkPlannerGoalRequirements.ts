import operatorJson from "data/operators";
import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import { Operator } from "types/operators/operator";
import { MAX_LEVEL_BY_RARITY, MAX_SKILL_LEVEL_BY_PROMOTION } from "util/changeOperator";

export const checkPlannerGoalRequirements = (goal: PlannerGoal, op: Operator): boolean => {

    const opData = operatorJson[op.op_id];
    if (!opData) return false;
    const rarity = opData.rarity;

    switch (goal.category) {
        //elite - check levels=max for rarity and elite-1
        case OperatorGoalCategory.Elite: {
            const prevElite = goal.eliteLevel - 1;
            if (prevElite < 0) return false;
            const maxLevelPrevElite = MAX_LEVEL_BY_RARITY[rarity][prevElite];
            if (maxLevelPrevElite == null) return false;
            return op.elite === prevElite && op.level >= maxLevelPrevElite;
        }

        //level - need same elite, and ===fromLevel
        case OperatorGoalCategory.Level: {
            return op.elite === goal.eliteLevel && op.level === goal.fromLevel;
        }

        //skill level - need elite, and skill level-1
        case OperatorGoalCategory.SkillLevel: {
            const requiredElite =
                MAX_SKILL_LEVEL_BY_PROMOTION.findIndex(max => goal.skillLevel <= max);
            if (requiredElite === -1) return false;
            return (
                op.elite >= requiredElite &&
                op.skill_level === goal.skillLevel - 1
            );
        }

        //mastery - needs skill level 7, elite2 and mastery by index-1
        case OperatorGoalCategory.Mastery: {
            const opData = operatorJson[goal.operatorId];
            if (!opData?.skillData) return false;
            const skillIndex = opData.skillData.findIndex(s => s.skillId === goal.skillId);
            if (skillIndex === -1) return false;

            return (
                op.elite === 2 &&
                op.skill_level === 7 &&
                op.masteries[skillIndex] === goal.masteryLevel - 1
            );
        }

        //module - needs elite 2 and level 60, and module by id-1
        case OperatorGoalCategory.Module: {
            const currentModuleLevel = op.modules[goal.moduleId] ?? 0;
            return (
                op.elite === 2 &&
                op.level >= 60 &&
                currentModuleLevel === goal.moduleLevel - 1
            );
        }

        default:
            return false;
    }
};