import { useCallback, useEffect, useState } from "react";
import supabase from "supabase/supabaseClient";
import GoalData, { getPlannerGoals, GoalDataInsert, plannerGoalToGoalData } from "types/goalData";
import handlePostgrestError from "util/fns/handlePostgrestError";
import useLocalStorage from "./useLocalStorage";
import _ from "lodash";

export interface GoalsHook {
  readonly goals: GoalData[];
  readonly updateGoals: (goalsData: GoalDataInsert[]) => Promise<void>;
  readonly removeAllGoals: () => Promise<void>;
  readonly removeAllGoalsFromGroup: (groupName: string, cleanLocal?: boolean) => Promise<void>;
  readonly removeAllGoalsFromOperator: (opId: string, groupName: string) => Promise<void>;
  readonly changeLocalGoalGroup: (oldGoalGroup: string, newGoalGroup: string) => Promise<void>;
}

const fillNull = (goal: GoalDataInsert, index: number): GoalDataInsert => {
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
  const [user_id, setUserId] = useState<string>("");

  const updateGoals = useCallback(
    async (goalsData: GoalDataInsert[]) => {
      const _goals = [...goals];
      //group max index - remove some of index numbers leakage
      const maxGroupIndex: Record<string, number> = {};
      _goals.forEach(g => {
        maxGroupIndex[g.group_name] = Math.max(maxGroupIndex[g.group_name] ?? 0, g.sort_order ?? 0);
      });
      const nulledGoalsData = goalsData.map((g) => fillNull(g, (maxGroupIndex[g.group_name] ?? -1) + 1));
      nulledGoalsData.forEach((goalInsert) => {
        const plannerGoals = getPlannerGoals(goalInsert);
        const substantial = plannerGoals.length > 0;
        if (!substantial) {
          const index = _goals.findIndex((x) => x.op_id === goalInsert.op_id && x.group_name === goalInsert.group_name);
          _goals.splice(index, 1);
          supabase
            .from("goals")
            .delete()
            .match({ op_id: goalInsert.op_id, group_name: goalInsert.group_name })
            .then(({ error }) => handlePostgrestError(error));
          return;
        }
        const index = _goals.findIndex((x) => x.op_id === goalInsert.op_id && x.group_name === goalInsert.group_name);
        if (index !== -1) {
          const newGoal: GoalData = { ...goals[index], ...goalInsert };
          _goals[index] = newGoal;
        } else {
          _goals.push(goalInsert as GoalData);
        }

        supabase
          .from("goals")
          .upsert(goalInsert)
          .then(({ error }) => handlePostgrestError(error));
      });
      _setGoals(_goals);
    },
    [goals, _setGoals]
  );

  const changeLocalGoalGroup = useCallback(
    async (oldGoalGroup: string, newGoalGroup: string) => {
      const _goals = [...goals];
      _goals.forEach((goal) => {
        if (goal.group_name === oldGoalGroup) {
          goal.group_name = newGoalGroup;
        }
      });
      _setGoals(_goals);
    },
    [_setGoals, goals]
  );

  const removeAllGoals = useCallback(async () => {
    _setGoals([]);

    const { error } = await supabase.from("goals").delete().eq("user_id", user_id);
    handlePostgrestError(error);
  }, [_setGoals]);

  const removeAllGoalsFromGroup = useCallback(
    async (groupName: string, cleanLocal?: boolean) => {
      const filteredArray = goals.filter((goal) => goal.group_name !== groupName);
      _setGoals(filteredArray);
      if (cleanLocal) return;
      const { error } = await supabase.from("goals").delete().eq("group_name", groupName);
      handlePostgrestError(error);
    },
    [goals, _setGoals]
  );

  const removeAllGoalsFromOperator = useCallback(
    async (opId: string, groupName: string) => {
      const filteredArray = goals.filter((goal) => goal.group_name !== groupName || goal.op_id !== opId);
      _setGoals(filteredArray);

      const { error } = await supabase.from("goals").delete().eq("op_id", opId).eq("group_name", groupName);
      handlePostgrestError(error);
    },
    [goals, _setGoals]
  );

  // fetch data from db
  useEffect(() => {
    let isCanceled = false;
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user_id = session?.user.id;

      if (!user_id) return;
      setUserId(user_id);

      //fetch goals
      const { data: _goals } = await supabase.from("goals").select().eq("user_id", user_id);

      let goalResult: GoalData[] = [];
      if (_goals?.length) {
        goalResult = _goals as GoalData[];
      }

      if (!isCanceled) _setGoals(goalResult);
    };

    fetchData();
    return () => {
      isCanceled = true;
    };
  }, []);

  return {
    goals,
    updateGoals,
    removeAllGoals,
    removeAllGoalsFromGroup,
    removeAllGoalsFromOperator,
    changeLocalGoalGroup,
  } as const;
}

export default useGoals;
