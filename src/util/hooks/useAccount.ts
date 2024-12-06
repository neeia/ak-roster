import { useCallback, useEffect, useState } from "react";
import supabase from "supabase/supabaseClient";
import AccountData, { AccountDataInsert } from "../../types/auth/accountData";
import { enqueueSnackbar } from "notistack";

function useAccount() {
  const [account, _setAccount] = useState<AccountData>();

  const setAccount = useCallback(async (accountData: AccountDataInsert) => {

    const updatedData: AccountData = { ...account, ...accountData } as AccountData;
    _setAccount(updatedData);

    const { user_id, ...rest } = updatedData;
    const { error } = await supabase
      .from("krooster_accounts")
      .update({ ...rest })
      .eq("user_id", user_id);

    if (error)
      enqueueSnackbar({
        message: `DB${error.code}: ${error.message}`,
        variant: "error",
      });

  }, [account]);

  // fetch data from db
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user_id = session?.user.id;

      if (!user_id) return;

      const { data } = await supabase
        .from("krooster_accounts")
        .select()
        .eq("user_id", user_id)
        .single();

      _setAccount(data as AccountData);
    };

    fetchData();
  }, []);

  return [account, setAccount] as const;
}

export default useAccount;
