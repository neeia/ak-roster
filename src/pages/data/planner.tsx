import { Grid } from "@mui/material";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import Layout from "components/Layout";
import { PlannerGoal } from "types/goal";

const MaterialsNeeded = dynamic(() => import("components/planner/MaterialsNeeded"), {
  ssr: false
});
const PlannerGoals = dynamic(() => import("components/planner/PlannerGoals"), {
  ssr: false,
});

const Goals: NextPage = () => {

  const handleGoalsAdded = (newGoals: PlannerGoal[]) => {

  };

  return (
    <Layout tab="/data" page="/planner">
      <Grid container mt={1} mb={1} spacing={4}>
        <Grid item xs={12} lg={6}>
          {/*<MaterialsNeeded />*/}
        </Grid>
        <Grid item xs={12} lg={6}>
          <PlannerGoals />
        </Grid>
      </Grid>
    </Layout>
  );
};
export default Goals;
