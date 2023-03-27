import supabase from "./db";

export default function (username: string) {
  return supabase
    .from("profiles")
    .select("pid")
    .eq("username", username)
}