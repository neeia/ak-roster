import { supabaseApi } from "./apiSlice";
import supabase from "supabase/supabaseClient";
import GoalData, { GoalDataInsert } from "types/goalData";

const extendedApi = supabaseApi.injectEndpoints({
  endpoints: (builder) => ({
    goalsGet: builder.query<GoalData[], void>({
      async queryFn() {
        const { data: session } = await supabase.auth.getSession();
        const user_id = session.session?.user.id ?? "";

        const { data } = await supabase.from("goals").select().eq("user_id", user_id);

        return { data } as { data: GoalData[] };
      },
      providesTags: ["goals"],
    }),
    goalsUpdate: builder.mutation<GoalData[], GoalDataInsert[]>({
      async queryFn(goalDataInsert) {
        const { data, error } = await supabase.from("goals").upsert(goalDataInsert).select();
        return { data } as { data: GoalData[] };
      },
      invalidatesTags: ["goals"],
    }),
    goalsDeleteAll: builder.mutation<boolean, void>({
      async queryFn() {
        const { data: session } = await supabase.auth.getSession();
        const user_id = session.session?.user.id ?? "";

        const { error } = await supabase.from("goals").delete().eq("user_id", user_id);

        return { data: !!error };
      },
      invalidatesTags: ["goals"],
    }),
    goalsDeleteAllFromGroup: builder.mutation<boolean, string>({
      async queryFn(groupName: string) {
        const { data: session } = await supabase.auth.getSession();
        const user_id = session.session?.user.id ?? "";

        const { error } = await supabase.from("goals").delete().eq("user_id", user_id).eq("group_name", groupName);

        return { data: !!error };
      },
      invalidatesTags: ["goals"],
    }),
    goalsOperatorDelete: builder.mutation<boolean, GoalDataInsert>({
      async queryFn({ op_id, group_name }) {
        const { data: session } = await supabase.auth.getSession();
        const user_id = session.session?.user.id ?? "";

        const { error } = await supabase
          .from("goals")
          .delete()
          .eq("user_id", user_id)
          .eq("op_id", op_id)
          .eq("group_name", group_name);

        console.log(error);
        return { data: !!error };
      },
      invalidatesTags: ["goals"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGoalsGetQuery,
  useGoalsUpdateMutation,
  useGoalsDeleteAllMutation,
  useGoalsDeleteAllFromGroupMutation,
  useGoalsOperatorDeleteMutation,
} = extendedApi;
