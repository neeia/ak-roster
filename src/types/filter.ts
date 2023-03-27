import { Operator, OperatorData } from "./operator";

export type FilterFunction = (op: Operator, opData: OperatorData) => boolean;