import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Image from "next/image";
import React, { memo, useCallback, useState } from "react";
import GoalData from "types/goalData";
import { PlannerGoal } from "types/goal";
import { OperatorGoals } from "./OperatorGoals";
import { Operator } from "types/operators/operator";
import useOperators from "util/hooks/useOperators";
import { defaultOperatorObject } from "util/changeOperator";

interface Props {
  operatorGoals: GoalData[] | undefined;
  groupName: string;
  onGoalDeleted: (plannerGoal: PlannerGoal) => void;
  onGoalCompleted: (plannerGoal: PlannerGoal, operator: Operator) => void;
  removeAllGoalsFromGroup: (groupName: string) => void;
  removeGroup: (groupName: string) => void;
  removeAllGoalsFromOperator: (opId: string, groupName: string) => void;
  defaultExpanded: boolean;
}

const GoalGroup = memo((props: Props) => {
  const {
    operatorGoals,
    groupName,
    onGoalDeleted,
    onGoalCompleted,
    removeAllGoalsFromGroup,
    removeGroup,
    removeAllGoalsFromOperator,
    defaultExpanded,
  } = props;

  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);
  const [deleteGroupGoalsOpen, setDeleteGroupGoalsOpen] = useState<boolean>(false);
  const [deleteGroupOpen, setDeleteGroupOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isMenuOpen = Boolean(anchorEl);

  const [roster] = useOperators();

  const onDeleteFromGroupsClick = useCallback(() => {
    removeAllGoalsFromGroup(groupName);
    setDeleteGroupGoalsOpen(false);
  }, [removeAllGoalsFromGroup, groupName]);

  const onDeleteGroupClick = useCallback(() => {
    removeGroup(groupName);
    setDeleteGroupGoalsOpen(false);
  }, [groupName, removeGroup]);

  const handleMoreButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  }, []);

  const handleMoreMenuClose = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnchorEl(null);
  }, []);

  const handleDeleteGroupButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      handleMoreMenuClose(e);
      setDeleteGroupOpen(true);
    },
    [handleMoreMenuClose]
  );

  const handleDeleteGroupGoalsButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      handleMoreMenuClose(e);
      setDeleteGroupGoalsOpen(true);
    },
    [handleMoreMenuClose]
  );

  return (
    <>
      <Accordion
        onChange={(_, expanded) => setExpanded(expanded)}
        disableGutters
        elevation={0}
        defaultExpanded={defaultExpanded}
        sx={{
          "&:before": {
            display: "none",
          },
        }}
      >
        <AccordionSummary>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <IconButton id="more-button" onClick={handleMoreButtonClick}>
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
                <MenuItem disabled={!operatorGoals}>
                  <Typography onClick={handleDeleteGroupGoalsButtonClick} color="error">
                    Delete goals
                  </Typography>
                </MenuItem>
                <MenuItem disabled={groupName == "Default"}>
                  <Typography onClick={handleDeleteGroupButtonClick} color="error">
                    Delete group
                  </Typography>
                </MenuItem>
              </Menu>
              <Typography textAlign="center" variant="h5" sx={{ flexGrow: "1" }}>
                {groupName}
              </Typography>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            {operatorGoals && (
              <Collapse in={!expanded}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    backgroundColor: "background.default",
                    padding: 1,
                    borderRadius: 1,
                    pl: 2.5,
                  }}
                >
                  {operatorGoals
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((operatorGoal) => {
                      const imgUrl = `/img/avatars/${operatorGoal.op_id}.png`;
                      return (
                        <Box
                          sx={{
                            "& img": {
                              borderBottomLeftRadius: "50%",
                              borderTopLeftRadius: 8,
                              borderBottomRightRadius: 4,
                              filter: "drop-shadow(-4px -2px 4px rgba(0,0,0,0.5))",
                              ml: -1.5,
                            },
                          }}
                          key={operatorGoal.op_id}
                        >
                          <Image src={imgUrl} width={48} height={48} alt="" />
                        </Box>
                      );
                    })}
                </Box>
              </Collapse>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {operatorGoals &&
            operatorGoals
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((operatorGoal) => {
                return (
                  <OperatorGoals
                    key={operatorGoal.op_id}
                    operator={roster[operatorGoal.op_id] ?? defaultOperatorObject(operatorGoal.op_id, true)}
                    operatorGoal={operatorGoal}
                    onGoalDeleted={onGoalDeleted}
                    onGoalCompleted={onGoalCompleted}
                    removeAllGoalsFromOperator={removeAllGoalsFromOperator}
                  />
                );
              })}
        </AccordionDetails>
      </Accordion>
      <Dialog open={deleteGroupGoalsOpen}>
        <DialogTitle>
          <Typography>Delete goal group</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>Do you want to delete all the goals in the group?</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant={"contained"} onClick={() => setDeleteGroupGoalsOpen(false)}>
            Cancel
          </Button>
          <Button variant={"contained"} color={"error"} onClick={onDeleteFromGroupsClick}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteGroupOpen}>
        <DialogTitle>
          <Typography>Delete group</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>Do you want to delete the group and all the goals in it?</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant={"contained"} onClick={() => setDeleteGroupOpen(false)}>
            Cancel
          </Button>
          <Button variant={"contained"} color={"error"} onClick={onDeleteGroupClick}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});
GoalGroup.displayName = "GoalGroup";
export default GoalGroup;
