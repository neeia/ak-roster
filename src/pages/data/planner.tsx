import { NextPage } from "next";
import dynamic from "next/dynamic";
import Layout from "components/Layout";
import useGoals from "util/hooks/useGoals";
import useDepot from "util/hooks/useDepot";
import { Box, BoxProps, Tab, Tabs } from "@mui/material";
import { useState } from "react";

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
  const [depot, putDepot] = useDepot();
  const { goals, updateGoals, removeAllGoals, removeAllGoalsFromGroup, removeAllGoalsFromOperator } = useGoals();
  const [value, setValue] = useState(1);

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
        sx={{ width: "100%", display: { md: "none" } }}
      >
        <Tab value={1} label="Depot" {...a11yProps(1)}></Tab>
        <Tab value={2} label="Goals" {...a11yProps(2)}></Tab>
      </Tabs>
      <Box sx={{ display: { xs: "flex", md: "grid" }, gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <TabPanel index={1} value={value}>
          <MaterialsNeeded goals={goals} depot={depot} putDepot={putDepot} />
        </TabPanel>
        <TabPanel index={2} value={value}>
          <PlannerGoals
            goals={goals}
            depot={depot}
            setDepot={putDepot}
            updateGoals={updateGoals}
            removeAllGoals={removeAllGoals}
            removeAllGoalsFromGroup={removeAllGoalsFromGroup}
            removeAllGoalsFromOperator={removeAllGoalsFromOperator}
          />
        </TabPanel>
      </Box>
    </Layout>
  );
};
export default Goals;
