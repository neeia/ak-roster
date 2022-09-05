import React, { useEffect } from "react";
import { defaultOperatorObject, Operator, OpJsonObj, LegacyOperator, } from '../types/operator';
import operatorJson from "../data/operators.json";
import useLocalStorage from './useLocalStorage';
import changeOperator from './changeOperator';
import { isUndefined } from "util";

const orderOfOperations = [
  "owned",
  "favorite",
  "potential",
  "promotion",
  "level",
  "skillLevel",
];


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

export function repair(ops: Record<string, Operator>) {
  let rooster = { ...ops }
  Object.entries(operatorJson).forEach((props: [opId: string, opJ: OpJsonObj]) => {
    const [opId, opJsonItem] = props;
    const op = rooster[opId];

    // check for missing operators to repair
    if (!op || !op.name || !op.id) {
      if (opJsonItem) rooster[opId] = defaultOperatorObject([opId, opJsonItem])[1];
    }
    // check for outdated operators to redefine
    else if (isUndefined(op.class)) {
      rooster[opId] = convertLegacy([op.id, op as any])[1];
    }
  })
  return rooster;
}

function useOperators() {
  const defaultOperators = Object.fromEntries(
    Object.entries(operatorJson).map(defaultOperatorObject)
  );
  const [operators, setOperators] = useLocalStorage<Record<string, Operator>>("operators", defaultOperators);


  const onChange = (operatorID: string, property: string, value: number | boolean, index?: number) => {
    if (isNaN(value as any)) {
      return;
    }
    setOperators(
      (oldOperators: Record<string, Operator>): Record<string, Operator> => {
        const copyOperators = { ...oldOperators };
        const copyOperatorData = { ...copyOperators[operatorID] };
        copyOperators[operatorID] = changeOperator(copyOperatorData, property, value, index);
        return copyOperators;
      }
    );
  }
  const applyBatch = React.useCallback(
    (source: Operator, target: string[]) => {
      setOperators(
        (oldOperators: Record<string, Operator>): Record<string, Operator> => {
          const copyOperators = { ...oldOperators };
          target.forEach((opId: string) => {
            var copyOperatorData = { ...copyOperators[opId] };
            orderOfOperations.forEach((prop: string) =>
              copyOperatorData = changeOperator(copyOperatorData, prop, (source as any)[prop])
            )
            source.mastery.forEach((index: number) =>
              copyOperatorData = changeOperator(copyOperatorData, "mastery", source.mastery[index], index)
            )
            source.module.forEach((index: number) =>
              copyOperatorData = changeOperator(copyOperatorData, "module", source.module[index], index)
            )
            copyOperators[opId] = copyOperatorData;
          })
          return copyOperators;
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setOperators]
  );

  setOperators(repair(operators));

  return [operators, onChange, applyBatch] as const
}

export default useOperators;