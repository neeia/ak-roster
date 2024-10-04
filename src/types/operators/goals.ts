export interface Goal {
  op_id: string;
  elite?: number;
  level?: number;
  skill_level?: number;
  masteries?: number[];
  modules?: Record<string, number>;
}

type Goals = Record<string, Record<string, Goal>>;
export default Goals;

export const initialState: Goals = {};
