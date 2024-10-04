import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "util/api/db";
import getReq from "util/api/getReq";
import { Account } from "types/auth/account";

export default getReq(GET);

// GETs the specified user's specified operator
async function GET(
  req: NextApiRequest,
  res: NextApiResponse,
  account: Account
) {
  const { op_id } = req.query;

  // Fetch roster
  const { data: operators, error } = await supabase
    .from("operators")
    .select(
      "op_id, owned, favorite, potential, elite, level, rank, masteries, modules, skin, users"
    )
    .match({ pid, op_id });

  if (error) res.status(500).json(error);
  else if (operators.length === 1)
    res.status(200).json({ message: "Successful", data: { operators } });
  else res.status(204);
}
