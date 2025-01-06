import { Database } from "./supabase";

type GroupsTable = Database["public"]["Tables"]["groups"];
type GroupData = GroupsTable["Row"];
export default GroupData;
export type GroupsDataInsert = GroupsTable["Insert"];
