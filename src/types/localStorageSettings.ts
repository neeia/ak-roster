export interface LocalStorageSettings {
  plannerSettings?: PlannerSettings;
}

export interface PlannerSettings {
  showInactiveMaterials: boolean;
  hideIncrementDecrementButtons: boolean;
  sortCompletedToBottom: boolean;
}
