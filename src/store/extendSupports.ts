import {supabaseApi} from "./apiSlice";
import supabaseClient from 'util/supabaseClient';
import {AccountData} from "../types/auth/accountData";
import {Operator} from "../types/operator";
import {Json} from "../types/supabase";
import {OperatorSupport} from "../types/operators/supports";

const extendedApi = supabaseApi.injectEndpoints({
  endpoints: (builder ) => ({
    supportsGet: builder.query<OperatorSupport[], void>({
      queryFn: async () => {
        const userId = (await supabaseClient.auth.getSession()).data.session?.user.id;
        const {data, error} = await supabaseClient
          .from("supports")
          .select()
          .eq('user_id', userId)

        return { data: data as OperatorSupport[] };
      },
      providesTags: ["supports"],
    }),
    supportSet: builder.mutation<boolean, OperatorSupport>({
      queryFn: async (support: OperatorSupport) => {
        // update requires a WHERE clause, so we can use the user_id for it
        const userId = (await supabaseClient.auth.getSession()).data.session?.user.id;

        const {data, error} = await supabaseClient
          .from("supports")
          .upsert(support)
          .eq('user_id', userId)
          .select()
          .single();
        return { data: !!error};
      },
      invalidatesTags: ["supports"],
    }),
    supportSkillSet: builder.mutation<boolean, { supportSlot: number, skillSlot: number }>({
      queryFn: async ({ supportSlot, skillSlot }) => {
        const {data, error} = await supabaseClient
          .from("supports")
          .update({skill: skillSlot})
          .eq('slot', supportSlot)
          .select()
          .single();
        return { data: !!error};
      },
      invalidatesTags: ["supports"],
    }),
    supportRemove: builder.mutation<boolean, number>({
      queryFn: async (slot: number) => {
        const { error} = await supabaseClient
          .from("supports")
          .delete()
          .eq('slot', slot)
          .select()
        return { data: !!error};
      },
      invalidatesTags: ["supports"],
    })
  }),
  overrideExisting: false,
})

export const { useSupportsGetQuery, useSupportSetMutation, useSupportSkillSetMutation, useSupportRemoveMutation} = extendedApi