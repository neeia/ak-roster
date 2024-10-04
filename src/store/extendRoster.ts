import operatorJson from "data/operators";
import { supabaseApi, UID } from "./apiSlice";
import { Operator } from "types/operator";
import Roster from "types/operators/roster";
import supabase from "supabase/supabaseClient";
import { defaultOperatorObject } from "util/changeOperator";

export const rosterApi = supabaseApi.injectEndpoints({
  endpoints: (builder) => ({
    rosterGet: builder.query<Roster, void>({
      async queryFn() {
        const { data: session } = await supabase.auth.getSession();
        const user_id = session.session?.user.id ?? "";

        const { data } = await supabase
          .from("operators")
          .select(
            "op_id, favorite, potential, elite, level, skill_level, masteries, modules, skin"
          )
          .match({ user_id });

        if (!data || data.length == 0) return { data: {} };

        const acc: Roster = {};
        data.forEach((o) =>
          o.op_id in operatorJson ? (acc[o.op_id] = o as Operator) : null
        );
        return { data: acc };
      },
      providesTags: ["operator"],
    }),
    rosterUpsert: builder.mutation({
      async queryFn(op: Operator | Operator[]) {
        const { data } = await supabase
          .from("operators")
          .upsert(([] as Operator[]).concat(op))
          .select(
            "op_id, favorite, potential, elite, level, skill_level, masteries, modules, skin"
          );

        return { data };
      },
      async onQueryStarted(
        op: UID & (Operator | Operator[]),
        { dispatch, queryFulfilled }
      ) {
        const patchResult = dispatch(
          rosterApi.util.updateQueryData("rosterGet", undefined, (draft) => {
            const ops: Roster = Object.fromEntries(
              ([] as Operator[]).concat(op).map((o) => [o.op_id, o])
            );
            Object.assign(draft, ops);
          })
        );
        queryFulfilled.catch(patchResult.undo);
      },
      invalidatesTags: (_, __, c) =>
        Array.isArray(c)
          ? c.map((op) => ({ type: "operator", id: op.op_id }))
          : [{ type: "operator", id: c.op_id }],
    }),
    rosterDelete: builder.mutation({
      queryFn: async (op_id: string | string[]) => {
        const user_id = (await supabase.auth.getSession()).data.session?.user
          .id;
        if (!user_id) return { data: null };

        const { data } = Array.isArray(op_id)
          ? await supabase.from("operators").delete().in("op_id", op_id)
          : await supabase.from("operators").delete().match({ op_id });

        return { data };
      },
      invalidatesTags: (_, __, c) =>
        Array.isArray(c)
          ? c.map((op) => ({ type: "operator", id: op }))
          : [{ type: "operator", id: c }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useRosterGetQuery,
  useRosterUpsertMutation,
  useRosterDeleteMutation,
} = rosterApi;
