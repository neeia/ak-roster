import { Operator } from "./operator";

export interface SortListItem {
  key: string;
  desc: boolean;
}

export interface SortFunction {
  fn: (a: Operator, b: Operator) => number;
  dfDesc: boolean;
}