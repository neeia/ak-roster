import { supabaseApi, UID } from "./apiSlice";
import DepotData, { DepotDataInsert } from "types/depotData";
import supabase from "../supabase/supabaseClient";
import AccountData from "../types/auth/accountData";

const extendedApi = supabaseApi.injectEndpoints({
  endpoints : (builder) => ({
      depotGet: builder.query<DepotData[], void>({
        async queryFn( ) {

          const {data: session} = await supabase.auth.getSession();
          const user_id = session.session?.user.id ?? "";

          const { data } = await supabase
            .from("depot")
            .select()
            .eq("user_id", user_id)

          return { data } as { data: DepotData[] };
        },
        providesTags: ["depot"]
      }),
      depotUpdate: builder.mutation<DepotData[], DepotDataInsert[] >({
        async queryFn( depotDataInsert ) {

          const {data: session} = await supabase.auth.getSession();
          const user_id = session.session?.user.id ?? "";

          const { data } = await supabase
            .from("depot")
            .upsert(depotDataInsert)
            .select()

          return { data } as { data: DepotData[] };
        },
        invalidatesTags: ["depot"]
      }),
    }
  ),
  overrideExisting: false,
})

export const { useDepotGetQuery, useDepotUpdateMutation } = extendedApi
