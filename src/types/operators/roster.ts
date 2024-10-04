import { Operator } from "types/operator";

type Roster = Record<string, Operator>;

export default Roster;

export const initialState: Roster = {};
