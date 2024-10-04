import operatorJson from "data/operators";
import { supabaseApi, UID } from "./apiSlice";
import supabase from "supabase/supabaseClient";
import AccountData from "types/auth/accountData";
import Roster from "types/operators/roster";
import { Operator } from "types/operator";
import { OperatorSupport } from "types/operators/supports";

const extendedApi = supabaseApi.injectEndpoints({
  endpoints: (builder) => ({
    accountGetById: builder.query<AccountData, UID>({
      async queryFn({ user_id }) {
        const { data } = await supabase
          .from("krooster_accounts")
          .select()
          .eq("user_id", user_id)
          .single();

        return { data } as { data: AccountData };
      },
      providesTags: ["account"],
    }),
    rosterGetById: builder.query<Roster, UID>({
      async queryFn({ user_id }) {
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
    supportsGetById: builder.query<OperatorSupport[], UID>({
      queryFn: async ({ user_id }) => {
        const { data, error } = await supabase
          .from("supports")
          .select()
          .eq("user_id", user_id);

        return { data: data as OperatorSupport[] };
      },
      providesTags: ["supports"],
    }),
  }),
  overrideExisting: false,
});

export const { useAccountGetByIdQuery } = extendedApi;
