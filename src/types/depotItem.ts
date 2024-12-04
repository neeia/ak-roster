import { Database } from "./supabase";

type DepotTable = Database["public"]["Tables"]["depot"];
type DepotItem = DepotTable["Insert"];
export default DepotItem;

