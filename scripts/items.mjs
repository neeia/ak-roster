import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import axios from "axios";
import puppeteer from "puppeteer";

import enStageData from "./ArknightsGameData/en_US/gamedata/excel/stage_table.json" assert { type: "json" };
import cnBuildingData from "./ArknightsGameData/zh_CN/gamedata/excel/building_data.json" assert { type: "json" };
import cnItemTable from "./ArknightsGameData/zh_CN/gamedata/excel/item_table.json" assert { type: "json" };
import cnStageData from "./ArknightsGameData/zh_CN/gamedata/excel/stage_table.json" assert { type: "json" };
import {
  getEnglishItemName,
  DATA_OUTPUT_DIRECTORY,
  gameDataCostToIngredient,
  convertLMDCostToLMDItem,
} from "./shared.mjs";

const enStageTable = enStageData.stages;
const cnStageTable = cnStageData.stages;
const cnItems = cnItemTable.items;
const { workshopFormulas, manufactFormulas: manufactureFormulas } =
  cnBuildingData;

const ADDITIONAL_ITEM_NAME_TO_ID_ENTRIES = {
  "Crystalline Electroassembly": "30145",
};

// maximum item sanity cost multiplier when considering a stage as being "efficient"
// e.g. if Sugar Substitute costs 4x+ sanity per item farming it from the "most efficient" stage
// compared to the sanity per item from the "least sanity" stage, then don't display a most efficient stage
// (since it'd take way too long to get the item from the prospective most efficient stage)
const EFFICIENT_STAGE_MAX_ITEM_SANITY_COST_MULTIPLIER = 4;

const isPlannerItem = (itemId) => {
  const entry = cnItems[itemId];
  return (
    itemId === "4001" || // LMD
    (entry.classifyType === "MATERIAL" &&
      !itemId.startsWith("p_char_") && // character-specific potential tokens
      !itemId.startsWith("tier") && // generic potential tokens
      !itemId.startsWith("voucher_full_")) // vouchers for event welfare ops like Flamebringer
  );
};

const fetchLuzarkLPSolverOutput = async () => {
  const LUZARK_LP_SOLVER_URL =
    "https://colab.research.google.com/drive/1lHwJDG7WCAr3KMlxY-HLyD8-yG3boazq";
  const SANITY_VALUE_CELL_ID = "feRucRPwWGZo";
  const STAGE_INFO_CELL_ID = "znmVNbnNWIre";
  const stageRegex =
    /^Activity (?<stageName>[A-Z0-9-]+) \([^)]+\).*Efficiency 100\.000%/;
  const itemRegex = /^(?<itemName>[^:]+): (?<sanityValue>[0-9.]+) sanity value/;

  const stageNameToKey = Object.fromEntries(
    Object.entries(cnStageTable)
      .filter(([key]) => !key.endsWith("#f#")) // challenge mode stage suffix
      .map(([key, value]) => [value.code, key])
  );

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(LUZARK_LP_SOLVER_URL);
  await Promise.all([
    page.waitForSelector(`#cell-${SANITY_VALUE_CELL_ID}`),
    page.waitForSelector(`#cell-${STAGE_INFO_CELL_ID}`),
  ]);

  const stagesOutputElement = await page.$(
    `#cell-${STAGE_INFO_CELL_ID} .output pre`
  );
  const stagesOutputText = await page.evaluate(
    (el) => el.innerText,
    stagesOutputElement
  );
  /** @type{string[]} */
  const efficientStageNames = stagesOutputText
    .split("\n")
    .map((line) => {
      const result = line.match(stageRegex);
      return result?.groups?.stageName ?? null;
    })
    .filter((item) => item != null)
    .map((stageName) => stageNameToKey[stageName]);

  const sanityValuesOutputElement = await page.$(
    `#cell-${SANITY_VALUE_CELL_ID} .output pre`
  );
  const sanityValuesOutputText = await page.evaluate(
    (el) => el.innerText,
    sanityValuesOutputElement
  );
  /** @type{{[itemName: string]: number}} */
  const itemSanityValues = Object.fromEntries(
    sanityValuesOutputText
      .split("\n")
      .map((line) => {
        const result = line.match(itemRegex);
        if (result && result.groups?.itemName && result.groups?.sanityValue) {
          return [
            result.groups.itemName,
            parseFloat(result.groups.sanityValue),
          ];
        }
        return [];
      })
      .filter((pair) => pair.length > 0)
  );
  await browser.close();

  return { efficientStageNames, itemSanityValues };
};

const fetchPenguinStatsStageData = async (itemIds, stageFilter) => {
  const PENGUIN_STATS_MATRIX_URL =
    "https://penguin-stats.io/PenguinStats/api/v2/result/matrix";
  const params = {
    itemFilter: itemIds.join(","),
    stageFilter: stageFilter?.length > 0 ? stageFilter.join(",") : undefined,
  };

  const response = await axios.get(PENGUIN_STATS_MATRIX_URL, { params });
  const { matrix } = response.data;

  /** @type{{[itemId: string]: { sanityCost: number, dropRate: number, stageId: string }}} */
  const itemStageMap = {};
  matrix
    .filter((cell) => enStageTable[cell.stageId] != null)
    .forEach((cell) => {
      const dropRate = cell.quantity / cell.times;
      const stageData = cnStageTable[cell.stageId];
      const sanityCost = stageData.apCost / dropRate;
      if (
        !Object.prototype.hasOwnProperty.call(itemStageMap, cell.itemId) ||
        itemStageMap[cell.itemId].sanityCost > sanityCost
      ) {
        itemStageMap[cell.itemId] = {
          sanityCost,
          dropRate,
          stageId: cell.stageId,
        };
      }
    });
  return itemStageMap;
};

const shouldAddStageRecommendation = (itemId) => {
  const entry = cnItems[itemId];
  return (
    itemId !== "30013" && // exclude Orirock Cluster; it should be crafted from cubes
    entry.itemType !== "CARD_EXP" && // exclude EXP
    entry.rarity < 3 && // exclude tier 4/5 items (rarity is 0-indexed)
    entry.stageDropList.length > 0
  );
};

const buildFarmingStage = (itemId, stageItem) => {
  const stageData = cnStageTable[stageItem.stageId];
  const itemName = getEnglishItemName(itemId);
  const dropRate =
    itemName.endsWith("Chip") || itemName.endsWith("Chip Pack")
      ? 0.5
      : Math.round((stageItem.dropRate + Number.EPSILON) * 100) / 100;
  const itemSanityCost =
    itemName.endsWith("Chip") || itemName.endsWith("Chip Pack")
      ? stageData.apCost * 2
      : Math.round((stageItem.sanityCost + Number.EPSILON) * 100) / 100;

  return {
    stageSanityCost: stageData.apCost,
    stageName: stageData.code,
    itemSanityCost,
    dropRate,
  };
};

const createItemsJson = async () => {
  const itemIds = Object.keys(cnItems).filter((itemId) =>
    isPlannerItem(itemId)
  );
  const baseItems = Object.fromEntries(
    itemIds.map((itemId) => {
      const item = cnItems[itemId];
      const baseOutputItem = {
        id: itemId,
        name: getEnglishItemName(itemId),
        iconId: item.iconId,
        tier: item.rarity + 1,
        sortId: item.sortId,
      };

      const workshopFormulaId = item.buildingProductList.find(
        ({ roomType }) => roomType === "WORKSHOP"
      )?.formulaId;
      const manufactureFormulaId = item.buildingProductList.find(
        ({ roomType }) => roomType === "MANUFACTURE"
      )?.formulaId;
      let formula = null;

      if (workshopFormulaId) {
        formula = workshopFormulas[workshopFormulaId];
      } else if (
        // a bit hacky, but we don't want to include yield: 1; ingredients: [] for EXP items
        manufactureFormulaId &&
        !manufactureFormulas[manufactureFormulaId].formulaType.endsWith("EXP")
      ) {
        formula = manufactureFormulas[manufactureFormulaId];
      }
      if (formula) {
        const ingredients = formula.costs.map(gameDataCostToIngredient);
        if (formula.goldCost != null && formula.goldCost > 0) {
          ingredients.unshift(convertLMDCostToLMDItem(formula.goldCost));
        }
        return [
          itemId,
          { ...baseOutputItem, ingredients, yield: formula.count },
        ];
      }
      return [itemId, baseOutputItem];
    })
  );

  const { efficientStageNames, itemSanityValues } =
    await fetchLuzarkLPSolverOutput();
  const [efficientStages, fastestStages] = await Promise.all([
    fetchPenguinStatsStageData(itemIds, efficientStageNames),
    fetchPenguinStatsStageData(itemIds),
  ]);

  const itemsJson = Object.fromEntries(
    Object.entries(baseItems).map(([itemId, item]) => {
      const stages = {};
      if (shouldAddStageRecommendation(itemId)) {
        if (fastestStages[itemId] != null) {
          stages.leastSanity = buildFarmingStage(itemId, fastestStages[itemId]);
        }

        if (efficientStages[itemId] != null) {
          const mostEfficientStage = buildFarmingStage(
            itemId,
            efficientStages[itemId]
          );
          if (
            stages.leastSanity != null &&
            mostEfficientStage.itemSanityCost <=
              stages.leastSanity.itemSanityCost *
                EFFICIENT_STAGE_MAX_ITEM_SANITY_COST_MULTIPLIER
          ) {
            stages.mostEfficient = mostEfficientStage;
            // if the least sanity stage and the most efficient stage are the same,
            // display the stage only once as "most efficient"
            if (
              stages.leastSanity.stageName === stages.mostEfficient.stageName
            ) {
              delete stages.leastSanity;
            }
          }
        }
      }
      return [
        itemId,
        {
          ...item,
          stages: Object.keys(stages).length > 0 ? stages : undefined,
          sanityValue: itemSanityValues[itemId],
        },
      ];
    })
  );

  const itemsJsonPath = path.join(DATA_OUTPUT_DIRECTORY, "items.json");
  fs.writeFileSync(itemsJsonPath, JSON.stringify(itemsJson, null, 2));
  console.log(`items: wrote ${itemsJsonPath}`);

  const itemNameToId = {
    ...Object.fromEntries(
      Object.entries(itemsJson).map(([id, item]) => [item.name, id])
    ),
    ...ADDITIONAL_ITEM_NAME_TO_ID_ENTRIES,
  };
  const itemNameToIdJsonPath = path.join(
    DATA_OUTPUT_DIRECTORY,
    "item-name-to-id.json"
  );
  fs.writeFileSync(itemNameToIdJsonPath, JSON.stringify(itemNameToId, null, 2));
  console.log(`items: wrote ${itemNameToIdJsonPath}`);
};

export default createItemsJson;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createItemsJson();
}
