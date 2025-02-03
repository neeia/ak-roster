import DepotItem from "types/depotItem";
import { Item } from "types/item";
import itemsJson from "data/items.json";

const canCompleteByCrafting = (
  materialsNeeded: Record<string, number>,
  depot: Record<string, DepotItem>,
  crafting: string[]
) => {
  //0. Tweak: all Dualchips => hypothetically craftable
  //Needed to showcase depot for All Goals better
  //variables to save/refund/consume catalists
  const catalistId = "32001";
  let catalistsUsedQuantity = 0;

  // 1. Save original recipe
  const _materialsNeeded = { ...materialsNeeded };

  // 2. populate number of ingredients required for items being crafted
  const ingredientToCraftedItemsMapping: Record<string, string[]> = {};
  Object.values(itemsJson)
    .sort((a, b) => b.tier - a.tier)
    .forEach((item) => {
      // n.b. NOT equivalent to filtering the array first,
      // because we will be modifying materialsNeeded during execution
      if (materialsNeeded[item.id] != null) {
        const remaining = Math.max(materialsNeeded[item.id] - (depot[item.id]?.stock ?? 0), 0);

        if (remaining > 0 && crafting.includes(item.id)) {
          const itemBeingCrafted: Item = itemsJson[item.id as keyof typeof itemsJson];
          const { ingredients, yield: itemYield } = itemBeingCrafted;
          if (ingredients != null) {
            const multiplier = Math.ceil(remaining / (itemYield ?? 1));
            ingredients.forEach((ingr) => {
              //Fix chips-pairs loop: add <" Chip"> or <" Chip" Pack> as ingredient only if craftedItem Chip isn't already ingredient
              if (itemBeingCrafted.name.includes(" Chip")
                && !Boolean(ingredientToCraftedItemsMapping[item.id] ?? false)) {
                ingredientToCraftedItemsMapping[ingr.id] = [...(ingredientToCraftedItemsMapping[ingr.id] ?? []), item.id];
              }
              materialsNeeded[ingr.id] = (materialsNeeded[ingr.id] ?? 0) + ingr.quantity * multiplier;
            });
          }
        }
      }
    });
  
  // 3. calculate what ingredients can be fulfilled by crafting and craft them in _depot
  const _depot = { ...depot }; // need to hypothetically deduct from stock
  const craftableItems: Record<string, boolean> = {};
  Object.keys(materialsNeeded)
    .filter(
      (craftedItemId) =>
        (
          (materialsNeeded[craftedItemId] - (depot[craftedItemId]?.stock ?? 0)) > 0)
        //only craft "Crafting" items
        && crafting.includes(craftedItemId)
        //Fix chips-pairs loop: only craft Chips that are not ingredients (of other chips)
        && (!itemsJson[craftedItemId as keyof typeof itemsJson].name.includes(" Chip")//  chip   = 0 not-chip  = 1
          || !Boolean(ingredientToCraftedItemsMapping[craftedItemId]))                //  inr    = 0 not-inr   = 1 
    )
    .sort(
      (itemA, itemB) =>
        itemsJson[itemA as keyof typeof itemsJson].tier - itemsJson[itemB as keyof typeof itemsJson].tier
    )
    .forEach((craftedItemId) => {
      const shortage = materialsNeeded[craftedItemId] - (depot[craftedItemId]?.stock ?? 0);
      const craftedItem: Item = itemsJson[craftedItemId as keyof typeof itemsJson];
      const ingredients = craftedItem.ingredients;
      if (ingredients != null) {
        const itemYield = craftedItem.yield ?? 1;
        // numTimesCraftable: max number of times the formula can be executed
        const numTimesCraftable = Math.min(
          ...ingredients.map((ingr) => Math.floor((_depot[ingr.id]?.stock ?? 0) / ingr.quantity))
        );
        // numTimesToCraft: how many times we'll actually execute the formula
        const numTimesToCraft = Math.min(numTimesCraftable, Math.ceil(shortage / itemYield));
        // now deduct from crafting supply
        ingredients.forEach((ingr) => {
          const copy = { ..._depot[ingr.id] };
          const refund = copy.stock;
          copy.stock = Math.max((_depot[ingr.id]?.stock ?? 0) - ingr.quantity * numTimesToCraft);
          //Tweak: all Dualchips => hypothetically craftable: refund catalists
          if ((craftedItem.name.includes("Dualchip")
            && ingr.id === catalistId)) {
              copy.stock = refund;
              catalistsUsedQuantity = ingr.quantity * numTimesToCraft;
            }
          _depot[ingr.id] = copy;
        });
        if ((shortage - itemYield * numTimesToCraft <= 0)) {
          craftableItems[craftedItemId] = true;
        }
        // even if the crafted item can't be completed, update our hypothetical depot counts
        const copy = { ..._depot[craftedItemId] };
        copy.stock = (_depot[craftedItemId]?.stock ?? 0) + numTimesToCraft * itemYield;
        _depot[craftedItemId] = copy;
      }
    });

  Object.keys(ingredientToCraftedItemsMapping)
    //Fix chips-pairs loop: chips that are ingredients (of other chips) - can't be auto set to cratable
    .filter(ingrId => !itemsJson[ingrId as keyof typeof itemsJson].name.includes(" Chip"))
    .forEach((ingrId) => {
      if ((materialsNeeded[ingrId] ?? 0) - (_depot[ingrId]?.stock ?? 0) <= 0) {
        craftableItems[ingrId] = true;
      }
    });

  // 4. calculate Goal Completion _depot
  // 4.1 Consume original recipe materials, both hypothetically crafted in #3 and stock  
  Object.keys(_materialsNeeded).forEach((ingrId) => {
    const copy = { ..._depot[ingrId] };
    copy.stock = Math.max((_depot[ingrId]?.stock ?? 0) - _materialsNeeded[ingrId], 0);
    _depot[ingrId] = copy;
  });
  // 4.2 Tweak: all Dualchips => hypothetically craftable: Consume used catalists
  if (catalistsUsedQuantity > 0) {
    const copy = { ..._depot[catalistId] };
    copy.stock = Math.max((_depot[catalistId]?.stock ?? 0) - catalistsUsedQuantity,0);
    _depot[catalistId] = copy;
  }

  return { craftableItems, ingredientToCraftedItemsMapping, depot: _depot };
};

export default canCompleteByCrafting;
