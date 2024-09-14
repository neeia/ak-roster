import ClearAllIcon from "@mui/icons-material/ClearAll";
import AddIcon from '@mui/icons-material/Add';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import {  Button, Grid, IconButton, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import { PlannerGoal } from "types/goal";
import { Search } from "@mui/icons-material";
import React, { useState } from "react";
import { useGoalsDeleteAllMutation, useGoalsGetQuery, useGoalsUpdateMutation } from "store/extendGoals";
import EditOperator from "../data/input/EditOperator";
import PlannerGoalAdd from "./PlannerGoalAdd";

const OperatorGoals: React.FC = () => {

  const {data: goals} = useGoalsGetQuery();
  const [goalsUpdateTrigger] = useGoalsUpdateMutation();
  const [goalsDeleteAllTrigger] = useGoalsDeleteAllMutation();

  const [addGoalOpen, setAddGoalOpen] = useState<boolean>(false);

  const handleGoalDeleted = (goal: PlannerGoal) => {
  };

  const handleGoalCompleted = (goal: PlannerGoal) => {

  };

  const handleClearAll = () => {
    if (goals && goals.length > 0)
    {
      goalsDeleteAllTrigger();
    }
  };

  const handleAddGoal = () => {
    setAddGoalOpen(true);
  }

  return (
    <section>
      <Paper
        sx={{
          mb: 1,
          p: 2,
        }}
      >
        <Grid container columnGap={1}
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
        >
          <Grid item xs={7}>
            <Typography component="h3" variant="h5">
              Goals
            </Typography>
          </Grid>
          <Grid item
          >
            <Button
              onClick={handleAddGoal}
              startIcon={< AddIcon/>}
              variant="contained"
              color="primary"
            >
              New Goal
            </Button>
          </Grid>
          <Grid item >
            <Button
              onClick={handleClearAll}
              startIcon={<ClearAllIcon />}
              variant="outlined"
              color="secondary"
            >
              Clear All
            </Button>
          </Grid>
        </Grid>
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
      </Paper>
      <PlannerGoalAdd
        open={addGoalOpen}
        onClose={() => setAddGoalOpen(false)}
      />
    </section>
  );
};
export default OperatorGoals;
