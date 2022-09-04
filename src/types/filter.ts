import { Operator, OpJsonObj } from "./operator";

export type FilterFunction = (op: Operator, opInfo: OpJsonObj) => boolean;