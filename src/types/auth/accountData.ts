import { Database } from "../supabase";

type KroosterAccounts = Database["public"]["Tables"]["krooster_accounts"];
type AccountData = Omit<KroosterAccounts["Row"], "friendcode"> & {
  friendcode: {
    tag: string;
    username: string;
  };
};
export default AccountData;

export type AccountDataInsert = KroosterAccounts["Insert"];
