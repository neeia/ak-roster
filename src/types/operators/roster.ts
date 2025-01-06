import { Operator } from "types/operators/operator";

type Roster = Record<string, Operator>;

export default Roster;

export const initialState: Roster = {};
