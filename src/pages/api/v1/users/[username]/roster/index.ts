import type { NextApiRequest, NextApiResponse } from 'next'
import Ajv from 'ajv'
import { Operator, operatorSchema } from 'types/operator';
import supabase from 'util/api/db';
import fetchPid from 'util/api/fetchPid';
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

// GETs the specified user's roster
async function GET(req: NextApiRequest, res: NextApiResponse, pid: string) {

  // Fetch roster
  const { data: operators, error } = await supabase
    .from("operators")
    .select("op_id, owned, favorite, potential, elite, level, rank, masteries, modules, skin")
    .eq("pid", pid);

  if (error) res.status(500).json(error);
  else res.status(200).json({ message: "Successful", data: { operators } });
}

const schema = {
  type: "array",
  items: operatorSchema
}

const validateOptionsArray = ajv.compile(schema)

// Upserts a Operator[] into the db
async function POST(req: NextApiRequest, res: NextApiResponse, pid: string) {

  // Process Operator[] into db format
  const ops: Operator[] = req.body;

  const mistakes: Operator[] = [];
  ops.forEach(op => {
    if (!validateOperator(op)) {
      mistakes.push(op);
    }
  })

  // Check properties
  const valid = validateOptionsArray(req.body)
  if (!valid || mistakes.length > 0) {
    res.status(400).json({ message: `Could not write; ${mistakes.length} invalid operators.`, data: mistakes })
    return;
  }

  const procOptions = ops.map(op => {
    return {
      ...op,
      op_id: op.id,
      pid
    }
  })

  // Perform upsert and return the data
  const { data: operators, error: upsertError } = await supabase
    .from("operators")
    .upsert(procOptions, { ignoreDuplicates: false })
    .select();

  // Delete rows where potential is 0
  supabase.from("operators").delete().eq("potential", 0);

  // Unknown Supabase error?
  if (upsertError) res.status(500).json(upsertError);

  // Return operator data
  else res.status(201).json({ message: "Successful", data: { operators } })
}