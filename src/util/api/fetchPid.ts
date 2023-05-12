import { NextApiResponse } from "next";
import supabase from "./db";

export default async function (res: NextApiResponse, username: string) {
  const { data, error: fetchError } = await supabase
    .from("profiles")
    .select("pid")
    .eq("username", username)
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
  return data[0].pid;
}