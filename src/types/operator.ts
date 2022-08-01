export interface Operator {
  id: string;
  name: string;
  favorite: boolean;
  rarity: number;
  potential: number;
  promotion: number;
  owned: boolean;
  level: number;
  skillLevel: number;
  mastery: number[];
  module: number[];
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
}

export interface OpJsonSkill {
  skillId: string;
  iconId: string | null;
  skillName: string;
}

export interface OpJsonModule {
  moduleName: string;
  moduleId: string;
  typeName: string;
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
      potential: 1,
      promotion: 0,
      owned: true,
      level: 1,
      skillLevel: 1,
      mastery: [],
      module: []
    },
  ];
}
