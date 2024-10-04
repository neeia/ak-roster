export type ApiServer = "en" | "jp" | "cn" | "kr";
export type YostarServer = "en" | "jp" | "kr";
export type ArknightsServer = "en" | "jp" | "kr" | "cn" | "bili" | "tw";
export type Distributor = "yostar" | "hypergryph" | "bilibili";
export const channelIds: { [distributor in Distributor]: string } = {
  hypergryph: "1",
  bilibili: "2",
  yostar: "3",
};

export const yostarPassportUrls: { [server in YostarServer]: string } = {
  en: "https://passport.arknights.global",
  jp: "https://passport.arknights.jp",
  kr: "https://passport.arknights.kr",
};

export const networkConfigUrls: { [server in ArknightsServer]: string } = {
  en: "https://ak-conf.arknights.global/config/prod/official/network_config",
  jp: "https://ak-conf.arknights.jp/config/prod/official/network_config",
  kr: "https://ak-conf.arknights.kr/config/prod/official/network_config",
  cn: "https://ak-conf.hypergryph.com/config/prod/official/network_config",
  bili: "https://ak-conf.hypergryph.com/config/prod/b/network_config",
  tw: "https://ak-conf.txwy.tw/config/prod/official/network_config",
};

export interface YostarAuthData {
  result: number;
  yostar_uid: string;
  yostar_token: string;
  yostar_account: string;
}

export interface YostarToken {
  result: number;
  uid: string;
  token: string;
}

export interface AccessToken {
  result: number;
  accessToken: string;
}

export interface U8Token {
  result: number;
  uid: string;
  token: string;
}

export interface LoginSecret {
  result: number;
  uid: string;
  secret: string;
}

export interface VersionInfo {
  resVersion: string;
  clientVersion: string;
}

export interface PlayerData {
  result: number;
  user: UserData;
}

export interface UserData {
  status: StatusData;
  troop: RosterData;
  social: SocialData;
  inventory: { [id: string]: number | undefined };
  tokenData: TokenData;
}

export interface TokenData {
  deviceId: string;
  token: YostarToken;
}

export interface StatusData {
  nickName: string;
  nickNumber: string;
  level: number;
  secretary: string;
  secretarySkinId: string;
}

export interface RosterData {
  chars: { [id: string]: CharachterData | undefined };
}

export interface CharachterData {
  //id for operator, based on the order of acquisition.
  instId: number;
  charId: string;
  potentialRank: number;
  mainSkillLvl: number;
  skin: string | null;
  level: number;
  //elite level
  evolvePhase: number;
  //can be -1? maybe for amiya?
  defaultSkillIndex: number;
  skills: SkillData[];
  currentEquip: string | null;
  equip: { [id: string]: ModuleData | undefined };
  starMark: number;
  //this is just for amiya
  currentTmpl: string;
  //more stuff just for amiya, to separate the two states
  tmpl: any;
}

export interface ModuleData {
  level: number;
  locked: number;
}

export interface SkillData {
  //seems to be in the format skchr_XXX_Y, with XXX being operator id/name, and Y the slot, from 1 to 3
  skillId: string;
  unlock: number;
  specializeLevel: number;
}

export interface SocialData {
  assistCharList: AssistantData[];
}

export interface AssistantData {
  //char Id
  charInstId: number | null;
  skillIndex: number | null;
  //equipped module
  currentEquip: string | null;
}
