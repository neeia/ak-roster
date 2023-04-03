import { useEffect } from "react";
import { defaultOperatorObject, Operator, OperatorData, OperatorV1, } from '../types/operator';
import operatorJson from "data/operators.json";
import useLocalStorage from './useLocalStorage';

// Converts a LegacyOperator into an Operator
function convertLegacy([_, op]: [any, OperatorV1]): [string, Operator] {
  const newMastery = [];
  if (op.skill1Mastery) newMastery[0] = op.skill1Mastery;
  if (op.skill2Mastery) newMastery[1] = op.skill2Mastery;
  if (op.skill3Mastery) newMastery[2] = op.skill3Mastery;
  return [
    op.id,
    {
      id: op.id,
      name: op.name,
      favorite: op.favorite,
      rarity: op.rarity,
      class: operatorJson[op.id as keyof typeof operatorJson].class,
      potential: op.potential,
      elite: op.promotion,
      owned: op.owned,
      level: op.level,
      rank: op.skillLevel,
      masteries: newMastery,
      modules: op.module ?? [],
    },
  ];
}

export function repair(ops: Record<string, Operator>, setOps: (v: Record<string, Operator>) => void) {
  var rooster = { ...ops }
  Object.entries(operatorJson).forEach((props: [opId: string, opJ: OperatorData]) => {
    const [opId, opJsonItem] = props;
    const op = rooster[opId];

    // check for missing operators to repair
    if (!op || !op.name || !op.id || op.id !== opId) {
      if (opJsonItem) rooster[opId] = defaultOperatorObject([opId, opJsonItem])[1];
    }
    else if (op.name !== opJsonItem.name) {
      rooster[opId].name = opJsonItem.name;
    }
  })
  
  Object.entries(rooster).forEach(([opId, op]) => {
    // check for outdated operators to redefine
    if (op.class === undefined) {
      rooster[opId] = convertLegacy([, op])[1];
    }
    else {
      if (op.masteries === undefined) op.masteries = [];
      if (op.modules === undefined) op.modules = [];
    }
  })
  setOps(rooster);

}
