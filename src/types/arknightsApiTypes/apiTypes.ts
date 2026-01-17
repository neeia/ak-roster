export type ApiServer = "en" | "jp" | "cn" | "kr";
export type YostarServer = "en" | "jp" | "kr";
export type ArknightsServer = "en" | "jp" | "kr" | "cn" | "bili" | "tw";
export type Distributor = "yostar" | "hypergryph" | "bilibili";
export const channelIds: { [distributor in Distributor]: string } = {
  hypergryph: "1",
  bilibili: "2",
  yostar: "3",
};

export const yostarDomains: Record<YostarServer, string> = {
  en: "https://en-sdk-api.yostarplat.com",
  jp: "https://jp-sdk-api.yostarplat.com",
  kr: "https://jp-sdk-api.yostarplat.com",
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
  dungeon: unknown;
  activity: unknown;
  status: StatusData;
  troop: RosterData;
  social: SocialData;
  inventory: { [id: string]: number | undefined };
  tokenData: TokenData;
  npcAudio: unknown;
  pushFlags: {
    hasGifts: number;
    hasFriendRequest: number;
    hasClues: number;
    hasFreeLevelGP: number;
    status: number;
  };
  equipment: {
    missions: Record<string, { value: number; target: number }>;
  };
  skin: {
    // Record<skin_id, 1> - as far as I can tell, the number is always 1.
    characterSkins: Record<string, number>;
    // Record<skin_id, number> - epoch timestamp
    skinTs: Record<string, number>;
  };
  shop: Record<string, unknown>;
  mission: {
    missions: unknown;
    missionRewards: unknown;
    missionGroups: unknown;
  };
  building: {
    rooms: {
      TRAINING?: {
        [key: string]: {
          trainee: {
            charInstId: number;
            targetSkill: number;
            state: number;
          };
        };
      };
    };
  };
  dexNav: {
    character?: Record<string, { charInstId: number; count: number; classicCount?: number }>;
    formula: unknown;
    enemy: unknown;
    teamV2: unknown;
  };
  crisis: unknown;
  crisisV2: unknown;
  medal: unknown;
  nameCardStyle: unknown;
  tshop: unknown;
  gacha: unknown;
  backflow: unknown;
  mainline: unknown;
  avatar: unknown;
  background: unknown;
  homeTheme: unknown;
  rlv2: unknown;
  deepSea: unknown;
  tower: unknown;
  siracusaMap: unknown;
  sandboxPerm: unknown;
  openServer: unknown;
  trainingGround: unknown;
  storyreview: unknown;
  recruit: {
    normal: {
      slots: Record<
        "0" | "1" | "2" | "3",
        {
          state: number;
          tags: number[];
          selectTags: [];
          startTs: number;
          durationInSec: number;
          maxFinishTs: number;
          realFinishTs: number;
        }
      >;
    };
  };
  checkMeta: unknown;
  carousel: unknown;
  charm: unknown;
  consumable: unknown;
  ticket: unknown;
  checkIn: unknown;
  aprilFool: unknown;
  limitedBuff: unknown;
  share: unknown;
  roguelike: unknown;
  event: unknown;
  collectionReward: unknown;
  campaignsV2: unknown;
  retro: unknown;
  car: unknown;
}

export interface TokenData {
  deviceId: string;
  token: YostarToken;
}

export interface StatusData {
  nickName: string;
  nickNumber: string;
  level: number;
  exp: number;
  socialPoint: number;
  gachaTicket: number;
  tenGachaTicket: number;
  instantFinishTicket: number;
  hggShard: number;
  lggShard: number;
  recruitLicense: number;
  progress: number;
  buyApRemainTimes: number;
  apLimitUpFlag: number;
  uid: string;
  secretary: string;
  secretarySkinId: string;
  // account flags of various kinds
  flags: Record<string, 0 | 1>;
  ap: number;
  maxAp: number;
  // OP
  payDiamond: number;
  freeDiamond: number;
  // orundum
  diamondShard: number;
  // LMD
  gold: number;
  practiceTicket: number;
  lastRefreshTs: number;
  lastApAddTime: number;
  mainStageProgress: string;
  registerTs: number;
  lastOnlineTs: number;
  serverName: string;
  avatarId: string;
  resume: string;
  friendNumLimit: number;
  monthlySubscriptionStartTime: number;
  monthlySubscriptionEndTime: number;
  tipMonthlyCardExpireTs: number;
  avatar: {
    type: string;
    id: string;
  };
  globalVoiceLan: string;
  classicShard: number;
  classicGachaTicket: number;
  classicTenGachaTicket: number;
}

type SquadId = "0" | "1" | "2" | "3";
type SquadOperator = {
  charInstId: number;
  skillIndex: 0 | 1 | 2;
  currentEquip: string | null;
};
type SquadData = {
  squadId: SquadId;
  name: string;
  slots: (SquadOperator | null)[];
};

export interface RosterData {
  curCharInstId: number;
  curSquadCount: number;
  squads: Record<SquadId, SquadData>;
  chars: { [id: string]: CharacterData | undefined };
  charGroup: Record<string, { favorPoint: number }>;
  charMission: unknown;
  addon: unknown;
}

export interface CharacterData {
  //id for operator, based on the order of acquisition.
  instId: number;
  charId: string;
  // trust
  favorPoint: number;
  potentialRank: number;
  mainSkillLvl: number;
  skin: string | null;
  level: number;
  exp: number;
  //elite level
  evolvePhase: number;
  //can be -1? maybe for amiya?
  defaultSkillIndex: number;
  // epoch timestamp
  gainTime: number;
  skills: SkillData[];
  currentEquip: string | null;
  equip: { [id: string]: ModuleData | undefined };
  starMark?: number;
  //this is just for amiya
  currentTmpl?: string;
  //more stuff just for amiya, to separate the two states
  tmpl?: { [id: string]: CharachterTemplateData };
  voiceLan: string;
}

export interface CharachterTemplateData {
  skinId: string;
  defaultSkillIndex: number;
  currentEquip: string | null;
  equip: { [id: string]: ModuleData | undefined };
  skills: SkillData[];
}

export interface ModuleData {
  level: number;
  locked: number;
  hide: number;
}

export interface SkillData {
  //seems to be in the format skchr_XXX_Y, with XXX being operator id/name, and Y the slot, from 1 to 3
  skillId: string;
  unlock: number;
  state: number;
  specializeLevel: number;
  completeUpgradeTime: number;
}

export interface SocialData {
  assistCharList: AssistantData[] | [null];
  yesterdayReward: {
    canReceive: number;
    assistAmount: number;
    comfortAmount: number;
    first: number;
  };
  yCrisisSs: unknown;
  medalBoard: {
    type: string;
    custom: string;
    template: unknown;
    templateMedalList: unknown;
  };
  yCrisisV2Ss: unknown;
}

export interface AssistantData {
  //char Id
  charInstId: number;
  skillIndex: number | null;
  //equipped module
  currentEquip: string | null;
}
