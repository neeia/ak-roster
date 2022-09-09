import { User } from "firebase/auth";
import { get, getDatabase, ref, set } from "firebase/database";
import { Operator } from "../types/operator";
import operatorJson from "../data/operators.json";
import useOperators, { repair } from "./useOperators";

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
    mastery: a.mastery.map((value, index) =>
      !b.mastery || !b.mastery[index] || value > b.mastery[index]
        ? value : b.mastery[index]),
    module: a.module.map((value, index) =>
      !b.module || !b.module[index] || value > b.module[index]
        ? value : b.module[index])
  };
}

function useSync() {
  const [operators, onChange, applyBatch] = useOperators();
  const db = getDatabase();

  const safeSyncAll = (user: User) => {
    const rosterPath = `users/${user.uid}/roster/`;
    get(ref(db, rosterPath)).then(s1 => {
      if (s1.exists()) {
        let v1: Record<string, Operator> = s1.val();
        repair(v1, v => v1 = v);
        Object.keys(operatorJson).forEach(opID => {
          const safeMerged = safeMerge(operators[opID], v1[opID]);
          operators[opID] = safeMerged;
          set(ref(db, `${rosterPath}/${opID}/`), safeMerged);
        })
      }
    })
  }


  return [safeSyncAll] as const
}

export default useSync;