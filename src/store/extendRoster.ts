import { supabaseApi } from './apiSlice'
import { Operator } from 'types/operator';
import supabaseClient from 'util/supabaseClient';

const extendedApi = supabaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOperators: builder.query({
      queryFn: async () => {
        const { data, error } = await supabaseClient
          .from("operators")
          .select("op_id, owned, favorite, potential, elite, level, rank, masteries, modules, skin")

        return { data };
      }
    }),
    setOperator: builder.query({
      queryFn: async (op: Operator) => {
        const { data, error } = await supabaseClient
          .from("operators")
          .upsert({ ...op, })

        // .select("op_id, owned, favorite, potential, elite, level, rank, masteries, modules, skin")

        return { data };
      }
    })
  }),
  overrideExisting: false,
})

export const { useGetOperatorsQuery, useSetOperatorQuery } = extendedApi