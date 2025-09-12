import GoalData from "types/goalData";
import { Operator } from "types/operators/operator";

export default function changeGoal(goal: GoalData, op: Operator): GoalData {
    if (goal.op_id !== op.op_id) return goal; // no relation

    const _goal: GoalData = { ...goal };

    changeGoalSKillLevel(_goal, op);
    //always before elite
    changeGoalLevel(_goal, op);
    //always after level
    changeGoalElite(_goal, op);

    // ---- masteries ----
    changeGoalMasteries(_goal, op);

    // ---- modules ----
    changeGoalModules(_goal, op);

    return _goal;
};

const changeGoalSKillLevel = (goal: GoalData, op: Operator): void => {
    if (goal.skill_level_from == null || goal.skill_level_to == null) return;

    goal.skill_level_from = Math.max(op.skill_level, goal.skill_level_from) as number;
    goal.skill_level_to = Math.max(op.skill_level, goal.skill_level_to) as number;

    if (goal.skill_level_from == goal.skill_level_to) {
        goal.skill_level_from = null;
        goal.skill_level_to = null;
    }
};

const changeGoalLevel = (goal: GoalData, op: Operator): void => {
    if (goal.level_from == null || goal.level_to == null
        || goal.elite_from == null || goal.elite_to == null)
        return;
    //from
    if (goal.elite_from < op.elite) {
        //next elite reached, to current
        goal.level_from = op.level;
    } else if (goal.elite_from == op.elite) {
        //elite stayed the same - pick between
        goal.level_from = Math.max(op.level, goal.level_from);
    }
    //else - goal isn't reachable - leave level_from as is

    //to
    if (goal.elite_to < op.elite) {
        //elite over-reached - remove level goals
        goal.level_from = null;
        goal.level_to = null;
    } else if (goal.elite_to == op.elite) {
        //elite same as goal - pick between op and goal
        goal.level_to = Math.max(op.level, goal.level_to);

        //if goal level and elite are reached - remove level goals
        if (goal.level_from == goal.level_to) {
            goal.level_from = null;
            goal.level_to = null;
        }
    }
    //else elite not yet reached - leave level_to as is    
}

const changeGoalElite = (goal: GoalData, op: Operator): void => {
    goal.elite_from = Math.max(op.elite, goal.elite_from ?? 0);
    goal.elite_to = Math.max(op.elite, goal.elite_to ?? 0);

    //remove reached elites only if no level-goals
    if (goal.elite_from == goal.elite_to
        && goal.level_from == null && goal.level_to == null) {
        goal.elite_from = null;
        goal.elite_to = null;
    }
};

const changeGoalMasteries = (goal: GoalData, op: Operator): void => {
    if (goal.masteries_from == null || goal.masteries_to == null) return
    const from = [...goal.masteries_from];
    const to = [...goal.masteries_to];

    let removeGoal = true;

    for (let i = 0; i < from.length; i++) {
        from[i] = Math.max(op.masteries[i], from[i]);
        to[i] = Math.max(op.masteries[i], to[i]);
        if (from[i] < to[i]) {
            removeGoal = false;
        }
    }

    if (removeGoal) {
        goal.masteries_from = null;
        goal.masteries_to = null;
    } else {
        goal.masteries_from = from;
        goal.masteries_to = to;
    }
};

const changeGoalModules = (goal: GoalData, op: Operator): void => {
    if (!goal.modules_from || !goal.modules_to) return;
    const from = { ...goal.modules_from };
    const to = { ...goal.modules_to };

    let removeGoal = true;

    for (const key of Object.keys(goal.modules_from)) {
        const opVal = op.modules[key] ?? 0;

        from[key] = Math.max(opVal, from[key]);
        to[key] = Math.max(opVal, to[key]);

        if (from[key] < to[key]) {
            removeGoal = false;
        }
    }

    if (removeGoal) {
        goal.modules_from = null;
        goal.modules_to = null;
    } else {
        goal.modules_from = from;
        goal.modules_to = to;
    }
};