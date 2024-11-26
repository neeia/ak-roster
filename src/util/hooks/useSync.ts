import { User } from "firebase/auth";
import { get, getDatabase, ref, set } from "firebase/database";
import { Operator } from "types/operators/operator";
import operatorJson from "data/operators.json";
import { repair } from "./useOperators";

export const safeMerge = (a: Operator, b: Operator): Operator => {
  if (!a) return b;
  if (!b) return a;
  return {
    op_id: a.op_id,
    name: a.name,
    owned: a.owned || b.owned,
    favorite: a.favorite || b.favorite,
    rarity: a.rarity,
    class: a.class,
    potential: Math.max(a.potential, b.potential),
    elite: Math.max(a.elite, b.elite),
    level: a.elite > b.elite ? a.level : Math.max(a.level, b.level),
    skill_level: Math.max(a.skill_level, b.skill_level),
    masteries:
      a.masteries && a.masteries.length
        ? a.masteries.map((value, index) =>
            !b.masteries || !b.masteries[index] || value > b.masteries[index]
              ? value
              : b.masteries[index]
          )
        : b.masteries ?? [],
    modules:
      a.modules && a.modules.length
        ? a.modules.map((value, index) =>
            !b.modules || !b.modules[index] || value > b.modules[index]
              ? value
              : b.modules[index]
          )
        : b.modules ?? [],
    skin: a.skin || b.skin,
  };
};

export const safeSyncAll = (
  user: User,
  operators: Record<string, Operator>,
  setOperators: (ops: Record<string, Operator>) => void
) => {
  const db = getDatabase();
  const rosterPath = `users/${user.uid}/roster/`;
  get(ref(db, rosterPath)).then((s1) => {
    if (s1.exists()) {
      const ops = { ...operators };
      let v1: Record<string, Operator> = s1.val();
      repair(v1, (v) => (v1 = v));
      Object.keys(operatorJson).forEach((opID) => {
        const safeMerged = safeMerge(ops[opID], v1[opID]);
        ops[opID] = safeMerged;
        set(
          ref(db, `${rosterPath}/${opID}/`),
          JSON.parse(JSON.stringify(safeMerged))
        );
      });
      setOperators(ops);
    }
  });
};
