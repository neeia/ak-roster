import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import { Box, Button, IconButton, InputAdornment, ListItemText, Menu, MenuItem, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Search } from "@mui/icons-material";
import React, { useCallback, useState } from "react";
import PlannerGoalAdd from "./PlannerGoalAdd";
import operatorJson from "data/operators";
import GoalGroup from "./GoalGroup";
import Board from "components/base/Board";
import GoalData, { GoalDataInsert } from "types/goalData";
import _ from "lodash";
import { MAX_LEVEL_BY_RARITY } from "util/changeOperator";
import GoalReorderDialog from "./GoalReorderDialog";
import DepotItem from "types/depotItem";
import { Ingredient } from "types/item";
import { Operator } from "types/operators/operator";
import useGoalGroups from "util/hooks/useGoalGroups";

interface Props {
  goals: GoalData[];
  depot: Record<string, DepotItem>;
  setDepot: (depotItem: DepotItem[]) => void;
  updateGoals: (goalsData: GoalDataInsert[]) => void;
  removeAllGoals: () => void;
  removeAllGoalsFromGroup: (groupName: string) => void;
  removeAllGoalsFromOperator: (opId: string, groupName: string) => void;
}

const OperatorGoals = (props: Props) => {
  const { goals, depot, setDepot, updateGoals, removeAllGoals, removeAllGoalsFromGroup, removeAllGoalsFromOperator } =
    props;
  const { groups, putGroups, removeGroup } = useGoalGroups();

  const [addGoalOpen, setAddGoalOpen] = useState<boolean>(false);
  const [opId, setOpId] = useState<string>();
  const [group, setGroup] = useState<string>();
  const [reorderOpen, setReorderOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isSettingsMenuOpen = Boolean(anchorEl);

  const onGoalEdit = (opId: string, groupName: string) => {
    setOpId(opId);
    setGroup(groupName);
    setAddGoalOpen(true);
  };

  const onPlannerGoalCardGoalDeleted = useCallback(
    (plannerGoal: PlannerGoal) => {
      const opId = plannerGoal.operatorId;
      const opData = operatorJson[opId];
      // TODO: There should probably be some sort of failsafe if goals is undefined  <-- groups is always defined in this point, otherwise you can't physically click the button
      const goal = goals!.find((x) => x.op_id === opId)!;

      const goalUpdate: GoalData = { ...goal };

      switch (plannerGoal.category) {
        case OperatorGoalCategory.Elite:
          const removedElite = plannerGoal.eliteLevel;
          const newMaxLevel = MAX_LEVEL_BY_RARITY[opData.rarity][Math.max(removedElite - 1, 0)];
          if (goal.elite_from! <= removedElite - 1) {
            if (goal.level_to) {
              goalUpdate.elite_from = goal.elite_from;
              goalUpdate.elite_to = goal.elite_from;
              if (newMaxLevel == goal.level_from) {
                goalUpdate.elite_from = null;
                goalUpdate.elite_to = null;
                goalUpdate.elite_from = null;
                goalUpdate.elite_to = null;
              } else {
                goalUpdate.level_to = Math.min(newMaxLevel, goal.level_to);
              }
            } else {
              goalUpdate.elite_from = null;
              goalUpdate.elite_to = null;
            }
          } else {
            goalUpdate.elite_to = removedElite - 1;
            if (goal.level_to) {
              if (newMaxLevel == goal.level_from) {
                goalUpdate.elite_from = null;
                goalUpdate.elite_to = null;
                goalUpdate.elite_from = null;
                goalUpdate.elite_to = null;
              } else {
                goalUpdate.level_to = Math.min(newMaxLevel, goal.level_to);
              }
            }
          }
          break;
        case OperatorGoalCategory.Level:
          const goalElite = plannerGoal.eliteLevel;
          if (goalElite == goal.elite_to) {
            if (goal.elite_to == goal.elite_from) {
              goalUpdate.level_from = null;
              goalUpdate.level_to = null;
              goalUpdate.elite_from = null;
              goalUpdate.elite_to = null;
            } else {
              goalUpdate.level_to = 1;
            }
          } else {
            //goalElite < goal.elite_to
            if (goalElite == goal.elite_from) {
              goalUpdate.level_from = null;
              goalUpdate.level_to = null;
              goalUpdate.elite_from = null;
              goalUpdate.elite_to = null;
            } else {
              goalUpdate.elite_to = goalElite;
              goalUpdate.level_to = 1;
            }
          }
          break;
        case OperatorGoalCategory.Mastery:
          const skillId = plannerGoal.skillId;
          const skillIndex = opData.skillData?.findIndex((x) => x.skillId === skillId)!;

          goalUpdate.masteries_to = [...goal.masteries_to!];
          const removedMastery = plannerGoal.masteryLevel;

          goalUpdate.masteries_to[skillIndex] = Math.max(removedMastery - 1, goal.masteries_from![skillIndex]);

          if (_.isEqual(goal.masteries_from, goalUpdate.masteries_to)) {
            goalUpdate.masteries_from = null;
            goalUpdate.masteries_to = null;
          }
          break;
        case OperatorGoalCategory.Module:
          const moduleId = plannerGoal.moduleId;

          const updatedModuleTo: Record<string, number> = {
            ...(goal.modules_to as Record<string, number>),
          };
          const removedMasteryLevel = plannerGoal.moduleLevel;

          if (removedMasteryLevel - 1 <= ((goal.modules_from as Record<string, number>)![moduleId] ?? 0)) {
            delete updatedModuleTo[moduleId];
          } else {
            updatedModuleTo[moduleId] = removedMasteryLevel - 1;
          }

          if (_.isEqual(updatedModuleTo, goal.modules_from)) {
            goalUpdate.modules_from = null;
            goalUpdate.modules_to = null;
          } else {
            goalUpdate.modules_to = updatedModuleTo;
          }
          break;
        case OperatorGoalCategory.SkillLevel:
          const removedSkillLevel = plannerGoal.skillLevel;

          if (removedSkillLevel - 1 <= goal.skill_level_from!) {
            goalUpdate.skill_level_from = null;
            goalUpdate.skill_level_to = null;
          } else {
            goalUpdate.skill_level_to = Math.max(removedSkillLevel - 1, goal.skill_level_from!);
          }
          break;
      }
      const { group_name, op_id, ...rest } = goalUpdate;
      if (Object.values(rest).every((x) => x == null)) {
        removeAllGoalsFromOperator(op_id, group_name);
      } else {
        updateGoals([goalUpdate]);
      }
    },
    [goals, updateGoals, removeAllGoalsFromOperator]
  );

  const getDepotUpdateFromIngredients = useCallback(
    (ingredients: Ingredient[]) => {
      const depotUpdate: DepotItem[] = [];

      const initial: Ingredient[] = [];
      const summedIngredient = ingredients
        .filter((x) => x.id != "4001")
        .reduce((acc, curr) => {
          let item = acc.find((item) => item.id === curr.id);

          if (item) {
            item.quantity += curr.quantity;
          } else {
            acc.push(curr);
          }

          return acc;
        }, initial);
      summedIngredient.forEach((ingredient) => {
        const ingredientUpdate: DepotItem = {
          material_id: ingredient.id,
          stock: Math.max(0, (depot![ingredient.id]?.stock ?? 0) - ingredient.quantity),
        };
        depotUpdate.push(ingredientUpdate);
      });
      return depotUpdate;
    },
    [depot]
  );

  const onPlannerGoalCardGoalCompleted = useCallback(
    (plannerGoal: PlannerGoal, operator: Operator) => {
      const opId = plannerGoal.operatorId;
      const opData = operatorJson[opId];
      const goal = goals!.find((x) => x.op_id === operator.op_id)!;
      const operatorUpdate: Operator = { ...operator };
      let depotUpdate: DepotItem[] = [];

      switch (plannerGoal.category) {
        case OperatorGoalCategory.Elite:
          const completedElite = plannerGoal.eliteLevel;
          operator.elite = completedElite;

          break;
        case OperatorGoalCategory.Level:
          const completedLevel = plannerGoal.toLevel;
          const eliteLevel = plannerGoal.eliteLevel;

          break;
        case OperatorGoalCategory.Mastery:
          const completedMasteryLevel = plannerGoal.masteryLevel;
          const skillId = plannerGoal.skillId;
          const skillIndex = opData.skillData?.findIndex((x) => x.skillId === skillId)!;
          const rosterOperatorMasteryLevel = operator.masteries?.[skillIndex] ?? 0;

          if (rosterOperatorMasteryLevel < completedMasteryLevel) {
            if (operatorUpdate.masteries) {
              operatorUpdate.masteries = [0, 0, 0];
            }
            operatorUpdate.masteries![skillIndex] = completedMasteryLevel;
            const masteryLevelStart = Math.max(goal.masteries_from![skillIndex], operator.masteries?.[skillIndex] ?? 0);
            const ingredients = opData
              .skillData![skillIndex].masteries.slice(masteryLevelStart, completedMasteryLevel)
              .flatMap((x) => x.ingredients);
            depotUpdate = depotUpdate.concat(getDepotUpdateFromIngredients(ingredients));

            //TODO add complete e2, SL7 requirements
          }
          break;
        case OperatorGoalCategory.Module:
          const completedModuleLevel = plannerGoal.moduleLevel;
          const moduleId = plannerGoal.moduleId;
          const rosterOperatorModuleLevel = operator.modules?.[moduleId] ?? 0;
          if (rosterOperatorModuleLevel < completedModuleLevel) {
            if (operatorUpdate.modules) {
              operatorUpdate.modules = {};
            }
            operatorUpdate.modules![moduleId] = completedModuleLevel;
            const moduleLevelStart = Math.max(
              (goal.modules_from as Record<string, number>)![moduleId],
              operator.modules?.[moduleId] ?? 0
            );
            const ingredients = opData
              .moduleData!.find((x) => x.moduleId === moduleId)!
              .stages.slice(moduleLevelStart, completedModuleLevel)
              .flatMap((x) => x.ingredients);
            depotUpdate = depotUpdate.concat(getDepotUpdateFromIngredients(ingredients));

            //TODO add complete e1, e2, min level requirements
          }
          break;
        case OperatorGoalCategory.SkillLevel:
          const completedSkillLevel = plannerGoal.skillLevel;
          if (operator.skill_level < completedSkillLevel) {
            const skillLevelStart = Math.max(goal.skill_level_from!, operator.skill_level);
            const ingredients = opData.skillLevels
              .slice(skillLevelStart, completedSkillLevel)
              .flatMap((x) => x.ingredients);
            depotUpdate = depotUpdate.concat(getDepotUpdateFromIngredients(ingredients));

            if (completedSkillLevel > 4) {
              //TODO add complete e1 requirement
            }
          }

          break;
      }
      if (depotUpdate.length > 0) {
        setDepot(depotUpdate);
      }
    },
    [getDepotUpdateFromIngredients, goals, setDepot]
  );

  const createGoalGroups = () => {
    const groupedGoals = Object.groupBy(goals!, (goal) => goal.group_name);
    return groups!.map((groupName, index) => (
      <GoalGroup
        key={groupName}
        groupName={groupName}
        operatorGoals={groupedGoals[groupName]}
        onGoalEdit={onGoalEdit}
        onGoalDeleted={onPlannerGoalCardGoalDeleted}
        onGoalCompleted={onPlannerGoalCardGoalCompleted}
        removeAllGoalsFromGroup={removeAllGoalsFromGroup}
        removeGroup={removeGroup}
        removeAllGoalsFromOperator={removeAllGoalsFromOperator}
        defaultExpanded={index == 0}
      />
    ));
  };

  const handleClearAll = () => {
    if (goals && goals.length > 0) {
      removeAllGoals();
    }
    setAnchorEl(null);
  };

  const handleAddGoal = () => {
    setAddGoalOpen(true);
  };

  const handleReorder = () => {
    setReorderOpen(true);
    setAnchorEl(null);
  };

  const handleSettingsMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleSettingsButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);

  return (
    <>
      <Board
        title="Goals"
        TitleAction={
          <Box display="flex" gap={2}>
            <Button onClick={handleAddGoal} startIcon={<AddIcon />} variant="contained" color="primary">
              New Goal
            </Button>
            <IconButton onClick={handleSettingsButtonClick}>
              <SettingsIcon />
            </IconButton>
            <Menu
              id="settings-menu"
              anchorEl={anchorEl}
              open={isSettingsMenuOpen}
              onClose={handleSettingsMenuClose}
              MenuListProps={{
                "aria-labelledby": "settings-button",
              }}
              hideBackdrop={false}
              slotProps={{
                root: {
                  slotProps: {
                    backdrop: {
                      invisible: false,
                    },
                  },
                },
              }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={handleReorder}>
                <ListItemText inset>Reorder groups and goals</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleClearAll}>
                <ListItemText inset sx={{ color: (theme) => theme.palette.error.light }}>
                  Clear all
                </ListItemText>
              </MenuItem>
            </Menu>
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
            <IconButton size="large">
              <FilterAltOutlinedIcon fontSize="inherit" />
            </IconButton>
          </Grid>
          <Grid flexGrow="1">
            <TextField
              id="search"
              autoComplete="off"
              label="Search..."
              // value={searchText}
              // onChange={(e) => setSearchText(e.target.value)}
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
        {goals && groups && createGoalGroups()}
      </Board>
      <PlannerGoalAdd
        open={addGoalOpen}
        onClose={() => {
          setAddGoalOpen(false);
          setOpId(undefined);
          setGroup(undefined);
        }}
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
    </>
  );
};
export default OperatorGoals;
