import operatorJson from 'data/operators';
import { supabaseApi } from './apiSlice'
import { Operator, OperatorId } from 'types/operator';
import Roster from 'types/operators/roster';
import supabaseClient from 'util/supabaseClient';
import { defaultOperatorObject } from 'util/changeOperator';

export const rosterApi = supabaseApi.injectEndpoints({
  endpoints: (builder) => ({
    rosterGet: builder.query<Roster, void>({
      async queryFn() {
        const user_id = (await supabaseClient.auth.getSession()).data.session?.user.id;
        if (!user_id) return { data: {} };

        const { data } = await supabaseClient
          .from("operators")
          .select("op_id, favorite, potential, elite, level, skill_level, masteries, modules, skin")
          .match({ user_id })

        if (!data || data.length == 0) return { data: {} };

        const acc: Roster = {};
        data.forEach(o => o.op_id in operatorJson ? acc[o.op_id] = o as Operator : null);
        return { data: acc };
      },
      providesTags: ["operator"]
    }),
    rosterUpsert: builder.mutation({
      async queryFn(op: Operator | Operator[]) {
        const { data } = await supabaseClient
          .from("operators")
          .upsert(op)
          .select("op_id, favorite, potential, elite, level, skill_level, masteries, modules, skin");

        return { data };
      },
      async onQueryStarted(op: Operator | Operator[], { dispatch, queryFulfilled }) {
        console.log("Query started:")
        console.log(op)
        const patchResult = dispatch(
          rosterApi.util.updateQueryData('rosterGet', undefined, (draft) => {
            const ops: Roster = Object.fromEntries(
              (Array.isArray(op) ? op : [op]).map(o => [o.op_id, o])
            );
            Object.assign(draft, ops)
          })
        );
        try {
          await queryFulfilled;
          console.log("Query finished:")
          console.log(op)
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_, __, c) => Array.isArray(c) ? c.map(op => ({ type: "operator", id: op.op_id })) : [{ type: "operator", id: c.op_id }]
    }),
    rosterDelete: builder.mutation({
      queryFn: async (op_id: OperatorId | OperatorId[]) => {
        const user_id = (await supabaseClient.auth.getSession()).data.session?.user.id;
        if (!user_id) return { data: null };

        const { data } = Array.isArray(op_id)
          ? await supabaseClient
            .from("operators")
            .delete()
            .in("op_id", op_id)
          : await supabaseClient
            .from("operators")
            .delete()
            .match({ op_id })

        return { data };
      },
      invalidatesTags: (_, __, c) => Array.isArray(c) ? c.map(op => ({ type: "operator", id: op })) : [{ type: "operator", id: c }]
    })
  }),
  overrideExisting: false,
})

export const { useRosterGetQuery, useRosterUpsertMutation, useRosterDeleteMutation } = rosterApi;