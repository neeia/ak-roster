import {supabaseApi} from "./apiSlice";
import supabaseClient from 'util/supabaseClient';
import {AccountData} from "../types/auth/accountData";
import {Operator} from "../types/operator";

const extendedApi = supabaseApi.injectEndpoints({
  endpoints: (builder ) => ({
    accountGet: builder.query<AccountData, void>({
      queryFn: async () => {
        const {data, error} = await supabaseClient
          .from("krooster_accounts")
          .select()
          .single();

        return { data: data as AccountData  };
      },
      providesTags: ["account"],
    }),
    accountPrivateSet: builder.mutation<AccountData, boolean>({
      queryFn: async (isPrivate: boolean) => {
        // update requires a WHERE clause, so we can use the user_id for it
        const {data: session} = await supabaseClient.auth.getSession();
        const userId = session.session?.user.id;

        const {data, error} = await supabaseClient
          .from("krooster_accounts")
          .update({private: isPrivate})
          .eq('user_id', userId)
          .select()
          .single();
        return { data: data as AccountData };
      },
      invalidatesTags: ["account"],
    }),
    displayNameSet: builder.mutation<boolean, string>({
      queryFn: async (displayName: string) => {
        //update requires a WHERE clause, so we can use the user_id for it
        const {data: session} = await supabaseClient.auth.getSession();
        const userId = session.session?.user.id;

        const username = displayName.toLowerCase().replace(/\s/g, "");

        const {data, error} = await supabaseClient
          .from("krooster_accounts")
          .update({display_name: displayName, username: username})
          .eq('user_id', userId)

        return !error ? { data: true} : {data: false};
      },
      invalidatesTags: ["account"],
    })
  }),
  overrideExisting: false,
})

export const { useAccountGetQuery, useAccountPrivateSetMutation, useDisplayNameSetMutation} = extendedApi