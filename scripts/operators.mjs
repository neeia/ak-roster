import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import enCharacterPatchTable from "./ArknightsGameData/en_US/gamedata/excel/char_patch_table.json" assert { type: "json" };
import enCharacterTable from "./ArknightsGameData/en_US/gamedata/excel/character_table.json" assert { type: "json" };
import enSkillTable from "./ArknightsGameData/en_US/gamedata/excel/skill_table.json" assert { type: "json" };
import enUniequipTable from "./ArknightsGameData/en_US/gamedata/excel/uniequip_table.json" assert { type: "json" };
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

const createOperatorsJson = () => {
  const operatorsJson = Object.fromEntries(
    [
      ...Object.entries(cnCharacterTable).filter(([opId]) => isOperator(opId)),
      ...Object.entries(cnPatchCharacters),
    ].map(([id, operator]) => {
      const rarity = operator.rarity + 1;
      const isCnOnly = enCharacterTable[id] == null && enPatchCharacters[id] == null;

      const skills = operator.skills
        .filter(
          ({ skillId }) => skillId != null
        )
        .map(({ skillId } ) => {
          const skillTable = isCnOnly ? cnSkillTable : enSkillTable;
          return {
            skillId: skillId,
            iconId: skillTable[skillId].iconId,
            skillName: skillTable[skillId].levels[0].name,
          };
        });

      let modules = [];
      if (cnCharEquip[id] != null) {
        cnCharEquip[id].shift();
        modules = cnCharEquip[id].map((modName) => {
          const cnModuleData = cnEquipDict[modName];
          const enModuleData = enEquipDict[modName];
          return {
            moduleName: enModuleData?.uniEquipName ?? cnModuleData.uniEquipName,
            moduleId: cnModuleData.uniEquipId,
            typeName: cnModuleData.typeName1 + '-' + cnModuleData.typeName2,
            isCnOnly: enModuleData === undefined
          }
        })
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
        potentials
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
