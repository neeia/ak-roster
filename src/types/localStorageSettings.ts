export interface LocalStorageSettings {
  version: string;
  plannerSettings: PlannerSettings;
  depotSettings: DepotSettings;
  recruitSettings: RecruitSettings;
  importSettings: ImportSettings;
}

export interface InactiveOpsInGroups {
  [groupName: string]: string[];
}

export interface PlannerSettings {
  allowAllGoals: boolean;
  sortEmptyGroupsToBottom: boolean;
  inactiveOpsInGroups: InactiveOpsInGroups;
  autoRefreshGoals: boolean;
}

const plannerSettings: PlannerSettings = {
  allowAllGoals: false,
  sortEmptyGroupsToBottom: false,
  inactiveOpsInGroups: {},
  autoRefreshGoals: true,
};

export interface DepotSettings {
  crafting: string[];
  showInactiveMaterials: boolean;
  showIncrementDecrementButtons: boolean;
  sortCompletedToBottom: boolean;
  ignoreLmdInCrafting: boolean;
  //optional to migrate them and remove
  eventsIncomeData?: any;
}

export interface ImportSettings {
  importProfile: boolean;
  importOperators: boolean;
  importDepot: boolean;
  importServer: "en" | "kr" | "jp";
  refreshGoals: boolean;
}

const depotSettings: DepotSettings = {
  crafting: [],
  showInactiveMaterials: false,
  showIncrementDecrementButtons: false,
  sortCompletedToBottom: false,
  ignoreLmdInCrafting: false,
};

export interface RecruitSettings {
  showBonuses: boolean;
  showPotential: boolean;
  hideThreeStarRecruits: boolean;
}

const recruitSettings: RecruitSettings = {
  showBonuses: false,
  showPotential: false,
  hideThreeStarRecruits: false,
};

const importSettings: ImportSettings = {
  importProfile: true,
  importOperators: true,
  importDepot: true,
  importServer: "en",
  refreshGoals: true,
};

export const defaultSettings: LocalStorageSettings = {
  version: "1",
  plannerSettings,
  recruitSettings,
  depotSettings,
  importSettings,
};
