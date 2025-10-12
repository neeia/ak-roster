import { NextPage } from "next";
import dynamic from "next/dynamic";
import Layout from "components/Layout";
import useGoals from "util/hooks/useGoals";
import useDepot from "util/hooks/useDepot";
import { Box, BoxProps, Tab, Tabs } from "@mui/material";
import { useMemo, useState } from "react";
import useSettings from "util/hooks/useSettings";
import useGoalFilter from "util/hooks/useGoalFilter";
import { getPlannerGoals, GoalsFilteredCalculatedMap, plannerGoalToGoalData } from "types/goalData";
import useGoalGroups from "util/hooks/useGoalGroups";
import useOperators from "util/hooks/useOperators";
import { defaultOperatorObject } from "util/changeOperator";
import operatorJson from "data/operators";
import calculateCompletableStatus from "util/fns/planner/calculateCompletableStatus";
import { PlannerGoal, PlannerGoalCalculated } from "types/goal";
import _ from "lodash";
import useEvents from "util/hooks/useEvents";
import useEventsDefaults from "util/hooks/useEventsDefaults";
import { createEmptyNamedEvent, getTotalMaterialsUptoSelectedEvent } from "util/fns/eventUtils";
import { NamedEvent } from "types/events";
import { cloneCompleteDepot } from "util/fns/depot/itemUtils";
import applyGoalsToOperator from "util/fns/planner/applyGoalsToOperator";
import { checkPlannerGoalRequirements } from "util/fns/planner/checkPlannerGoalRequirements";
import Roster from "types/operators/roster";

interface TabPanelProps extends BoxProps {
  index: number;
  value: number;
  component?: string;
}
function TabPanel(props: TabPanelProps) {
  const { children, value, index, sx, ...rest } = props;

  return (
    <Box
      role="tabpanel"
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      sx={{
        width: "100%",
        display: { xs: value !== index ? "none" : "block", md: "block" },
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`,
  };
}

const MaterialsNeeded = dynamic(() => import("components/planner/depot/MaterialsNeeded"), {
  ssr: false,
});
const PlannerGoals = dynamic(() => import("components/planner/goals/PlannerGoals"), {
  ssr: false,
});

const Goals: NextPage = () => {
  const [depot, putDepot, resetDepot, depotIsUnsaved, refreshDepotDebounce] = useDepot();

  const [value, setValue] = useState(1);
  const [settings, setSettings] = useSettings();

  const filtersHook = useGoalFilter();
  const goalsHook = useGoals();
  const groupsHook = useGoalGroups();

  const [roster, onChange] = useOperators();

  const eventsHook = useEvents();
  const eventsDefaultsHook = useEventsDefaults();
  const [selectedEvent, setSelectedEvent] = useState<NamedEvent>(createEmptyNamedEvent());

  //calculate + filter for MaterialsNeeded and PlannerGoals, once at top level 
  const upcomingEventsSource = useMemo(() => {
    return Object.keys(eventsHook.eventsData ?? {}).length > 0 ? eventsHook.eventsData : eventsDefaultsHook.trackerDefaults?.eventsData ?? {}
  }, [eventsHook.eventsData, eventsDefaultsHook.trackerDefaults])

  const upcomingMaterialsData = useMemo(() => {
    return getTotalMaterialsUptoSelectedEvent(upcomingEventsSource, selectedEvent);
  }, [upcomingEventsSource, selectedEvent]);

  const groupedGoals = useMemo(() => _.groupBy(goalsHook.goals, (goal) => goal.group_name), [goalsHook.goals]);

  const groupedCalculatedGoals: GoalsFilteredCalculatedMap = useMemo(() => {

    //0. clone depot & json & add upcoming mats if event is selected
    let runningDepot = cloneCompleteDepot(depot, upcomingMaterialsData.materials);
    const runningRoster: Roster = {};

    //+goalGroups level
    const sortedGroups = groupsHook.groups?.map((groupName, index) => {
      const sortedGoals = groupedGoals[groupName]?.sort((a, b) => a.sort_order - b.sort_order) || [];
      const inactiveOps = settings.plannerSettings?.inactiveOpsInGroups?.[groupName] ?? [];

      //+operatorGoals level
      const operatorGoals = sortedGoals.map((operatorGoal) => {
        const op = roster[operatorGoal.op_id] ?? defaultOperatorObject(operatorGoal.op_id, true);

        const plannerGoalsRaw = getPlannerGoals(operatorGoal, {
          ...op,
          ...operatorJson[operatorGoal.op_id],
        })
          //filter visible ops/groups
          .filter((g) => filtersHook.filterFunction.byOperatorsAndGroups(g, groupName, settings))
          .sort((a, b) => a.sort_order_upgrade - b.sort_order_upgrade);

        //+plannerGoals level 
        const { plannerGoals, plannerGoalsDisabled } = plannerGoalsRaw.reduce((acc, plannerGoal) => {
          if (!runningRoster[plannerGoal.operatorId]) {
            runningRoster[plannerGoal.operatorId] = structuredClone(op);
          }
          let opAfter = runningRoster[operatorGoal.op_id];
          let requirementsNotMet = false;
          if (settings?.plannerSettings?.calculateGoalsInOrder ?? true) {
            requirementsNotMet = !checkPlannerGoalRequirements(plannerGoal, opAfter);
          }

          //apply goal to runningDepot
          const { completable, completableByCrafting, depot: depotAfter, ingredients } =
            calculateCompletableStatus(plannerGoal, runningDepot, settings);

          //apply goal to runningOp
          if (!requirementsNotMet && (completable || completableByCrafting)) {
            opAfter = applyGoalsToOperator(plannerGoalToGoalData(plannerGoal), opAfter);
          }

          //keep temp results only when ordered setting
          if ((settings?.plannerSettings?.calculateGoalsInOrder ?? true) && !requirementsNotMet) {
            runningDepot = depotAfter;
            runningRoster[operatorGoal.op_id] = opAfter;
          }

          const plannerGoalCalculated = { ...plannerGoal, completable, completableByCrafting, requirementsNotMet, ingredients };
          if (filtersHook.filterFunction.byGoalAndMaterials(plannerGoalCalculated, settings, runningDepot)) {
            acc.plannerGoals.push(plannerGoalCalculated);
          } else {
            acc.plannerGoalsDisabled.push(plannerGoalCalculated);
          }
          return acc;
        }, { plannerGoals: [], plannerGoalsDisabled: [] } as {
          plannerGoals: PlannerGoalCalculated[],
          plannerGoalsDisabled: PlannerGoalCalculated[],
        });
        //-return plannerGoals

        const completable = !inactiveOps.includes(op.op_id)
          && plannerGoals.every((g) => g.completable)
          && plannerGoalsDisabled.every((g) => g.completable);
        const completableByCrafting = !inactiveOps.includes(op.op_id)
          && !completable
          && plannerGoals.every((g) => g.completable || g.completableByCrafting)
          && plannerGoalsDisabled.every((g) => g.completable || g.completableByCrafting);

        return {
          operatorGoal,
          plannerGoals: plannerGoals.sort((a, b) => a.sort_order - b.sort_order),
          substantial: plannerGoals.length > 0,
          operator: op,
          completable, completableByCrafting
        };
        //-return operatorGoals
      });
      const hasSubstantialGoals = operatorGoals.some((goal) => goal.substantial);

      const completableOperators = operatorGoals
        .filter((og) => og.completable)
        .map((og) => og.operator.op_id);
      const completableByCraftingOperators = operatorGoals
        .filter((og) => og.completableByCrafting)
        .map((og) => og.operator.op_id);

      return { groupName, index, operatorGoals, inactiveOps, hasSubstantialGoals, completableOperators, completableByCraftingOperators };
      //-return goalGroups
    });

    if (settings.plannerSettings.sortEmptyGroupsToBottom) {
      sortedGroups?.sort((a, b) => {
        return a.hasSubstantialGoals === b.hasSubstantialGoals ? 0 : a.hasSubstantialGoals ? -1 : 1;
      });
    }
    return sortedGroups;
  }, [groupsHook, groupedGoals, roster, filtersHook, depot, settings, upcomingMaterialsData.materials]);

  const plannerGoals: PlannerGoal[] = useMemo(() => groupedCalculatedGoals.flatMap(group =>
    group.operatorGoals.flatMap(opGoal => opGoal.plannerGoals)
  ), [groupedCalculatedGoals]);

  const handleChange = (_: any, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Layout tab="/data" page="/planner">
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="tab menu"
        variant="fullWidth"
        sx={{ width: "100%", display: { md: "none" }, minWidth: "410px" }}
      >
        <Tab value={1} label={!depotIsUnsaved ? "Depot" : "↑ Depot ↑"} {...a11yProps(1)}></Tab>
        <Tab value={2} label="Goals" {...a11yProps(2)}></Tab>
      </Tabs>
      <Box sx={{
        display: { xs: "flex", md: "grid" }, gridTemplateColumns: "1fr min(540px,49%);", gap: 5,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: depotIsUnsaved ? "#FFD440" : "transparent",
      }}>
        <TabPanel index={1} value={value}>
          <MaterialsNeeded
            goals={plannerGoals}
            goalData={goalsHook.goals}
            depot={depot}
            putDepot={putDepot}
            resetDepot={resetDepot}
            settings={settings}
            setSettings={setSettings}
            depotIsUnsaved={depotIsUnsaved}
            refreshDepotDebounce={refreshDepotDebounce}
            upcomingMaterialsData={upcomingMaterialsData}
            selectedEvent={selectedEvent}
            setSelectedEvent={setSelectedEvent}
            groupedGoalsMap={groupedCalculatedGoals}
            {...eventsHook}
            {...eventsDefaultsHook}
          />
        </TabPanel>
        <TabPanel index={2} value={value}>
          <PlannerGoals
            depot={depot}
            setDepot={putDepot}
            settings={settings}
            setSettings={setSettings}
            groupedGoals={groupedGoals}
            groupedGoalsMap={groupedCalculatedGoals}
            roster={roster}
            onChange={onChange}
            {...filtersHook}
            {...groupsHook}
            {...goalsHook}
          />
        </TabPanel>
      </Box>
    </Layout>
  );
};
export default Goals;
