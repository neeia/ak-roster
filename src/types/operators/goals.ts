import { OperatorId } from "types/operator";

export interface Goal {
  op_id: OperatorId;
  elite?: number;
  level?: number;
  skill_level?: number;
  masteries?: number[];
  modules?: Record<string, number>;
}

type Goals = Record<string, Record<OperatorId, Goal>>;
export default Goals;

export const initialState: Goals = {};