import { Database, Json } from "../supabase";

type KroosterAccounts = Database["public"]["Tables"]["krooster_accounts"];
type AccountData = KroosterAccounts["Row"];
export default AccountData;

export type AccountDataInsert = KroosterAccounts["Insert"];
