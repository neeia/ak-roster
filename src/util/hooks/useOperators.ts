import { useCallback, useEffect, useRef, useState } from "react";
import { Operator, OperatorV2 } from "types/operators/operator";
import operatorJson from "data/operators";
import useLocalStorage from "./useLocalStorage";
import Roster from "types/operators/roster";
import supabase from "supabase/supabaseClient";
import handlePostgrestError from "util/fns/handlePostgrestError";
import { repair } from "util/fns/convertLegacyOperator";
import { enqueueSnackbar } from "notistack";

function useOperators() {
  const [operators, setOperators] = useLocalStorage<Roster>("v3_roster", {});
  const [legacyOperators, setLegacyOperators] = useLocalStorage<null | Record<string, OperatorV2>>("operators", null);

  const [isLoaded, setIsLoaded] = useState(false);

  // change operator, push to db
  const onChange = useCallback(
    (op: Operator) => {
      setOperators(({ ..._roster }) => {
        // assign if owned, otherwise delete
        if (op.potential) {
          _roster[op.op_id] = op;
          supabase
            .from("operators")
            .upsert(op)
            .then(({ error }) => handlePostgrestError(error));
        } else {
          delete _roster[op.op_id];
          supabase
            .from("operators")
            .delete()
            .eq("op_id", op.op_id)
            .then(({ error }) => handlePostgrestError(error));
        }
        return _roster;
      });
    },
    [setOperators]
  );

  const overwriteOperators = useCallback(
    async (newOperators: Operator[]) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user_id = session?.user.id;
      if (!user_id) return;

      if ((newOperators?.length ?? 0) === 0) return;

      // Filter valid operators and append user_id
      const preparedOperators = newOperators
        .filter((op) => op.op_id in operatorJson)
        .map((op) => ({
          ...op,
          user_id,
        }));

      if (preparedOperators.length === 0) return;

      // 1. Delete all existing operator records for this user
      const { error: deleteError } = await supabase
        .from("operators")
        .delete()
        .eq("user_id", user_id);

      if (deleteError) {
        handlePostgrestError(deleteError);
        return;
      }

      // 2. Insert new operators
      const { error: insertError } = await supabase
        .from("operators")
        .insert(preparedOperators);

      if (insertError) {
        handlePostgrestError(insertError);
        return;
      }

      // 3. Update local state
      const newRoster: Roster = preparedOperators.reduce((acc, op) => {
        acc[op.op_id] = op;
        return acc;
      }, {} as Roster);

      setOperators(newRoster);
    },
    [setOperators]
  );

  const hydrated = useRef(false);
  // fetch data from db
  useEffect(() => {
    let isCanceled = false;
    if (hydrated.current) return;

    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user_id = session?.user.id;

      if (!user_id) {
        setIsLoaded(true);
        return;
      }

      const { data: dbOperators, error } = await supabase.from("operators").select().match({ user_id });
      if (error) handlePostgrestError(error);

      let _roster: Roster = {};
      if (dbOperators?.length)
        dbOperators.forEach((op) => {
          if (op.op_id in operatorJson) _roster[op.op_id] = { ...op } as Operator;
        });
      else if (!Object.keys(operators).length && legacyOperators) {
        enqueueSnackbar("Loading cached roster data...", { variant: "info" });
        _roster = repair(legacyOperators);

        const { error } = await supabase.from("operators").insert(Object.values(_roster));
        if (error) handlePostgrestError(error);
        else {
          enqueueSnackbar("Finished loading data.", { variant: "success" });
          setLegacyOperators(null);
          localStorage.removeItem("operators");
        }
      }

      hydrated.current = true;
      if (!isCanceled) {
        setOperators(_roster);
        setIsLoaded(true);
      }
    };

    fetchData();

    return () => {
      isCanceled = true;
    };
  }, []);

  return [operators, onChange, isLoaded, overwriteOperators] as const;
}
export default useOperators;
