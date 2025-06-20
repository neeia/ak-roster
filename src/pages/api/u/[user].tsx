import { createClient } from "@supabase/supabase-js";
import operatorJson from "data/operators";
import { NextApiRequest, NextApiResponse } from "next";
import { Operator } from "types/operators/operator";
import Roster from "types/operators/roster";
import { Database } from "types/supabase";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const user = req.url?.split("/u/")[1] ?? "";
  if (!user) {
    res.status(400).send("No username provided.");
    return;
  }

  const username = user.toString().replace(",", "");

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: account, error: accountError } = await supabase
    .from("krooster_accounts")
    .select("*, supports (op_id, slot), operators (*)")
    .eq("username", username.toLocaleLowerCase())
    .limit(1)
    .single();

  console.log(account);
  if (!account) {
    res.status(404).send("User not found");
    return;
  }

  if (accountError) {
    res.status(500).send("Internal server error.");
    return;
  }

  const { supports, operators, ...accountData } = account;
  const roster = (operators as Operator[]).reduce((roster: Roster, op: Operator) => {
    if (op.op_id in operatorJson) {
      roster[op.op_id] = { ...op } as Operator;
    }
    return roster;
  }, {});

  console.log(accountData);

  res.status(200).json({
    data: {
      account: accountData,
      supports,
      roster,
    },
  });
}
