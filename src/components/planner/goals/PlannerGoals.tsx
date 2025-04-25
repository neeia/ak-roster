import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import {
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Search } from "@mui/icons-material";
import React, { useCallback, useMemo, useState } from "react";
import PlannerGoalAdd from "./PlannerGoalAdd";
import operatorJson from "data/operators";
import GoalGroup from "./GoalGroup";
import Board from "components/base/Board";
import GoalData, { getPlannerGoals, GoalDataInsert } from "types/goalData";
import _ from "lodash";
import {
  changeLevel,
  changeMastery,
  changeModule,
  changePromotion,
  changeSkillLevel,
  clamp,
  defaultOperatorObject,
  MAX_LEVEL_BY_RARITY,
  MODULE_REQ_BY_RARITY,
} from "util/changeOperator";
import GoalReorderDialog from "./GoalReorderDialog";
import DepotItem from "types/depotItem";
import useGoalGroups from "util/hooks/useGoalGroups";
import getGoalIngredients from "util/fns/depot/getGoalIngredients";
import useOperators from "util/hooks/useOperators";
import OperatorGoals from "./OperatorGoals";
import PlannerGoalCard from "./PlannerGoalCard";
import canCompleteByCrafting from "util/fns/depot/canCompleteByCrafting";
import { LocalStorageSettings } from "types/localStorageSettings";
import depotToExp from "util/fns/depot/depotToExp";
import GoalFilterDialog from "./GoalFilterDialog";
import { GoalFilterHook } from "util/hooks/useGoalFilter";
import expToBattleRecords from "util/fns/depot/expToBattleRecords";
import { levelingCost } from "pages/tools/level";
import ChangeGroupDialog from "./ChangeGroupDialog";
import { enqueueSnackbar } from "notistack";
import RenameGroupDialog from "./RenameGroupDialog";
import { SettingsMenu, SettingsMenuItem, SettingsButton } from "../SettingsMenu";
import useMenu from "util/hooks/useMenu";

type Depot = Record<string, DepotItem>;

interface Props extends GoalFilterHook {
  goals: GoalData[];
  depot: Depot;
  setDepot: (depotItem: DepotItem[]) => void;
  updateGoals: (goalsData: GoalDataInsert[]) => void;
  removeAllGoals: () => void;
  removeAllGoalsFromGroup: (groupName: string, cleanLocal?: boolean) => void;
  removeAllGoalsFromOperator: (opId: string, groupName: string) => void;
  changeLocalGoalGroup: (oldGroupName: string, newGroupName: string) => void;
  settings: LocalStorageSettings;
  setSettings: (settings: LocalStorageSettings | ((settings: LocalStorageSettings) => LocalStorageSettings)) => void;
}

const PlannerGoals = (props: Props) => {
  const {
    goals,
    depot,
    setDepot,
    updateGoals,
    removeAllGoals,
    removeAllGoalsFromGroup,
    removeAllGoalsFromOperator,
    changeLocalGoalGroup,
    settings,
    setSettings,
    ...filter
  } = props;
  const { groups, putGroups, removeGroup, renameGroup } = useGoalGroups();
  const [roster, onChange] = useOperators();

  const [reorderOpen, setReorderOpen] = useState<boolean>(false);
  const { setAnchorEl, menuProps, menuButtonProps } = useMenu();

  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  const [addGoalOpen, setAddGoalOpen] = useState<boolean>(false);
  const [opId, setOpId] = useState<string>();
  const [group, setGroup] = useState<string>();
  const onGoalEdit = (opId: string, groupName: string) => {
    setOpId(opId);
    setGroup(groupName);
    setAddGoalOpen(true);
  };

  const [moveId, setMoveId] = useState<[string, string]>();
  const onGoalMove = (opId: string, groupName: string) => {
    setMoveId([opId, groupName]);
  };
  const valid = (group_name: string) => {
    if (!moveId || !moveId[0] || !moveId[1]) return false;
    if (!groups.includes(group_name)) return false;
    const goalInTargetPosn = goals.find((x) => x.op_id === moveId[0] && x.group_name === group_name);
    if (goalInTargetPosn) return false;
    return true;
  };
  const moveGoal = (group_name: string) => {
    if (!moveId || !moveId[0] || !moveId[1]) return;
    const goal = goals.find((x) => x.op_id === moveId[0] && x.group_name === moveId[1]);

    if (!valid) {
      enqueueSnackbar("Goal already exists in target group", { variant: "error" });
      return;
    }
    setMoveId(undefined);
    if (goal) {
      const oldGoal: GoalDataInsert = { op_id: moveId[0], group_name: moveId[1], sort_order: goal.sort_order };
      updateGoals([oldGoal, { ...goal, group_name }]);
    }
  };

  const [groupToRename, setGroupToRename] = useState<string>();
  const onGroupRename = (groupName: string) => {
    setGroupToRename(groupName);
  };

  const onPlannerGoalCardGoalDeleted = useCallback(
    (plannerGoal: PlannerGoal, groupName: string) => {
      const opId = plannerGoal.operatorId;
      const opData = operatorJson[opId];

      if (!goals) return;

      const goal = goals.find((x) => x.op_id === opId && x.group_name === groupName);
      if (!goal) return;

      const _goal: GoalData = { ...goal };
      const allPlannerGoals = getPlannerGoals(goal, opData);

      switch (plannerGoal.category) {
        case OperatorGoalCategory.Elite:
          if (goal.elite_from != null && goal.elite_to != null) {
            /*
             * if goal is e0 -> e2 and goal removed is e2, then update elite_to to e1
             * otherwise, remove elite goal entirely
             * then, if operator has a level goal, then update level_to to the new max level and make sure elite_from and elite_to are non-null
             *
             * ex: e1 50 -> e2 40, remove e2
             * new goal: e1 50 -> e1 max
             *
             * ex: e0 max -> e2 40, remove e1
             * new goal: none
             *
             * ex: e0 1 -> e2 1, remove e1
             * new goal: e0 1 -> e0 max
             */

            const removedElite = plannerGoal.eliteLevel; // can either be 1 or 2
            if (removedElite === 2 && goal.elite_from === 0) {
              _goal.elite_to = 1;
            } else {
              _goal.elite_from = null;
              _goal.elite_to = null;
            }
            //delete should be backwards: get values after elite goal removal
            const elite_from = _goal.elite_from ?? 0;
            const elite_to = _goal.elite_to ?? 0;

            // update level goal if it exists
            if (goal.level_from && goal.level_to) {
              const maxFrom = MAX_LEVEL_BY_RARITY[opData.rarity][elite_from];
              const maxTo = MAX_LEVEL_BY_RARITY[opData.rarity][elite_to];
              const level_from = clamp(1, goal.level_from, maxFrom);
              const level_to = clamp(1, goal.level_to, maxTo);

              if (elite_from === elite_to && level_from === level_to) {
                // level goal is redundant and can be removed
                _goal.elite_from = null;
                _goal.elite_to = null;
                _goal.elite_from = null;
                _goal.elite_to = null;
              } else {
                // either elite is differnt or level is; either way, not redundant
                _goal.elite_from = elite_from;
                _goal.elite_to = elite_to;
                _goal.level_from = level_from;
                _goal.level_to = level_to;
              }
            }
          }
          break;
        case OperatorGoalCategory.Level:
          if (goal.level_from != null && goal.level_to != null) {
            /*
             * if goal is the only level component of an elite goal, then remove level goal and leave elite goal intact
             * otherwise, remove elite goal entirely
             * if goal is part of a greater promotion + level goal, then remove anything that requires the level goal, leaving anything prior intact
             *
             * ex: e1 50 -> e2 40, remove e1 50 -> max
             * new goal: e1 -> e2
             *
             * ex: e0 max -> e2 40, remove e1 1 -> max
             * new goal: e0 -> e1
             *
             * ex: e0 1 -> e2 1, remove e1 1 -> max
             * new goal: e0 1 -> e1 1
             */

            // pure level goal
            if (goal.elite_from === goal.elite_to) {
              // this means there are no other level or promotion goals. great, we can remove level / elite entirely
              _goal.elite_from = null;
              _goal.elite_to = null;
              _goal.level_from = null;
              _goal.level_to = null;
            } else if (allPlannerGoals.filter((x) => x.category === OperatorGoalCategory.Level).length === 1) {
              /* check for possible pure elite goal
               * this can only be elite A lvl 1 -> elite A + 1 lvl 1
               * or elite A lvl max -> elite A + 1 lvl N
               * or elite 0 lvl max -> elite 2 lvl 1
               * we can do this by checking if getPlannerGoals returns only one level goal
               */
              _goal.level_from = null;
              _goal.level_to = null;
            } else {
              // remaining goal must be complex - a mix of elite and level goals

              // sanity check - elite_from should never be equal to elite_to at this point, but just in case
              // delete should be backwards:
              // del of plannerGoal of Lowest elite -> deletes It, and every higher goals (or complete it alone)
              if (_goal.elite_from === plannerGoal.eliteLevel) {
                _goal.elite_from = null;
                _goal.elite_to = null;
                _goal.level_from = null;
                _goal.level_to = null;
              } else {
                // cap elite goal at the current elite
                _goal.elite_to = plannerGoal.eliteLevel;
                // we should be able to set the level_to to 1 here because if the previous level was E? max,
                // this case would have been caught by the pure elite goal check
                _goal.level_to = 1;
              }
            }
          }
          break;
        case OperatorGoalCategory.Mastery:
          // fortunately any non-elite/lvl cases should be simpler -
          // just remove anything after the indicated level
          const skillIndex = opData.skillData?.findIndex((x) => x.skillId === plannerGoal.skillId);
          if (skillIndex != null && goal.masteries_from && goal.masteries_to) {
            _goal.masteries_to = [...goal.masteries_to];

            _goal.masteries_to[skillIndex] = Math.max(plannerGoal.masteryLevel - 1, goal.masteries_from[skillIndex]);

            if (_.isEqual(goal.masteries_from, _goal.masteries_to)) {
              _goal.masteries_from = null;
              _goal.masteries_to = null;
            }
          }
          break;
        case OperatorGoalCategory.Module:
          const moduleId = plannerGoal.moduleId;
          if (moduleId != null && goal.modules_from && goal.modules_to) {
            _goal.modules_to = { ...goal.modules_to };
            const removedModuleLevel = plannerGoal.moduleLevel;

            if (removedModuleLevel - 1 <= goal.modules_from[moduleId]) {
              _goal.modules_to[moduleId] = goal.modules_from[moduleId];
            } else {
              _goal.modules_to[moduleId] = removedModuleLevel - 1;
            }

            if (_.isEqual(_goal.modules_to, goal.modules_from)) {
              _goal.modules_from = null;
              _goal.modules_to = null;
            }
          }
          break;
        case OperatorGoalCategory.SkillLevel:
          if (goal.skill_level_from != null && goal.skill_level_to != null) {
            const newSkillLevel = plannerGoal.skillLevel - 1;

            if (newSkillLevel <= goal.skill_level_from) {
              _goal.skill_level_from = null;
              _goal.skill_level_to = null;
            } else {
              _goal.skill_level_to = newSkillLevel;
            }
          }
          break;
      }
      const { group_name, op_id, sort_order, user_id, ...rest } = _goal;
      if (Object.values(rest).every((x) => x == null)) {
        removeAllGoalsFromOperator(op_id, group_name);
      } else {
        updateGoals([_goal]);
      }
    },
    [goals, updateGoals, removeAllGoalsFromOperator]
  );

  //modified "onPlannerGoalCardGoalCompleted" for use in Loop.
  //input: previous values,
  //return: computes and returns {updatedGoal, updatedOperator, updatedDepot}
  //with changes after completing each Goal.
  //hooks are removed, moved to wrapper functions.
  const completePlannerGoal = useCallback(
    (goal: GoalData, operator: any, depotData: Depot, plannerGoal: PlannerGoal) => {
      const opId = plannerGoal.operatorId;
      const opData = operatorJson[opId];

      // remove goal, remove any prerequisites, update roster, and update depot
      const allPlannerGoals = getPlannerGoals(goal, opData);
      const _goal = { ...goal };
      let op = { ...operator };
      let updatedDepot: Depot = {};

      switch (plannerGoal.category) {
        case OperatorGoalCategory.Elite:
          if (goal.elite_from != null && goal.elite_to != null) {
            const finishedElite = plannerGoal.eliteLevel; // can either be 1 or 2

            const elite_from = finishedElite;
            _goal.elite_from = finishedElite;
            const elite_to = _goal.elite_to ?? 0;
            if (_goal.elite_from >= elite_to) {
              _goal.elite_from = null;
              _goal.elite_to = null;
            }

            // update level goal if it exists
            if (goal.level_from && goal.level_to) {
              const maxTo = MAX_LEVEL_BY_RARITY[opData.rarity][elite_to];
              const level_from = 1;
              const level_to = clamp(1, goal.level_to, maxTo);

              if (elite_from === elite_to && level_from === level_to) {
                // level goal is redundant and can be removed
                _goal.elite_from = null;
                _goal.elite_to = null;
                _goal.elite_from = null;
                _goal.elite_to = null;
              } else {
                // either elite is different or level is; either way, not redundant
                _goal.elite_from = elite_from;
                _goal.elite_to = elite_to;
                _goal.level_from = level_from;
                _goal.level_to = level_to;
              }
            }
            if (op.elite < finishedElite) {
              op = changePromotion(op, finishedElite);
            }
          }
          break;
        case OperatorGoalCategory.Level:
          if (goal.level_from != null && goal.level_to != null) {
            /*
             * if goal is the only level component of an elite goal, then remove level goal and leave elite goal intact
             * otherwise, remove elite goal entirely
             * if goal is part of a greater promotion + level goal, then remove anything that the level goal required
             *
             * ex: e1 50 -> e2 40, finish e1 50 -> max
             * new goal: e1 max -> e2 40
             *
             * ex: e0 max -> e2 40, finish e1 1 -> max
             * new goal: e1 max -> e2 40
             *
             * ex: e0 1 -> e2 1, finish e1 1 -> max
             * new goal: e1 -> e2
             */

            _goal.elite_from = plannerGoal.eliteLevel;
            // we should be able to set the level_to to 1 here because if the previous level was E? max,
            // this case would have been caught by the pure elite goal check
            _goal.level_from = plannerGoal.toLevel;

            // pure level goal
            if (_goal.elite_from === _goal.elite_to) {
              // this means there are no other level or promotion goals. great, we can remove level / elite entirely
              _goal.elite_from = null;
              _goal.elite_to = null;
              _goal.level_from = null;
              _goal.level_to = null;
            } else if (allPlannerGoals.filter((x) => x.category === OperatorGoalCategory.Level).length === 1) {
              /* check for possible pure elite goal
               * this can only be elite A lvl 1 -> elite A + 1 lvl 1
               * or elite A lvl max -> elite A + 1 lvl N
               * or elite 0 lvl max -> elite 2 lvl 1
               * we can do this by checking if getPlannerGoals returns only one level goal
               */
              _goal.level_from = null;
              _goal.level_to = null;
            } else if (_goal.elite_to === plannerGoal.eliteLevel) {
              _goal.elite_from = null;
              _goal.elite_to = null;
              _goal.level_from = null;
              _goal.level_to = null;
            }
            if (op.elite < plannerGoal.eliteLevel) {
              op = changePromotion(op, plannerGoal.eliteLevel);
            }
            if (op.level < plannerGoal.toLevel) {
              op = changeLevel(op, plannerGoal.toLevel);
            }
          }
          break;
        case OperatorGoalCategory.Mastery:
          // fortunately any non-elite/lvl cases should be simpler -
          // just remove anything before the indicated level
          const skillIndex = opData.skillData?.findIndex((x) => x.skillId === plannerGoal.skillId);
          if (skillIndex != null && goal.masteries_from && goal.masteries_to) {
            _goal.masteries_from = [...goal.masteries_from];

            _goal.masteries_from[skillIndex] = Math.min(plannerGoal.masteryLevel, goal.masteries_to[skillIndex]);

            if (_.isEqual(goal.masteries_from, _goal.masteries_to)) {
              _goal.masteries_from = null;
              _goal.masteries_to = null;
            }
            if (op.masteries[skillIndex] < plannerGoal.masteryLevel) {
              if (op.elite < 2) op = changePromotion(op, 2);
              if (op.skill_level < 7) {
                op = changeSkillLevel(op, 7);
              }
              op = changeMastery(op, skillIndex, plannerGoal.masteryLevel);
            }
          }
          break;
        case OperatorGoalCategory.Module:
          const moduleId = plannerGoal.moduleId;
          if (moduleId != null && goal.modules_from && goal.modules_to) {
            _goal.modules_from = { ...goal.modules_from };

            _goal.modules_from[moduleId] = Math.min(plannerGoal.moduleLevel, goal.modules_to[moduleId]);

            if (_.isEqual(_goal.modules_to, goal.modules_from)) {
              _goal.modules_from = null;
              _goal.modules_to = null;
            }
            if (op.modules[moduleId] < plannerGoal.moduleLevel) {
              if (op.elite < 2) op = changePromotion(op, 2);
              if (op.level < MODULE_REQ_BY_RARITY[opData.rarity]) {
                op = changeLevel(op, MODULE_REQ_BY_RARITY[opData.rarity]);
              }
              op = changeModule(op, moduleId, plannerGoal.moduleLevel);
            }
          }
          break;
        case OperatorGoalCategory.SkillLevel:
          if (goal.skill_level_from != null && goal.skill_level_to != null) {
            const newSkillLevel = plannerGoal.skillLevel;

            if (newSkillLevel >= goal.skill_level_to!) {
              _goal.skill_level_from = null;
              _goal.skill_level_to = null;
            } else {
              _goal.skill_level_from = newSkillLevel;
            }
            if (op.skill_level < plannerGoal.skillLevel) {
              if (op.elite < 1 && plannerGoal.skillLevel > 4) op = changePromotion(op, 1);
              op = changeSkillLevel(op, plannerGoal.skillLevel);
            }
          }
          break;
      }

      //updateGoals([_goal]);
      //onChange(op);

      const ingredients = getGoalIngredients(plannerGoal);
      if (ingredients.length > 0) {
        if (plannerGoal.category === OperatorGoalCategory.Level) {
          const { exp, lmd } = levelingCost(
            opData.rarity,
            plannerGoal.eliteLevel,
            plannerGoal.fromLevel,
            plannerGoal.eliteLevel,
            plannerGoal.toLevel
          );
          const { depot: _depotUpdate } = expToBattleRecords(exp, depotData);
          _depotUpdate["4001"].stock -= lmd;
          updatedDepot = _depotUpdate;
          //setDepot(Object.values(_depot));
        } else {
          const { depot: _depotUpdate } = canCompleteByCrafting(
            Object.fromEntries(ingredients.map(({ quantity, id }) => [id, quantity])),
            depotData,
            //tweak: only craft ingrediets in crafting state
            settings.depotSettings.crafting
          ); //Object.keys(depotData)
          updatedDepot = _depotUpdate;
          //setDepot(Object.values(_depot));
        }
      }
      return { updatedGoal: _goal, updatedOperator: op, updatedDepot };
    },
    [settings.depotSettings.crafting]
  );

  //wrapper for completePlannerGoal to compete one goal
  const onPlannerGoalCardGoalCompleted = (plannerGoal: PlannerGoal, groupName: string) => {
    const opData = roster[plannerGoal.operatorId] ?? defaultOperatorObject(plannerGoal.operatorId, true);
    const goalData = goals!.find((x) => x.op_id === opData.op_id && x.group_name === groupName)!;

    const { updatedGoal, updatedOperator, updatedDepot } = completePlannerGoal(goalData, opData, depot, plannerGoal);
    //update storages through hooks
    setDepot(Object.values(updatedDepot));
    onChange(updatedOperator);
    updateGoals([updatedGoal]);
  };

  //wrapper for completePlannerGoal to complete all goals of op in group
  //gradually computes resulting values to use in next goals, and uses hooks on totals in the end.
  const onPlannerGoalGroupCompleteAllGoals = useCallback(
    (opId: string, groupName: string) => {
      const OperatorGroupGoals = goals.filter((goal) => goal.op_id === opId && goal.group_name === groupName);
      let _opData = roster[opId] ?? defaultOperatorObject(opId, true);
      let _depotData = { ...depot };
      let _goalData: GoalData[] = [];

      for (const goalData of OperatorGroupGoals) {
        let _goal = goalData;
        const plannerGoals = getPlannerGoals(goalData);
        plannerGoals.forEach((_plannerGoal) => {
          const { updatedGoal, updatedOperator, updatedDepot } = completePlannerGoal(
            _goal,
            _opData,
            _depotData,
            _plannerGoal
          );
          _opData = updatedOperator;
          _depotData = updatedDepot;
          _goal = updatedGoal;
        });
        _goalData.push(_goal);
      }
      //update storages through hooks
      setDepot(Object.values(_depotData));
      onChange(_opData);

      //Level,Elite category goals logic deletes parts of GoalData
      //maybe modify and use later:
      //updateGoals(_goalData);

      //delete all goals of op in group
      removeAllGoalsFromOperator(opId, groupName);
    },
    [depot, goals, roster, completePlannerGoal, setDepot, onChange, removeAllGoalsFromOperator]
  );

  const inactiveOpsInGroups = useMemo(
    () => ({ ...(settings.plannerSettings.inactiveOpsInGroups ?? {}) }),
    [settings.plannerSettings.inactiveOpsInGroups]
  );
  const groupedGoals = useMemo(() => _.groupBy(goals, (goal) => goal.group_name), [goals]);

  const handleOpSelect = useCallback(
    (opId: string, groupName: string) => {
      const _opsList = new Set(inactiveOpsInGroups[groupName] ?? []);

      if (_opsList.has(opId)) {
        _opsList.delete(opId);
      } else {
        _opsList.add(opId);
      }

      if (_opsList.size === 0) {
        delete inactiveOpsInGroups[groupName];
      } else {
        inactiveOpsInGroups[groupName] = Array.from(_opsList);
      }

      setSettings((s) => ({ ...s, plannerSettings: { ...s.plannerSettings, inactiveOpsInGroups } }));
    },
    [inactiveOpsInGroups, setSettings]
  );

  const resetAllOpsInactivity = useCallback(() => {
    setAnchorEl(null);
    setSettings((s) => ({ ...s, plannerSettings: { ...s.plannerSettings, inactiveOpsInGroups: {} } }));
  }, [setSettings, setAnchorEl]);

  const setAllOpsInactivity = useCallback(() => {
    setAnchorEl(null);

    const allOpsInAllGroup = Object.keys(groupedGoals).reduce((acc, groupName) => {
      const opsInGroup = groupedGoals[groupName]?.map((goal) => goal.op_id) ?? [];
      if (opsInGroup.length > 0) {
        acc[groupName] = opsInGroup;
      }
      return acc;
    }, {} as Record<string, string[]>);

    setSettings((s) => ({ ...s, plannerSettings: { ...s.plannerSettings, inactiveOpsInGroups: allOpsInAllGroup } }));
  }, [groupedGoals, setSettings, setAnchorEl]);

  const toggleGroupOpsInactivity = useCallback(
    (groupName: string) => {
      const opsSelection = inactiveOpsInGroups[groupName] ?? [];
      const allOpsInGroup = groupedGoals[groupName]?.map((goal) => goal.op_id) ?? [];

      const allEnabled = allOpsInGroup.every((opId) => !opsSelection.includes(opId));

      const newSelectionState = allEnabled ? true : false;

      const newOpsSelection = newSelectionState
        ? opsSelection.concat(allOpsInGroup.filter((opId) => !opsSelection.includes(opId)))
        : [];

      if (newOpsSelection.length === 0) {
        delete inactiveOpsInGroups[groupName];
      } else {
        inactiveOpsInGroups[groupName] = newOpsSelection;
      }

      setSettings((s) => ({ ...s, plannerSettings: { ...s.plannerSettings, inactiveOpsInGroups } }));
    },
    [groupedGoals, inactiveOpsInGroups, setSettings]
  );

  const getGroupCheckboxState = useCallback(
    (groupName: string) => {
      const opsUnSelection = inactiveOpsInGroups[groupName] ?? [];
      const allOpsInGroup = groupedGoals[groupName]?.map((goal) => goal.op_id) ?? [];

      const allEnabled = opsUnSelection.length === 0;
      const someDisabled = opsUnSelection.length > 0;
      const emptyGroup = allOpsInGroup.length === 0;
      const allDisabled = someDisabled && opsUnSelection.length === allOpsInGroup.length;
      return {
        checkboxText: emptyGroup ? '' : `${allOpsInGroup.length - opsUnSelection.length}/${allOpsInGroup.length}`,
        checkboxState: {
          checked: allEnabled && !emptyGroup,
          indeterminate: !allDisabled && someDisabled,
          disabled: emptyGroup,
        }
      };
    },
    [groupedGoals, inactiveOpsInGroups]
  );

  const renameInactivityGroup = useCallback(
    (groupName: string, newName: string) => {
      const opsSelection = inactiveOpsInGroups[groupName] ?? [];
      if (opsSelection.length === 0) return;
      delete inactiveOpsInGroups[groupName];

      inactiveOpsInGroups[newName] = opsSelection;
      setSettings((s) => ({ ...s, plannerSettings: { ...s.plannerSettings, inactiveOpsInGroups } }));
    },
    [inactiveOpsInGroups, setSettings]
  );

  const resetGroupInactivity = useCallback(
    (groupName: string) => {
      delete inactiveOpsInGroups[groupName];
      setSettings((s) => ({ ...s, plannerSettings: { ...s.plannerSettings, inactiveOpsInGroups } }));
    },
    [inactiveOpsInGroups, setSettings]
  );

  const handleAllowAllGoals = useCallback(() => {
    const plannerSettings = { ...settings.plannerSettings };
    plannerSettings.allowAllGoals = !plannerSettings?.allowAllGoals;

    setSettings((s) => ({ ...s, plannerSettings }));
    setAnchorEl(null);
  }, [settings, setSettings, setAnchorEl]);

  const handleSortEmptyGroupsToBottom = useCallback(() => {
    const plannerSettings = { ...settings.plannerSettings };
    plannerSettings.sortEmptyGroupsToBottom = !plannerSettings?.sortEmptyGroupsToBottom;

    setSettings((s) => ({ ...s, plannerSettings }));
    setAnchorEl(null);
  }, [settings, setSettings, setAnchorEl]);

  const groupedGoalsMemo = useMemo(() => {
    const sortedGroups = groups?.map((groupName, index) => {
      const sortedGoals = groupedGoals[groupName]?.sort((a, b) => a.sort_order - b.sort_order) || [];
      const inactiveOps = inactiveOpsInGroups[groupName] ?? [];

      const operatorGoals = sortedGoals.map((operatorGoal) => {
        const op = roster[operatorGoal.op_id] ?? defaultOperatorObject(operatorGoal.op_id, true);
        const plannerGoals = getPlannerGoals(operatorGoal, {
          ...op,
          ...operatorJson[operatorGoal.op_id],
        }).filter((g) => filter.filterFunction(g, depot, groupName, !inactiveOps.includes(g.operatorId)));

        return { operatorGoal, plannerGoals, substantial: plannerGoals.length > 0, operator: op };
      });
      const hasSubstantialGoals = operatorGoals.some((goal) => goal.substantial);

      return { groupName, index, operatorGoals, inactiveOps, hasSubstantialGoals };
    });

    if (settings.plannerSettings.sortEmptyGroupsToBottom) {
      sortedGroups?.sort((a, b) => {
        return a.hasSubstantialGoals === b.hasSubstantialGoals ? 0 : a.hasSubstantialGoals ? -1 : 1;
      });
    }
    return sortedGroups;
  }, [
    groups,
    groupedGoals,
    roster,
    filter,
    depot,
    inactiveOpsInGroups,
    settings.plannerSettings.sortEmptyGroupsToBottom,
  ]);

  const calculateCompletableStatus = useCallback(
    (plannerGoal: PlannerGoal) => {
      if (settings.plannerSettings.allowAllGoals) {
        return { completable: true, completableByCrafting: false };
      }

      const ingredients = getGoalIngredients(plannerGoal);
      const { craftableItems } = canCompleteByCrafting(
        Object.fromEntries(ingredients.map(({ quantity, id }) => [id, quantity])),
        depot,
        settings.depotSettings.crafting,
        settings.depotSettings.ignoreLmdInCrafting
      );

      const completableByCrafting = ingredients.every(
        ({ id, quantity }) =>
          (settings.depotSettings.ignoreLmdInCrafting && id === "4001") ||
          (id === "EXP" ? depotToExp(depot) : depot[id]?.stock) >= quantity ||
          craftableItems[id]
      );

      const completable = ingredients.every(
        ({ id, quantity }) =>
          (settings.depotSettings.ignoreLmdInCrafting && id === "4001") ||
          (id === "EXP" ? depotToExp(depot) : depot[id]?.stock) >= quantity
      );

      return { completable, completableByCrafting };
    },
    [settings, depot]
  );

  return (
    <>
      <Board
        title="Goals"
        TitleAction={
          <Box display="flex" gap={2}>
            <Button onClick={() => setAddGoalOpen(true)} startIcon={<AddIcon />} variant="contained" color="primary">
              New Goal
            </Button>
            <SettingsButton props={menuButtonProps} />
            <SettingsMenu props={menuProps}>
              <SettingsMenuItem onClick={handleAllowAllGoals} checked={settings.plannerSettings.allowAllGoals}>
                Allow completing goals unconditionally
              </SettingsMenuItem>
              <SettingsMenuItem
                onClick={handleSortEmptyGroupsToBottom}
                checked={settings.plannerSettings.sortEmptyGroupsToBottom}
              >
                Sort empty & excluded groups to bottom
              </SettingsMenuItem>
              <Divider />
              <MenuItem onClick={resetAllOpsInactivity}>
                <ListItemText inset>Enable all ops</ListItemText>
              </MenuItem>
              <MenuItem onClick={setAllOpsInactivity}>
                <ListItemText inset>Disable all ops</ListItemText>
              </MenuItem>
              <Divider>
                <Typography variant="caption" color="textSecondary">
                  non-local settings
                </Typography>
              </Divider>
              <MenuItem
                onClick={() => {
                  setReorderOpen(true);
                  setAnchorEl(null);
                }}
              >
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                Reorder groups and goals
              </MenuItem>
              <MenuItem
                onClick={() => {
                  if (goals && goals.length > 0) {
                    removeAllGoals();
                    resetAllOpsInactivity();
                  }
                  setAnchorEl(null);
                }}
              >
                <ListItemText inset sx={{ color: (theme) => theme.palette.error.light }}>
                  Clear all
                </ListItemText>
              </MenuItem>
            </SettingsMenu>
          </Box>
        }
        sx={{
          borderRadius: { xs: "0px 0px 4px 4px", md: "4px" },
          px: { xs: 1, md: 2 },
        }}
      >
        <Grid
          container
          columnGap={1}
          sx={{
            alignItems: "center",
          }}
        >
          <Grid>
            <IconButton size="large" onClick={() => setFilterOpen(true)}>
              <FilterAltOutlinedIcon fontSize="inherit" />
            </IconButton>
          </Grid>
          <Grid flexGrow="1">
            <TextField
              id="search"
              autoComplete="off"
              label="Filter with list of groups, ops..."
              value={filter.filters.search}
              onChange={(e) => filter.setFilters({ ...filter.filters, search: e.target.value })}
              size="small"
              fullWidth={true}
              slotProps={{
                input: {
                  sx: { pr: 0.5 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="submit"
                        aria-label="search"
                        onClick={(e) => {
                          e.preventDefault();
                          // search(searchText);
                        }}
                      >
                        <Search fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
        </Grid>
        {goals &&
          groups &&
          groupedGoalsMemo?.map(({ groupName, index, operatorGoals, inactiveOps }) => (
            <GoalGroup
              key={groupName}
              groupName={groupName}
              operatorGoals={groupedGoals[groupName]}
              removeAllGoalsFromGroup={() => {
                removeAllGoalsFromGroup(groupName);
                resetGroupInactivity(groupName);
              }}
              removeGroup={() => {
                removeGroup(groupName);
                removeAllGoalsFromGroup(groupName, true);
                resetGroupInactivity(groupName);
              }}
              defaultExpanded={index === 0}
              onRename={onGroupRename}
              inactiveOps={inactiveOps}
              onOpSelect={handleOpSelect}
              onGroupSelect={toggleGroupOpsInactivity}
              getCheckboxState={getGroupCheckboxState}
            >
              {operatorGoals.map(({ operatorGoal, plannerGoals, substantial, operator }) => (
                <Collapse in={substantial} key={operatorGoal.op_id}>
                  <OperatorGoals
                    key={operatorGoal.op_id}
                    operator={operator}
                    operatorGoal={operatorGoal}
                    onGoalEdit={onGoalEdit}
                    onGoalMove={onGoalMove}
                    removeAllGoalsFromOperator={removeAllGoalsFromOperator}
                    completeAllGoalsFromOperator={onPlannerGoalGroupCompleteAllGoals}
                    onOpSelect={handleOpSelect}
                  >
                    {plannerGoals.map((plannerGoal, index) => {
                      const { completable, completableByCrafting } = calculateCompletableStatus(plannerGoal);
                      return (
                        <PlannerGoalCard
                          key={index}
                          goal={plannerGoal}
                          groupName={groupName}
                          onGoalDeleted={onPlannerGoalCardGoalDeleted}
                          onGoalCompleted={onPlannerGoalCardGoalCompleted}
                          completable={completable}
                          completableByCrafting={completableByCrafting}
                        />
                      );
                    })}
                  </OperatorGoals>
                </Collapse>
              ))}
            </GoalGroup>
          ))}
      </Board>
      <PlannerGoalAdd
        open={addGoalOpen}
        onClose={() => {
          setAddGoalOpen(false);
          setOpId(undefined);
          setGroup(undefined);
        }}
        roster={roster}
        op_id={opId}
        group={group}
        goals={goals}
        goalGroups={groups}
        putGroup={putGroups}
        updateGoals={updateGoals}
      />
      <GoalReorderDialog
        open={reorderOpen}
        goals={goals}
        groups={groups}
        updateGoals={updateGoals}
        putGroups={putGroups}
        onClose={() => setReorderOpen(false)}
      />
      <ChangeGroupDialog
        open={moveId != null}
        onClose={() => setMoveId(undefined)}
        onSubmit={moveGoal}
        goalGroups={groups}
        valid={valid}
      />
      <RenameGroupDialog
        open={!!groupToRename}
        onClose={() => setGroupToRename(undefined)}
        onSubmit={(newGroupName) => {
          if (groupToRename) {
            renameGroup(groupToRename, newGroupName);
            changeLocalGoalGroup(groupToRename, newGroupName);
            renameInactivityGroup(groupToRename, newGroupName);
          }
        }}
        goalGroups={groups}
      />
      <GoalFilterDialog open={filterOpen} onClose={() => setFilterOpen(false)} {...filter} />
    </>
  );
};
export default PlannerGoals;
