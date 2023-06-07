import { NextApiRequest, NextApiResponse } from "next";
import supabase from "./db";
import { Account } from "types/auth/account";

// Consumes a request with { username, profile } in its query
export default async function (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<Account | undefined> {
  const { username, profile } = req.query as { username: string, profile: string };
  const { data, error: fetchError } = await supabase
    .from("ak_accounts")
    .select("user_id, account_name")
    .match({ username, account_name: profile })
  if (fetchError) {
    // Unknown Supabase error?
    res.status(500).json(fetchError);
    return;
  }
  if (!data || !data.length) {
    // No user found.
    res.status(404).json({ code: 404, message: "No such user exists." });
    return;
  }
  return data[0];
}