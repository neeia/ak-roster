import Grid from "@mui/material/Grid2";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import Layout from "components/Layout";

const MaterialsNeeded = dynamic(
  () => import("components/planner/MaterialsNeeded"),
  {
    ssr: false,
  }
);
const PlannerGoals = dynamic(() => import("components/planner/PlannerGoals"), {
  ssr: false,
});

const Goals: NextPage = () => {
  return (
    <Layout tab="/data" page="/planner">
      <Grid container mt={1} mb={1} spacing={4}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <MaterialsNeeded />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <PlannerGoals />
        </Grid>
      </Grid>
    </Layout>
  );
};
export default Goals;
