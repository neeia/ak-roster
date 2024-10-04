import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "util/api/db";
import fetchAccount from "util/api/fetchAccount";
import { Account } from "types/auth/account";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const account = await fetchAccount(req, res);
  if (!account) return;

  switch (req.method) {
    case "GET":
      GET(req, res, account);
      break;
    default:
      res.status(405);
  }
}

// GETs the specified user's roster
async function GET(req: NextApiRequest, res: NextApiResponse, pid: Account) {
  // Fetch roster
  const { data: operators, error } = await supabase
    .from("operators")
    .select(
      "op_id, owned, favorite, potential, elite, level, rank, masteries, modules, skin"
    )
    .eq("pid", pid);

  if (error) res.status(500).json(error);
  else res.status(200).json({ message: "Successful", data: { operators } });
}
