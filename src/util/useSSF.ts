import { useCallback, useState } from "react";
import { FilterFunction } from "../types/filter";
import { Operator, OpJsonObj } from "../types/operator";
import { SortFunction, SortListItem } from "../types/sort";
import useOperators from "./useOperators";

export const sortFunctions: Record<string, SortFunction> = {
  "Name": {
    fn: (a: Operator, b: Operator): number => b.name.localeCompare(a.name),
    dfDesc: false,
  },
  "Level": {
    fn: (a: Operator, b: Operator): number => b.promotion - a.promotion || b.level - a.level,
    dfDesc: true,
  },
  "Rarity": {
    fn: (a: Operator, b: Operator): number => b.rarity - a.rarity,
    dfDesc: true,
  },
  "Potential": {
    fn: (a: Operator, b: Operator): number => b.potential - a.potential,
    dfDesc: true,
  },
  "Favorite": {
    fn: (a: Operator, b: Operator): number => +b.favorite - +a.favorite,
    dfDesc: true,
  },
  //"Class": {
  //  fn: (a: Operator, b: Operator): number => classList.indexOf(b.class) - classList.indexOf(a.class),
  //  dfDesc: false,
  //},
}

function useSSF(initSort?: SortListItem[], initFilter?: Record<string, Record<string, FilterFunction>>) {
  const [operators] = useOperators();
  const [sortQueue, setSortQueue] = useState<SortListItem[]>(initSort ?? []);
  const [searchName, setSearchName] = useState("");

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

  const sortFunction = useCallback((a: Operator, b: Operator) => {
    return sortQueue.map(({ key, desc }) => {
      let compareKey = sortFunctions[key as keyof typeof sortFunctions].fn(a, b);
      return desc ? compareKey : -compareKey;
    }).reduce((acc, curr) => {
      return acc || curr;
    }, 0);
  }, [sortQueue])

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
  const filterFunction = useCallback((opInfo: OpJsonObj) => {
    const op = operators[opInfo.id]
    const filterFunctions = Object.values(filter)
      .map(v1 => Object.keys(v1).length === 0 || Object.values(v1).some(v2 => v2(op, opInfo)));
    return filterFunctions.every(v => v)
      && (opInfo.name.toLowerCase().includes(searchName.toLowerCase())
        || opInfo.cnName.toLowerCase().includes(searchName.toLowerCase()));
  }, [operators, filter, searchName]);

  return [searchName, setSearchName,
    sortQueue, setSortQueue, sortFunctions, toggleSort, sortFunction,
    filter, addFilter, removeFilter, clearFilters, filterFunction] as const;
}

export default useSSF;