import { User } from "firebase/auth";
import { get, getDatabase, ref, set } from "firebase/database";
import { Operator } from "types/operator";
import operatorJson from "data/operators.json";
import { repair } from "./useOperators";

export const safeMerge = (a: Operator, b: Operator): Operator => {
  if (!a) return b;
  if (!b) return a;
  return {
    id: a.id,
    name: a.name,
    owned: a.owned || b.owned,
    favorite: a.favorite || b.favorite,
    rarity: a.rarity,
    class: a.class,
    potential: Math.max(a.potential, b.potential),
    promotion: Math.max(a.promotion, b.promotion),
    level: a.promotion > b.promotion
      ? a.level : Math.max(a.level, b.level),
    skillLevel: Math.max(a.skillLevel, b.skillLevel),
    mastery: a.mastery && a.mastery.length ? a.mastery.map((value, index) =>
      !b.mastery || !b.mastery[index] || value > b.mastery[index]
        ? value : b.mastery[index]) : b.mastery ?? [],
    module: a.module && a.module.length ? a.module.map((value, index) =>
      !b.module || !b.module[index] || value > b.module[index]
        ? value : b.module[index]) : b.module ?? [],
    skin: a.skin || b.skin,
  };
}

export const safeSyncAll = (user: User, operators: Record<string, Operator>, setOperators: (ops: Record<string, Operator>) => void) => {
  const db = getDatabase();
  const rosterPath = `users/${user.uid}/roster/`;
  get(ref(db, rosterPath)).then(s1 => {
    if (s1.exists()) {
      const ops = { ...operators }
      let v1: Record<string, Operator> = s1.val();
      repair(v1, v => v1 = v);
      Object.keys(operatorJson).forEach(opID => {
        const safeMerged = safeMerge(ops[opID], v1[opID]);
        ops[opID] = safeMerged;
        set(ref(db, `${rosterPath}/${opID}/`), safeMerged);
      })
      setOperators(ops);
    }
  })
}
