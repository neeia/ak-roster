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
    email: { type: "string" },
    password: { type: "string" }
  },
  required: ["email", "password"],
  additionalProperties: false
}

interface Credentials {
  email: string;
  password: string;
}

const validate = ajv.compile<Credentials>(schema)

// Given credentials, return an auth token and a refresh token
async function POST(req: NextApiRequest, res: NextApiResponse) {

  const creds: Credentials = req.body;

  // Check properties
  const valid = validate(req.body)
  if (!valid) {
    res.status(400).json({ message: `Bad request` })
    return;
  }

  // Login and return the session
  const { data: { session }, error: authError } = await supabase.auth.signInWithPassword(creds);

  // Probably incorrect creds
  if (authError) res.status(500).json(authError);

  // Return session
  else res.status(200).json({ message: "Successful", data: session })
}