import operatorJson from "data/operators";
import { GoalDataInsert } from "types/goalData";
import { Operator } from "types/operators/operator";
import {
  changeLevel,
  changeMastery,
  changeModule,
  changePromotion,
  changeSkillLevel,
  defaultOperatorObject,
  MODULE_REQ_BY_RARITY,
} from "util/changeOperator";

const isNumber = (value: any) => typeof value === "number";
export default function applyGoalsFromOperator(goal: Partial<GoalDataInsert>, op: Operator): Operator {
  let _op = { ...op };
  const opData = operatorJson[op.op_id];
  let changed = false;

  if (!_op.potential) _op = defaultOperatorObject(op.op_id, true);
  if (isNumber(goal.elite_from)) {
    changed = true;
    _op = changePromotion(_op, goal.elite_from);
  }
  if (isNumber(goal.skill_level_from)) {
    changed = true;
    if (goal.skill_level_from > 4 && _op.elite === 0) _op = changePromotion(_op, 1);
    _op = changeSkillLevel(_op, goal.skill_level_from);
  }
  if (goal.masteries_from) {
    if (opData.rarity > 3)
      goal.masteries_from.forEach((mastery, index) => {
        if (mastery !== -1) {
          changed = true;
          if (mastery) {
            _op = changePromotion(_op, 2);
            _op = changeSkillLevel(_op, 7);
          }
          _op = changeMastery(_op, index, mastery);
          _op.masteries[index] = mastery;
        }
      });
  }
  if (isNumber(goal.level_from)) {
    changed = true;
    _op = changeLevel(_op, goal.level_from);
  }
  if (goal.modules_from) {
    Object.entries(goal.modules_from).forEach(([id, value]) => {
      if (!opData.moduleData) return;
      const moduleData = opData.moduleData.find(({ moduleId }) => moduleId === id);
      if (!moduleData) return;
      changed = true;
      if (value) {
        _op = changePromotion(_op, 2);
        _op = changeLevel(_op, Math.max(_op.level, MODULE_REQ_BY_RARITY[opData.rarity]));
      }
      _op = changeModule(_op, moduleData.moduleId, value);
    });
  }

  return changed ? _op : op;
}
