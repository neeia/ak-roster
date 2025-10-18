import { FactionData } from "types/operators/operator";
import json from "./factions.json";

/*
  This file serves as a wrapper for factions.json
  It mainly exists to provide typing and to make importing easier
*/
const factionJson = json as Record<string, FactionData>;
export default factionJson;
