import { matchOperatorName } from "components/planner/OperatorSearch";
import operatorJson from "data/operators";
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";
import DepotItem from "types/depotItem";
import { PlannerGoal, PlannerGoalCalculated } from "types/goal";
import { GoalFilter } from "types/goalFilter";
import { LocalStorageSettings } from "types/localStorageSettings";
import calculateCompletableStatus from "util/fns/planner/calculateCompletableStatus";
import getGoalIngredients from "util/fns/depot/getGoalIngredients";
import { Ingredient } from "types/item";

export interface GoalFilterHook {
  readonly filters: GoalFilter;
  readonly setFilters: Dispatch<SetStateAction<GoalFilter>>;
  readonly clearFilters: () => void;
  readonly filterFunction: {
    readonly byOperatorsAndGroups: (goal: PlannerGoal, group: string, settings: LocalStorageSettings) => boolean,
    readonly byGoalAndMaterials: (goal: PlannerGoal | PlannerGoalCalculated, settings: LocalStorageSettings, depot?: Record<string, DepotItem>) => boolean,
  }
}

const isCalculated = (goal: PlannerGoal | PlannerGoalCalculated): goal is PlannerGoalCalculated => {
  return "completable" in goal && "completableByCrafting" in goal;
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

  const byOperatorsAndGroups = useCallback(
    (goal: PlannerGoal, group: string, settings: LocalStorageSettings) => {

      const opData = operatorJson[goal.operatorId];
      if (!opData) return false;

      const opIsEnabled = !(settings.plannerSettings.inactiveOpsInGroups[group]?.includes(goal.operatorId));
      if (opIsEnabled === false) return false;

      if (filters.category.length && !filters.category.includes(goal.category)) return false;

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

      return true;
    },
    [filters]
  );

  const byGoalAndMaterials = useCallback(
    (goal: PlannerGoal | PlannerGoalCalculated, settings: LocalStorageSettings, depot?: Record<string, DepotItem>) => {
      //ingrediets
      if (filters.materials.length > 0) {
        let ingredients: Ingredient[];
        if (isCalculated(goal)) {
          ingredients = goal.ingredients;
        }
        else {
          ingredients = getGoalIngredients(goal);
        }
        return ingredients.some((ingr) => filters.materials.includes(ingr.id));
      }
      //completability only if depot wast sent
      if (depot) {
        let completable: boolean;
        let completableByCrafting: boolean;
        //calculate only if not PlannerGoalCalculated
        if (isCalculated(goal)) {
          completable = goal.completable;
          completableByCrafting = goal.completableByCrafting;
        } else {
          const result = calculateCompletableStatus(goal, depot, settings);
          completable = result.completable;
          completableByCrafting = result.completableByCrafting;
        }
        const craftFilters =
          !filters.completable && !filters.craftable && !filters.uncompletable
            ? true
            : [
              filters.completable && completable,
              filters.craftable && !completable && completableByCrafting,
              filters.uncompletable && !completable && !completableByCrafting
            ].some(Boolean);
        if (!craftFilters) return false;
      }
      return true;
    },
    [filters]
  );

  return {
    filters,
    setFilters,
    clearFilters,
    filterFunction: {
      byOperatorsAndGroups,
      byGoalAndMaterials
    },
  } as const;
}
