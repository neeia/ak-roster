import { OpInfo } from "./operator";

export interface SortListItem {
  key: string;
  desc: boolean;
}

export type SortFunction = (a: OpInfo, b: OpInfo) => number;

export interface SortFunctionData {
  fn: SortFunction;
  dfDesc: boolean;
}
