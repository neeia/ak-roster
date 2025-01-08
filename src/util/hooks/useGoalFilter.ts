import { matchOperatorName } from "components/planner/OperatorSearch";
import operatorJson from "data/operators";
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";
import DepotItem from "types/depotItem";
import { PlannerGoal } from "types/goal";
import { GoalFilter } from "types/goalFilter";
import canCompleteByCrafting from "util/fns/depot/canCompleteByCrafting";
import depotToExp from "util/fns/depot/depotToExp";
import getGoalIngredients from "util/fns/depot/getGoalIngredients";

export interface GoalFilterHook {
  readonly filters: GoalFilter;
  readonly setFilters: Dispatch<SetStateAction<GoalFilter>>;
  readonly clearFilters: () => void;
  readonly filterFunction: (goal: PlannerGoal, depot: Record<string, DepotItem>, group: string) => boolean;
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
    (goal: PlannerGoal, depot: Record<string, DepotItem>, group: string) => {
      const opData = operatorJson[goal.operatorId];
      const ingredients = getGoalIngredients(goal);
      const completableByCrafting = canCompleteByCrafting(
        Object.fromEntries(ingredients.map(({ quantity, id }) => [id, quantity])),
        depot,
        Object.keys(depot)
      );
      const completable = ingredients.every(({ id, quantity }) =>
        id === "EXP" ? depotToExp(depot) : depot[id]?.stock >= quantity
      );
      if (!opData) return false;
      if (
        !matchOperatorName(opData.name, filters.search) &&
        !group.toLocaleLowerCase().includes(filters.search.toLocaleLowerCase())
      )
        return false;
      if (
        (filters.completable && !completable) ||
        (filters.craftable && !completableByCrafting) ||
        (filters.uncompletable && (completable || completableByCrafting))
      )
        return false;
      if (filters.category.length && !filters.category.includes(goal.category)) return false;
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
