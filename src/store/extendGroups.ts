import { supabaseApi } from "./apiSlice";
import supabase from "supabase/supabaseClient";
import GoalData, { GoalDataInsert } from "types/goalData";
import GroupData, { GroupsDataInsert } from "../types/groupData";

const extendedApi = supabaseApi.injectEndpoints({
  endpoints : (builder) => ({
      groupsGet: builder.query<string[], void>({
        async queryFn( ) {

          const {data: session} = await supabase.auth.getSession();
          const user_id = session.session?.user.id ?? "";

          const { data } = await supabase
            .from("groups")
            .select("group_name")
            .eq("user_id", user_id)

          let names: string[] = [];
          if (data)
          {
            names = data.map(x => x.group_name);
          }
          return { data: names };
        },
        providesTags: ["groups"]
      }),
      groupsUpdate: builder.mutation<GroupData[], GroupsDataInsert[] >({
        async queryFn( goalDataInsert ) {

          const { data } = await supabase
            .from("groups")
            .upsert(goalDataInsert)
            .select()

          return { data } as { data: GroupData[] };
        },
        invalidatesTags: ["groups"]
      }),
    }
  ),
  overrideExisting: false,
})

export const { useGroupsGetQuery, useGroupsUpdateMutation,  } = extendedApi
