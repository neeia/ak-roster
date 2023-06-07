import { supabaseApi } from './apiSlice'
import { Operator, OperatorId } from 'types/operator';
import supabaseClient from 'util/supabaseClient';

const extendedApi = supabaseApi.injectEndpoints({
  endpoints: (builder) => ({
    rosterGet: builder.query({
      queryFn: async () => {
        const user_id = (await supabaseClient.auth.getSession()).data.session?.user.id;
        if (!user_id) return { data: null };

        const { data, error } = await supabaseClient
          .from("operators")
          .select("op_id, owned, favorite, potential, elite, level, skill_level, masteries, modules, skin")
          .match({ user_id })

        return { data };
      },
      providesTags: ["operator"]
    }),
    rosterUpsert: builder.mutation({
      queryFn: async (op: Operator | Operator[]) => {
        const user_id = (await supabaseClient.auth.getSession()).data.session?.user.id;
        if (!user_id) return { data: null };

        const { data, error } = await supabaseClient
          .from("operators")
          .upsert(op)
          .select("op_id, owned, favorite, potential, elite, level, rank, masteries, modules, skin");
        return { data };
      },
      invalidatesTags: (_, __, c) => Array.isArray(c) ? c.map(op => ({ type: "operator", id: op.op_id })) : [{ type: "operator", id: c.op_id }]
    }),
    rosterDelete: builder.mutation({
      queryFn: async (op_id: OperatorId | OperatorId[]) => {
        const user_id = (await supabaseClient.auth.getSession()).data.session?.user.id;
        if (!user_id) return { data: null };

        const { data, error } = Array.isArray(op_id)
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

export const { useRosterGetQuery, useRosterUpsertMutation } = extendedApi