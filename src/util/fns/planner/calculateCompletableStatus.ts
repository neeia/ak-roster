import DepotItem from "types/depotItem";
import { PlannerGoal } from "types/goal";
import { LocalStorageSettings } from "types/localStorageSettings";
import getGoalIngredients from "util/fns/depot/getGoalIngredients";
import canCompleteByCrafting from "../depot/canCompleteByCrafting";
import depotToExp from "../depot/depotToExp";

const calculateCompletableStatus = (plannerGoal: PlannerGoal, depot: Record<string, DepotItem>, settings: LocalStorageSettings) => {
    if (settings.plannerSettings.allowAllGoals) {
        return { completable: true, completableByCrafting: false };
    }

    const ingredients = getGoalIngredients(plannerGoal);
    const { craftableItems } = canCompleteByCrafting(
        Object.fromEntries(ingredients.map(({ quantity, id }) => [id, quantity])),
        depot,
        settings.depotSettings.crafting,
        settings.depotSettings.ignoreLmdInCrafting
    );

    const completableByCrafting = ingredients.every(
        ({ id, quantity }) =>
            (settings.depotSettings.ignoreLmdInCrafting && id === "4001") ||
            (id === "EXP" ? depotToExp(depot) : depot[id]?.stock) >= quantity ||
            craftableItems[id]
    );

    const completable = ingredients.every(
        ({ id, quantity }) =>
            (settings.depotSettings.ignoreLmdInCrafting && id === "4001") ||
            (id === "EXP" ? depotToExp(depot) : depot[id]?.stock) >= quantity
    );

    return { completable, completableByCrafting };
};

export default calculateCompletableStatus;