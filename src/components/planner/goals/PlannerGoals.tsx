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
import GoalData, { getPlannerGoals, GoalDataInsert, plannerGoalToGoalData } from "types/goalData";
import _ from "lodash";
import { changeLevel, changePromotion, clamp, defaultOperatorObject, MAX_LEVEL_BY_RARITY } from "util/changeOperator";
import GoalReorderDialog from "./GoalReorderDialog";
import DepotItem from "types/depotItem";
import { Ingredient } from "types/item";
import { Operator } from "types/operators/operator";
import useGoalGroups from "util/hooks/useGoalGroups";
import applyGoalsToOperator from "util/fns/applyGoalsToOperator";
import getGoalIngredients from "util/getGoalIngredients";
import useOperators from "util/hooks/useOperators";
import OperatorGoals from "./OperatorGoals";
import PlannerGoalCard from "./PlannerGoalCard";

interface Props {
  goals: GoalData[];
  depot: Record<string, DepotItem>;
  setDepot: (depotItem: DepotItem[]) => void;
  updateGoals: (goalsData: GoalDataInsert[]) => void;
  removeAllGoals: () => void;
  removeAllGoalsFromGroup: (groupName: string) => void;
  removeAllGoalsFromOperator: (opId: string, groupName: string) => void;
}

const PlannerGoals = (props: Props) => {
  const { goals, depot, setDepot, updateGoals, removeAllGoals, removeAllGoalsFromGroup, removeAllGoalsFromOperator } =
    props;
  const { groups, putGroups, removeGroup } = useGoalGroups();
  const [roster] = useOperators();

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

      if (!goals) return;

      const goal = goals.find((x) => x.op_id === opId);
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
            const elite_from = _goal.elite_from ?? 0;
            const elite_to = _goal.elite_to ?? 0;
            if (removedElite === 2 && goal.elite_from === 0) {
              _goal.elite_to = 1;
            } else {
              _goal.elite_from = null;
              _goal.elite_to = null;
            }

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
          if (goal.level_from != null && goal.elite_to != null) {
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
              _goal.elite_from = null;
              _goal.elite_to = null;
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
              if (_goal.elite_to === plannerGoal.eliteLevel) {
                _goal.elite_from = null;
                _goal.elite_to = null;
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
            const removedMasteryLevel = plannerGoal.moduleLevel;

            if (removedMasteryLevel - 1 <= goal.modules_from[moduleId]) {
              _goal.modules_to[moduleId] = goal.modules_from[moduleId];
            } else {
              _goal.modules_to[moduleId] = removedMasteryLevel - 1;
            }

            if (_.isEqual(_goal.modules_to, goal.modules_from)) {
              _goal.modules_from = null;
              _goal.modules_to = null;
            }
          }
          break;
        case OperatorGoalCategory.SkillLevel:
          const newSkillLevel = plannerGoal.skillLevel - 1;

          if (newSkillLevel <= goal.skill_level_from!) {
            _goal.skill_level_from = null;
            _goal.skill_level_to = null;
          } else {
            _goal.skill_level_to = newSkillLevel;
          }
          break;
      }
      const { group_name, op_id, sort_order, ...rest } = _goal;
      if (Object.values(rest).every((x) => x == null)) {
        removeAllGoalsFromOperator(op_id, group_name);
      } else {
        updateGoals([_goal]);
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
    (plannerGoal: PlannerGoal, operator?: Operator) => {
      if (!operator) operator = defaultOperatorObject(plannerGoal.operatorId, true);
      const opId = plannerGoal.operatorId;
      const opData = operatorJson[opId];
      const goal = goals!.find((x) => x.op_id === operator.op_id)!;
      let _operator: Operator = { ...operator };
      let depotUpdate: DepotItem[] = [];

      const op = applyGoalsToOperator(plannerGoalToGoalData(plannerGoal), operator);

      const ingredients = getGoalIngredients(plannerGoal);
      console.log(ingredients);

      if (depotUpdate.length > 0) {
        // setDepot(depotUpdate);
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
        removeAllGoalsFromGroup={removeAllGoalsFromGroup}
        removeGroup={removeGroup}
        defaultExpanded={index == 0}
      >
        {groupedGoals[groupName]
          ?.sort((a, b) => a.sort_order - b.sort_order)
          .map((operatorGoal) => {
            return (
              <OperatorGoals
                key={operatorGoal.op_id}
                operator={roster[operatorGoal.op_id] ?? defaultOperatorObject(operatorGoal.op_id, true)}
                operatorGoal={operatorGoal}
                onGoalEdit={onGoalEdit}
                removeAllGoalsFromOperator={removeAllGoalsFromOperator}
              >
                {getPlannerGoals(operatorGoal, {
                  ...(roster[operatorGoal.op_id] ?? defaultOperatorObject(operatorGoal.op_id, true)),
                  ...operatorJson[operatorGoal.op_id],
                }).map((plannerGoal, index) => (
                  <PlannerGoalCard
                    key={index}
                    goal={plannerGoal}
                    onGoalDeleted={onPlannerGoalCardGoalDeleted}
                    onGoalCompleted={onPlannerGoalCardGoalCompleted}
                  />
                ))}
              </OperatorGoals>
            );
          })}
      </GoalGroup>
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
export default PlannerGoals;
