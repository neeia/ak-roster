export interface LocalStorageSettings {
  plannerSettings: PlannerSettings;
}

export interface PlannerSettings {
  showInactiveMaterials: boolean;
  hideIncrementDecrementButtons: boolean;
  sortCompletedToBottom: boolean;
}

const defaultPlannerSettings: PlannerSettings = {
  showInactiveMaterials: false,
  hideIncrementDecrementButtons: true,
  sortCompletedToBottom: false,
};


export const defaultSettings: LocalStorageSettings = {
  plannerSettings: defaultPlannerSettings,
};
