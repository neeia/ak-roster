import ClearAllIcon from "@mui/icons-material/ClearAll";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import { Button, Grid, IconButton, InputAdornment, TextField } from "@mui/material";
import { Search } from "@mui/icons-material";
import React, { useCallback, useState } from "react";
import {
  useGoalsDeleteAllMutation,
  useGoalsDeleteOneMutation,
  useGoalsGetQuery,
  useGoalsUpdateMutation,
} from "store/extendGoals";
import PlannerGoalAdd from "./PlannerGoalAdd";
import operatorJson from "../../data/operators";
import GoalGroup from "./GoalGroup";
import Board from "components/base/Board";

const OperatorGoals = () => {

  const { data: goals , isLoading: areGoalsLoading} = useGoalsGetQuery();
  const [goalsDeleteAllTrigger] = useGoalsDeleteAllMutation();
  const [goalsUpdateTrigger] = useGoalsUpdateMutation();
  const [goalsDeleteOneTrigger] = useGoalsDeleteOneMutation();

  const [addGoalOpen, setAddGoalOpen] = useState<boolean>(false);

  const onPlannerGoalCardGoalDeleted = useCallback((plannerGoal: PlannerGoal) => {
      const opId = plannerGoal.operatorId;
      const opData = operatorJson[opId];
      const goal = goals!.find(x => x.op_id === opId)!;
      const {user_id, ...goalUpdate} = goal;

      switch (plannerGoal.category) {
        case OperatorGoalCategory.Mastery:
          const skillId = plannerGoal.skillId;
          const skillIndex = opData.skillData?.findIndex(x => x.skillId === skillId)!;
          goalUpdate.masteries = [...goal.masteries!];
          goalUpdate.masteries![skillIndex] = 0;
          if (!goalUpdate.masteries!.some((x) => x > 0))
          {
            goalUpdate.masteries= null;
          }
          break;
        case OperatorGoalCategory.Module:
          const moduleId = plannerGoal.moduleId;
          const updatedModules : Record<string,number>= {}
          Object.entries(goalUpdate.modules!).forEach(([goalModuleId, goalModulevel]) => {
            if (goalModuleId != moduleId)
            {
              updatedModules[goalModuleId] = goalModulevel;
            }
          })
          goalUpdate.modules = updatedModules;
          if (Object.entries(updatedModules).length == 0)
          {
            goalUpdate.modules = null;
          }
          break;
        case OperatorGoalCategory.SkillLevel:
          goalUpdate.skill_level = null;
          break;
      }
    if (!goalUpdate.masteries && !goalUpdate.elite && !goalUpdate.modules && !goalUpdate.skill_level)
    {
      goalsDeleteOneTrigger(goalUpdate);
    }
      //TODO check if there are still goals left. if there aren't, delete the row
    goalsUpdateTrigger([goalUpdate]);
  }, [goals, goalsDeleteOneTrigger, goalsUpdateTrigger]);


  const handleClearAll = () => {
    if (goals && goals.length > 0) {
      goalsDeleteAllTrigger();
    }
  };

  const handleAddGoal = () => {
    setAddGoalOpen(true);
  }

  return (
    <>
      <Board title="Goals" TitleAction={
        <Button
          onClick={handleAddGoal}
          startIcon={< AddIcon />}
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
        <Grid container columnGap={1}
          sx={{
            alignItems: "center",
          }}>
          <Grid item >
            <IconButton size="large">
              <FilterAltOutlinedIcon fontSize="inherit" />
            </IconButton>
          </Grid>
          <Grid item flexGrow="1">
            <TextField id="search"
              autoComplete="off"
              label="Search..."
              // value={searchText}
              // onChange={(e) => setSearchText(e.target.value)}
              size="small"
              fullWidth={true}
              InputProps={{
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
                )
              }}
            />
          </Grid>
        </Grid>
          {!areGoalsLoading && goals && Object.entries(Object.groupBy(goals, goal => goal.group_name)).map(([groupName, operatorGoals]) =>(
            <GoalGroup key={groupName} groupName={groupName} operatorGoals={operatorGoals!} onGoalDeleted={onPlannerGoalCardGoalDeleted}/>
          ))}
      </Board>
      <PlannerGoalAdd
        open={addGoalOpen}
        onClose={() => setAddGoalOpen(false)}
      />
    </>
  );
};
export default OperatorGoals;
