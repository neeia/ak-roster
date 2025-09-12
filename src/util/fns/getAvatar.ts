import { OpInfo } from "types/operators/operator";
import imageBase from "util/imageBase";

export default function getAvatar(op: OpInfo) {
  if (op.skin && op.skin !== op.id) return `${imageBase}/avatars/${op.skin.replace("#", "%23").replace("+", "%2b")}.webp`;

  let intermediate = op.op_id;
  if (op?.elite === 2) {
    intermediate += "_2";
  } else if (op?.elite === 1 && op.name === "Amiya") {
    intermediate += "_1";
  }
  return `${imageBase}/avatars/${intermediate}.webp`;
}
