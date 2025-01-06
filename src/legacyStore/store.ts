import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  createMigrate,
  MigrationManifest,
  PersistedState,
} from "redux-persist";

import depotReducer from "./depotSlice";
import goalsReducer from "./goalsSlice";
import storage from "./storage";
import { OperatorGoalCategory } from "types/goal";
import operatorJson from "data/operators";
import { OperatorData } from "types/operators/operator";

const migrations: MigrationManifest = {
  2: (state) => {
    return {
      ...state,
      goals: (state as RootState).goals
        .map((goal) => {
          if (goal.category === OperatorGoalCategory.Module) {
            goal.moduleLevel ??= 1;
            if (goal.moduleId == null) {
              const op: OperatorData = operatorJson[goal.operatorId];
              const firstModule = op.moduleData?.[0];
              if (firstModule == null) {
                console.warn("Couldn't find any modules for this operator module goal", goal);
                return null;
              }
              goal.moduleId = firstModule.moduleId;
            }
          }
          return goal;
        })
        .filter((goal) => Boolean(goal)),
    } as PersistedState;
  },
  3: (state) => {
    return {
      ...state,
    } as PersistedState;
  },
};

const persistConfig = {
  key: "root",
  version: 3,
  storage,
  migrate: createMigrate(migrations, { debug: true }),
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    depot: depotReducer,
    goals: goalsReducer,
  })
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
