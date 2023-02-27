import { Grid } from "@mui/material";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import { useState } from "react";

import GoalSelect from "components/planner/GoalSelect";
import Layout from "components/Layout";
import OperatorSearch from "components/planner/OperatorSearch";
import { OpJsonObj } from "types/operator";
import { useAppDispatch } from "store/hooks";
import { addGoals } from "store/goalsSlice";
import { PlannerGoal } from "types/goal";

const MaterialsNeeded = dynamic(
  () => import("components/planner/MaterialsNeeded"),
  { ssr: false }
);
const PlannerGoals = dynamic(() => import("components/planner/PlannerGoals"), {
  ssr: false,
});

const Goals: NextPage = () => {
  const [operator, setOperator] = useState<OpJsonObj | null>(null);
  const dispatch = useAppDispatch();

  const handleGoalsAdded = (newGoals: PlannerGoal[]) => {
    dispatch(addGoals(newGoals));
    setOperator(null);
  };

  return (
    <Layout tab="/planner" page="/goals">
      <Grid container mb={2}>
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            pr: {
              xs: 0,
              md: 1,
            },
          }}
        >
          <OperatorSearch
            value={operator}
            onChange={(newOp) => setOperator(newOp)}
          />
        </Grid>
        <Grid
          item
          xs={12}
          md={8}
          sx={{
            mt: {
              xs: 1,
              md: 0,
            },
          }}
        >
          <GoalSelect operator={operator} onGoalsAdded={handleGoalsAdded} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <MaterialsNeeded />
        </Grid>
        <Grid item xs={12} lg={5}>
          <PlannerGoals />
        </Grid>
      </Grid>
    </Layout>
  );
};
export default Goals;
