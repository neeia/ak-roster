import { useCallback, useEffect, useState } from "react";
import supabase from "supabase/supabaseClient";
import DepotItem from "types/depotItem";
import handlePostgrestError from "util/fns/handlePostgrestError";
import itemJson from "data/items.json";
import useLocalStorage from "./useLocalStorage";
import debounce from "lodash/debounce";

function useDepot() {
  const [depot, _setDepot] = useLocalStorage<Record<string, DepotItem>>("v3_depot", {});
  const [rawDepotUpdate, setRawDepot ] = useState<Record<string, DepotItem>>({});
  const debounceDelayPutDepot = 5000; //5s of no changes before updating db

  //Debounced update DB, only after no changes in delay
  const debouncedPutDepot = useCallback(
    debounce(
      async (items: DepotItem[]) => {
        //Docs && Yesod30: "Add filters to every query", so user_id:
        const { data: { session } } = await supabase.auth.getSession();
        const user_id = session?.user.id;
        if (!user_id) return;

        const { error } = await supabase.from("depot").upsert(items).eq('user_id', user_id);
        handlePostgrestError(error);
        setRawDepot({});
      }
      , debounceDelayPutDepot)
    , []
  );

  // update local storage and agregate depot changes into rawDepotUpdate
  const putDepot = useCallback(
    (items: DepotItem[]) => {
      //dont copy user_id
      //mixing items with/w/o user_id, provokes row-level security error in upsert
      const depotCopy = Object.fromEntries(
        Object.entries(depot).map(([key, { user_id, ...rest }]) => [key, rest])
      );
      const _rawDepotUpdate = { ...rawDepotUpdate };

      items.forEach((item) => {
        //need to create item in local storage, if it didnt exist
        //if exist - agregate only changes
        if ((depotCopy[item.material_id]?.stock ?? 0) !== item.stock) {
          //ignore user_id
          depotCopy[item.material_id] = { 
            material_id: item.material_id,
            stock: item.stock
          }
          _rawDepotUpdate[item.material_id] = {
            ...depotCopy[item.material_id]
          };
        }
      });
      _setDepot(depotCopy);
      setRawDepot(_rawDepotUpdate);

      debouncedPutDepot(Object.values(_rawDepotUpdate));
    },
    [depot,_setDepot]
  );

  // fetch data from db
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      let isCanceled = false;
      const user_id = session?.user.id;

      if (!user_id) return;
      //fetch depot
      const { data: _depot } = await supabase.from("depot").select().eq("user_id", user_id);

      const depotResult: Record<string, DepotItem> = {};
      const depotTrash: string[] = [];
      if (_depot?.length) {
        _depot.forEach((x) => {
          if (x.material_id in itemJson) {
            //unless will specifically need - ignore user_id on fetch too, for consistency
            //depotResult[x.material_id] = x;
            depotResult[x.material_id] = {
              material_id: x.material_id,
              stock: x.stock};
          } else {
            depotTrash.push(x.material_id);
          }
        });
      }

      if (depotTrash.length) await supabase.from("depot").delete().in("material_id", depotTrash);

      if (!isCanceled) _setDepot(depotResult);
      return () => {
        isCanceled = true;
      };
    };

    fetchData();
  }, []);

  return [depot, putDepot] as const;
}

export default useDepot;
