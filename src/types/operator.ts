import { EliteGoal, MasteryGoal, ModuleGoal, SkillLevelGoal } from "./goal";

export interface Operator {
  id: string;
  favorite: boolean;
  potential: number;
  elite: number;
  level: number;
  rank: number;
  masteries: number[];
  modules: number[];
  skin?: string;
}

const opSchema = {
  id: { type: "string" },
  favorite: { type: "boolean" },
  potential: { type: "number" },
  elite: { type: "number" },
  level: { type: "number" },
  rank: { type: "number" },
  masteries: {
    type: "array",
    items: {
      type: "number"
    }
  },
  modules: {
    type: "array",
    items: {
      type: "number"
    }
  },
  skin: { type: "boolean" },
}

export const operatorSchema = {
  properties: opSchema,
  required: ["id", "favorite", "potential", "elite", "level", "rank", "masteries", "modules"],
  additionalProperties: false
}

export interface Skin {
  skinId: string;
  skinName: string | null;
  avatarId: string;
  sortId: number;
}

export interface OperatorData {
  id: string;
  name: string;
  cnName: string;
  rarity: number;
  class: string;
  isCnOnly: boolean;
  skills: SkillData[];
  modules: ModuleData[];
  potentials: string[];
  skillLevels: SkillLevelGoal[];
  elite: EliteGoal[];
}

export interface SkillData {
  skillId: string;
  iconId: string | null;
  skillName: string;
  masteries: MasteryGoal[];
}

export interface ModuleData {
  moduleName: string;
  moduleId: string;
  typeName: string;
  stages: ModuleGoal[];
  isCnOnly: boolean;
}

export interface OperatorV2 {
  id: string;
  name: string;
  favorite: boolean;
  rarity: number;
  class: string;
  potential: number;
  elite: number;
  owned: boolean;
  level: number;
  rank: number;
  mastery: number[];
  module: number[];
  skin?: string;
}

export interface OperatorV1 {
  id: string;
  name: string;
  favorite: boolean;
  rarity: number;
  potential: number;
  promotion: number;
  owned: boolean;
  level: number;
  skillLevel: number;
  skill1Mastery?: number;
  skill2Mastery?: number;
  skill3Mastery?: number;
  module?: number[];
}

// Converts an opJson entry into an Operator
export function defaultOperatorObject([_, op]: [any, OperatorData]): [string, Operator] {
  return [
    op.id,
    {
      id: op.id,
      favorite: false,
      potential: 0,
      elite: -1,
      level: 0,
      rank: 0,
      masteries: [],
      modules: []
    },
  ];
}

export interface Preset extends Operator {
  name: string;
}

// Generates a preset with the given index
export function defaultPresetObject(_: any, index: number): [string, Preset] {
  return [
    index.toString(),
    {
      id: index.toString(),
      name: `Untitled Preset ${index + 1}`,
      favorite: false,
      potential: 0,
      elite: -1,
      level: 0,
      rank: 0,
      masteries: [],
      modules: []
    },
  ];
}
