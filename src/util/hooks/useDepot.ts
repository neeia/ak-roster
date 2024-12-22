import { useCallback, useEffect, useState } from "react";
import supabase from "supabase/supabaseClient";
import DepotItem from "types/depotItem";
import handlePostgrestError from "util/fns/handlePostgrestError";

function useDepot() {
  const [depot, _setDepot] = useState<Record<string, DepotItem>>({});

  // change operator, push to db
  const setDepot = useCallback(
    async (items: DepotItem[]) => {
      const depotCopy = { ...depot };

      items.forEach((item) => {
        depotCopy[item.material_id] = item;
      });

      _setDepot(depotCopy);

      const { error } = await supabase.from("depot").upsert(items).select();
      handlePostgrestError(error);
    },
    [depot]
  );

  // fetch data from db
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user_id = session?.user.id;

      if (!user_id) return;

      //fetch depot
      const { data: depot } = await supabase.from("depot").select().eq("user_id", user_id);

      const depotResult: Record<string, DepotItem> = {};
      depot?.forEach((x) => (depotResult[x.material_id] = x));

      _setDepot(depotResult);
    };

    fetchData();
  }, []);

  return [depot, setDepot] as const;
}

export default useDepot;
