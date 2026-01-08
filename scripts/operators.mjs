import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadRepositoryTable } from "./tablesMapper.mjs";

const enCharacterPatchTable = loadRepositoryTable("enCharacterPatchTable");
const enCharacterTable = loadRepositoryTable("enCharacterTable");
const enSkillTable = loadRepositoryTable("enSkillTable");
const enUniequipTable = loadRepositoryTable("enUniequipTable");
const cnCharacterPatchTable = loadRepositoryTable("cnCharacterPatchTable");
const cnCharacterTable = loadRepositoryTable("cnCharacterTable");
const cnSkillTable = loadRepositoryTable("cnSkillTable");
const cnUniequipTable = loadRepositoryTable("cnUniequipTable");
const cnGachaTable = loadRepositoryTable("cnGachaTable");
const cnStageTable = loadRepositoryTable("cnStageTable");
const enHandbookTeamTable = loadRepositoryTable("enHandbookTeamTable");
const cnHandbookTeamTable = loadRepositoryTable("cnHandbookTeamTable");

const recruitJson = loadRepositoryTable("recruitmentJson");

const enPatchCharacters = enCharacterPatchTable.patchChars;
const cnPatchCharacters = cnCharacterPatchTable.patchChars;
const { equipDict: cnEquipDict, charEquip: cnCharEquip, subProfDict: cnSubProfDict } = cnUniequipTable;
const { equipDict: enEquipDict, subProfDict: enSubProfDict } = enUniequipTable;
const { gachaPoolClient: cnGachaPoolClient } = cnGachaTable;
const { stages: cnStages } = cnStageTable;

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
  Веточки: "Vetochki",
  Снегурочка: "Snegurochka",
};

//exclusions/inclusions, can't find how to detect in files.
const colabLimiteds = [
  //other
  "char_4019_ncdeer",
  "char_4067_lolxh",
  // MH
  "char_1029_yato2",
  "char_1030_noirc2",
  "char_4077_palico",
  //other can be auto detected by faction isRaw
  /*  // R6 1
    "char_456_ash",
    "char_457_blitz",
    "char_458_rfrost",
    "char_459_tachak",
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
    //BDAM
    "char_4182_oblvns",
    "char_4183_mortis",
    "char_4184_dolris",
    "char_4185_amoris",  
    "char_4186_tmoris", */
];
const freePoolInclude = [
  "char_1001_amiya2",
  "char_1037_amiya3",
  //pin-board - texas
  "char_102_texas",
  //2 recruitment-vouchers indra+vulcan
  "char_163_hpsts",
  "char_155_tiger",
];
const standardPoolExclude = [
  "char_1001_amiya2",
  "char_1037_amiya3",
  //recruitment only
  "char_211_adnach",
  "char_385_finlpp",
  "char_127_estell",
  "char_163_hpsts",
  "char_155_tiger",
]

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

function subProfessionToBranch(subProfession, className) {
  const subProffesionName =
    enSubProfDict[subProfession]?.subProfessionName
      ? `${enSubProfDict[subProfession]?.subProfessionName}`.replace(className, "").trim() != ""
        ? `${enSubProfDict[subProfession]?.subProfessionName}`.replace(className, "").trim()
        : enSubProfDict[subProfession]?.subProfessionName
      : [[...subProfession.toLowerCase()].map((char, i) => (i === 0 ? char.toUpperCase() : char)).join(""),
      cnSubProfDict[subProfession]?.subProfessionName ?? ""]
        .filter(Boolean).join(" - ");
  return { id: subProfession, name: subProffesionName };
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

const MAX_PROMOTION_BY_RARITY = [0, 0, 0, 1, 2, 2, 2];
const getEmptyElite = (eliteLevel) => {
  return {
    eliteLevel: Number(eliteLevel),
    ingredients: [],
    name: `Elite ${eliteLevel}`,
    category: OperatorGoalCategory.Elite,
  };
};

const getPools = (operatorId, rarity, factions) => {
  const id = operatorId;
  const isKernel = (enCharacterTable[id]?.classicPotentialItemId ?? null) !== null;
  const isCnKernel = (cnCharacterTable[id]?.classicPotentialItemId ?? null) !== null;

  let isFree =
    //itemObtainApproach - descripton based cases
    cnCharacterTable[id]?.itemObtainApproach &&
    (cnCharacterTable[id].itemObtainApproach.includes("主题曲剧情")     //story
      || cnCharacterTable[id].itemObtainApproach.includes("获得")       //reward - (events or IS)
      || cnCharacterTable[id].itemObtainApproach.includes("交易所")     //exchanges - reds/credit
      || cnCharacterTable[id].itemObtainApproach.includes("周年奖励")   //anniversary reward
    );
  const isLimited = factions.some((id) => cnHandbookTeamTable[id]?.isRaw)
    || colabLimiteds.includes(id)
    || Object.values(cnGachaPoolClient).some((b) =>
      b.limitParam?.limitedCharId && b.limitParam.limitedCharId.includes(id));

  //not exact detection (find better way later)
  const isStandard = rarity > 2 //exclude non-gacha 1-2
    //exclude pools
    && !isKernel && !isLimited && !isFree
    //exclude standardPoolExclude
    && !standardPoolExclude.includes(id)
    //include 3-4 rarity if not in standardPoolExclude
    || ((rarity === 3 || rarity === 4) && !standardPoolExclude.includes(id) && !isFree);

  //isFree addon: story stages reward, gacha characters
  isFree = isFree || freePoolInclude.includes(id)
    || Object.values(cnStages).some((s) =>
      s.stageType === "MAIN"
      && s.stageDropInfo?.displayRewards
      && s.stageDropInfo.displayRewards.some((r) => r.id && r.id === id))

  const isRecruit = Object.values(recruitJson).some((t) =>
    t.operators?.some((op) => op.id === id));

  const pools = [];
  if (isKernel) pools.push("Kernel");
  if (isCnKernel) pools.push("Kernel CN");
  if (isLimited) pools.push("Limited");
  if (isFree) pools.push("Free");
  if (isStandard) pools.push("Standard");
  if (isRecruit) pools.push("Recruitment");

  return pools;
}

export const getFactions = (operator) => {
  const result = {
    main: new Set(),
    sub: new Set()
  };

  const addFaction = (id, type = "main") => {
    if (!id || result.main.has(id) || result.sub.has(id)) return;
    result[`${type}`].add(id);
  };

  //first power (prioritize team > group > nation)
  const defaultId = operator.teamId || operator.groupId || operator.nationId;
  addFaction(defaultId);

  //second from operator + mainPower
  const mainSources = [operator, operator.mainPower];
  for (const src of mainSources) {
    if (!src) continue;
    for (const key of ["teamId", "groupId", "nationId"]) {
      const val = src[key];
      if (val && val !== defaultId) addFaction(val);
    }
  }

  //last from subPower array
  if (Array.isArray(operator.subPower)) {
    for (const sub of operator.subPower) {
      for (const key of ["teamId", "groupId", "nationId"]) {
        const val = sub?.[key];
        if (val) addFaction(val, "sub");
      }
    }
  }
  return result;
};

const createFactionsJson = () => {
  const factionsJson = Object.fromEntries(
    Object.entries(cnHandbookTeamTable).map(([id, power]) => {

      let powerName = (enHandbookTeamTable[id]) ? enHandbookTeamTable[id].powerName : power.powerCode;
      let powerCode = power.powerCode;
      //swap based on length, longer is title
      if (String(powerName).length < String(powerCode).length) {
        [powerCode, powerName] = [powerName, powerCode];
      }

      const outputPower = {
        powerName,
        powerCode,
        powerLevel: power.powerLevel,
        isRaw: power.isRaw,
        sortId: power.orderNum,
      };
      return [id, outputPower];
    }));

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outDir = path.join(__dirname, "..", "src/data");
  const operatorsOutPath = path.join(outDir, "factions.json");
  fs.writeFileSync(operatorsOutPath, JSON.stringify(factionsJson, null, 2));
  console.log(`operator factions: wrote ${operatorsOutPath}`);
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
      //fix elite with task ops like radian
      if (eliteLevels.length === 0 && MAX_PROMOTION_BY_RARITY[rarity] > 0) {
        for (let i = 1; i <= MAX_PROMOTION_BY_RARITY[rarity]; i++) {
          eliteLevels.push(getEmptyElite(i));
        };
      };

      const skillLevels = isPatchCharacter
        ? amiyaSkillLevel
        : !operator.allSkillLvlup
          ? []
          : operator.allSkillLvlup
            .filter(({ lvlUpCost, unlockCond }) => lvlUpCost != null || unlockCond)
            .map((skillLevelEntry, i) => {
              const cost = skillLevelEntry.lvlUpCost;
              const ingredients = cost ? cost.map(gameDataCostToIngredient) : [];
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
            !levelUpCostCond.find(({ levelUpCost, unlockCond }) => levelUpCost == null && !unlockCond)
        )
        .map(({ skillId, levelUpCostCond }, i) => {
          const masteries = levelUpCostCond.map(({ levelUpCost }, j) => {
            const ingredients = levelUpCost ? levelUpCost.map(gameDataCostToIngredient) : [];
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
            iconId: skillTable[skillId].iconId ?? null,
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
      const className = professionToClass(operator.profession);

      const factions = getFactions(enCharacterTable[id] ?? operator);

      const outputOperator = {
        id,
        name: getOperatorName(id),
        cnName: getCNOperatorName(id),
        rarity,
        class: className,
        branch: subProfessionToBranch(operator.subProfessionId, className),
        isCnOnly,
        factions: [...factions.main],
        ...(factions.sub.size > 0 && { factionsHidden: [...factions.sub] }),
        pools: getPools(id, rarity, [...factions.main, ...factions.sub]),
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
  createFactionsJson();
  createOperatorsJson();
}
