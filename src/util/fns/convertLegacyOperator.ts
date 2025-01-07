import { Operator, OperatorV1, OperatorV2 } from "types/operators/operator";
import getNumSkills from "util/fns/getNumSkills";
import operatorJson from "data/operators";
import Roster from "types/operators/roster";
import { isObject } from "lodash";

function checkVersion(op: any) {
  if ("mastery" in op) return 2;
  if ("class" in op) return 1;
  if ("name" in op) return 2;
  return 3;
}

// Converts an OperatorV1 into an Operator
function convertV1(op: OperatorV1): Operator {
  const masteries = [...Array(getNumSkills(op.id))].fill(0);
  if (op.skill1Mastery) masteries[0] = op.skill1Mastery;
  if (op.skill2Mastery) masteries[1] = op.skill2Mastery;
  if (op.skill3Mastery) masteries[2] = op.skill3Mastery;

  const modData = operatorJson[op.id].moduleData;
  const modules: Record<string, number> = {};
  if (modData) {
    modData.forEach((md, i) => {
      modules[md.moduleId] = op.module?.[i] ?? 0;
    });
  }

  return {
    op_id: op.id,
    favorite: op.favorite,
    potential: op.potential,
    elite: op.promotion,
    level: op.level,
    skill_level: op.skillLevel,
    masteries,
    modules,
    skin: null,
  };
}

function convertV2(op: OperatorV2): Operator {
  const rarity = operatorJson[op.id].rarity;
  const modData = operatorJson[op.id].moduleData;
  const skillData = operatorJson[op.id].skillData;
  const modules: Record<string, number> = {};
  if (modData) {
    modData.forEach((md, i) => {
      modules[md.moduleId] = op.module?.[i] ?? 0;
    });
  }
  const masteries: number[] = new Array(getNumSkills(op.id)).fill(0);
  if (skillData && rarity > 3) {
    Object.keys(op.mastery).forEach((n) => (masteries[Number(n)] = op.mastery[Number(n)]));
  }

  return {
    op_id: op.id,
    favorite: op.favorite,
    potential: op.potential,
    elite: op.promotion,
    level: op.level,
    skill_level: op.skillLevel,
    masteries,
    modules,
    skin: op.skin || null,
  };
}

function convert(op: OperatorV1 | OperatorV2 | Operator): Operator {
  switch (checkVersion(op)) {
    case 1:
      return convertV1(op as OperatorV1);
    case 2:
      return convertV2(op as OperatorV2);
    case 3:
    default:
      return op as Operator;
  }
}

export function repair(roster: Record<string, Operator> | Record<string, OperatorV2> | Record<string, OperatorV1>) {
  var _roster: Roster = {};

  Object.values(roster).forEach((op) => {
    if (op.potential) {
      const newOp = convert(op);
      _roster[newOp.op_id] = newOp;
    }
  });

  return _roster;
}
