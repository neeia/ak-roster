import type { NextApiRequest, NextApiResponse } from "next";
import { OperatorSkillSlot } from "types/doctor";
import supabase from "util/api/db";
import fetchPid from "util/api/fetchAccount";

export default async function (req: NextApiRequest, res: NextApiResponse) {
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
      GET(req, res, pid);
      break;
    default:
      res.status(405);
  }
}

// GETs the specified user's supports
async function GET(req: NextApiRequest, res: NextApiResponse, pid: string) {
  // Fetch profile
  const { data, error } = await supabase
    .from("supports")
    .select("slot, op_id, skill, module")
    .eq("pid", pid);

  if (error) {
    res.status(500).json(error);
    return;
  }

  const supports: (OperatorSkillSlot | null)[] = [null, null, null];
  data?.forEach((support) => {
    supports[support.slot] = {
      opID: support.op_id,
      opSkill: support.skill,
      opModule: support.module ?? undefined,
    };
  });

  if (supports.length === 0)
    res.status(204).json({ message: "No supports found", data: [] });
  else res.status(200).json({ message: "Successful", data: supports });
}
