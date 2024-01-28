import {Grid, Select, MenuItem, InputLabel, FormControl, SelectChangeEvent} from "@mui/material";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import GoalSelect from "components/planner/GoalSelect";
import Layout from "components/Layout";
import OperatorSearch from "components/planner/OperatorSearch";
import { OpJsonObj } from "types/operator";
import { useAppDispatch, useAppSelector} from "store/hooks";
import { addGoals, GoalsState, selectGoals} from "store/goalsSlice";
import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import useOperators from "util/useOperators";
import operatorsJson from "data/operators.json";
import { useRouter } from "next/router";
import * as lz from "util/lz-string";
import { DepotState, setCrafting, setStock } from "store/depotSlice";
import { captureMessage } from "@sentry/nextjs";
import ExportImportDialog from "../../components/planner/ExportImportDialog";

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
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

  const goals = useAppSelector(selectGoals);

  const handleGoalsAdded = (newGoals: PlannerGoal[]) => {
    dispatch(addGoals(newGoals));
    setOperator(null);
  };

  function parseText(text: string) {
    try {
      const { goals, depot }: { goals: GoalsState, depot: DepotState } = JSON.parse(lz.decompressFromEncodedURIComponent(text) ?? "");
      Object.entries(depot.stock).forEach(([itemId, newQuantity]) => {
        dispatch(setStock({ itemId, newQuantity }));
      })
      Object.entries(depot.crafting).forEach(([itemId, isCrafting]) => {
        dispatch(setCrafting({ itemId, isCrafting }))
      })
      dispatch(addGoals(goals));
    }
    catch (e) {
      captureMessage("Error while migrating planner data: " + e);
    }
  }

  const router = useRouter();
  useEffect(() => {
    if (router.query.migrate && !Array.isArray(router.query.migrate)) {
      const data = router.query.migrate;
      router.replace('/planner/goals', undefined, { shallow: true });
      parseText(data);
    }
  }, [router])

  const handleGoalComplete = (goal: PlannerGoal) => {
    setOperators((ops) => {
      const op = ops[goal.operatorId];
      const opData: OpJsonObj =
        operatorsJson[goal.operatorId as keyof typeof operatorsJson];
      switch (goal.category) {
        case OperatorGoalCategory.Elite:
          const prevPromotion = ops[goal.operatorId].promotion;
          ops[goal.operatorId].promotion = Math.max(goal.eliteLevel, op.promotion);
          // reset Operator level
          if (goal.eliteLevel > prevPromotion) {
            ops[goal.operatorId].level = 1;
          }
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

  const handlePriorityChange = (e: SelectChangeEvent<string[]>) => {
    const newPriorities = e.target.value;
    setSelectedPriorities([...newPriorities]);
  };

  const renderOptions = () =>
  {
    return [... new Set([...goals].sort((a,b) => Number(a.priority) - Number(b.priority)).map(x => x.priority))]
        .map(x => (
            <MenuItem key={x} value={x}>
              <em>{x}</em>
            </MenuItem>
        ));
  }

  return (
    <Layout tab="/planner" page="/goals">
      <Grid container mt={1} mb={2}>
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
          <GoalSelect op={operator && operators[operator.id]} opData={operator} onGoalsAdded={handleGoalsAdded} />
        </Grid>
      </Grid>
      <Grid container mt={1} mb={2}>
        <Grid  item
               xs={12}
               md={4}
               sx={{
                 pr: {
                   xs: 0,
                   md: 1,
                 },
               }}>
          <FormControl fullWidth>
            <InputLabel id="priority-filter-label">Filter by priority</InputLabel>
            <Select
                id="priority-filter"
                name="priority-filter"
                labelId="priority-filter-label"
                label="Filter by priority"
                fullWidth
                multiple
                value={selectedPriorities}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  sx: { "& .MuiList-root": { mr: "25px", width: "100%" } },
                }}
                renderValue={(selected) => {
                    return "Priorities: " + selected.sort((a,b) => Number(a)-Number(b)).join(', ');
                }}
                onChange={handlePriorityChange}
            >
              {renderOptions()}
            </Select>
          </FormControl>
        </Grid>
        <Grid item
              xs={12}
              md={4}
              sx={{
                pr: {
                  xs: 0,
                  md: 1,
                },
              }}>
          <ExportImportDialog/>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <MaterialsNeeded priorityList={selectedPriorities}/>
        </Grid>
        <Grid item xs={12} lg={5}>
          <PlannerGoals onCompleteGoal={handleGoalComplete} priorityList={selectedPriorities} />
        </Grid>
      </Grid>
    </Layout>
  );
};
export default Goals;
