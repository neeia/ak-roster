import React, { useEffect, useState } from "react";
import { defaultOperatorObject, Operator, OpJsonObj, LegacyOperator, } from '../types/operator';
import operatorJson from "../data/operators.json";
import useLocalStorage from './useLocalStorage';
import { isUndefined } from "util";
import { changeFavorite, changeLevel, changeMastery, changeModule, changeOwned, changePotential, changePromotion, changeSkillLevel } from "./changeOperator";
import { safeMerge } from "./useSync";
import initFirebase from "./initFirebase";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getUserStatus } from "./getUserStatus";
import { getDatabase, ref, set } from "firebase/database";


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
  const rooster = { ...ops }
  Object.entries(operatorJson).forEach((props: [opId: string, opJ: OpJsonObj]) => {
    const [opId, opJsonItem] = props;
    const op = rooster[opId];

    // check for missing operators to repair
    if (!op || !op.name || !op.id) {
      if (opJsonItem) rooster[opId] = defaultOperatorObject([opId, opJsonItem])[1];
    }
    // check for outdated operators to redefine
    else if (isUndefined(op.class)) {
      const newOps = Object.fromEntries(Object.entries(rooster).map(convertLegacy));
      setOps(newOps);
    }
  })
}

function useOperators() {
  const [operators, setOperators] = useLocalStorage<Record<string, Operator>>("operators", Object.fromEntries(
    Object.entries(operatorJson).map(defaultOperatorObject)
  ));
  initFirebase();
  const db = getDatabase();
  const [user, setUser] = useState<User | null>();
  useEffect(() => {
    getUserStatus().then((user) => {
      setUser(user);
    })
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  const onChange = (operatorID: string, newOperator: Operator) => {
    setOperators(
      (oldOperators: Record<string, Operator>): Record<string, Operator> => {
        const copyOperators = { ...oldOperators };
        copyOperators[operatorID] = { ...newOperator };
        if (user) {
          set(ref(db, `users/${user.uid}/roster/${newOperator.id}`), newOperator);
        }
        return copyOperators;
      }
    );
  }
  const applyBatch = React.useCallback(
    (source: Operator, target: string[], safeMode?: boolean) => {
      setOperators(
        (oldOperators: Record<string, Operator>): Record<string, Operator> => {
          const copyOperators = { ...oldOperators };
          target.forEach((opID: string) => {
            var op = { ...copyOperators[opID] };
            var copySource = { ...source }
            if (safeMode) {
              copySource = safeMerge(source, op);
            }

            op = changeOwned(op, copySource.owned);
            op = changeFavorite(op, copySource.favorite);
            op = changePotential(op, copySource.potential);
            op = changePromotion(op, copySource.promotion);
            op = changeLevel(op, copySource.level);
            op = changeSkillLevel(op, copySource.skillLevel);
            copySource.mastery.forEach((value, index) => {
              op = changeMastery(op, index, value);
            })
            copySource.module.forEach((value, index) => {
              op = changeModule(op, index, value);
            })

            copyOperators[opID] = op;
            if (user) {
              set(ref(db, `users/${user.uid}/roster/${opID}`), op);
            }
          })
          return copyOperators;
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, setOperators]
  );
  useEffect(() => {
    repair(operators, setOperators);
  }, [])

  return [operators, onChange, applyBatch] as const
}

export default useOperators;