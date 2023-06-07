import type { NextApiRequest, NextApiResponse } from 'next'
import supabase from 'util/api/db';
import fetchPid from 'util/api/fetchAccount';

export default async function (
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username } = req.query as { username: string };
  const pid = await fetchPid(res, username);
  if (!pid) return;

  switch (req.method) {
    case "GET":
      GET(req, res, pid)
      break;
    default:
      res.status(405);
  }
}

// GETs the specified user's connections
async function GET(req: NextApiRequest, res: NextApiResponse, pid: string) {

  // Fetch connections
  const { data: profile, error } = await supabase
    .from("users")
    .select("discordCode, redditUser")
    .eq("pid", pid);

  if (error) res.status(500).json(error);
  else if (profile.length === 0) res.status(204).json({ message: "No profile found", data: {} });
  else res.status(200).json({ message: "Successful", data: profile[0] });
}
