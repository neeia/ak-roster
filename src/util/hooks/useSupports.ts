import { useCallback, useEffect, useState } from "react";
import supabase from "supabase/supabaseClient";
import { enqueueSnackbar } from "notistack";
import { OperatorSupport } from "../../types/operators/supports";

function useSupports() {
  const [supports, _setSupport] = useState<OperatorSupport[]>([]);

  const setSupport = useCallback(async (newSupport: OperatorSupport) => {

    const supportsCopy = [...supports];
    const index = supportsCopy.findIndex(x => x.slot == newSupport.slot);
    supportsCopy[index] = newSupport;
    _setSupport(supportsCopy);

    const {error } = await supabase
      .from("supports")
      .upsert(newSupport)

    if (error)
      enqueueSnackbar({
        message: `DB${error.code}: ${error.message}`,
        variant: "error",
      });

  }, [supports]);

  const removeSupport = useCallback(async (slot: number) => {

    const supportsCopy = supports.filter(x => x.slot != slot);
    _setSupport(supportsCopy);

    const { error } = await supabase
      .from("supports")
      .delete()
      .eq("slot", slot)

    if (error)
      enqueueSnackbar({
        message: `DB${error.code}: ${error.message}`,
        variant: "error",
      });

  }, [supports]);

  // fetch data from db
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user_id = session?.user.id;

      if (!user_id) return;

      const { data } = await supabase
        .from("supports")
        .select()
        .eq("user_id", user_id);

      _setSupport(data as OperatorSupport[]);
    };

    fetchData();
  }, []);

  return [supports, setSupport, removeSupport] as const;
}

export default useSupports;
