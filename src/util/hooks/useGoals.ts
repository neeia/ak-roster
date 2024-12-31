import { useCallback, useEffect, useState } from "react";
import supabase from "supabase/supabaseClient";
import GoalData, { GoalDataInsert } from "types/goalData";
import handlePostgrestError from "util/fns/handlePostgrestError";
import useLocalStorage from "./useLocalStorage";

const fillNull = (goal: GoalDataInsert, index: number): GoalData => {
  const {
    op_id,
    group_name,
    elite_from,
    elite_to,
    level_from,
    level_to,
    masteries_from,
    masteries_to,
    modules_from,
    modules_to,
    skill_level_from,
    skill_level_to,
    sort_order,
  } = goal;
  return {
    op_id,
    group_name,
    elite_from: elite_from ?? null,
    elite_to: elite_to ?? null,
    level_from: level_from ?? null,
    level_to: level_to ?? null,
    masteries_from: masteries_from ?? null,
    masteries_to: masteries_to ?? null,
    modules_from: modules_from ?? null,
    modules_to: modules_to ?? null,
    skill_level_from: skill_level_from ?? null,
    skill_level_to: skill_level_to ?? null,
    sort_order: sort_order ?? index,
  };
};

function useGoals() {
  const [goals, _setGoals] = useLocalStorage<GoalData[]>("v3_goals", []);

  const updateGoals = useCallback(
    async (goalsData: GoalDataInsert[]) => {
      const _goals = [...goals];
      const maxIndex = (goals.reduce((acc, goal) => (goal.sort_order > acc ? goal.sort_order : acc), 0) ?? 0) + 1;

      const nulledGoalsData = goalsData.map((g) => fillNull(g, maxIndex));
      nulledGoalsData.forEach((goalInsert) => {
        const index = goals.findIndex((x) => x.op_id == goalInsert.op_id && x.group_name == goalInsert.group_name);
        if (index !== -1) {
          const newGoal: GoalData = { ...goals[index], ...goalInsert };
          _goals[index] = newGoal;
        } else {
          _goals.push(goalInsert as GoalData);
        }
      });

      _setGoals(_goals);

      const { error } = await supabase.from("goals").upsert(nulledGoalsData);
      handlePostgrestError(error);
    },
    [goals]
  );

  const removeAllGoals = useCallback(async () => {
    _setGoals([]);

    const { error } = await supabase.from("goals").delete();
    handlePostgrestError(error);
  }, []);

  const removeAllGoalsFromGroup = useCallback(
    async (groupName: string) => {
      const filteredArray = goals.filter((goal) => goal.group_name != groupName);
      _setGoals(filteredArray);

      const { error } = await supabase.from("goals").delete().eq("group_name", groupName);
      handlePostgrestError(error);
    },
    [goals]
  );

  const removeAllGoalsFromOperator = useCallback(
    async (opId: string, groupName: string) => {
      const filteredArray = goals.filter((goal) => goal.group_name != groupName || goal.op_id != opId);
      _setGoals(filteredArray);

      const { error } = await supabase.from("goals").delete().eq("op_id", opId).eq("group_name", groupName);
      handlePostgrestError(error);
    },
    [goals]
  );

  // fetch data from db
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user_id = session?.user.id;

      if (!user_id) return;

      //fetch goals
      const { data: goals } = await supabase.from("goals").select().eq("user_id", user_id);

      let goalResult: GoalData[] = [];
      if (goals?.length) {
        goalResult = goals as GoalData[];
      }
      _setGoals(goalResult);
    };

    fetchData();
  }, []);

  return { goals, updateGoals, removeAllGoals, removeAllGoalsFromGroup, removeAllGoalsFromOperator } as const;
}

export default useGoals;
