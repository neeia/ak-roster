import { useCallback, useEffect, useState } from "react";
import supabase from "supabase/supabaseClient";
import { GroupsDataInsert } from "types/groupData";
import handlePostgrestError from "util/fns/handlePostgrestError";
import useLocalStorage from "./useLocalStorage";

function useGoalGroups() {
  const [groups, _setGroups] = useLocalStorage<string[]>("v3_groups", []);
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
    [user_id, _setGroups]
  );

  const renameGroup = useCallback(
    async (oldName: string, newName: string) => {
      if (!oldName || !newName) return;
      const { error } = await supabase.from("groups").update({ group_name: newName }).eq("group_name", oldName);
      handlePostgrestError(error);

      const { data } = await supabase.from("groups").select("group_name, sort_order").eq("user_id", user_id);

      let names: string[] = [];
      if (data) {
        names = data.sort((a, b) => a.sort_order - b.sort_order).map((x) => x.group_name);
      }
      _setGroups(names);
    },
    [user_id, _setGroups]
  );

  const removeGroup = useCallback(
    async (groupName: string) => {
      const groupsCopy = groups.filter((x) => x !== groupName);
      _setGroups(groupsCopy);

      const { error } = await supabase.from("groups").delete().eq("group_name", groupName);
      handlePostgrestError(error);
    },
    [groups, _setGroups]
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
  }, [_setGroups]);

  return { groups, putGroups: putGroups, renameGroup, removeGroup } as const;
}

export default useGoalGroups;
