import operatorJson from "data/operators";
import { Operator } from "types/operators/operator";
import Preset from "types/operators/presets";
import {
  changeLevel,
  changeMastery,
  changeModule,
  changePotential,
  changePromotion,
  changeSkillLevel,
  defaultOperatorObject,
  MODULE_REQ_BY_RARITY,
} from "util/changeOperator";

const isNumber = (value: any) => typeof value === "number";
export default function (preset: Preset, op: Operator): Operator {
  let _op = { ...op };
  const opData = operatorJson[op.op_id];
  let changed = false;

  if (!_op.potential) _op = defaultOperatorObject(op.op_id, true);
  if (isNumber(preset.potential)) {
    changed = true;
    _op = changePotential(_op, preset.potential);
  }
  if (isNumber(preset.elite)) {
    changed = true;
    _op = changePromotion(_op, preset.elite);
  }
  if (isNumber(preset.skill_level)) {
    changed = true;
    if (preset.skill_level > 4 && _op.elite === 0) _op = changePromotion(_op, 1);
    _op = changeSkillLevel(_op, preset.skill_level);
  }
  if (preset.masteries) {
    if (opData.rarity > 3)
      preset.masteries.forEach((mastery, index) => {
        if (mastery !== -1) {
          changed = true;
          _op = changePromotion(_op, 2);
          _op = changeSkillLevel(_op, 7);
          _op = changeMastery(_op, index, mastery);
          _op.masteries[index] = mastery;
        }
      });
  }
  if (isNumber(preset.level)) {
    changed = true;
    _op = changeLevel(_op, preset.level);
  }
  if (preset.modules) {
    Object.entries(preset.modules).forEach(([id, value]) => {
      if (!opData.moduleData) return;
      const module = opData.moduleData.find((m) => m.typeName.endsWith(id));
      if (!module) return;
      changed = true;
      _op = changePromotion(_op, 2);
      _op = changeLevel(_op, Math.max(_op.level, MODULE_REQ_BY_RARITY[opData.rarity]));
      _op = changeModule(_op, module.moduleId, value);
    });
  }

  return changed ? _op : op;
}
