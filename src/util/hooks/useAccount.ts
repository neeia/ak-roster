import { useCallback, useEffect, useState } from "react";
import supabase from "supabase/supabaseClient";
import AccountData, { AccountDataInsert } from "types/auth/accountData";
import { enqueueSnackbar } from "notistack";
import randomName from "util/fns/randomName";
import handlePostgrestError from "util/fns/handlePostgrestError";

function useAccount() {
  const [account, _setAccount] = useState<AccountData>();
  const [loading, setLoading] = useState(true);

  const setAccount = useCallback(
    async (accountData: AccountDataInsert) => {
      const updatedData: AccountData = { ...account, ...accountData } as AccountData;
      _setAccount(updatedData);

      const { user_id, ...rest } = updatedData;
      const { error } = await supabase
        .from("krooster_accounts")
        .update({ ...rest })
        .eq("user_id", user_id);
      handlePostgrestError(error);
    },
    [account]
  );

  // fetch data from db
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user_id = session?.user.id;

      if (!user_id || cancelled) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("krooster_accounts")
        .select()
        .eq("user_id", user_id)
        .limit(1)
        .single();
      handlePostgrestError(error);

      if (!data || (!data.username && !error && !cancelled)) {
        const genName = randomName();
        const { data: accountData } = await supabase
          .from("krooster_accounts")
          .upsert({
            user_id: user_id,
            username: genName,
            display_name: genName,
          })
          .is("username", null)
          .select()
          .limit(1)
          .single();

        enqueueSnackbar({
          message: "You have been assigned a random username. Change it in the settings!",
          variant: "info",
        });
        _setAccount(accountData as AccountData);
      } else {
        _setAccount(data as AccountData);
      }
      setLoading(false);
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  return [account, setAccount, { loading }] as const;
}

export default useAccount;
