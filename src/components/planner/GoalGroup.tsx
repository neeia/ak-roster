import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box, Button,
  Dialog, DialogActions, DialogContent,
  DialogTitle,
  IconButton, Menu, MenuItem,
  Typography,
} from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Image from "next/image";
import PlannerGoalCard from "./PlannerGoalCard";
import React, { memo, useCallback, useState } from "react";
import operatorJson from "../../data/operators";
import GoalData, { getGoalString, getPlannerGoals } from "../../types/goalData";
import { PlannerGoal } from "../../types/goal";
import { OperatorGoals } from "./OperatorGoals";
import { useGoalsDeleteAllFromGroupMutation } from "../../store/extendGoals";
import { useGroupsDeleteMutation } from "../../store/extendGroups";

interface Props {
  operatorGoals: GoalData[] | undefined;
  groupName: string;
  onGoalDeleted : (plannerGoal: PlannerGoal) => void;
  defaultExpanded: boolean;
}

const GoalGroup = memo((props : Props) => {
  const {operatorGoals, groupName, onGoalDeleted, defaultExpanded} = props;

  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);
  const [deleteGroupGoalsOpen, setDeleteGroupGoalsOpen] = useState<boolean>(false);
  const [deleteGroupOpen, setDeleteGroupOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isMenuOpen = Boolean(anchorEl);

  const [goalsDeleteAllFromGroupTrigger] = useGoalsDeleteAllFromGroupMutation();
  const [groupsDeleteTrigger] = useGroupsDeleteMutation();

  const onDeleteFromGroupsClick = useCallback(() => {
    goalsDeleteAllFromGroupTrigger(groupName);
    setDeleteGroupGoalsOpen(false);
  }, [goalsDeleteAllFromGroupTrigger, groupName]);

  const onDeleteGroupClick = useCallback(() => {
    groupsDeleteTrigger(groupName)
    setDeleteGroupGoalsOpen(false);
  }, [groupName, groupsDeleteTrigger]);

  const handleMoreButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setAnchorEl(e.currentTarget);
    },
    []
  );

  const handleMoreMenuClose = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnchorEl(null);
  }, []);

  const handleDeleteGroupButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    handleMoreMenuClose(e)
    setDeleteGroupOpen(true);
  }, [handleMoreMenuClose]);

  const handleDeleteGroupGoalsButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    handleMoreMenuClose(e)
    setDeleteGroupGoalsOpen(true)
  }, [handleMoreMenuClose]);

  return (
    <>
      <Accordion onChange={(_, expanded) => setExpanded(expanded)} disableGutters elevation={0} defaultExpanded={defaultExpanded} sx={{ '&:before': {
          display: 'none',
        }}}>
        <AccordionSummary>
          <Box sx={{display: "flex", flexDirection: "column", width: "100%",
           }}>
            <Box sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}>
              <IconButton

                id="more-button"
                onClick={handleMoreButtonClick}>
                <MoreHorizIcon/>
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
                <MenuItem disabled={!operatorGoals}>
                  <Typography onClick={handleDeleteGroupGoalsButtonClick} color={theme => theme.palette.error.light}>Delete goals</Typography>
                </MenuItem>
                <MenuItem disabled={groupName == "Default"}>
                  <Typography onClick={handleDeleteGroupButtonClick} color={theme => theme.palette.error.light}>Delete group</Typography>
                </MenuItem>
              </Menu>
              <Typography textAlign="center" variant="h5" sx={{flexGrow: "1"}}>{groupName}</Typography>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            {!expanded && operatorGoals &&
              <Box sx={{
                display: "flex",
                flexDirection: "row",
                backgroundColor: "background.default",
                padding: 1,
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
              return (
                <OperatorGoals key={operatorGoal.op_id} operatorGoal={operatorGoal} onGoalDeleted={onGoalDeleted}/>
              )})}
        </AccordionDetails>
      </Accordion>
      <Dialog
        open={deleteGroupGoalsOpen}
      >
        <DialogTitle>
          <Typography>
            Delete goal group
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Do you want to delete all the goals in the group?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant={"contained"} onClick={() => setDeleteGroupGoalsOpen(false)}>Cancel</Button>
          <Button variant={"contained"} color={"error"} onClick={onDeleteFromGroupsClick}>Delete</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteGroupOpen}
      >
        <DialogTitle>
          <Typography>
            Delete group
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Do you want to delete the group and all the goals in it?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant={"contained"} onClick={() => setDeleteGroupOpen(false)}>Cancel</Button>
          <Button variant={"contained"} color={"error"} onClick={onDeleteGroupClick}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
});
GoalGroup.displayName = "GoalGroup";
export default GoalGroup;