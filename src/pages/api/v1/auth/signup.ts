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

// Given credentials, create an account
async function POST(req: NextApiRequest, res: NextApiResponse) {

  const creds: Credentials = req.body;

  // Check properties
  const valid = validate(req.body)
  if (!valid) {
    res.status(400).json({ message: `Bad request` })
    return;
  }

  // Try to create account
  const { data: { user }, error: authError } = await supabase.auth.signUp(creds);


  // Unknown Supabase error
  if (authError) res.status(500).json(authError);

  // Email in use.
  // User exists, but is fake. https://supabase.com/docs/reference/javascript/auth-signup
  else if (user?.identities?.length === 0) res.status(409).json({
    message: "Email is in use",
  });

  // Return success. User will need to verify email before logging in.
  else res.status(204);
}