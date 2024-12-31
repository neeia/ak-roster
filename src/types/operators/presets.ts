import { Database } from "types/supabase";

type Table = Database["public"]["Tables"]["presets"];

type Preset = Omit<Table["Insert"], "modules"> & {
  modules?: Record<string, number>;
};
export default Preset;
