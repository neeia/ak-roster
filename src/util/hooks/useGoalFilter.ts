import { matchOperatorName } from "components/planner/OperatorSearch";
import operatorJson from "data/operators";
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";
import DepotItem from "types/depotItem";
import { PlannerGoal } from "types/goal";
import { GoalFilter } from "types/goalFilter";
import { LocalStorageSettings } from "types/localStorageSettings";
import calculateCompletableStatus from "util/fns/planner/calculateCompletableStatus";
import getGoalIngredients from "util/fns/depot/getGoalIngredients";

export interface GoalFilterHook {
  readonly filters: GoalFilter;
  readonly setFilters: Dispatch<SetStateAction<GoalFilter>>;
  readonly clearFilters: () => void;
  filterFunction: (goal: PlannerGoal, depot: Record<string, DepotItem>, group: string, settings: LocalStorageSettings) => boolean;
}

export default function useGoalFilter(init: Partial<GoalFilter> = {}) {
  const defaultFilter = useMemo(
    () => ({
      search: init.search ?? "",
      completable: init.completable,
      craftable: init.craftable,
      uncompletable: init.uncompletable,
      category: init.category ?? [],
      materials: init.materials ?? [],
    }),
    [init]
  );

  const [filters, setFilters] = useState<GoalFilter>(defaultFilter);

  const clearFilters = useCallback(() => {
    setFilters({ ...defaultFilter });
  }, [defaultFilter]);

  const filterFunction = useCallback(
    (goal: PlannerGoal, depot: Record<string, DepotItem>, group: string, settings: LocalStorageSettings) => {

      const opData = operatorJson[goal.operatorId];
      const ingredients = getGoalIngredients(goal);

      const { completableByCrafting, completable } = calculateCompletableStatus(goal, depot, settings);
      const opIsEnabled = !(settings.plannerSettings.inactiveOpsInGroups[group]?.includes(goal.operatorId));
      if (!opData) return false;
      if (opIsEnabled === false) return false;
      if (
        filters.search &&
        filters.search
          .split(",")
          .map((s) => s.trim())
          .every((s) =>
            s.startsWith("-")
              ? (
                matchOperatorName(opData.name, s.substring(1)) ||
                group.toLocaleLowerCase().includes(s.substring(1).toLocaleLowerCase())
              )
              : !(matchOperatorName(opData.name, s) || group.toLocaleLowerCase().includes(s.toLocaleLowerCase()))
          )
      )
        return false;
      const craftFilters =
        !filters.completable && !filters.craftable && !filters.uncompletable
          ? true
          : [
            filters.completable && completable,
            filters.craftable && !completable && completableByCrafting,
            filters.uncompletable && !completable && !completableByCrafting
          ].some(Boolean);
      if (!craftFilters) return false;
      if (filters.category.length && !filters.category.includes(goal.category)) return false;

      if (filters.materials.length > 0) {
        return ingredients.some((ingr) => filters.materials.includes(ingr.id));
      }

      return true;
    },
    [filters]
  );

  return {
    filters,
    setFilters,
    clearFilters,
    filterFunction,
  } as const;
}
