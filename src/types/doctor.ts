export interface AccountInfo {
  friendCode?: FriendCode;
  server?: string;
  public?: boolean;
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
