import { useCallback, useEffect, useState } from "react";
import { Operator } from "types/operators/operator";
import operatorJson from "data/operators";
import useLocalStorage from "./useLocalStorage";
import Roster from "types/operators/roster";
import supabase from "supabase/supabaseClient";

function useOperators() {
  const [operators, setOperators] = useState<Roster>({});
  const [_operators] = useLocalStorage<Roster>("operators", {});

  // change operator, push to db
  const onChange = useCallback(
    (op: Operator) => {
      setOperators(({ ..._roster }) => {
        // assign if owned, otherwise delete
        if (op.potential) _roster[op.op_id] = op;
        else delete _roster[op.op_id];
        return _roster;
      });
    },
    [setOperators]
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

      const { data: dbOperators } = await supabase
        .from("operators")
        .select("op_id, favorite, potential, elite, level, skill_level, masteries, modules, skin")
        .match({ user_id });

      if (!dbOperators?.length) return { data: {} };

      const _roster: Roster = {};
      dbOperators.forEach((op) => (op.op_id in operatorJson ? (_roster[op.op_id] = op as Operator) : null));

      if (!isCanceled) setOperators(_roster);
    };

    fetchData();

    return () => {
      isCanceled = true;
    };
  }, []);

  return [operators, setOperators, onChange] as const;
}
export default useOperators;
