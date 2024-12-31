import { useCallback, useState } from "react";
import { OpInfo } from "types/operators/operator";
import { SortFunctionData, SortListItem } from "types/sort";

export const sortFunctions: Record<string, SortFunctionData> = {
  Name: {
    fn: (a, b) => b.name.localeCompare(a.name),
    dfDesc: false,
  },
  Level: {
    fn: (a, b) => b.elite - a.elite || b.level - a.level,
    dfDesc: true,
  },
  Rarity: {
    fn: (a, b) => b.rarity - a.rarity,
    dfDesc: true,
  },
  Potential: {
    fn: (a, b) => b.potential - a.potential,
    dfDesc: true,
  },
  Favorite: {
    fn: (a, b) => +b.favorite - +a.favorite,
    dfDesc: true,
  },
};

export default function useSort(initSort?: SortListItem[]) {
  const [sorts, setSorts] = useState<SortListItem[]>(initSort ?? []);

  /*
   * (key) -> remove this sort from the queue
   * (key, desc) -> add the sort with this sorting
   */
  function toggleSort(key: string, desc?: boolean) {
    const filteredQueue = sorts.filter((li) => li.key !== key);
    if (desc !== undefined) {
      setSorts((_) => [...filteredQueue, { key: key, desc: desc }]);
    } else {
      setSorts((_) => [...filteredQueue]);
    }
  }

  const sortFunction = useCallback(
    (a: OpInfo, b: OpInfo) => {
      return sorts
        .map(({ key, desc }) => {
          let compareKey = sortFunctions[key as keyof typeof sortFunctions].fn(
            a,
            b
          );
          return desc ? compareKey : -compareKey;
        })
        .reduce((acc, curr) => {
          return acc || curr;
        }, 0);
    },
    [sorts]
  );

  return { sorts, setSorts, toggleSort, sortFunction, sortFunctions } as const;
}
