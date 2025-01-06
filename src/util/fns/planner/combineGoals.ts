import GoalData from "types/goalData";

export function combineGoals(
  goals: Partial<GoalData>[],
  op_id: string,
  user_id: string,
  sort_order: number
): GoalData | null {
  if (!goals.length || !op_id) return null;

  const goalBuilder: GoalData = {
    op_id,
    sort_order,
    user_id,
    group_name: "Default",
    elite_from: null,
    elite_to: null,
    level_from: null,
    level_to: null,
    masteries_from: null,
    masteries_to: null,
    modules_from: null,
    modules_to: null,
    skill_level_from: null,
    skill_level_to: null,
  };

  goals.forEach((goal) => {
    if (goal.elite_from != null && goal.elite_to != null) {
      goalBuilder.elite_from ??= goal.elite_from;
      goalBuilder.elite_from = Math.min(goal.elite_from, goalBuilder.elite_from);
      goalBuilder.elite_to ??= goal.elite_to;
      goalBuilder.elite_to = Math.max(goal.elite_to, goalBuilder.elite_to);

      if (goal.level_from != null && goal.level_to != null) {
        goalBuilder.level_from ??= goal.level_from;
        goalBuilder.level_from = Math.min(goal.level_from, goalBuilder.level_from);
        goalBuilder.level_to ??= goal.level_to;
        goalBuilder.level_to = Math.max(goal.level_to, goalBuilder.level_to);
      }
    }
    if (goal.skill_level_from != null && goal.skill_level_to != null) {
      goalBuilder.skill_level_from ??= goal.skill_level_from;
      goalBuilder.skill_level_from = Math.min(goal.skill_level_from, goalBuilder.skill_level_from);
      goalBuilder.skill_level_to ??= goal.skill_level_to;
      goalBuilder.skill_level_to = Math.max(goal.skill_level_to, goalBuilder.skill_level_to);
    }
    if (goal.masteries_from != null && goal.masteries_to != null) {
      goalBuilder.masteries_from ??= goal.masteries_from;
      goalBuilder.masteries_from = goalBuilder.masteries_from.map((v, i) => {
        const v_new = goal.masteries_from![i];
        if (v_new < 0) return v;
        else if (v < 0) return v_new;
        else return Math.min(v, v_new);
      });
      goalBuilder.masteries_to ??= goal.masteries_to;
      goalBuilder.masteries_to = goalBuilder.masteries_to.map((v, i) => {
        const v_new = goal.masteries_to![i];
        if (v_new < 0) return v;
        else return Math.max(v, v_new);
      });
    }
    if (goal.modules_from != null && goal.modules_to != null) {
      goalBuilder.modules_from ??= goal.modules_from;
      goalBuilder.modules_from = Object.fromEntries(
        Object.entries(goalBuilder.modules_from).map(([id, v]) => {
          const v_new = goal.modules_from![id];
          if (v_new < 0) return [id, v];
          else return [id, Math.min(v, v_new)];
        })
      );
      goalBuilder.modules_to ??= goal.modules_to;
      goalBuilder.modules_to = Object.fromEntries(
        Object.entries(goalBuilder.modules_to).map(([id, v]) => {
          const v_new = goal.modules_to![id];
          if (v_new < 0) return [id, v];
          else return [id, Math.max(v, v_new)];
        })
      );
    }
  });

  return goalBuilder;
}
