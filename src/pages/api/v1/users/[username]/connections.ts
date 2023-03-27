import type { NextApiRequest, NextApiResponse } from 'next'
import Ajv from 'ajv'
import { Operator, operatorSchema } from 'types/operator';
import supabase from 'util/api/db';
import fetchPid from 'util/api/fetchPid';
import validateOperator from 'util/validateOperator';
import { AccountInfo, profileSchema } from 'types/doctor';
const ajv = new Ajv();

export default async function (
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username } = req.query as { username: string };
  const { data, error: fetchError } = await fetchPid(username);
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
  const pid = data[0].pid;

  switch (req.method) {
    case "GET":
      GET(req, res, pid)
      break;
    case "POST":
      POST(req, res, pid)
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

const schema = profileSchema;
const validateProfile = ajv.compile(schema);

// Updates connection data in the db
async function POST(req: NextApiRequest, res: NextApiResponse, pid: string) {

  const profile: AccountInfo = req.body;

  // Check properties
  const valid = validateProfile(profile)
  if (!valid) {
    res.status(400).json({ message: `Could not write; Invalid profile.`, data: profile })
  }

  // Process Profile into db format
  const procProfile = {
    ...profile,
    display_name: profile.displayName,
    friend_code: profile.friendCode,
    pid
  }

  // Perform upsert and return the data
  const { data, error: upsertError } = await supabase
    .from("profile")
    .update(procProfile)
    .select();

  // Unknown Supabase error?
  if (upsertError) res.status(500).json(upsertError);

  // Return operator data
  else res.status(201).json({ message: "Successful", data })
}