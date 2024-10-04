import { supabaseApi, UID } from "./apiSlice";
import supabase from "supabase/supabaseClient";
import { OperatorSupport } from "../types/operators/supports";

const extendedApi = supabaseApi.injectEndpoints({
  endpoints: (builder) => ({
    supportsGet: builder.query<OperatorSupport[], void>({
      queryFn: async () => {
        const { data: session } = await supabase.auth.getSession();
        const user_id = session.session?.user.id ?? "";

        const { data, error } = await supabase
          .from("supports")
          .select()
          .eq("user_id", user_id);

        return { data: data as OperatorSupport[] };
      },
      providesTags: ["supports"],
    }),
    supportSet: builder.mutation<boolean, OperatorSupport>({
      queryFn: async (support: OperatorSupport) => {
        const { data: session } = await supabase.auth.getSession();
        const user_id = session.session?.user.id ?? "";

        const { data, error } = await supabase
          .from("supports")
          .upsert(support)
          .eq("user_id", user_id)
          .select()
          .single();
        return { data: !!error };
      },
      invalidatesTags: ["supports"],
    }),
    supportSkillSet: builder.mutation<
      boolean,
      { supportSlot: number; skillSlot: number }
    >({
      queryFn: async ({ supportSlot, skillSlot }) => {
        const { data, error } = await supabase
          .from("supports")
          .update({ skill: skillSlot })
          .eq("slot", supportSlot)
          .select()
          .single();
        return { data: !!error };
      },
      invalidatesTags: ["supports"],
    }),
    supportRemove: builder.mutation<boolean, number>({
      queryFn: async (slot: number) => {
        const { error } = await supabase
          .from("supports")
          .delete()
          .eq("slot", slot)
          .select();
        return { data: !!error };
      },
      invalidatesTags: ["supports"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSupportsGetQuery,
  useSupportSetMutation,
  useSupportSkillSetMutation,
  useSupportRemoveMutation,
} = extendedApi;
