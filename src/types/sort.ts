import { OperatorData, OpInfo } from "./operators/operator";

export interface SortListItem {
  key: keyof SortFunctionFields;
  desc: boolean;
}

export type SortOpInfoOrData = OpInfo | OperatorData;

export type SortFunction = (a: SortOpInfoOrData, b: SortOpInfoOrData, isCnAccount?: boolean) => number;

export interface SortFunctionData {
  fn: SortFunction;
  dfDesc: boolean;
}

export type SortFunctionFields = {
  Name: "name";
  Level: "elite" & "level";
  Rarity: "rarity";
  Potential: "potential";
  Favorite: "favorite";
  "Release Date": "releaseDateCn";
  Released: "potential" & "isCnOnly";
};
