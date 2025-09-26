import DepotItem from "types/depotItem";
import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import { LocalStorageSettings } from "types/localStorageSettings";
import getGoalIngredients from "util/fns/depot/getGoalIngredients";
import canCompleteByCrafting from "../depot/canCompleteByCrafting";
import operatorJson from "data/operators";
import { levelingCost } from "pages/tools/level";
import expToBattleRecords from "../depot/expToBattleRecords";
import { Ingredient } from "types/item";

const calculateCompletableStatus = (plannerGoal: PlannerGoal, depot: Record<string, DepotItem>, settings: LocalStorageSettings) => {
    if (settings.plannerSettings.allowAllGoals) {
        return { completable: true, completableByCrafting: false, depot, ingredients: getGoalIngredients(plannerGoal) };
    }
    let depotUpdate: Record<string,DepotItem>;
    let completable = false;
    let completableByCrafting = false;
    let ingredients: Ingredient[];
    if (plannerGoal.category === OperatorGoalCategory.Level) {
        const { exp, lmd } = levelingCost(
            operatorJson[plannerGoal.operatorId].rarity,
            plannerGoal.eliteLevel,
            plannerGoal.fromLevel,
            plannerGoal.eliteLevel,
            plannerGoal.toLevel
        );
        ingredients = [{id:"4001",quantity:lmd},{id:"EXP",quantity:exp}];
        const { success, depot: _depot } = expToBattleRecords(exp, depot);
        _depot["4001"].stock = Math.max(0, _depot["4001"].stock - lmd);

        completableByCrafting = false;
        completable = success
            && (depot["4001"].stock >= lmd || settings.depotSettings.ignoreLmdInCrafting);        
        
        depotUpdate = completable ? _depot : depot;
    } else {
        ingredients = getGoalIngredients(plannerGoal);
        const { craftableItems, depot: _depot } = canCompleteByCrafting(
            Object.fromEntries(ingredients.map(({ quantity, id }) => [id, quantity])),
            depot,
            settings.depotSettings.crafting,
            settings.depotSettings.ignoreLmdInCrafting
        );

        completableByCrafting = ingredients.every(
            ({ id, quantity }) =>
                (settings.depotSettings.ignoreLmdInCrafting && id === "4001") ||
                (/* id === "EXP" ? depotToExp(depot) :  */depot?.[id]?.stock) >= quantity ||
                craftableItems[id]
        );

        completable = ingredients.every(
            ({ id, quantity }) =>
                (settings.depotSettings.ignoreLmdInCrafting && id === "4001") ||
                (/* id === "EXP" ? depotToExp(depot) : */ depot?.[id]?.stock) >= quantity
        );

        depotUpdate = (completable || completableByCrafting) ? _depot : depot;
    }

    return { completable, completableByCrafting, depot: depotUpdate, ingredients };
};

export default calculateCompletableStatus;