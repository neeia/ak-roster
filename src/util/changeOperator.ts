import { Operator } from "../types/operator";

export const MAX_LEVEL_BY_RARITY = [
  [0],
  [30, 30, 30],
  [30, 30, 30],
  [40, 55, 55],
  [45, 60, 70],
  [50, 70, 80],
  [50, 80, 90]
];

export const MAX_PROMOTION_BY_RARITY = [
  0, 0, 0, 1, 2, 2, 2
]

export const MODULE_REQ_BY_RARITY = [
  0, 99, 99, 99, 40, 50, 60
];

export const getMaxPotentialById = (opId: string) => {
  switch (opId) {
    case "char_159_peacok":
    case "char_4019_ncdeer":
      return 1;
    case "char_230_savage":
      return 4;
    default:
      return 6;
  }
};

function minMax(min: number, value: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
const changeOperator = (op: Operator, prop: string, value: number | boolean, index?: number): Operator => {
  if (!op.owned && prop !== "owned") return op;
  switch (prop) {
    case "owned":
      op.owned = value > 0;
      op.favorite = false;
      op.potential = +value;
      op.promotion = +value - 1;
      op.level = +value;
      op.skillLevel = (value && op.rarity > 2 ? 1 : 0);
      op.mastery = [];
      op.module = [];
      break;
    case "favorite":
      op.favorite = value > 0;
      break;
    case "potential":
      op.potential = minMax(1, +value, getMaxPotentialById(op.id));
      break;
    case "promotion":
      op.promotion = minMax(0, +value, MAX_PROMOTION_BY_RARITY[op.rarity])
      op = changeOperator(op, "level", op.level)
      op = changeOperator(op, "skillLevel", op.skillLevel)
      if (value !== 2) {
        op.module = [];
        op.mastery = [];
      }
      break;
    case "level":
      op.level = minMax(1, +value, MAX_LEVEL_BY_RARITY[op.rarity][op.promotion]);
      break;
    case "skillLevel":
      op.skillLevel = minMax(1, +value, 7);
      if (op.rarity < 3) {
        op.skillLevel = 0;
      }
      else if (op.skillLevel > 4 && op.promotion === 0) {
        op.skillLevel = 4;
      }
      if (value !== 7) {
        op.mastery = []
      }
      break;
    case "mastery":
      // Check if masteries are invalid
      if (op.rarity < 4 || op.promotion !== 2 || op.skillLevel !== 7) {
        op.mastery = [];
      }
      // Check if trying to assign value to nonexisting skill
      else if (index === 3 && !(op.rarity === 6 || op.name === "Amiya")) {
        break;
      }
      else {
        op.mastery[index ?? 0] = +value;
      }
      break;
    case "module":
      if (op.promotion === 2 && op.level >= MODULE_REQ_BY_RARITY[op.rarity]) {
        op.module[index ?? 0] = +value;
      }
      break;
  }
  return op;
}
export default changeOperator;