import type { NextApiRequest, NextApiResponse } from 'next'
import Ajv from 'ajv'
import supabase from 'util/api/db';
import fetchPid from 'util/api/fetchPid';
import { OperatorSkillSlot, opSkillSlotSchema } from 'types/doctor';
const ajv = new Ajv();

export default async function (
  req: NextApiRequest,
  res: NextApiResponse
) {
  const username = req.query.username as string;
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
    case "POST":
      POST(req, res, pid)
      break;
    case "DELETE":
      DELETE(req, res, pid)
      break;
    default:
      res.status(405);
  }

}

const schema = opSkillSlotSchema;
const validateSupport = ajv.compile<OperatorSkillSlot>(schema);

// Updates profile data in the db
async function POST(req: NextApiRequest, res: NextApiResponse, pid: string) {
  const index = parseInt(req.query.index as string);
  const support: OperatorSkillSlot = req.body;

  // Check properties
  const valid = validateSupport(support)
  if (!valid) {
    res.status(400).json({ message: `Could not write; Invalid format.`, data: support })
    return;
  }

  // Process support unit into db format
  const procSupport = {
    op_id: support.opID,
    skill: support.opSkill,
    module: support.opModule,
    pid,
    slot: index
  }

  // Perform upsert and return the data
  const { data, error: upsertError } = await supabase
    .from("supports")
    .upsert(procSupport)
    .select();

  // Unknown Supabase error?
  if (upsertError) res.status(500).json(upsertError);

  // Return operator data
  else res.status(201).json({ message: "Successful", data })
}

// DELETEs a support unit from the db
async function DELETE(req: NextApiRequest, res: NextApiResponse, pid: string) {
  const slot = parseInt(req.query.slot as string);

  // Perform upsert and return the data
  const { error: upsertError } = await supabase
    .from("supports")
    .delete()
    .match({ slot, pid });

  // Unknown Supabase error?
  if (upsertError) res.status(500).json(upsertError);

  // Success
  else res.status(200).json({ message: "Successful", data: null })
}