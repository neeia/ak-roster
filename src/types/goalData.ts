import { Database } from "./supabase";

type GoalsTable = Database["public"]["Tables"]["goals"];
type GoalData = GoalsTable["Row"];
export default GoalData;
export type GoalDataInsert = Omit<GoalsTable["Insert"], "user_id">;
