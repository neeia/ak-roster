interface Preset {
  name: string;
  elite?: number;
  level?: number;
  skill_level?: number;
  masteries?: number[];
  potential?: number;
}
export default Preset;

export const initialState: Preset[] = [];
