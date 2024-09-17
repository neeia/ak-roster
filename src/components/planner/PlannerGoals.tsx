import ClearAllIcon from "@mui/icons-material/ClearAll";
import AddIcon from '@mui/icons-material/Add';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { Button, Grid, IconButton, InputAdornment, TextField } from "@mui/material";
import { PlannerGoal } from "types/goal";
import { Search } from "@mui/icons-material";
import React, { useState } from "react";
import { useGoalsDeleteAllMutation, useGoalsGetQuery, useGoalsUpdateMutation } from "store/extendGoals";
import PlannerGoalAdd from "./PlannerGoalAdd";
import Board from "components/base/Board";

const OperatorGoals = () => {

  const { data: goals } = useGoalsGetQuery();
  const [goalsUpdateTrigger] = useGoalsUpdateMutation();
  const [goalsDeleteAllTrigger] = useGoalsDeleteAllMutation();

  const [addGoalOpen, setAddGoalOpen] = useState<boolean>(false);

  const handleGoalDeleted = (goal: PlannerGoal) => {
  };

  const handleGoalCompleted = (goal: PlannerGoal) => {

  };

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
      </Board>
      <PlannerGoalAdd
        open={addGoalOpen}
        onClose={() => setAddGoalOpen(false)}
      />
    </>
  );
};
export default OperatorGoals;
