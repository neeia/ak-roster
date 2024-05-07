import { useEffect } from "react";
import { defaultOperatorObject, Operator, OpJsonObj, LegacyOperator, } from '../types/operator';
import operatorJson from "data/operators.json";
import useLocalStorage from './useLocalStorage';

// Converts a LegacyOperator into an Operator
function convertLegacy([_, op]: [any, LegacyOperator]): [string, Operator] {
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
      promotion: op.promotion,
      owned: op.owned,
      level: op.level,
      skillLevel: op.skillLevel,
      mastery: newMastery,
      module: op.module ?? [],
    },
  ];
}

export function repair(ops: Record<string, Operator>, setOps: (v: Record<string, Operator>) => void) {
  var rooster = { ...ops }
  Object.entries(operatorJson).forEach((props: [opId: string, opJ: OpJsonObj]) => {
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
      if (op.mastery === undefined) op.mastery = [];
      if (op.module === undefined) op.module = [];
    }
    if (op.module && !Array.isArray(op.module)) {
      const mod: number[] = [];
      Object.entries(op.module as Record<number, number>).forEach(([a, b]) => {
        mod[parseInt(a)] = b;
      })
      op.module = mod;
    }
  })
  setOps(rooster);

}

function useOperators() {
  const [operators, setOperators] = useLocalStorage<Record<string, Operator>>("operators", Object.fromEntries(
    Object.entries(operatorJson).map(defaultOperatorObject)
  ));
  useEffect(() => {
    repair(operators, setOperators);
  }, [])
  return [operators, setOperators] as const
}
export default useOperators;
