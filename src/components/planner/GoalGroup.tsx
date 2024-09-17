import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Image from "next/image";
import PlannerGoalCard from "./PlannerGoalCard";
import React, { memo, useCallback, useState } from "react";
import operatorJson from "../../data/operators";
import GoalData, { getGoalString, getPlannerGoals } from "../../types/goalData";
import { OperatorData } from "../../types/operator";
import { OperatorGoalCategory, PlannerGoal } from "../../types/goal";

interface Props {
  operatorGoals: GoalData[];
  groupName: string;
  onGoalDeleted : (plannerGoal: PlannerGoal) => void;
}

const GoalGroup = memo((props : Props) => {
  const {operatorGoals, groupName, onGoalDeleted} = props;

  const [expanded, setExpanded] = useState<boolean>(true);

  return (
    <Accordion onChange={(_, expanded) => setExpanded(expanded)} sx={{mt: "20px"}} disableGutters elevation={0} defaultExpanded>
      <AccordionSummary>
        <Box sx={{display: "flex", flexDirection: "column", width: "100%"}}>
          <Box sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            mb: 2,
          }}>
            <IconButton>
              <MoreHorizIcon/>
            </IconButton>
            <Typography textAlign="center" variant="h5" sx={{flexGrow: "1"}}>{groupName}</Typography>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
          {!expanded &&
            <Box sx={{
              display: "flex",
              flexDirection: "row",
              backgroundColor: "background.default",
              padding: 2,
            }}>
              {
                operatorGoals.map((operatorGoal) => {
              const imgUrl = `/img/avatars/${operatorGoal.op_id}.png`;
              return (<Box sx={{"&:not(:first-of-type)": { marginLeft: -2 },}} key={operatorGoal.op_id}>
                        <Image src={imgUrl} width={64} height={64} alt=""/>
                      </Box>)
              })}
            </Box>
          }
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {
          operatorGoals && operatorGoals.map((operatorGoal) => {
           const imgUrl = `/img/avatars/${operatorGoal.op_id}.png`;
           const opData = operatorJson[operatorGoal.op_id];

            return (
              <Accordion key={operatorGoal.op_id} sx={{
                backgroundColor: "background.default",
                mb: 2,
              }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
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
                    <Box sx={{gridArea: "opImage"}}>
                      <Image src={imgUrl} width={64} height={64} alt="" />
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
            )})}
      </AccordionDetails>
    </Accordion>

  );
});
GoalGroup.displayName = "GoalGroup";
export default GoalGroup;