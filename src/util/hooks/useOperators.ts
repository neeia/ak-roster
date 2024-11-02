import { useEffect } from "react";
import { Operator, OperatorData, OperatorV1 } from "types/operator";
import operatorJson from "data/operators";
import useLocalStorage from "./useLocalStorage";
import getNumSkills from "util/fns/getNumSkills";

function checkVersion(op: any) {
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

  const modData = operatorJson[op.id];
  const modules = {};
  modules.

  return {
    op_id: op.id,
    name: op.name,
    favorite: op.favorite,
    rarity: op.rarity,
    class: operatorJson[op.id as keyof typeof operatorJson].class,
    potential: op.potential,
    elite: op.promotion,
    owned: op.owned,
    level: op.level,
    skill_level: op.skillLevel,
    masteries,
    modules: op.module ?? [],
  };
}

export function repair(
  ops: Record<string, Operator>,
  setOps: (v: Record<string, Operator>) => void
) {
  var rooster = { ...ops };
  Object.entries(operatorJson).forEach(
    (props: [opId: string, opJ: OperatorData]) => {
      const [opId, opJsonItem] = props;
      const op = rooster[opId];

      // check for missing operators to repair
      if (!op || !op.name || !op.op_id || op.op_id !== opId) {
        if (opJsonItem)
          rooster[opId] = defaultOperatorObject([opId, opJsonItem])[1];
      } else if (op.name !== opJsonItem.name) {
        rooster[opId].name = opJsonItem.name;
      }
    }
  );

  Object.entries(rooster).forEach(([opId, op]) => {
    // check for outdated operators to redefine
    if (op.class === undefined) {
      rooster[opId] = convertV1([, op])[1];
    } else {
      if (op.masteries === undefined) op.masteries = [];
      if (op.modules === undefined) op.modules = [];
    }
  });
  setOps(rooster);
}

function useOperators() {
  const [operators, setOperators] = useLocalStorage<Record<string, Operator>>(
    "operators",
    Object.fromEntries(Object.entries(operatorJson).map(defaultOperatorObject))
  );
  useEffect(() => {
    repair(operators, setOperators);
  }, []);
  return [operators, setOperators] as const;
}
export default useOperators;
