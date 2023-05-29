import { supabaseApi } from './apiSlice'
import { Operator } from 'types/operator';
import supabaseClient from 'util/supabaseClient';

const extendedApi = supabaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOperators: builder.query({
      queryFn: async () => {
        const { data, error } = await supabaseClient
          .from("operators")
          .select("op_id, owned, favorite, potential, elite, level, skill_level, masteries, modules, skin")

        return { data };
      }
    }),
    setOperator: builder.query({
      queryFn: async (op: Operator) => {
        const { data: authData, error: authError } = await supabaseClient.auth.getSession()
        
        // const { data, error } = await supabaseClient
        //   .from("operators")
        //   .upsert({ ...op, op_id: op.id, "skill_level": op.rank })

        //   id: OperatorId;
        //   favorite: boolean;
        //   potential: number;
        //   elite: number;
        //   level: number;
        //   rank: number;
        //   masteries: number[];
        //   modules: number[];
        //   skin?: string;
        // .select("op_id, owned, favorite, potential, elite, level, rank, masteries, modules, skin")

        return { data: null };
      }
    })
  }),
  overrideExisting: false,
})

export const { useGetOperatorsQuery, useSetOperatorQuery } = extendedApi