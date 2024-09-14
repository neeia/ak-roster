import { supabaseApi, UID } from "./apiSlice";
import supabase from 'supabase/supabaseClient';
import AccountData, { AccountDataInsert } from "types/auth/accountData";

const extendedApi = supabaseApi.injectEndpoints({
  endpoints: (builder) => ({
    accountGet: builder.query<AccountData, UID>({
      async queryFn({ user_id }) {
        const { data } = await supabase
          .from("krooster_accounts")
          .select()
          .eq("user_id", user_id)
          .single();

        return { data } as { data: AccountData };
      },
      providesTags: ["account"],
    }),
    currentAccountGet: builder.query<AccountData, void>({
      async queryFn() {

        const {data: session} = await supabase.auth.getSession();
        const user_id = session.session?.user.id ?? "";

        const { data } = await supabase
          .from("krooster_accounts")
          .select()
          .eq("user_id", user_id)
          .single();

        return { data } as { data: AccountData };
      },
      providesTags: ["account"],
      serializeQueryArgs: q => q.endpointName,
    }),
    accountUpdate: builder.mutation<AccountData, AccountDataInsert>({
      async queryFn(account: AccountData) {
        const { user_id, ...rest } = account;
        const { data, error } = await supabase
          .from("krooster_accounts")
          .update({ ...rest })
          .eq("user_id", user_id)
          .select()
          .single();

        return { data } as { data: AccountData };
      },
      invalidatesTags: ["account"],
    }),
  }),
  overrideExisting: false,
})

export const { useAccountGetQuery, useCurrentAccountGetQuery, useAccountUpdateMutation } = extendedApi