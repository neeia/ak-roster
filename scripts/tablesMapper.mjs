import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadJsonFile(primary, fallback, baseUrl = import.meta.url) {
  const callerFile = fileURLToPath(baseUrl);
  const callerDir = path.dirname(callerFile);

  const primaryPath = path.resolve(callerDir, primary);
  const fallbackPath = path.resolve(callerDir, fallback);

  const file = fs.existsSync(primaryPath) ? primaryPath : fallbackPath;
  const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
  return normalizeJson(raw);
};

//Normalize empty values to [] that krooster scripts use. Repos have different: Kengxxiao [], Assets {}
function normalizeJson(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeJson);
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      return [];
    }
    const normalized = {};
    for (const key of keys) {
      normalized[key] = normalizeJson(value[key]);
    }
    return normalized;
  }
  return value;
}

//mapping of all repository files
//optional fallback [primary, fallback]
const repositories = {
  //char_patch_table
  cnCharacterPatchTable: [
    "./ArknightsGameData/zh_CN/gamedata/excel/char_patch_table.json",
    ""
  ],
  enCharacterPatchTable: [
    "./ArknightsAssetsGamedata/en/gamedata/excel/char_patch_table.json",
    ""
  ],
  //character_table
  cnCharacterTable: [
    "./ArknightsGameData/zh_CN/gamedata/excel/character_table.json",
    ""
  ],
  enCharacterTable: [
    "./ArknightsAssetsGamedata/en/gamedata/excel/character_table.json",
    ""
  ],
  //skill_table
  cnSkillTable: [
    "./ArknightsGameData/zh_CN/gamedata/excel/skill_table.json",
    ""
  ],
  enSkillTable: [
    "./ArknightsAssetsGamedata/en/gamedata/excel/skill_table.json",
    ""
  ],
  //uniequip_table
  cnUniequipTable: [
    "./ArknightsGameData/zh_CN/gamedata/excel/uniequip_table.json",
    ""
  ],
  enUniequipTable: [
    "./ArknightsAssetsGamedata/en/gamedata/excel/uniequip_table.json",
    ""
  ],
  //gacha_table
  cnGachaTable: [
    "./ArknightsGameData/zh_CN/gamedata/excel/gacha_table.json",
    ""
  ],
  enGachaTable: [
    "./ArknightsAssetsGamedata/en/gamedata/excel/gacha_table.json",
    ""
  ],
  //stage_table
  cnStageTable: [
    "./ArknightsGameData/zh_CN/gamedata/excel/stage_table.json",
    ""
  ],
  enStageTable: [
    "./ArknightsAssetsGamedata/en/gamedata/excel/stage_table.json",
    ""
  ],
  //building_data
  cnBuildingData: [
    "./ArknightsGameData/zh_CN/gamedata/excel/building_data.json",
    ""
  ],
  enBuildingData: [
    "./ArknightsAssetsGamedata/en/gamedata/excel/building_data.json",
    ""
  ],
  //item_table
  cnItemTable: [
    "./ArknightsGameData/zh_CN/gamedata/excel/item_table.json",
    ""
  ],
  enItemTable: [
    "./ArknightsAssetsGamedata/en/gamedata/excel/item_table.json",
    ""
  ],
  cnSkinTable: [
    "./ArknightsGameData/zh_CN/gamedata/excel/skin_table.json",
    ""
  ],
  enSkinTable: [
    "./ArknightsAssetsGamedata/en/gamedata/excel/skin_table.json",
    ""
  ]
};

// --- auto-add all krooster ../src/data/*.json files ---
const dataDir = path.resolve(__dirname, "../src/data");
for (const file of fs.readdirSync(dataDir)) {
  if (file.endsWith(".json")) {
    const baseName = path.basename(file, ".json");
    const keyName = `${baseName}Json`; // e.g. recruitment.json -> recruitmentJson
    repositories[keyName] = [
      `../src/data/${file}`,
      "",
    ];
  }
}
/**
 * Load a repository table by name
 * @param {string} tableName - key in repositories mapping, name of table
 * @param {string} baseUrl - caller’s import.meta.url
 * @returns {object} parsed JSON
 */
export function loadRepositoryTable(tableName, baseUrl = import.meta.url) {
  if (!(tableName in repositories)) {
    throw new Error(
      `Invalid repository name "${tableName}". Must be mapped inside tablesMapper.mjs. Otherwise use one of: ${Object.keys(repositories).join(", ")}`
    );
  }
  const [primary, fallback] = repositories[tableName];
  return loadJsonFile(primary, fallback, baseUrl);
}