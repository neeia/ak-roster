export interface LocalStorageSettings {
  version: string;
  plannerSettings: PlannerSettings;
  depotSettings: DepotSettings;
  recruitSettings: RecruitSettings;
}

export interface PlannerSettings {}

const plannerSettings: PlannerSettings = {};

export interface DepotSettings {
  crafting: string[];
  showInactiveMaterials: boolean;
  showIncrementDecrementButtons: boolean;
  sortCompletedToBottom: boolean;
}

const depotSettings: DepotSettings = {
  crafting: [],
  showInactiveMaterials: false,
  showIncrementDecrementButtons: false,
  sortCompletedToBottom: false,
};

export interface RecruitSettings {
  showBonuses: boolean;
  showPotential: boolean;
}

const recruitSettings: RecruitSettings = {
  showBonuses: false,
  showPotential: false,
};

export const defaultSettings: LocalStorageSettings = {
  version: "1",
  plannerSettings,
  recruitSettings,
  depotSettings,
};
