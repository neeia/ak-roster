import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "util/api/db";
import { Account } from "types/auth/account";
import getReq from "util/api/getReq";

export default getReq(GET);

// GETs a support unit from the db
async function GET(
  req: NextApiRequest,
  res: NextApiResponse,
  account: Account
) {
  const slot = parseInt(req.query.slot as string);
  const { user_id, account_name } = account;

  // Perform upsert and return the data
  const { data: support, error } = await supabase
    .from("supports")
    .select()
    .match({ slot, user_id, account_name });

  // Unknown Supabase error?
  if (upsertError) res.status(500).json(upsertError);
  // Success
  else res.status(200).json({ message: "Successful", data: null });
}
