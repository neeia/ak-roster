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

    const { data: _account, error: accountError } = await supabase
      .from("krooster_accounts")
      .select()
      .match({ username })
      .limit(1);
    handlePostgrestError(accountError);

    const account = _account?.[0] as AccountData;
    const user_id = account?.user_id;
    if (!user_id) {
      clear();
      enqueueSnackbar(`Could not find user: "${username}". Please check your spelling and try again.`, {
        variant: "error",
      });
      return;
    }

    const { data: _roster, error: rosterError } = await supabase.from("operators").select().match({ user_id });
    handlePostgrestError(rosterError);

    const { data: supports, error: supportError } = await supabase.from("supports").select().match({ user_id });
    handlePostgrestError(supportError);

    if (!account || !_roster || !supports) {
      clear();
      return;
    }

    const roster: Roster = {};
    _roster.filter(({ op_id }) => op_id in operatorJson).forEach((op) => (roster[op.op_id] = op as Operator));

    setData({
      roster,
      account,
      supports,
    });
    setLoading(false);
  }, []);

  return { query, data, loading, clear } as const;
}
export default useLookup;
