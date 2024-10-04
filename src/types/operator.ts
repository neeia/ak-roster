import { EliteGoal, MasteryGoal, ModuleGoal, SkillLevelGoal } from "./goal";

export interface Operator {
  op_id: string;
  favorite: boolean;
  potential: number;
  elite: number;
  level: number;
  skill_level: number;
  masteries?: number[];
  modules?: Record<string, number>;
  skin?: string;
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
  skillData?: SkillData[];
  moduleData?: ModuleData[];
  potentials: string[];
  skillLevels: SkillLevelGoal[];
  eliteLevels: EliteGoal[];
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
  promotion: number;
  owned: boolean;
  level: number;
  skillLevel: number;
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

export interface Preset {
  id: number;
  name: string;
  favorite: boolean;
  potential: number;
  elite: number;
  level: number;
  rank: number;
  masteries: number[];
}

// Generates a preset with the given index
export function defaultPresetObject(_: any, index: number): [string, Preset] {
  return [
    index.toString(),
    {
      id: index,
      name: `Untitled Preset ${index + 1}`,
      favorite: false,
      potential: 0,
      elite: -1,
      level: 0,
      rank: 0,
      masteries: [],
    },
  ];
}

export type OpInfo = Operator & OperatorData;
