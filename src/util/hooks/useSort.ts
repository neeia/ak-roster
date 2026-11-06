import { useCallback, useState } from "react";
import { LocalStorageSettings } from "types/localStorageSettings";
import { SortFunctionData, SortFunctionFields, SortListItem, SortOpInfoOrData } from "types/sort";
import useAccount from "./useAccount";

export const sortFunctions: Record<keyof SortFunctionFields, SortFunctionData> = {
  Name: {
    fn: (a, b) => b.name.localeCompare(a.name),
    dfDesc: false,
  },
  Level: {
    fn: (a, b) => {
      const aElite = "elite" in a ? a.elite : 0;
      const bElite = "elite" in b ? b.elite : 0;
      const aLevel = "level" in a ? a.level : 0;
      const bLevel = "level" in b ? b.level : 0;
      return bElite - aElite || bLevel - aLevel;
    },
    dfDesc: true,
  },
  Rarity: {
    fn: (a, b) => b.rarity - a.rarity,
    dfDesc: true,
  },
  Potential: {
    fn: (a, b) => {
      const aPot = "potential" in a ? a.potential : 0;
      const bPot = "potential" in b ? b.potential : 0;
      return bPot - aPot;
    },
    dfDesc: true,
  },
  Favorite: {
    fn: (a, b) => {
      const aFav = "favorite" in a ? +a.favorite : 0;
      const bFav = "favorite" in b ? +b.favorite : 0;
      return bFav - aFav;
    },
    dfDesc: true,
  },
  "Release Date": {
    fn: (a, b) => b.releaseDateCn.localeCompare(a.releaseDateCn),
    dfDesc: true,
  },
  Released: {
    fn: (a, b, isCnAccount) => {
      const aPot = "potential" in a ? a.potential : 0;
      const bPot = "potential" in b ? b.potential : 0;
      const aCnOnly = "isCnOnly" in a ? a.isCnOnly : false;
      const bCnOnly = "isCnOnly" in b ? b.isCnOnly : false;

      const aVal = +((bPot > 0) || !bCnOnly || (isCnAccount ?? false));
      const bVal = +((aPot > 0) || !aCnOnly || (isCnAccount ?? false));

      return aVal - bVal;
    },
    dfDesc: true,
  },
};

export default function useSort(
  initSort?: SortListItem[],
  setSettings?: (settings: LocalStorageSettings | ((settings: LocalStorageSettings) => LocalStorageSettings)) => void,
  route?: string,) {
  const [sorts, _setSorts] = useState<SortListItem[]>(initSort ?? []);
  const [account] = useAccount();
  const isCnAccount = (account?.server ?? "").toLowerCase() == "cn"

  //redefining set - to also save settings
  const setSorts = useCallback(
    (valueOrUpdater: SortListItem[] | ((prev: SortListItem[]) => SortListItem[])) => {
      _setSorts((prevSorts) => {

        const nextSorts =
          typeof valueOrUpdater === "function"
            ? valueOrUpdater(prevSorts)
            : valueOrUpdater;

        if (setSettings && route) {
          setSettings((s) => ({
            ...s,
            sortingSettings: {
              ...(s?.sortingSettings ?? {}),
              [route]: nextSorts,
            },
          }));
        }

        return nextSorts;
      });
    },
    [setSettings, route]
  );

  /*
   * (key) -> remove this sort from the queue
   * (key, desc) -> add the sort with this sorting
   * priority - puts/moves sort to first/last 
   */
  const toggleSort = useCallback((key: keyof SortFunctionFields, desc?: boolean, priority: "first" | "last" = "last") => {
    setSorts((currentSorts) => {
      const filteredQueue = currentSorts.filter((li) => li.key !== key);
      if (desc === undefined) return filteredQueue;

      const item = { key, desc };
      return priority === "first" ? [item, ...filteredQueue] : [...filteredQueue, item];
    });
  }, [setSorts]);

  const sortFunction = useCallback(
    (a: SortOpInfoOrData, b: SortOpInfoOrData) => {
      return sorts
        .map(({ key, desc }) => {
          let compareKey = sortFunctions[key as keyof typeof sortFunctions].fn(
            a,
            b,
            isCnAccount
          );
          return desc ? compareKey : -compareKey;
        })
        .reduce((acc, curr) => {
          return acc || curr;
        }, 0);
    },
    [sorts, isCnAccount]
  );

  return { sorts, setSorts, toggleSort, sortFunction, sortFunctions } as const;
}
