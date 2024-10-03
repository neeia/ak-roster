import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import Image from "next/image";
import AddCircleIcon from "@mui/icons-material/AddCircleOutlined";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircleOutlined";
import GoalData, { getGoalString, getPlannerGoals } from "../../types/goalData";
import PlannerGoalCard from "./PlannerGoalCard";
import React, { memo, useCallback, useState } from "react";
import { PlannerGoal } from "../../types/goal";
import operatorJson from "../../data/operators";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useGoalsOperatorDeleteMutation } from "../../store/extendGoals";

interface Props {
  operatorGoal: GoalData;
  onGoalDeleted : (plannerGoal: PlannerGoal) => void;
}

export const OperatorGoals = memo((props: Props) => {

  const {operatorGoal, onGoalDeleted} = props;

  const [expanded, setExpanded] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isMenuOpen = Boolean(anchorEl);

  const [goalsDeleteOneOperatorTrigger] = useGoalsOperatorDeleteMutation();

  const imgUrl = `/img/avatars/${operatorGoal.op_id}.png`;
  const opData = operatorJson[operatorGoal.op_id];

  const handleMoreButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  }, []);

  const handleMoreMenuClose = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnchorEl(null);
  }, []);

  const handleDeleteGoalsButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      handleMoreMenuClose(e);
      goalsDeleteOneOperatorTrigger(operatorGoal);
    },
    [goalsDeleteOneOperatorTrigger, handleMoreMenuClose, operatorGoal]
  );

  const handleCompleteGoalsButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      handleMoreMenuClose(e);
    },
    [handleMoreMenuClose]
  );

  return (
    <Accordion
      onChange={(_, expanded) => setExpanded(expanded)}
      sx={{
        backgroundColor: "background.default",
        mb: 2,
        "&:before": {
          display: "none",
        },
      }}
    >
      <AccordionSummary>
        <Box
          sx={{
            width: "stretch",
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gridTemplateRows: "1fr 1fr",
            columnGap: "20px",
            gridTemplateAreas: `
                        "opImage opName more"
                        "opImage goals more"`,
            alignItems: "end",
          }}
        >
          <Box sx={{ gridArea: "opImage", position: "relative", marginLeft: -4 }}>
            <Box sx={{ borderBottomLeftRadius: 25, overflow: "hidden" }} width={64} height={64}>
              <Image src={imgUrl} width={64} height={64} alt="" />
            </Box>
            {expanded ? <RemoveCircleIcon sx={{ position: "absolute", bottom: "-10px", left: "0" }} /> : <AddCircleIcon sx={{ position: "absolute", bottom: "-10px", left: "0" }} />}
          </Box>
          <Typography variant="h5" sx={{ gridArea: "opName" }}>
            {opData.name}
          </Typography>
          <Typography sx={{ gridArea: "goals" }}>{getGoalString(operatorGoal, opData)}</Typography>
          <IconButton sx={{ gridArea: "more", alignSelf: "center" }} onClick={handleMoreButtonClick}>
            <MoreHorizIcon />
          </IconButton>
          <Menu
            onClick={(e) => e.stopPropagation()}
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleMoreMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem>
              <Typography onClick={handleCompleteGoalsButtonClick} color="success">
                Complete all goals
              </Typography>
            </MenuItem>
            <MenuItem>
              <Typography onClick={handleDeleteGoalsButtonClick} color="error">
                Delete all goals
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: "0" }}>
        {getPlannerGoals(operatorGoal, opData).map((plannerGoal, index) => (
          <PlannerGoalCard key={index} goal={plannerGoal} onGoalDeleted={onGoalDeleted} onGoalCompleted={() => {}} />
        ))}
      </AccordionDetails>
    </Accordion>
  );
});
OperatorGoals.displayName = "OperatorGoals";
export default OperatorGoals