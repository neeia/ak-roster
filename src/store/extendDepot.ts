import { supabaseApi } from "./apiSlice";
import DepotItem from "types/depotItem";
import supabase from "../supabase/supabaseClient";

const extendedApi = supabaseApi.injectEndpoints({
  endpoints: (builder) => ({
    depotGet: builder.query<Record<string, DepotItem>, void>({
      async queryFn() {
        const { data: session } = await supabase.auth.getSession();
        const user_id = session.session?.user.id ?? "";

        const { data } = await supabase.from("depot").select().eq("user_id", user_id);

        const result: Record<string, DepotItem> = {};
        data?.forEach((x) => (result[x.material_id] = x));
        return { data: result };
      },
      providesTags: ["depot"],
    }),
    depotUpdate: builder.mutation<DepotItem[], DepotItem[]>({
      async queryFn(depotDataInsert) {
        const { data: session } = await supabase.auth.getSession();
        const user_id = session.session?.user.id ?? "";

        const { data } = await supabase.from("depot").upsert(depotDataInsert).select();

        return { data } as { data: DepotItem[] };
      },
      invalidatesTags: ["depot"],
    }),
    depotResetCraftingUpdate: builder.mutation<boolean, void>({
      async queryFn() {
        const { data: session } = await supabase.auth.getSession();
        const user_id = session.session?.user.id ?? "";

        const { error } = await supabase.from("depot").update({ crafting: false }).eq("user_id", user_id);
        console.log(JSON.stringify(error));

        return { data: !!error };
      },
      invalidatesTags: ["depot"],
    }),
    depotResetStockUpdate: builder.mutation<boolean, void>({
      async queryFn() {
        const { data: session } = await supabase.auth.getSession();
        const user_id = session.session?.user.id ?? "";

        const { error } = await supabase.from("depot").update({ stock: 0 }).eq("user_id", user_id);

        console.log(JSON.stringify(error));
        return { data: !!error };
      },
      invalidatesTags: ["depot"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useDepotGetQuery,
  useDepotUpdateMutation,
  useDepotResetStockUpdateMutation,
  useDepotResetCraftingUpdateMutation,
} = extendedApi;
