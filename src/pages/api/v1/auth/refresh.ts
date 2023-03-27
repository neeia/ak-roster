import type { NextApiRequest, NextApiResponse } from 'next'
import Ajv from 'ajv'
import supabase from 'util/api/db';
const ajv = new Ajv();

export default async function (
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "POST":
      POST(req, res)
      break;
    default:
      res.status(405);
  }
}

const schema = {
  type: "object",
  properties: {
    access_token: { type: "string" },
    refresh_token: { type: "string" }
  },
  required: ["access_token", "refresh_token"],
}

interface Tokens {
  access_token: string;
  refresh_token: string;
}

const validate = ajv.compile<Tokens>(schema)

// Given credentials, return an auth token and a refresh token
async function POST(req: NextApiRequest, res: NextApiResponse) {

  const { access_token, refresh_token }: Tokens = req.body;

  // Check properties
  const valid = validate(req.body)
  if (!valid) {
    res.status(400).json({ message: "Bad request" })
    return;
  }

  // Verify access token
  const { data: { user } } = await supabase.auth.getUser(access_token)

  if (!user) {
    res.status(401).json({ message: "Unauthorized" })
    return;
  }

  // Retrieve a new session
  const { data: { session }, error: authError } = await supabase.auth.refreshSession({ refresh_token })

  // Unknown supabase error (invalid refresh token, perhaps)
  if (authError) res.status(500).json(authError);

  // Return session
  else res.status(200).json({ message: "Successful", data: session })
}