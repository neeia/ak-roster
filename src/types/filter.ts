import { OpInfo } from "./operators/operator";

export type FilterFunction = (op: OpInfo) => boolean;
