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
import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import useOperators from "util/useOperators";
import operatorsJson from "data/operators.json";

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
  const [operators, setOperators] = useOperators();

  const handleGoalsAdded = (newGoals: PlannerGoal[]) => {
    dispatch(addGoals(newGoals));
    setOperator(null);
  };

  const handleGoalComplete = (goal: PlannerGoal) => {
    setOperators((ops) => {
      const op = ops[goal.operatorId];
      const opData: OpJsonObj =
        operatorsJson[goal.operatorId as keyof typeof operatorsJson];
      switch (goal.category) {
        case OperatorGoalCategory.Elite:
          ops[goal.operatorId].promotion = Math.max(goal.eliteLevel, op.promotion);
          break;
        case OperatorGoalCategory.SkillLevel:
          ops[goal.operatorId].skillLevel = Math.max(goal.skillLevel, op.skillLevel);
          break;
        case OperatorGoalCategory.Mastery:
          const skillIndex = opData.skills.findIndex((sk) => sk.skillId === goal.skillId);
          ops[goal.operatorId].mastery[skillIndex] = Math.max(goal.masteryLevel, op.mastery[skillIndex]);
          break;
        case OperatorGoalCategory.Module:
          const moduleIndex = opData.modules.findIndex(
            (m) => m.moduleId === goal.moduleId
          )!;
          ops[goal.operatorId].module[moduleIndex] = Math.max(goal.moduleLevel, op.mastery[moduleIndex]);
          break;
      }
      return ops;
    })
  }

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
          <GoalSelect opData={operator && operators[operator.id]} operator={operator} onGoalsAdded={handleGoalsAdded} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <MaterialsNeeded />
        </Grid>
        <Grid item xs={12} lg={5}>
          <PlannerGoals onCompleteGoal={handleGoalComplete} />
        </Grid>
      </Grid>
    </Layout>
  );
};
export default Goals;
