import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";
import Image from "next/image";
import AddCircleIcon from "@mui/icons-material/AddCircleOutlined";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircleOutlined';
import GoalData, { getGoalString, getPlannerGoals } from "../../types/goalData";
import PlannerGoalCard from "./PlannerGoalCard";
import React, { memo, useState } from "react";
import { PlannerGoal } from "../../types/goal";
import operatorJson from "../../data/operators";

interface Props {
  operatorGoal: GoalData;
  onGoalDeleted : (plannerGoal: PlannerGoal) => void;
}

export const OperatorGoals = memo((props: Props) => {

  const {operatorGoal, onGoalDeleted} = props;

  const [expanded, setExpanded] = useState<boolean>(false);

  const imgUrl = `/img/avatars/${operatorGoal.op_id}.png`;
  const opData = operatorJson[operatorGoal.op_id];

  return (
    <Accordion onChange={(_, expanded) => setExpanded(expanded)} sx={{
      backgroundColor: "background.default",
      mb: 2,
      '&:before': {
      display: 'none',}
    }}>
      <AccordionSummary>
        <Box sx={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gridTemplateRows: "1fr 1fr",
          columnGap: "20px",
          gridTemplateAreas:`
                        "opImage opName"
                        "opImage goals"`,
          alignItems: "end",
        }}>
          <Box sx={{gridArea: "opImage", position: "relative", marginLeft: -4}}>
            <Box sx={{ borderBottomLeftRadius: 25, overflow: "hidden"}} width={64} height={64}>
              <Image src={imgUrl} width={64} height={64} alt="" />
            </Box>
            {
              expanded ?
                <RemoveCircleIcon sx={{position: "absolute", bottom: "-10px", left: "0"}}/>
                :
                <AddCircleIcon sx={{position: "absolute", bottom: "-10px", left: "0"}}/>
            }
          </Box>
          <Typography variant="h5" sx={{gridArea: "opName"}}>{opData.name}</Typography>
          <Typography sx={{gridArea: "goals"}}>{getGoalString(operatorGoal, opData)}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{padding: "0"}}>
        {
          getPlannerGoals(operatorGoal, opData).map((plannerGoal, index) => (
            <PlannerGoalCard key={index} goal={plannerGoal} onGoalDeleted={onGoalDeleted} onGoalCompleted={() => {}}/>
          ))
        }
      </AccordionDetails>
    </Accordion>
  );
});
OperatorGoals.displayName = "OperatorGoals";
export default OperatorGoals