import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "supabase/supabaseClient";
import AccountData, { AccountDataInsert } from "types/auth/accountData";
import { enqueueSnackbar } from "notistack";
import randomName from "util/fns/randomName";
import handlePostgrestError from "util/fns/handlePostgrestError";

async function fetchAccount(): Promise<AccountData | null> {
  const { data: { session } } = await supabase.auth.getSession();
  const user_id = session?.user.id;
  if (!user_id) return null;

  const { data, error } = await supabase
    .from("krooster_accounts")
    .select()
    .eq("user_id", user_id)
    .limit(1)
    .single();
  handlePostgrestError(error);
  // If user record missing or empty username → create one
  if (!data || (!data.username && !error)) {
    const genName = randomName();
    const { data: accountData, error: upsertError } = await supabase
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

    handlePostgrestError(upsertError);
    enqueueSnackbar({
      message: "You have been assigned a random username. Change it in the settings!",
      variant: "info",
    });
    return accountData as AccountData;
  }

  return data as AccountData;
}

function useAccount() {
  const queryClient = useQueryClient();

  const { data: account, isLoading } = useQuery({
    queryKey: ["account"],
    queryFn: fetchAccount,
    staleTime: 1000 * 60 * 60 * 24, // 1 day
    gcTime: 1000 * 60 * 60 * 24, // 1 day
    retry: false,
  });

  const updateAccount = useMutation({
    mutationFn: async (accountData: AccountDataInsert) => {
      const previous = queryClient.getQueryData<AccountData>(["account"])
      const merged = { ...previous, ...accountData };
      const { user_id, ...rest } = merged;
      if (!user_id) throw new Error("Missing user_id");

      const { error } = await supabase
        .from("krooster_accounts")
        .update({ ...rest })
        .eq("user_id", user_id);
      handlePostgrestError(error);
    },

    //Optimistically update cache before request
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["account"] });
      const previousAccount = queryClient.getQueryData<AccountData>(["account"]);

      queryClient.setQueryData<AccountData>(["account"], (old) => ({
        ...old,
        ...newData,
      }) as AccountData);

      return { previousAccount };
    },

    //Update error > return to previous state + message
    onError: (err, newData, context) => {
      if (context?.previousAccount) {
        queryClient.setQueryData(["account"], context.previousAccount);
      }
      enqueueSnackbar({
        message: "Failed to save account changes.",
        variant: "error",
      });
    },

    //Invalidate cache after success/failure
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });

  return [account, updateAccount.mutateAsync, { loading: isLoading }] as const;
}

export default useAccount;
