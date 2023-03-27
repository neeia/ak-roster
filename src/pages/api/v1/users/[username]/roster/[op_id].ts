import type { NextApiRequest, NextApiResponse } from 'next'
import Ajv from 'ajv'
import supabase from 'util/api/db';
import fetchPid from 'util/api/fetchPid';
import { Operator, operatorSchema } from 'types/operator';
import validateOperator from 'util/validateOperator';
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

// GETs the specified user's specified operator
async function GET(req: NextApiRequest, res: NextApiResponse, pid: string) {
  const { op_id } = req.query;

  // Fetch roster
  const { data: operators, error } = await supabase
    .from("operators")
    .select("op_id, owned, favorite, potential, elite, level, rank, masteries, modules, skin, users")
    .match({ pid, op_id });

  if (error) res.status(500).json(error);
  else if (operators.length === 1) res.status(200).json({ message: "Successful", data: { operators } });
  else res.status(204);
}

const schema = operatorSchema

const validateOptions = ajv.compile(schema)

// Upserts a single operator into the db
async function POST(req: NextApiRequest, res: NextApiResponse, pid: string) {
  const op_id = req.query.op_id as string;

  // Process options[] into db format
  const op: Operator = req.body;
  const procOp = {
    ...op,
    op_id,
    pid
  }

  const valid = validateOptions(req.body)
  if (!valid || !validateOperator(op)) {
    res.status(400).json({ message: `Could not write; invalid operator.`, data: op })
    return;
  }

  // Perform upsert and return the data
  const { data: operators, error: upsertError } = op.potential
    // Delete unowned operator
    // Update data
    ? await supabase
      .from("operators")
      .update(procOp)
      .match({ op_id, pid })
    : await supabase
      .from("operators")
      .delete()
      .match({ op_id, pid });

  // Unknown Supabase error?
  if (upsertError) res.status(500).json(upsertError);

  // Return operator data
  else res.status(201).json({ message: "Successful", data: { operators } })
}