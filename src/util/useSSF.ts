import { useCallback, useState } from "react";
import { FilterFunction } from "../types/filter";
import { Operator, OperatorData } from "../types/operator";
import { OpInfo, SortFunctionData, SortListItem } from "../types/sort";

export const sortFunctions: Record<string, SortFunctionData> = {
  "Name": {
    fn: (a, b): number => b.name.localeCompare(a.name),
    dfDesc: false,
  },
  "Level": {
    fn: (a, b): number => b.promotion - a.promotion || b.level - a.level,
    dfDesc: true,
  },
  "Rarity": {
    fn: (a, b): number => b.rarity - a.rarity,
    dfDesc: true,
  },
  "Potential": {
    fn: (a, b): number => b.potential - a.potential,
    dfDesc: true,
  },
  "Favorite": {
    fn: (a, b): number => +b.favorite - +a.favorite,
    dfDesc: true,
  },
}

export function useFilter(initFilter?: Record<string, Record<string, FilterFunction>>) {
  const [searchName, setSearchName] = useState("");

  const [filter, _setFilter] = useState<Record<string, Record<string, FilterFunction>>>(initFilter ?? {});
  const addFilter = useCallback((p: string, k: string, fp: FilterFunction) => {
    const currFilter = { ...filter };
    const propertyFilter = currFilter[p];
    if (!propertyFilter) {
      // Key doesn't exist, add filter in
      currFilter[p] = {};
    }
    currFilter[p][k] = fp;
    _setFilter(currFilter);
  }, [filter]);
  const removeFilter = useCallback((p: string, k: string) => {
    const currFilter = { ...filter };
    const propertyFilter = currFilter[p];
    if (propertyFilter && Object.keys(propertyFilter).includes(k)) {
      // Key exists already, time to remove it
      delete currFilter[p][k];
    }
    _setFilter(currFilter);
  }, [filter]);
  const clearFilters = useCallback(() => {
    const newFilter = {};
    _setFilter(newFilter);
  }, []);
  const filterFunction = useCallback((opInfo: OperatorData, op: Operator) => {
    if (!opInfo || !op) return false;
    const filterFunctions = Object.values(filter)
      .map(v1 => Object.keys(v1).length === 0 || Object.values(v1).some(v2 => v2(op, opInfo)));
    return filterFunctions.every(v => v)
      && (opInfo.name.toLowerCase().includes(searchName.toLowerCase())
        || opInfo.cnName.toLowerCase().includes(searchName.toLowerCase()));
  }, [filter, searchName]);

  return [searchName, setSearchName,
    filter, addFilter, removeFilter, clearFilters, filterFunction] as const;
}

export function useSort(initSort?: SortListItem[]) {
  const [sortQueue, setSortQueue] = useState<SortListItem[]>(initSort ?? []);

  /*
   * (key) -> remove this sort from the queue
   * (key, desc) -> add the sort with this sorting
   */
  function toggleSort(key: string, desc?: boolean) {
    const filteredQueue = sortQueue.filter(li => li.key !== key);
    if (desc !== undefined) {
      setSortQueue(_ => [...filteredQueue, { key: key, desc: desc }]);
    } else {
      setSortQueue(_ => [...filteredQueue]);
    }
  }

  const sortFunction = useCallback((a: OpInfo, b: OpInfo) => {
    return sortQueue.map(({ key, desc }) => {
      let compareKey = sortFunctions[key as keyof typeof sortFunctions].fn(a, b);
      return desc ? compareKey : -compareKey;
    }).reduce((acc, curr) => {
      return acc || curr;
    }, 0);
  }, [sortQueue])

  return [sortQueue, setSortQueue, sortFunctions, toggleSort, sortFunction] as const;
}