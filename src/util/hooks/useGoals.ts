import { useCallback, useEffect, useState } from "react";
import supabase from "supabase/supabaseClient";
import GoalData, { GoalDataInsert } from "../../types/goalData";
import { enqueueSnackbar } from "notistack";

function useGoals() {
  const [goals, _setGoals] = useState<GoalData[]>([]);

  const updateGoals = useCallback(
    async (goalsData: GoalDataInsert[]) => {
      const goalsCopy = [...goals];

      goalsData.forEach((goalInsert) => {
        let goal = goals.find((x) => x.op_id == goalInsert.op_id && x.group_name == goalInsert.group_name);
        if (goal) {
          const newGoal: GoalData = { ...goal, ...goalInsert };
          goalsCopy.push(newGoal);
        } else {
          goalsCopy.push(goalInsert as GoalData);
        }
      });

      _setGoals(goalsCopy);

      const { error } = await supabase.from("goals").upsert(goalsData);

      if (error)
        enqueueSnackbar({
          message: `DB${error.code}: ${error.message}`,
          variant: "error",
        });
    },
    [goals]
  );

  const removeAllGoals = useCallback(async () => {
    _setGoals([]);

    const { error } = await supabase.from("goals").delete();

    if (error)
      enqueueSnackbar({
        message: `DB${error.code}: ${error.message}`,
        variant: "error",
      });
  }, []);

  const removeAllGoalsFromGroup = useCallback(
    async (groupName: string) => {
      const filteredArray = goals.filter((goal) => goal.group_name != groupName);
      _setGoals(filteredArray);

      const { error } = await supabase.from("goals").delete().eq("group_name", groupName);

      if (error)
        enqueueSnackbar({
          message: `DB${error.code}: ${error.message}`,
          variant: "error",
        });
    },
    [goals]
  );

  const removeAllGoalsFromOperator = useCallback(
    async (opId: string, groupName: string) => {
      const filteredArray = goals.filter((goal) => goal.group_name != groupName || goal.op_id != opId);
      _setGoals(filteredArray);

      const { error } = await supabase.from("goals").delete().eq("op_id", opId).eq("group_name", groupName);

      if (error)
        enqueueSnackbar({
          message: `DB${error.code}: ${error.message}`,
          variant: "error",
        });
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

  return [goals, updateGoals, removeAllGoals, removeAllGoalsFromGroup, removeAllGoalsFromOperator] as const;
}

export default useGoals;
