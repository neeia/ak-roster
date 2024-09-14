import { Database } from "./supabase";

type DepotTable = Database["public"]["Tables"]["depot"];
type DepotData = DepotTable["Row"];
export default DepotData;
export type DepotDataInsert = DepotTable["Insert"];
