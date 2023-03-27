export interface OperatorSkillSlot {
  opID: string;
  opSkill: number;
  opModule?: number;
}
export const opSkillSlotSchema = {
  type: "object",
  properties: {
    opID: { type: "string" },
    opSkll: { type: "number" },
    opModule: { type: "number" }
  },
  required: ["opID", "opSkill"],
  additionalProperties: false
}

export interface Team {
  name: string;
  ops: OperatorSkillSlot[];
}

const teamSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    ops: {
      type: "array",
      items: opSkillSlotSchema
    }
  },
  required: ["name", "ops"],
  additionalProperties: false
}

export interface FriendCode {
  username: string;
  tag?: string;
}

export interface AccountInfo {
  displayName?: string;
  friendCode?: FriendCode;
  server?: string;
  private?: boolean;
  supports?: (OperatorSkillSlot | undefined)[];
  assistant?: string;
  level?: number;
  onboard?: Date;
  // teams?: Team[];
}

export const profileSchema = {
  properties: {
    displayName: { type: "string" },
    friendCode: {
      type: "object",
      properties: {
        username: { type: "string" },
        tag: { type: "string" },
        required: ["username"],
        additionalProperties: false
      }
    },
    server: { type: "string" },
    assistant: { type: "string" },
    supports: {
      type: "array",
      items: opSkillSlotSchema
    },
    level: { type: "number" },
    onboard: { type: "date" },
    teams: {
      type: "array",
      items: teamSchema
    }
  },
  required: [],
  additionalProperties: false
}

export const servers = ["EN", "官服", "B服", "JP", "KR", "TW"];

export function isCN(server: string): boolean {
  return !["EN", "JP", "KR", "TW"].includes(server);
}