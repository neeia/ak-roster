import { EliteGoal, MasteryGoal, ModuleGoal, SkillLevelGoal } from "../goal";
import { Database } from "../supabase";

type Table = Database["public"]["Tables"]["operators"];

export interface Operator {
  elite: number;
  favorite: boolean;
  level: number;
  masteries: number[];
  modules: Record<string, number>;
  op_id: string;
  potential: number;
  skill_level: number;
  skin: string | null;
};

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
  branch: string;
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

export type OpInfo = Operator & OperatorData;
