import { EliteGoal, MasteryGoal, ModuleGoal, SkillLevelGoal } from "./goal";

export interface Operator {
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

export interface Skin {
  skinId: string;
  skinName: string | null;
  avatarId: string;
  sortId: number;
}

export interface OpJsonObj {
  id: string;
  name: string;
  cnName: string;
  rarity: number;
  class: string;
  isCnOnly: boolean;
  skills: OpJsonSkill[];
  modules: OpJsonModule[];
  potentials: string[];
  skillLevels: SkillLevelGoal[];
  elite: EliteGoal[];
}

export interface OpJsonSkill {
  skillId: string;
  iconId: string | null;
  skillName: string;
  masteries: MasteryGoal[];
}

export interface OpJsonModule {
  moduleName: string;
  moduleId: string;
  typeName: string;
  stages: ModuleGoal[];
  isCnOnly: boolean;
}

export interface LegacyOperator {
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
export function defaultOperatorObject([_, op]: [any, OpJsonObj]): [string, Operator] {
  return [
    op.id,
    {
      id: op.id,
      name: op.name,
      favorite: false,
      rarity: op.rarity,
      class: op.class,
      potential: 0,
      promotion: -1,
      owned: false,
      level: 0,
      skillLevel: 0,
      mastery: [],
      module: []
    },
  ];
}

// Generates a preset with the given index
export function defaultPresetObject(_: any, index: number): [string, Operator] {
  return [
    index.toString(),
    {
      id: index.toString(),
      name: `Untitled Preset ${index + 1}`,
      favorite: false,
      rarity: 6,
      class: "",
      potential: 0,
      promotion: -1,
      owned: false,
      level: 0,
      skillLevel: 0,
      mastery: [],
      module: []
    },
  ];
}
