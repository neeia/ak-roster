import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import enCharacterPatchTable from "./ArknightsGameData_YoStar/en_US/gamedata/excel/char_patch_table.json" assert { type: "json" };
import enCharacterTable from "./ArknightsGameData_YoStar/en_US/gamedata/excel/character_table.json" assert { type: "json" };
import enSkillTable from "./ArknightsGameData_YoStar/en_US/gamedata/excel/skill_table.json" assert { type: "json" };
import enUniequipTable from "./ArknightsGameData_YoStar/en_US/gamedata/excel/uniequip_table.json" assert { type: "json" };
import cnCharacterPatchTable from "./ArknightsGameData/zh_CN/gamedata/excel/char_patch_table.json" assert { type: "json" };
import cnCharacterTable from "./ArknightsGameData/zh_CN/gamedata/excel/character_table.json" assert { type: "json" };
import cnSkillTable from "./ArknightsGameData/zh_CN/gamedata/excel/skill_table.json" assert { type: "json" };
import cnUniequipTable from "./ArknightsGameData/zh_CN/gamedata/excel/uniequip_table.json" assert { type: "json" };
import createSkinsJson from "./skins.mjs";
import uploadAllImages from "./images.mjs";

const enPatchCharacters = enCharacterPatchTable.patchChars;
const cnPatchCharacters = cnCharacterPatchTable.patchChars;
const { equipDict: cnEquipDict, charEquip: cnCharEquip } = cnUniequipTable;
const { equipDict: enEquipDict } = enUniequipTable;

const isOperator = (charId) => {
  const operator = cnCharacterTable[charId];
  return (
    operator.profession !== "TOKEN" &&
    operator.profession !== "TRAP" &&
    !operator.isNotObtainable
  );
};

const operatorNameOverride = {
  ShiraYuki: "Shirayuki",
  Гум: "Gummy",
  Зима: "Zima",
  Истина: "Istina",
  Роса: "Rosa",
  Позёмка: "Pozëmka",
};
function getOperatorName(operatorId) {
  if (operatorId === "char_1001_amiya2") {
    return "Amiya (Guard)";
  }
  if (operatorId === "char_1037_amiya3") {
    return "Amiya (Medic)";
  }
  const entry = cnCharacterTable[operatorId];
  if (entry == null) {
    throw new Error(`No such operator: "${operatorId}"`);
  } else if (entry.isNotObtainable) {
    console.warn(`Operator is not obtainable: "${operatorId}"`);
  }
  const { appellation } = entry;
  return operatorNameOverride[appellation] ?? appellation;
};
function getCNOperatorName(operatorId) {
  if (operatorId === "char_1001_amiya2") {
    return "阿米娅(近卫)";
  }
  else if (operatorId === "char_1037_amiya3") {
    return "阿米娅(治疗)";
  }
  const entry = cnCharacterTable[operatorId];
  if (entry == null) {
    throw new Error(`No such operator: "${operatorId}"`);
  } else if (entry.isNotObtainable) {
    console.warn(`Operator is not obtainable: "${operatorId}"`);
  }
  const { name } = entry;
  return operatorNameOverride[name] ?? name;
};
function professionToClass(profession) {
  switch (profession) {
    case "PIONEER":
      return "Vanguard";
    case "WARRIOR":
      return "Guard";
    case "SPECIAL":
      return "Specialist";
    case "TANK":
      return "Defender";
    case "SUPPORT":
      return "Supporter";
    default:
      return [...profession.toLowerCase()]
        .map((char, i) => (i === 0 ? char.toUpperCase() : char))
        .join("")
  }
}

const convertLMDCostToLMDItem = (cost) => ({
  id: "4001",
  quantity: cost,
});

const getEliteLMDCost = (rarity, eliteLevel) => {
  let quantity = -1;
  if (rarity === 3) {
    quantity = 10000;
  } else if (rarity === 4) {
    quantity = eliteLevel === 2 ? 60000 : 15000;
  } else if (rarity === 5) {
    quantity = eliteLevel === 2 ? 120000 : 20000;
  } else if (rarity === 6) {
    quantity = eliteLevel === 2 ? 180000 : 30000;
  }
  return convertLMDCostToLMDItem(quantity);
};

const gameDataCostToIngredient = (cost) => {
  const { id, count } = cost;
  return {
    id,
    quantity: count,
  };
};

const gameDataRarityToNumber = (rarity) => {
  return isNaN(rarity) ? Number.parseInt(rarity.slice(-1)) : rarity + 1;
}

const OperatorGoalCategory = {
  Elite: 0,
  Mastery: 1,
  SkillLevel: 2,
  Module: 3,
};

const createOperatorsJson = () => {
  const operatorsJson = Object.fromEntries(
    [
      ...Object.entries(cnCharacterTable).filter(([opId]) => isOperator(opId)),
      ...Object.entries(cnPatchCharacters),
    ].map(([id, operator]) => {
      const rarity = gameDataRarityToNumber(operator.rarity);
      const isCnOnly = enCharacterTable[id] == null && enPatchCharacters[id] == null;
      const isPatchCharacter = cnPatchCharacters[id] != null;

      const elite = isPatchCharacter
        ? []
        : operator.phases
          .filter(({ evolveCost }) => evolveCost != null)
          .map(({ evolveCost }, i) => {
            const ingredients = evolveCost.map(gameDataCostToIngredient);
            ingredients.unshift(getEliteLMDCost(rarity, i + 1));
            // [0] points to E1, [1] points to E2, so add 1
            return {
              eliteLevel: i + 1,
              ingredients,
              name: `Elite ${i + 1}`,
              category: OperatorGoalCategory.Elite,
            };
          });
      const skillLevels = isPatchCharacter || !operator.allSkillLvlup
        ? []
        : operator.allSkillLvlup
          .filter(({ lvlUpCost }) => lvlUpCost != null)
          .map((skillLevelEntry, i) => {
            const cost = skillLevelEntry.lvlUpCost;
            const ingredients = cost.map(gameDataCostToIngredient);
            return {
              // we want to return the result of a skillup,
              // and since [0] points to skill level 1 -> 2, we add 2
              skillLevel: i + 2,
              ingredients,
              name: `Skill Level ${i + 2}`,
              category: OperatorGoalCategory.SkillLevel,
            };
          });

      const skills = operator.skills
        .filter(
          ({ skillId, levelUpCostCond }) =>
            skillId != null && levelUpCostCond &&
            // require that all mastery levels have a levelUpCost defined
            !levelUpCostCond.find(({ levelUpCost }) => levelUpCost == null)
        )
        .map(({ skillId, levelUpCostCond }, i) => {
          const masteries = levelUpCostCond.map(({ levelUpCost }, j) => {
            const ingredients = levelUpCost.map(gameDataCostToIngredient);
            return {
              masteryLevel: j + 1,
              ingredients,
              name: `Skill ${i + 1} Mastery ${j + 1}`,
              category: OperatorGoalCategory.Mastery,
            };
          });

          const skillTable = isCnOnly ? cnSkillTable : enSkillTable;
          return {
            skillId: skillId,
            iconId: skillTable[skillId].iconId,
            skillName: skillTable[skillId].levels[0].name,
            masteries,
          };
        });

      let modules = [];
      if (cnCharEquip[id] != null) {
        cnCharEquip[id].shift();
        modules = cnCharEquip[id].map((modName) => {
          const cnModuleData = cnEquipDict[modName];
          const enModuleData = enEquipDict[modName];
          const typeName =
            cnModuleData.typeName1 + "-" + cnModuleData.typeName2;
          const stages = [...Array(3)].map((_, modLevel) => {
            return {
              moduleLevel: modLevel + 1,
              ingredients: cnModuleData.itemCost[`${modLevel + 1}`].map(
                gameDataCostToIngredient
              ),
              name: `Module ${typeName} Stage ${modLevel + 1}`,
              category: OperatorGoalCategory.Module,
            };
          });
          return {
            moduleName: enModuleData?.uniEquipName ?? cnModuleData.uniEquipName,
            moduleId: cnModuleData.uniEquipId,
            typeName,
            stages,
            isCnOnly: enModuleData === undefined
          };
        });
      }

      const potentials = (enCharacterTable[id] ?? operator).potentialRanks.map(r => r.description);

      const outputOperator = {
        id,
        name: getOperatorName(id),
        cnName: getCNOperatorName(id),
        rarity,
        class: professionToClass(operator.profession),
        isCnOnly,
        skills,
        modules,
        potentials,
        skillLevels,
        elite
      };
      return [id, outputOperator];
    })
  );

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outDir = path.join(__dirname, "..", "src/data");
  const operatorsOutPath = path.join(outDir, "operators.json");
  fs.writeFileSync(operatorsOutPath, JSON.stringify(operatorsJson, null, 2));
  console.log(`operators: wrote ${operatorsOutPath}`);
};

export default createOperatorsJson;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createOperatorsJson();
  createSkinsJson();
  uploadAllImages();
}
