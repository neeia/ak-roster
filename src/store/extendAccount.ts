import {supabaseApi} from "./apiSlice";
import supabaseClient from 'util/supabaseClient';
import {AccountData} from "../types/auth/accountData";
import {Operator} from "../types/operator";
import {Json} from "../types/supabase";

const extendedApi = supabaseApi.injectEndpoints({
  endpoints: (builder ) => ({
    accountGet: builder.query<AccountData, void>({
      queryFn: async () => {
        const userId = (await supabaseClient.auth.getSession()).data.session?.user.id;
        const {data, error} = await supabaseClient
          .from("krooster_accounts")
          .select()
          .eq('user_id', userId)
          .single();

        return { data: data as AccountData  };
      },
      providesTags: ["account"],
    }),
    accountPrivateSet: builder.mutation<AccountData, boolean>({
      queryFn: async (isPrivate: boolean) => {
        // update requires a WHERE clause, so we can use the user_id for it
        const userId = (await supabaseClient.auth.getSession()).data.session?.user.id;

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
        const userId = (await supabaseClient.auth.getSession()).data.session?.user.id;

        const username = displayName.toLowerCase().replace(/\s/g, "");

        const {data, error} = await supabaseClient
          .from("krooster_accounts")
          .update({display_name: displayName, username: username})
          .eq('user_id', userId)

        return !error ? { data: true} : {data: false};
      },
      invalidatesTags: ["account"],
    }),
    friendCodeSet: builder.mutation<boolean, { username: string, tag: string }>({
      queryFn: async (friendCode : { username: string, tag: string }) => {
        //update requires a WHERE clause, so we can use the user_id for it
        const userId = (await supabaseClient.auth.getSession()).data.session?.user.id;

        const {data, error} = await supabaseClient
          .from("krooster_accounts")
          .update({friendcode: friendCode})
          .eq('user_id', userId)

        return !error ? { data: true} : {data: false};
      },
      invalidatesTags: ["account"],
    }),
    serverSet: builder.mutation<boolean, string>({
      queryFn: async (server : string) => {
        //update requires a WHERE clause, so we can use the user_id for it
        const userId = (await supabaseClient.auth.getSession()).data.session?.user.id;

        const {data, error} = await supabaseClient
          .from("krooster_accounts")
          .update({server: server})
          .eq('user_id', userId)

        return !error ? { data: true} : {data: false};
      },
      invalidatesTags: ["account"],
    }),
    levelSet: builder.mutation<boolean, string>({
      queryFn: async (level : string) => {
        //update requires a WHERE clause, so we can use the user_id for it
        const userId = (await supabaseClient.auth.getSession()).data.session?.user.id;

        let levelNumber : number | null;
        if (level === "")
        {
          levelNumber = null;
        }
        else
        {
          levelNumber = parseInt(level);
        }

        const {data, error} = await supabaseClient
          .from("krooster_accounts")
          .update({level: levelNumber})
          .eq('user_id', userId)

        return !error ? { data: true} : {data: false};
      },
      invalidatesTags: ["account"],
    }),
    onboardSet: builder.mutation<boolean, string | null>({
      queryFn: async (onboard : string) => {
        //update requires a WHERE clause, so we can use the user_id for it
        const userId = (await supabaseClient.auth.getSession()).data.session?.user.id;

        const {data, error} = await supabaseClient
          .from("krooster_accounts")
          .update({onboard: onboard})
          .eq('user_id', userId)

        return !error ? { data: true} : {data: false};
      },
      invalidatesTags: ["account"],
    }),
    discordSet: builder.mutation<boolean, string>({
      queryFn: async (discordUsername : string) => {
        //update requires a WHERE clause, so we can use the user_id for it
        const userId = (await supabaseClient.auth.getSession()).data.session?.user.id;

        const {data, error} = await supabaseClient
          .from("krooster_accounts")
          .update({discordcode: discordUsername})
          .eq('user_id', userId)

        return !error ? { data: true} : {data: false};
      },
      invalidatesTags: ["account"],
    }),
    redditSet: builder.mutation<boolean, string>({
      queryFn: async (redditUsername : string) => {
        //update requires a WHERE clause, so we can use the user_id for it
        const userId = (await supabaseClient.auth.getSession()).data.session?.user.id;

        const {data, error} = await supabaseClient
          .from("krooster_accounts")
          .update({reddituser: redditUsername})
          .eq('user_id', userId)

        return !error ? { data: true} : {data: false};
      },
      invalidatesTags: ["account"],
    })
  }),
  overrideExisting: false,
})

export const { useAccountGetQuery, useAccountPrivateSetMutation, useDisplayNameSetMutation, useFriendCodeSetMutation, useServerSetMutation, useLevelSetMutation, useOnboardSetMutation, useDiscordSetMutation, useRedditSetMutation} = extendedApi