import { Operator, OperatorV1, OperatorV2 } from "types/operators/operator";
import operatorJson from "data/operators.json";

function isV1(op: any): boolean {
  return (
    op.skill1Mastery !== undefined ||
    op.skill2Mastery !== undefined ||
    op.skill3Mastery !== undefined
  );
}

function isV2(op: any): boolean {
  return op.name !== undefined;
}

// Converts a legacy V1 operator into an Operator
function convertV1(op: OperatorV1): Operator {
  const opData = operatorJson[op.id];
  const masteries = opData.skillData.map((_) => 0);
  if (op.skill1Mastery) masteries[0] = op.skill1Mastery;
  if (op.skill2Mastery) masteries[1] = op.skill2Mastery;
  if (op.skill3Mastery) masteries[2] = op.skill3Mastery;
  return {
    op_id: op.id,
    favorite: op.favorite,
    potential: op.potential,
    elite: op.promotion,
    level: op.level,
    skill_level: op.skillLevel,
    masteries,
    modules: op.module ?? [],
  };
}

// Converts a legacy v2 into an Operator
function convertV2(op: OperatorV2): Operator {
  return {
    op_id: op.id,
    favorite: op.favorite,
    potential: op.potential,
    elite: op.promotion,
    level: op.level,
    skill_level: op.skillLevel,
    masteries: op.mastery,
    modules: op.module ?? [],
  };
}
