import { OpInfo } from "types/operators/operator";

export default function (op: OpInfo) {
  if (op.skin) return op.skin.replace("#", "%23");

  let intermediate = op.op_id;
  if (op?.elite === 2) {
    intermediate += "_2";
  } else if (op?.elite === 1 && op.name === "Amiya") {
    intermediate += "_1";
  }
  return intermediate;
}
