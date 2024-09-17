import { Grid } from "@mui/material";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import Layout from "components/Layout";
import { GoalsState } from "store/goalsSlice";
import { PlannerGoal } from "types/goal";
import * as lz from "util/lz-string";
import { DepotState } from "store/depotSlice";

const MaterialsNeeded = dynamic(() => import("components/planner/MaterialsNeeded"), {
  ssr: false
});
const PlannerGoals = dynamic(() => import("components/planner/PlannerGoals"), {
  ssr: false,
});

const Goals: NextPage = () => {

  const handleGoalsAdded = (newGoals: PlannerGoal[]) => {

  };

  function parseText(text: string) {
    try {
      const { goals, depot }: { goals: GoalsState, depot: DepotState } = JSON.parse(lz.decompressFromEncodedURIComponent(text) ?? "");
      Object.entries(depot.stock).forEach(([itemId, newQuantity]) => {
        //TODO set stock
      })
      Object.entries(depot.crafting).forEach(([itemId, isCrafting]) => {
        //TODO set crafting
      })
      //TODO add goals
    }
    catch (e) {
      console.log("Error while migrating planner data: " + e);
    }
  }

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
