import { useCallback, useState } from "react";
import { Operator } from "types/operators/operator";
import operatorJson from "data/operators";
import Roster from "types/operators/roster";
import supabase from "supabase/supabaseClient";
import AccountData from "types/auth/accountData";
import handlePostgrestError from "util/fns/handlePostgrestError";
import { OperatorSupport } from "types/operators/supports";
import { enqueueSnackbar } from "notistack";

export type LookupData = {
  roster: Roster;
  account: AccountData;
  supports: OperatorSupport[];
} | null;

function useLookup() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LookupData>();

  const clear = () => {
    setData(null);
    setLoading(false);
  };

  // fetch data from db
  const query = useCallback(async (username: string) => {
    setLoading(true);

    if (!username) {
      return { props: { username, data: null } };
    }

    const { data: _account, error } = await supabase
      .from("krooster_accounts")
      .select("*, supports (op_id, slot), operators (*)")
      .eq("username", username.toLocaleLowerCase())
      .limit(1)
      .single();

    const user_id = _account?.user_id;
    if (error) {
      handlePostgrestError(error);
      return;
    } else if (!user_id) {
      clear();
      enqueueSnackbar(`Could not find user: "${username}". Please check your spelling and try again.`, {
        variant: "error",
      });
      return;
    }

    const { supports, operators, ...account } = _account;

    const roster: Roster = {};
    operators.forEach((op) => (roster[op.op_id] = op as Operator));

    setData({
      roster,
      account: account as AccountData,
      supports,
    });
    setLoading(false);
  }, []);

  return { query, data, loading, clear } as const;
}
export default useLookup;
