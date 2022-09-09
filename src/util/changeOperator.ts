import { useCallback } from "react";
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

export const getNumSkills = (op: Operator) => {
  if (op.name === "Amiya") return 3;
  else return op.rarity > 3 ? (op.rarity > 5 ? 3 : 2) : 1;
}

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

export const changeOwned = (op: Operator, value: boolean) => {
  op.owned = value;
  op.favorite = false;
  op.potential = +value;
  op.promotion = +value - 1;
  op.level = +value;
  op.skillLevel = (value && op.rarity > 2 ? 1 : 0);
  op.mastery = [];
  op.module = [];
  return op;
}

export const changeFavorite = (op: Operator, value: boolean) => {
  op.favorite = value;
  return op;
}

export const changePotential = (op: Operator, value: number) => {
  if (!op.owned) return op;
  op.potential = minMax(1, value, getMaxPotentialById(op.id));
  return op;
}

export const changePromotion = (op: Operator, value: number) => {
  if (!op.owned) return op;
  op.promotion = minMax(0, value, MAX_PROMOTION_BY_RARITY[op.rarity])
  op = changeLevel(op, op.level);
  op = changeSkillLevel(op, op.skillLevel);
  if (value !== 2) {
    op.module = [];
    op.mastery = [];
  }
  return op;
}

export const changeLevel = (op: Operator, value: number) => {
  if (!op.owned) return op;
  op.level = minMax(1, +value, MAX_LEVEL_BY_RARITY[op.rarity][op.promotion]);
  return op;
}

export const changeSkillLevel = (op: Operator, value: number) => {
  if (!op.owned) return op;
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
  return op;
}

export const changeMastery = (op: Operator, index: number, value: number) => {
  if (!op.owned) return op;
  // Check if masteries are invalid
  if (op.rarity < 4 || op.promotion !== 2 || op.skillLevel !== 7) {
    op.mastery = [];
  }
  // Check if trying to assign value to nonexisting skill
  else if (index !== 3 || op.rarity === 6 || op.name === "Amiya") {
    op.mastery[index ?? 0] = +value;
  }
  return op;
}

export const changeModule = (op: Operator, index: number, value: number) => {
  if (!op.owned) return op;
  if (op.promotion === 2 && op.level >= MODULE_REQ_BY_RARITY[op.rarity]) {
    op.module[index ?? 0] = +value;
  }
  return op;
}
