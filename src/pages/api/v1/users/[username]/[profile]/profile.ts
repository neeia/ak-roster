import type { NextApiRequest, NextApiResponse } from 'next'
import supabase from 'util/api/db';
import getReq from 'util/api/getReq';
import { Account } from 'types/auth/account';

export default getReq(GET);

// GETs the specified user's profile
async function GET(req: NextApiRequest, res: NextApiResponse, account: Account) {

  // Fetch profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("friendCode, level, server, onboard, assistant, displayName, supports")
    .match(account);

  if (error) res.status(500).json(error);
  else if (profile.length === 0) res.status(204).json({ message: "No profile found", data: null });
  else res.status(200).json({ message: "Successful", data: profile[0] });
}
