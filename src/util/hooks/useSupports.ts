import { useCallback, useEffect, useState } from "react";
import supabase from "supabase/supabaseClient";
import { OperatorSupport } from "types/operators/supports";
import handlePostgrestError from "util/fns/handlePostgrestError";

function useSupports() {
  const [supports, _setSupport] = useState<OperatorSupport[]>([]);

  const setSupport = useCallback(
    async (newSupport: OperatorSupport) => {
      const _supports = [...supports];
      const index = _supports.findIndex((x) => x.slot == newSupport.slot);
      if (index === -1) _supports.push(newSupport);
      else _supports[index] = newSupport;
      _setSupport(_supports);

      const { error } = await supabase.from("supports").upsert(newSupport);
      handlePostgrestError(error);
    },
    [supports]
  );

  const removeSupport = useCallback(
    async (slot: number) => {
      const supportsCopy = supports.filter((x) => x.slot != slot);
      _setSupport(supportsCopy);

      const { error } = await supabase.from("supports").delete().eq("slot", slot);
      handlePostgrestError(error);
    },
    [supports]
  );

  // fetch data from db
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user_id = session?.user.id;

      if (!user_id) return;

      const { data } = await supabase.from("supports").select().eq("user_id", user_id);

      _setSupport(data as OperatorSupport[]);
    };

    fetchData();
  }, []);

  return [supports, setSupport, removeSupport] as const;
}

export default useSupports;
