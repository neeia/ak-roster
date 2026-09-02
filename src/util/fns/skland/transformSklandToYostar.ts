import { SklandPayload, StatusData, TokenData, UserData } from "types/arknightsApiTypes/apiTypes";

const AMIYA_IDS = {
  CASTER: "char_002_amiya",
  GUARD: "char_1001_amiya2",
  MEDIC: "char_1037_amiya3",
} as const;

const AMIYA_ID_SET = new Set<string>(Object.values(AMIYA_IDS));

export default function transformSklandToYostar(payload: SklandPayload, tokenData: TokenData): UserData {
  const { playerInfo, warehouseInfo, uid } = payload;

  // Extract core domain data safely from playerInfo
  const statusRaw = playerInfo?.status || {};
  const charsList: any[] = playerInfo?.chars || [];
  const assistList: any[] = playerInfo?.assistChars || [];
  const rawBuilding = playerInfo?.building || {};

  // 1. Port Status Data
  const status = portStatus(statusRaw, uid);

  // 2. Port Inventory Data from warehouseInfo
  const inventory: Record<string, number> = {};
  const warehouseItems = warehouseInfo?.items || [];
  if (Array.isArray(warehouseItems)) {
    warehouseItems.forEach((item: { id: string; count: number }) => {
      if (item && item.id) {
        inventory[item.id] = item.count ?? 0;
      }
    });
  }

  // 3. Process Characters Roster & Consolidate Amiya
  const chars: Record<string, any> = {};
  const charIdToInstIdMap: Record<string, number> = {};
  let instCounter = 10000;

  // Track raw SKLand Amiya entries to form Yostar `tmpl`
  const amiyaEntries: Record<string, any> = {};

  charsList.forEach((char: any) => {
    if (!char?.charId) return;

    // Separate Amiya variants for combined transformation later
    if (AMIYA_ID_SET.has(char.charId)) {
      amiyaEntries[char.charId] = char;
      return;
    }

    const instId = char.instId || instCounter++;
    charIdToInstIdMap[char.charId] = instId;

    chars[instId.toString()] = buildStandardCharObject(char, instId);
  });

  // Handle Amiya aggregation if any Amiya form exists
  if (Object.keys(amiyaEntries).length > 0) {
    const amiyaInstId = 1; // Standard Yostar reserved instId for Amiya
    const baseAmiya = amiyaEntries[AMIYA_IDS.CASTER] || Object.values(amiyaEntries)[0];

    // Map all present Amiya form IDs to this single instance ID
    Object.keys(amiyaEntries).forEach((id) => {
      charIdToInstIdMap[id] = amiyaInstId;
    });

    const tmplMap: Record<string, any> = {};
    Object.entries(amiyaEntries).forEach(([charId, amiyaData]) => {
      const skills = Array.isArray(amiyaData.skills) ? amiyaData.skills : [];
      const defaultSkillIndex = skills.findIndex((s: any) => s.id === amiyaData.defaultSkillId);

      const equipMap: Record<string, any> = {};
      if (Array.isArray(amiyaData.equip)) {
        amiyaData.equip.forEach((eq: any) => {
          equipMap[eq.id] = {
            hide: 0,
            locked: eq.locked ? 1 : 0,
            level: eq.level ?? 1,
          };
        });
      }

      tmplMap[charId] = {
        skinId: amiyaData.skinId || `${charId}#1`,
        defaultSkillIndex: defaultSkillIndex >= 0 ? defaultSkillIndex : 0,
        skills: skills.map((s: any) => ({
          skillId: s.id,
          unlock: 1,
          state: 0,
          specializeLevel: s.specializeLevel ?? 0,
          completeUpgradeTime: -1,
        })),
        currentEquip: amiyaData.defaultEquipId || null,
        equip: equipMap,
      };
    });

    // Determine current active template (defaulting to the first available form, prioritizing Caster)
    const currentTmpl = amiyaEntries[AMIYA_IDS.CASTER]?.charId
      || Object.keys(tmplMap)[0]
      || AMIYA_IDS.CASTER;

    chars[amiyaInstId.toString()] = {
      instId: amiyaInstId,
      charId: AMIYA_IDS.CASTER,
      favorPoint: (baseAmiya.favorPercent ?? 0) * 100,
      potentialRank: baseAmiya.potentialRank ?? 0,
      mainSkillLvl: baseAmiya.mainSkillLvl ?? 1,
      skin: baseAmiya.skinId || null,
      level: baseAmiya.level ?? 1,
      exp: baseAmiya.exp ?? 0,
      evolvePhase: baseAmiya.evolvePhase ?? 0,
      defaultSkillIndex: -1,
      gainTime: baseAmiya.gainTime ?? 0,
      skills: [],
      voiceLan: "CN",
      currentEquip: null,
      equip: {},
      currentTmpl,
      tmpl: tmplMap,
    };
  }

  // 4. Process Support List
  const assistCharList: any[] = [];
  if (Array.isArray(assistList)) {
    assistList.forEach((assist: any) => {
      if (!assist) {
        assistCharList.push(null);
        return;
      }

      // 1. Resolve character instance ID
      const charInstId = charIdToInstIdMap[assist.charId] ?? assist.charInstId ?? -1;
      const charObj = chars[charInstId.toString()];

      // 2. Derive skillIndex by finding assist.skillId inside the character's skill list
      let skillIndex = assist.skillIndex ?? 0;
      if (assist.skillId && charObj?.skills) {
        const foundIndex = charObj.skills.findIndex((s: any) => s.skillId === assist.skillId);
        if (foundIndex !== -1) {
          skillIndex = foundIndex;
        }
      }
      // 3. Extract currentEquip (supports object or string inputs)
      const currentEquip = assist.equip?.id ?? assist.currentEquip ?? null;

      assistCharList.push({
        charInstId,
        skillIndex,
        currentEquip,
      });
    });
  }

  // 5. Process Building Training Room Data
  const trainingRooms: Record<string, any> = {};
  const rawTraining = rawBuilding?.training || rawBuilding?.rooms?.TRAINING;

  if (rawTraining) {
    const slotId = rawTraining.slotId || "slot_13";
    const slotState = rawTraining.slotState ?? 0;
    const speed = rawTraining.speed ?? 1.0;
    const lastUpdateTime = rawTraining.lastUpdateTime ?? 0;

    // Resolve Trainee
    let traineeData = null;
    if (rawTraining.trainee) {
      const traineeCharId = rawTraining.trainee.charId;
      traineeData = {
        charInstId: charIdToInstIdMap[traineeCharId] ?? rawTraining.trainee.charInstId ?? -1,
        state: slotState, // SKLand `slotState` directly maps to Yostar `trainee.state`
        targetSkill: rawTraining.trainee.targetSkill ?? -1,
        processPoint: rawTraining.remainPoint ?? -1,
        speed: speed,
      };
    }

    // Resolve Trainer
    let trainerData = null;
    if (rawTraining.trainer) {
      const trainerCharId = rawTraining.trainer.charId;
      trainerData = {
        charInstId: charIdToInstIdMap[trainerCharId] ?? rawTraining.trainer.charInstId ?? -1,
        state: slotState, // Mapped to slot state as well
      };
    }

    // Construct Yostar Slot object dynamically keyed by slotId
    trainingRooms[slotId] = {
      buff: {
        speed: Math.max(0, parseFloat((speed - 1.0).toFixed(2))), // Converts total speed factor (1.05) back to buff value (0.05)
        lvEx: {},
        lvCost: {},
        reduce: {
          target: null,
          progress: 0,
          cut: 1,
        },
        reduceTimeBd: {
          fulltime: false,
          activated: false,
          cnt: 0,
          reset: false,
        },
        apCost: 0,
      },
      state: 0,
      lastUpdateTime: lastUpdateTime,
      trainee: traineeData,
      trainer: trainerData,
    };
  }

  return {
    status,
    troop: { chars },
    social: { assistCharList },
    building: {
      rooms: {
        TRAINING: trainingRooms ? trainingRooms : {},
      },
    },
    inventory,
    tokenData: tokenData,
  } as UserData;
}

function portStatus(statusData: any, defaultUid: string): StatusData {
  const fullName = statusData?.name || "";
  const [nickName = "", nickNumber = ""] = fullName.split("#");

  return {
    nickName,
    nickNumber,
    level: statusData?.level ?? 0,
    exp: statusData?.exp?.current ?? 0,
    socialPoint: 0,
    gachaTicket: 0,
    tenGachaTicket: 0,
    instantFinishTicket: 0,
    hggShard: 0,
    lggShard: 0,
    recruitLicense: 0,
    progress: 0,
    buyApRemainTimes: 0,
    apLimitUpFlag: 0,
    uid: statusData?.uid || defaultUid,
    secretary: statusData?.secretary?.charId || "",
    secretarySkinId: statusData?.secretary?.skinId || "",
    flags: {},
    ap: statusData?.ap?.current ?? 0,
    maxAp: statusData?.ap?.max ?? 0,
    payDiamond: 0,
    freeDiamond: 0,
    diamondShard: 0,
    gold: 0,
    practiceTicket: 0,
    lastRefreshTs: statusData?.storeTs ?? 0,
    lastApAddTime: statusData?.ap?.lastApAddTime ?? 0,
    mainStageProgress: statusData?.mainStageProgress || "",
    registerTs: statusData?.registerTs ?? 0,
    lastOnlineTs: statusData?.lastOnlineTs ?? 0,
    serverName: statusData?.serverName || "CN",
    avatarId: statusData?.avatar?.id || "",
    resume: statusData?.resume || "",
    friendNumLimit: 0,
    monthlySubscriptionStartTime: 0,
    monthlySubscriptionEndTime: statusData?.subscriptionEnd ?? 0,
    tipMonthlyCardExpireTs: statusData?.subscriptionEnd ?? 0,
    avatar: {
      type: statusData?.avatar?.type || "",
      id: statusData?.avatar?.id || "",
    },
    globalVoiceLan: "",
    classicShard: 0,
    classicGachaTicket: 0,
    classicTenGachaTicket: 0,
  };
}

function buildStandardCharObject(char: any, instId: number) {
  const equipMap: Record<string, any> = {};
  if (Array.isArray(char.equip)) {
    char.equip.forEach((eq: any) => {
      equipMap[eq.id] = {
        hide: 0,
        locked: eq.locked ? 1 : 0,
        level: eq.level ?? 1,
      };
    });
  }

  const skills = Array.isArray(char.skills) ? char.skills : [];
  const defaultSkillIndex = skills.findIndex((s: any) => s.id === char.defaultSkillId);

  return {
    instId,
    charId: char.charId,
    favorPoint: (char.favorPercent ?? 0) * 100,
    potentialRank: char.potentialRank ?? 0,
    mainSkillLvl: char.mainSkillLvl ?? 1,
    skin: char.skinId || null,
    level: char.level ?? 1,
    exp: char.exp ?? 0,
    evolvePhase: char.evolvePhase ?? 0,
    defaultSkillIndex: defaultSkillIndex >= 0 ? defaultSkillIndex : 0,
    gainTime: char.gainTime ?? 0,
    skills: skills.map((s: any) => ({
      skillId: s.id,
      unlock: 1,
      state: 0,
      specializeLevel: s.specializeLevel ?? 0,
      completeUpgradeTime: -1,
    })),
    voiceLan: "CN",
    currentEquip: char.defaultEquipId || null,
    equip: equipMap,
    tmpl: null,
    currentTmpl: null,
  };
}