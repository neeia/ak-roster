import { useCallback, useEffect, useState } from "react";
import supabase from "supabase/supabaseClient";
import { GroupsDataInsert } from "types/groupData";
import handlePostgrestError from "util/fns/handlePostgrestError";

function useGoalGroups() {
  const [groups, _setGroups] = useState<string[]>([]);
  const [user_id, setUserId] = useState<string>("");

  const putGroups = useCallback(
    async (goalGroupInsert: GroupsDataInsert[]) => {
      const { error } = await supabase.from("groups").upsert(goalGroupInsert);
      handlePostgrestError(error);

      const { data } = await supabase.from("groups").select("group_name, sort_order").eq("user_id", user_id);

      let names: string[] = [];
      if (data) {
        names = data.sort((a, b) => a.sort_order - b.sort_order).map((x) => x.group_name);
      }
      _setGroups(names);
    },
    [user_id]
  );

  const removeGroup = useCallback(
    async (groupName: string) => {
      const groupsCopy = groups.filter((x) => x !== groupName);
      _setGroups(groupsCopy);

      const { error } = await supabase.from("groups").delete().eq("group_name", groupName);
      handlePostgrestError(error);
    },
    [groups]
  );

  // fetch data from db
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user_id = session?.user.id;

      if (!user_id) return;
      setUserId(user_id);

      const { data } = await supabase.from("groups").select("group_name, sort_order").eq("user_id", user_id);

      let names: string[] = [];
      if (data) {
        names = data.sort((a, b) => a.sort_order - b.sort_order).map((x) => x.group_name);
      }
      _setGroups(names);
    };

    fetchData();
  }, []);

  return { groups, putGroups: putGroups, removeGroup } as const;
}

export default useGoalGroups;
