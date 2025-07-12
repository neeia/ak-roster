import { matchOperatorName } from "components/planner/OperatorSearch";
import { useCallback, useState } from "react";
import { OpInfo } from "types/operators/operator";

const checkClasses = (op: OpInfo, value: Set<Value>) => value.has(op.class);
const checkBranches = (op: OpInfo, value: Set<Value>) => value.has(op.branch);
const checkOwned = (op: OpInfo, value: Set<Value>) => value.has(op.potential > 0);
const checkElite = (op: OpInfo, value: Set<Value>) => value.has(op.elite);
const checkRarity = (op: OpInfo, value: Set<Value>) => value.has(op.rarity);
const checkCNOnly = (op: OpInfo, value: Set<Value>) => value.has(op.isCnOnly);
const checkModuleCNOnly = (op: OpInfo, value: Set<Value>) =>
  op.moduleData && op.moduleData.some((m) => value.has(m.isCnOnly));

const checkSkillLevel = (op: OpInfo, value: Set<Value>) => {
  for (const v of value) {
    if (
      (v === 1 && op.skill_level >= 1 && op.skill_level <= 3) ||
      (v === 4 && op.skill_level >= 4 && op.skill_level <= 6) ||
      (v === 7 && op.skill_level === 7)
    ) {
      return true;
    }
  }
  return false;
};

const checkMastery = (op: OpInfo, value: Set<Value>) => {
  const masteries = op.masteries;
  // 0 — All are 0 or none
  if (value.has(0)) {
    if (!masteries || masteries.every((m) => m === 0)) {
      return true;
    }
  }
  // 1 -3  — any at value
  for (let i = 1; i <= 3; i++) {
    if (value.has(i) && masteries?.some((m) => m === i)) {
      return true;
    }
  }
  // 4 — exactly two at 3
  if (value.has(4)) {
    const count = masteries?.filter((m) => m === 3).length ?? 0;
    if (count === 2) return true;
  }
  // 5 — exactly 3 at 3
  if (value.has(5)) {
    const count = masteries?.filter((m) => m === 3).length ?? 0;
    if (count === 3) return true;
  }
  return false;
};

const checkModuleLevel = (op: OpInfo, value: Set<Value>) =>
  op.modules &&
  value.values().some((v) =>
    (v === 0 && Object.values(op.modules).every((m) => m === v))
    || (v !== 0 && Object.values(op.modules).some((m) => m === v))
  );;
const checkPools = (op: OpInfo, value: Set<Value>) =>
  op.pools && value.values().some((v) => op.pools.some((p) => p === v));

export type Value = string | boolean | number;

export type Filters = {
  CLASS: Set<Value>;
  BRANCH: Set<Value>;
  OWNED: Set<Value>;
  ELITE: Set<Value>;
  RARITY: Set<Value>;
  CN: Set<Value>;
  MODULECN: Set<Value>;
  MASTERY: Set<Value>;
  SKILLLEVEL: Set<Value>;
  MODULELEVEL: Set<Value>;
  POOLS: Set<Value>;
  FAVORITE: Set<Value>;
};
export type ToggleFilter = (category: keyof Filters, value: Value) => void;

export default function useFilter(init: Partial<Filters> = {}) {
  const [filters, setFilters] = useState<Filters>({
    CLASS: init.CLASS ?? new Set(),
    BRANCH: init.BRANCH ?? new Set(),
    OWNED: init.OWNED ?? new Set(),
    ELITE: init.ELITE ?? new Set(),
    RARITY: init.RARITY ?? new Set(),
    CN: init.CN ?? new Set(),
    MODULECN: init.MODULECN ?? new Set(),
    MASTERY: init.MASTERY ?? new Set(),
    SKILLLEVEL: init.SKILLLEVEL ?? new Set(),
    MODULELEVEL: init.MODULELEVEL ?? new Set(),
    POOLS: init.POOLS ?? new Set(),
    FAVORITE: init.FAVORITE ?? new Set(),
  });

  const [search, setSearch] = useState("");

  const toggleFilter = useCallback(
    (category: keyof Filters, value: Value) => {
      const cloneFilter = structuredClone(filters);
      const set = cloneFilter[category];
      if (set.has(value)) {
        set.delete(value);
      } else set.add(value);
      setFilters(cloneFilter);
    },
    [filters]
  );

  const clearFilters = useCallback(() => {
    setFilters((f: Filters) => Object.fromEntries(Object.keys(f).map((k) => [k, new Set()])) as Filters);
  }, []);

  const filterFunction = useCallback(
    (op: OpInfo) => {
      if (filters.CLASS.size && !checkClasses(op, filters.CLASS)) return false;
      if (filters.BRANCH.size && !checkBranches(op, filters.BRANCH)) return false;
      if (filters.OWNED.size && !checkOwned(op, filters.OWNED)) return false;
      if (filters.ELITE.size && !checkElite(op, filters.ELITE)) return false;
      if (filters.RARITY.size && !checkRarity(op, filters.RARITY)) return false;
      if (filters.CN.size && !checkCNOnly(op, filters.CN)) return false;
      if (filters.MODULECN.size && !checkModuleCNOnly(op, filters.MODULECN)) return false;
      if (filters.MASTERY.size && !checkMastery(op, filters.MASTERY)) return false;
      if (filters.SKILLLEVEL.size && !checkSkillLevel(op, filters.SKILLLEVEL)) return false;
      if (filters.MODULELEVEL.size && !checkModuleLevel(op, filters.MODULELEVEL)) return false;
      if (filters.POOLS.size && !checkPools(op, filters.POOLS)) return false;
      if (filters.FAVORITE.size && !op.favorite) return false;
      if (!matchOperatorName(op.name, search)) return false;
      return true;
    },
    [filters, search]
  );

  return {
    filters,
    toggleFilter,
    clearFilters,
    filterFunction,
    search,
    setSearch,
  } as const;
}
