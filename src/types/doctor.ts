export interface AccountInfo {
  displayName?: string;
  friendCode?: FriendCode;
  server?: string;
  private?: boolean;
  support?: OperatorSkillSlot[];
  assistant?: string;
  level?: number;
  onboard?: Date;
}

export interface OperatorSkillSlot {
  opID: string;
  opSkill: number;
}

export interface FriendCode {
  username: string;
  tag?: string;
}

export const servers = ["EN", "CN", "JP", "KR", "TW"];
