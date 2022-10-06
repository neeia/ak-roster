export interface AccountInfo {
  displayName?: string;
  friendCode?: FriendCode;
  server?: string;
  private?: boolean;
  support?: OperatorSkillSlot[];
  assistant?: string;
  level?: number;
  onboard?: Date;
  team?: Team[];
}

export interface Team {
  name: string;
  ops: OperatorSkillSlot[];
}

export interface OperatorSkillSlot {
  opID: string;
  opSkill: number;
}

export interface FriendCode {
  username: string;
  tag?: string;
}

export const servers = ["EN", "官服", "B服", "JP", "KR", "TW"];
