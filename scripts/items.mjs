import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadRepositoryTable } from "./tablesMapper.mjs";

const enItemTable     = loadRepositoryTable("enItemTable");
const cnBuildingData  = loadRepositoryTable("cnBuildingData");
const cnItemTable     = loadRepositoryTable("cnItemTable");

const unofficialItemNameTranslations = {
  30165: "Biphasic Enantiomorphic Medium",
  31093: "Pseudocondensation Nucleus",
  31094: "Chiral Refractor",
};

const getEnglishItemName = (itemId) => {
  const enEntry = enItems[itemId];
  const cnName = cnItems[itemId].name;
  let name = enEntry?.name;
  if (name == null) {
    const unofficialName = unofficialItemNameTranslations[itemId];
    if (unofficialName != null) {
      console.log(`Using unofficial item name translation for ID '${itemId}' => '${unofficialName}'`);
      name = unofficialName;
    } else if (cnName != null) {
      console.warn(`No item name translation found for ID '${itemId}'`);
      name = cnName;
    } else {
      throw new Error(`Couldn't find item name for ID '${itemId}'`);
    }
  }
  return name;
};

const gameDataCostToIngredient = (cost) => {
  const { id, count } = cost;
  return {
    id,
    quantity: count,
  };
};

const convertLMDCostToLMDItem = (cost) => ({
  id: "4001",
  quantity: cost,
});

const enItems = enItemTable.items;
const cnItems = cnItemTable.items;
const { workshopFormulas, manufactFormulas: manufactureFormulas } = cnBuildingData;

const ADDITIONAL_ITEM_NAME_TO_ID_ENTRIES = {};

const ADDITIONAL_RECIPES = {
  32001: {
    costs: [
      {
        id: "4006",
        count: 90,
        type: "MATERIAL",
      },
    ],
    count: 1,
  },
  mod_unlock_token: {
    costs: [
      {
        id: "4006",
        count: 120,
        type: "MATERIAL",
      },
    ],
    count: 1,
  },
};

const isPlannerItem = (itemId) => {
  const entry = cnItems[itemId];
  return (
    itemId === "4001" || // LMD
    (entry.classifyType === "MATERIAL" &&
      !itemId.startsWith("p_char_") && // character-specific potential tokens
      !itemId.startsWith("class_p_char_") && // character-specific potential tokens
      !itemId.startsWith("tier") && // generic potential tokens
      !itemId.startsWith("voucher_full_")) // vouchers for event welfare ops like Flamebringer
  );
};

const createItemsJson = async () => {
  const itemIds = Object.keys(cnItems).filter((itemId) => isPlannerItem(itemId));
  const _baseItems = Object.fromEntries(
    itemIds.map((itemId) => {
      const item = cnItems[itemId];
      const baseOutputItem = {
        id: itemId,
        name: getEnglishItemName(itemId),
        iconId: item.iconId,
        tier: parseInt(item.rarity.slice(-1)),
        sortId: item.sortId,
      };

      const workshopFormulaId = item.buildingProductList.find(({ roomType }) => roomType === "WORKSHOP")?.formulaId;
      const manufactureFormulaId = item.buildingProductList.find(
        ({ roomType }) => roomType === "MANUFACTURE"
      )?.formulaId;
      const additionalRecipe = ADDITIONAL_RECIPES[itemId];
      let formula = null;

      if (workshopFormulaId) {
        formula = workshopFormulas[workshopFormulaId];
      } else if (
        // a bit hacky, but we don't want to include yield: 1; ingredients: [] for EXP items
        manufactureFormulaId &&
        !manufactureFormulas[manufactureFormulaId].formulaType.endsWith("EXP")
      ) {
        formula = manufactureFormulas[manufactureFormulaId];
      } else if (additionalRecipe) {
        formula = additionalRecipe;
      }
      if (formula) {
        const ingredients = formula.costs.map(gameDataCostToIngredient);
        if (formula.goldCost != null && formula.goldCost > 0) {
          ingredients.unshift(convertLMDCostToLMDItem(formula.goldCost));
        }
        return [itemId, { ...baseOutputItem, ingredients, yield: formula.count }];
      }
      return [itemId, baseOutputItem];
    })
  );
  const baseItems = {
    ..._baseItems,
    EXP: {
      id: "EXP",
      name: "Operator EXP",
      iconId: "EXP_PLAYER",
      tier: 4,
      sortId: 70000,
    },
    4006: {
      id: "4006",
      name: "Purchase Certificate",
      iconId: "EXGG_SHD",
      tier: 4,
      sortId: 10005,
    },
  };

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const itemsJsonPath = path.join(__dirname, "..", "src", "data", "items.json");
  fs.writeFileSync(itemsJsonPath, JSON.stringify(baseItems, null, 2));
  console.log(`items: wrote ${itemsJsonPath}`);

  const itemNameToId = {
    ...Object.fromEntries(Object.entries(baseItems).map(([id, item]) => [item.name, id])),
    ...ADDITIONAL_ITEM_NAME_TO_ID_ENTRIES,
  };
  const itemNameToIdJsonPath = path.join(__dirname, "..", "src", "data", "item-name-to-id.json");
  fs.writeFileSync(itemNameToIdJsonPath, JSON.stringify(itemNameToId, null, 2));
  console.log(`items: wrote ${itemNameToIdJsonPath}`);
};

export default createItemsJson;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createItemsJson();
}
