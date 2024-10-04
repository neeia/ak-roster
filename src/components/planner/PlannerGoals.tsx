import ClearAllIcon from "@mui/icons-material/ClearAll";
import AddIcon from "@mui/icons-material/Add";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import { Button, IconButton, InputAdornment, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Search } from "@mui/icons-material";
import React, { useCallback, useState } from "react";
import {
  useGoalsDeleteAllMutation,
  useGoalsGetQuery,
  useGoalsOperatorDeleteMutation,
  useGoalsUpdateMutation,
} from "store/extendGoals";
import PlannerGoalAdd from "./PlannerGoalAdd";
import operatorJson from "data/operators";
import GoalGroup from "./GoalGroup";
import Board from "components/base/Board";
import { useGroupsGetQuery } from "store/extendGroups";
import { GoalDataInsert } from "../../types/goalData";
import _ from "lodash";
import { MAX_LEVEL_BY_RARITY } from "../../util/changeOperator";

const OperatorGoals = () => {
  const { data: goals } = useGoalsGetQuery();
  const { data: groups } = useGroupsGetQuery();
  const [goalsDeleteAllTrigger] = useGoalsDeleteAllMutation();
  const [goalsUpdateTrigger] = useGoalsUpdateMutation();
  const [goalsDeleteOneOperatorTrigger] = useGoalsOperatorDeleteMutation();

  const [addGoalOpen, setAddGoalOpen] = useState<boolean>(false);

  const onPlannerGoalCardGoalDeleted = useCallback(
    (plannerGoal: PlannerGoal) => {
      const opId = plannerGoal.operatorId;
      const opData = operatorJson[opId];
      // TODO: There should probably be some sort of failsafe if goals is undefined  <-- groups is always defined in this point, otherwise you can't physically click the button
      const goal = goals!.find((x) => x.op_id === opId)!;

      const goalUpdate: GoalDataInsert = { ..._.omit(goal, "user_id") };

      switch (plannerGoal.category) {
        case OperatorGoalCategory.Elite:
          const removedElite = plannerGoal.eliteLevel;
          const newMaxLevel =
            MAX_LEVEL_BY_RARITY[opData.rarity][Math.max(removedElite - 1, 0)];
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
          const skillIndex = opData.skillData?.findIndex(
            (x) => x.skillId === skillId
          )!;

          goalUpdate.masteries_to = [...goal.masteries_to!];
          const removedMastery = plannerGoal.masteryLevel;

          goalUpdate.masteries_to[skillIndex] = Math.max(
            removedMastery - 1,
            goal.masteries_from![skillIndex]
          );

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

          if (
            removedMasteryLevel - 1 <=
            ((goal.modules_from as Record<string, number>)![moduleId] ?? 0)
          ) {
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
            goalUpdate.skill_level_to = Math.max(
              removedSkillLevel - 1,
              goal.skill_level_from!
            );
          }
          break;
      }
      const { group_name, op_id, ...rest } = goalUpdate;
      if (Object.values(rest).every((x) => x == null)) {
        goalsDeleteOneOperatorTrigger(goalUpdate);
      } else {
        goalsUpdateTrigger([goalUpdate]);
      }
    },
    [goals, goalsDeleteOneOperatorTrigger, goalsUpdateTrigger]
  );

  const createGoalGroups = () => {
    const groupedGoals = Object.groupBy(goals!, (goal) => goal.group_name);
    return groups!.map((groupName, index) => (
      <GoalGroup
        key={groupName}
        groupName={groupName}
        operatorGoals={groupedGoals[groupName]}
        onGoalDeleted={onPlannerGoalCardGoalDeleted}
        defaultExpanded={index == 0}
      />
    ));
  };

  const handleClearAll = () => {
    if (goals && goals.length > 0) {
      goalsDeleteAllTrigger();
    }
  };

  const handleAddGoal = () => {
    setAddGoalOpen(true);
  };

  return (
    <>
      <Board
        title="Goals"
        TitleAction={
          <Button
            onClick={handleAddGoal}
            startIcon={<AddIcon />}
            variant="contained"
            color="primary"
          >
            New Goal
          </Button>
        }
        sx={{
          mb: 1,
          p: 2,
        }}
      >
        {/* TODO: add settings button, move clear all to there w/ confirmation dialog */}
        <Button
          onClick={handleClearAll}
          startIcon={<ClearAllIcon />}
          variant="outlined"
          color="error"
        >
          Clear All
        </Button>
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
        onClose={() => setAddGoalOpen(false)}
        goals={goals}
      />
    </>
  );
};
export default OperatorGoals;
