import Grid from "@mui/material/Grid2";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import Layout from "components/Layout";
import useGoals from "../../util/hooks/useGoals";
import useDepot from "../../util/hooks/useDepot";

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
  const [depot, setDepot] = useDepot();
  const [goals, updateGoals, removeAllGoals, removeAllGoalsFromGroup, removeAllGoalsFromOperator] = useGoals();

  return (
    <Layout tab="/data" page="/planner">
      <Grid container mt={1} mb={1} spacing={4}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <MaterialsNeeded goals={goals} depot={depot} setDepot={setDepot} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <PlannerGoals
            goals={goals}
            depot={depot}
            setDepot={setDepot}
            updateGoals={updateGoals}
            removeAllGoals={removeAllGoals}
            removeAllGoalsFromGroup={removeAllGoalsFromGroup}
            removeAllGoalsFromOperator={removeAllGoalsFromOperator}
          />
        </Grid>
      </Grid>
    </Layout>
  );
};
export default Goals;
