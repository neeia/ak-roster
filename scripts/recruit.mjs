import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { Combination } from "js-combinatorics";

import characterTable from "./ArknightsGameData_YoStar/en_US/gamedata/excel/character_table.json" assert { type: "json" };
import gachaTable from "./ArknightsGameData_YoStar/en_US/gamedata/excel/gacha_table.json" assert { type: "json" };

export function professionToClass(profession) {
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
      return toTitleCase(profession);
  }
}

export function toTitleCase(string) {
  return [...string.toLowerCase()]
    .map((char, i) => (i === 0 ? char.toUpperCase() : char))
    .join("");
}

/**
 * Unfortunately Justice Knight is missing the single quotes in the list of recruitable operators,
 * so we'll have to manually map the name to char id
 */
const recruitableNameToIdOverride = {
  "Justice Knight": "char_4000_jnight",
};

const nameOverrides = {
  "THRM-EX": "Thermal-EX",
  "Justice Knight": "'Justice Knight'",
};

const RECRUITMENT_TAGS = [
  "Top Operator",
  "Senior Operator",
  "Starter",
  "Robot",
  "Melee",
  "Ranged",
  "Caster",
  "Defender",
  "Guard",
  "Medic",
  "Sniper",
  "Specialist",
  "Supporter",
  "Vanguard",
  "AoE",
  "Crowd-Control",
  "DP-Recovery",
  "DPS",
  "Debuff",
  "Defense",
  "Fast-Redeploy",
  "Healing",
  "Nuker",
  "Shift",
  "Slow",
  "Summon",
  "Support",
  "Survival",
];

const { recruitDetail } = gachaTable;

const createRecruitmentJson = () => {
  const operatorNameToId = Object.fromEntries(
    Object.entries(characterTable).filter(([id]) => !id.startsWith("trap")).map(([id, opData]) => [opData.name, id])
  );

  const recruitmentStrings = recruitDetail
    .split(/★+/)
    .slice(1);
  const recruitableOperators = recruitmentStrings.map((line) =>
    line
      .replace(/\n|-{2,}/g, "")
      .split(/(?:\s\/\s)|(?:<@rc\.eml>([^/]+)<\/>)/)
      .filter((item) => !!item && item.trim())
  );

  const recruitment = recruitableOperators.flatMap((opNames, r) =>
    opNames
      .filter((name) => !!name)
      .map((opName) => {
        const rarity = r + 1;
        const opId =
          recruitableNameToIdOverride[opName] ?? operatorNameToId[opName];
        const opData = characterTable[opId];
        const tags = [
          ...(opData.tagList ?? []),
          toTitleCase(opData.position),
          professionToClass(opData.profession),
        ];
        if (rarity === 1) {
          tags.push("Robot");
        } else if (rarity === 6) {
          tags.push("Top Operator");
        }
        if (rarity >= 5) {
          tags.push("Senior Operator");
        }
        return {
          id: opId,
          name: nameOverrides[opName] ?? opName,
          rarity,
          tags,
        };
      })
  );

  const tagSets = Array(3)
    .fill(0)
    .flatMap((_, i) => [...new Combination(RECRUITMENT_TAGS, i + 1)]);
  const recruitmentResults = Object.fromEntries(
    tagSets
      .map((tagSet) => ({
        tags: tagSet.sort(),
        operators: recruitment
          .filter((recruitable) =>
            tagSet.every(
              (tag) =>
                recruitable.tags.includes(tag) &&
                (recruitable.rarity < 6 || tagSet.includes("Top Operator"))
            )
          )
          .sort((op1, op2) => op2.rarity - op1.rarity),
      }))
      .filter((recruitData) => recruitData.operators.length > 0)
      .map((result) => {
        // for guaranteed tags, we only care about 1*, 4*, 5*, and 6*.
        // we include 1* if
        // - the otherwise highest rarity is 5 (1* and 5* can't coexist), or
        // - the Robot tag is available
        const lowestRarity = Math.min(
          ...result.operators
            .map((op) => op.rarity)
            .filter((rarity) => rarity > 1)
        );
        if (lowestRarity > 1 && lowestRarity < 4) {
          return [
            result.tags,
            {
              ...result,
              guarantees: [],
            },
          ];
        }

        const guarantees = Number.isFinite(lowestRarity) ? [lowestRarity] : [];
        if (
          (result.operators.find((op) => op.rarity === 1) &&
            lowestRarity >= 5) ||
          result.tags.includes("Robot")
        ) {
          guarantees.push(1);
        }
        return [
          result.tags.sort((a, b) => a.localeCompare(b)),
          {
            ...result,
            guarantees,
          },
        ];
      })
  );
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outDir = path.join(__dirname, "..", "src/data");
  const outPath = path.join(outDir, "recruitment.json");
  fs.writeFileSync(outPath, JSON.stringify(recruitmentResults, null, 2));
  console.log(`recruitment: wrote ${outPath}`);
};

export default createRecruitmentJson;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createRecruitmentJson();
}