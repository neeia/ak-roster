import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import enCharacterPatchTable from "./ArknightsGameData_YoStar/en_US/gamedata/excel/char_patch_table.json" with { type: "json" };
import enCharacterTable from "./ArknightsGameData_YoStar/en_US/gamedata/excel/character_table.json" with { type: "json" };
import enSkillTable from "./ArknightsGameData_YoStar/en_US/gamedata/excel/skill_table.json" with { type: "json" };
import enUniequipTable from "./ArknightsGameData_YoStar/en_US/gamedata/excel/uniequip_table.json" with { type: "json" };
import cnCharacterPatchTable from "./ArknightsGameData/zh_CN/gamedata/excel/char_patch_table.json" with { type: "json" };
import cnCharacterTable from "./ArknightsGameData/zh_CN/gamedata/excel/character_table.json" with { type: "json" };
import cnSkillTable from "./ArknightsGameData/zh_CN/gamedata/excel/skill_table.json" with { type: "json" };
import cnUniequipTable from "./ArknightsGameData/zh_CN/gamedata/excel/uniequip_table.json" with { type: "json" };
import cnGachaTable from "./ArknightsGameData/zh_CN/gamedata/excel/gacha_table.json" with { type: "json" };

const enPatchCharacters = enCharacterPatchTable.patchChars;
const cnPatchCharacters = cnCharacterPatchTable.patchChars;
const { equipDict: cnEquipDict, charEquip: cnCharEquip } = cnUniequipTable;
const { equipDict: enEquipDict } = enUniequipTable;

const isOperator = (charId) => {
  const operator = cnCharacterTable[charId];
  return operator.profession !== "TOKEN" && operator.profession !== "TRAP" && !operator.isNotObtainable;
};

const operatorNameOverride = {
  ShiraYuki: "Shirayuki",
  Гум: "Gummy",
  Зима: "Zima",
  Истина: "Istina",
  Роса: "Rosa",
  Позёмка: "Pozëmka",
  Лето: "Leto",
};

const colabLimiteds = [
  //other
  "char_4019_ncdeer",
  "char_4067_lolxh",
  // R6 1
  "char_456_ash",
  "char_457_blitz",
  "char_458_rfrost",
  "char_459_tachaka",
  // MH
  "char_1029_yato2",
  "char_1030_noirc2",
  "char_4077_palico",
  // R6 2
  "char_4125_rdoc",
  "char_4123_ela",
  "char_4124_iana",
  "char_4126_fuze",
  // DM
  "char_4144_chilc",
  "char_4142_laios",
  "char_4141_marcil",
  "char_4143_sensi",
];

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
}
function getCNOperatorName(operatorId) {
  if (operatorId === "char_1001_amiya2") {
    return "阿米娅(近卫)";
  } else if (operatorId === "char_1037_amiya3") {
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
}
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
      return [...profession.toLowerCase()].map((char, i) => (i === 0 ? char.toUpperCase() : char)).join("");
  }
}

function subProfessionToBranch(subProfession) {
  switch (subProfession) {
    case "physician":
      return "Medic";
    case "fearless":
      return "Dreadnought";
    case "fastshot":
      return "Marksman";
    case "bombarder":
      return "Flinger";
    case "corecaster":
      return "Core";
    case "splashcaster":
      return "Splash";
    case "slower":
      return "Decel Binder";
    case "funnel":
      return "Mech-Accord";
    case "aoesniper":
      return "Artilleryman";
    case "reaperrange":
      return "Spreadshooter"
    case "longrange":
      return "Deadeye";
    case "closerange":
      return "Heavyshooter";
    case "siegesniper":
      return "Besieger";
    case "bearer":
      return "Standard Bearer";
    case "artsfghter":
      return "Arts Fighter";
    case "sword":
      return "Swordmaster";
    case "musha":
      return "Soloblade";
    case "artsprotector":
      return "Arts Protector";
    case "blastcaster":
      return "Blast";
    case "blessing":
      return "Abjurer";
    case "chainhealer":
      return "Chain Medic";
    case "chain":
      return "Chain Caster";
    case "craftsman":
      return "Artificer";
    case "hammer":
      return "Earthshaker";
    case "healer":
      return "Therapist";
    case "incantationmedic":
      return "Incantation";
    case "primcaster":
      return "Primal";
    case "ringhealer":
      return "Multi-target";
    case "shotprotector":
      return "Sentry Protector";
    case "stalker":
      return "Ambusher";
    case "traper":
      return "Trapmaster";
    case "underminer":
      return "Hexer";
    case "unyield":
      return "Juggernaut";
    case "wandermedic":
      return "Wandering";
    case "soulcaster":
      return "Shaper";
    case "skywalker":
      return "Skyranger";
    case "primprotector":
      return "Primal Protector";
    default:
      return [...subProfession.toLowerCase()].map((char, i) => (i === 0 ? char.toUpperCase() : char)).join("");
    //Executor, Bard, Protector, Ritualist, Pioneer, Charger, Centurion
    //Guardian, Mystic, Loopshooter, Tactician, Instructor, Crusher
    //Lord, Dollkeeper, Duelist (defender), Fighter, Fortress, Geek
    //Hookmaster, Liberator, Merchant, Phalanx, Pusher, Reaper, Summoner
    //
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
};

const OperatorGoalCategory = {
  Elite: 0,
  Mastery: 1,
  SkillLevel: 2,
  Module: 3,
};

const amiyaSkillLevel = [
  {
    skillLevel: 2,
    ingredients: [
      {
        id: "3301",
        quantity: 4,
      },
    ],
    name: "Skill Level 2",
    category: 2,
  },
  {
    skillLevel: 3,
    ingredients: [
      {
        id: "3301",
        quantity: 4,
      },
      {
        id: "30061",
        quantity: 4,
      },
    ],
    name: "Skill Level 3",
    category: 2,
  },
  {
    skillLevel: 4,
    ingredients: [
      {
        id: "3302",
        quantity: 6,
      },
      {
        id: "30012",
        quantity: 4,
      },
    ],
    name: "Skill Level 4",
    category: 2,
  },
  {
    skillLevel: 5,
    ingredients: [
      {
        id: "3302",
        quantity: 6,
      },
      {
        id: "30022",
        quantity: 5,
      },
    ],
    name: "Skill Level 5",
    category: 2,
  },
  {
    skillLevel: 6,
    ingredients: [
      {
        id: "3302",
        quantity: 6,
      },
      {
        id: "30053",
        quantity: 4,
      },
    ],
    name: "Skill Level 6",
    category: 2,
  },
  {
    skillLevel: 7,
    ingredients: [
      {
        id: "3303",
        quantity: 6,
      },
      {
        id: "30063",
        quantity: 2,
      },
      {
        id: "30023",
        quantity: 3,
      },
    ],
    name: "Skill Level 7",
    category: 2,
  },
];

const amiyaEliteLevel = [
  {
    eliteLevel: 1,
    ingredients: [
      {
        id: "4001",
        quantity: 20000,
      },
      {
        id: "3251",
        quantity: 3,
      },
      {
        id: "30062",
        quantity: 4,
      },
      {
        id: "30042",
        quantity: 4,
      },
    ],
    name: "Elite 1",
    category: 0,
  },
  {
    eliteLevel: 2,
    ingredients: [
      {
        id: "4001",
        quantity: 120000,
      },
      {
        id: "3253",
        quantity: 3,
      },
      {
        id: "30014",
        quantity: 10,
      },
      {
        id: "30073",
        quantity: 10,
      },
    ],
    name: "Elite 2",
    category: 0,
  },
];

const getPools = (operatorId) => {
  const id = operatorId;
  const isKernel = (enCharacterTable[id]?.classicPotentialItemId ?? null) !== null;
  const isCnKernel = (cnCharacterTable[id]?.classicPotentialItemId ?? null) !== null;

  const isFree = ["char_1001_amiya2", "char_1037_amiya3"].includes(id) || //amiya (guard/medic)
    cnCharacterTable[id]?.itemObtainApproach &&
    (cnCharacterTable[id].itemObtainApproach.includes("主题曲剧情")     //story
      || cnCharacterTable[id].itemObtainApproach.includes("获得")       //reward - (events or IS)
      || cnCharacterTable[id].itemObtainApproach.includes("交易所")     //exchanges - reds/credit
      || cnCharacterTable[id].itemObtainApproach.includes("周年奖励")   //anniversary reward
    );

  const isLimited = colabLimiteds.includes(id) ||
    Object.values(cnGachaTable["gachaPoolClient"]).some((b) =>
      b.limitParam?.limitedCharId && b.limitParam.limitedCharId.includes(id));

  const isStandard = !isKernel && !isLimited && !isFree;

  const pools = [];
  if (isKernel) pools.push("Kernel");
  if (isCnKernel) pools.push("Kernel CN");
  if (isLimited) pools.push("Limited");
  if (isFree) pools.push("Free");
  if (isStandard) pools.push("Standard");

  return pools;
}

const createOperatorsJson = () => {
  const operatorsJson = Object.fromEntries(
    [
      ...Object.entries(cnCharacterTable).filter(([opId]) => isOperator(opId)),
      ...Object.entries(cnPatchCharacters),
    ].map(([id, operator]) => {
      const rarity = gameDataRarityToNumber(operator.rarity);
      const isCnOnly = enCharacterTable[id] == null && enPatchCharacters[id] == null;
      const isPatchCharacter = cnPatchCharacters[id] != null;

      const eliteLevels = isPatchCharacter
        ? amiyaEliteLevel
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
      const skillLevels = isPatchCharacter
        ? amiyaSkillLevel
        : !operator.allSkillLvlup
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

      const skillData = operator.skills
        .filter(
          ({ skillId, levelUpCostCond }) =>
            skillId != null &&
            levelUpCostCond &&
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

      let moduleData = [];
      if (cnCharEquip[id] != null) {
        cnCharEquip[id].shift();
        moduleData = cnCharEquip[id].map((modName) => {
          const cnModuleData = cnEquipDict[modName];
          const enModuleData = enEquipDict[modName];
          const typeName = cnModuleData.typeName1 + "-" + cnModuleData.typeName2;
          const stages = [...Array(3)].map((_, modLevel) => {
            return {
              moduleLevel: modLevel + 1,
              ingredients: cnModuleData.itemCost[`${modLevel + 1}`].map(gameDataCostToIngredient),
              name: `Module ${typeName} Stage ${modLevel + 1}`,
              category: OperatorGoalCategory.Module,
            };
          });
          return {
            moduleName: enModuleData?.uniEquipName ?? cnModuleData.uniEquipName,
            moduleId: cnModuleData.uniEquipId,
            typeName,
            stages,
            isCnOnly: enModuleData === undefined,
          };
        });
      }

      const potentials = (enCharacterTable[id] ?? operator).potentialRanks.map((r) => r.description);

      const outputOperator = {
        id,
        name: getOperatorName(id),
        cnName: getCNOperatorName(id),
        rarity,
        class: professionToClass(operator.profession),
        branch: subProfessionToBranch(operator.subProfessionId),
        isCnOnly,
        pools: getPools(id),
        skillData,
        moduleData,
        potentials,
        skillLevels,
        eliteLevels,
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
}
