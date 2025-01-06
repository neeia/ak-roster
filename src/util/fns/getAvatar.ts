import { OpInfo } from "types/operators/operator";

export default function getAvatar(op: OpInfo) {
  if (op.skin) return `/img/avatars/${op.skin.replace("#", "%23")}.png`;

  let intermediate = op.op_id;
  if (op?.elite === 2) {
    intermediate += "_2";
  } else if (op?.elite === 1 && op.name === "Amiya") {
    intermediate += "_1";
  }
  return `/img/avatars/${intermediate}.png`;
}
