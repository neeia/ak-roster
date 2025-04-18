import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  Box,
  Button,
  Checkbox,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Image from "components/base/Image";
import React, { memo, useCallback, useState } from "react";
import GoalData from "types/goalData";
import imageBase from "util/imageBase";

interface Props {
  operatorGoals: GoalData[] | undefined;
  groupName: string;
  removeAllGoalsFromGroup: (groupName: string) => void;
  removeGroup: (groupName: string) => void;
  onRename: (groupName: string) => void;
  defaultExpanded: boolean;
  children?: React.ReactNode;
  inactiveOps: string[];
  onOpSelect: (opId: string, groupName: string) => void;
  onGroupSelect: (groupName: string) => void;
  getCheckboxState: (groupName: string) => { checkboxText: string, checkboxState: { checked: boolean; indeterminate: boolean; disabled: boolean } };
}

const GoalGroup = memo((props: Props) => {
  const {
    operatorGoals,
    groupName,
    removeAllGoalsFromGroup,
    removeGroup,
    onRename,
    defaultExpanded,
    children,
    inactiveOps,
    onOpSelect,
    onGroupSelect,
    getCheckboxState,
  } = props;

  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);
  const [deleteGroupGoalsOpen, setDeleteGroupGoalsOpen] = useState<boolean>(false);
  const [deleteGroupOpen, setDeleteGroupOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isMenuOpen = Boolean(anchorEl);

  const { checkboxText, checkboxState } = getCheckboxState(groupName);

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

  const handleRenameGroupButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    handleMoreMenuClose(e);
    onRename(groupName);
  };

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
        slotProps={{ transition: { timeout: 250 } }}
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
                <MenuItem disabled={groupName === "Default"}>
                  <Typography onClick={handleRenameGroupButtonClick}>Rename group</Typography>
                </MenuItem>
                <MenuItem disabled={!operatorGoals}>
                  <Typography onClick={handleDeleteGroupGoalsButtonClick} color="error">
                    Delete goals
                  </Typography>
                </MenuItem>
                <MenuItem disabled={groupName === "Default"}>
                  <Typography onClick={handleDeleteGroupButtonClick} color="error">
                    Delete group
                  </Typography>
                </MenuItem>
              </Menu>
              <Typography textAlign="center" variant="h5" sx={{ flexGrow: "1" }}>
                {groupName}
              </Typography>
              <FormControlLabel
                label={checkboxText}
                labelPlacement="start"
                control={<Checkbox
                  {...checkboxState}
                  onClick={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.checked || !expanded) e.stopPropagation();
                    onGroupSelect(groupName);
                  }}
                />}
              />
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
                    mt: 1,
                  }}
                >
                  {operatorGoals
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((operatorGoal) => {
                      const imgUrl = `${imageBase}/avatars/${operatorGoal.op_id}.webp`;
                      const isEnabled = !(inactiveOps.includes(operatorGoal.op_id) ?? false);
                      return (
                        <Box
                          key={operatorGoal.op_id}
                          onClick={(e: React.MouseEvent<HTMLImageElement>) => {
                            e.stopPropagation();
                            onOpSelect(operatorGoal.op_id, groupName);
                          }}
                        >
                          <Image
                            src={imgUrl}
                            width={48}
                            height={48}
                            alt=""
                            sx={{
                              borderBottomLeftRadius: "50%",
                              borderTopLeftRadius: 8,
                              borderBottomRightRadius: 4,
                              filter: (theme) =>
                                `drop-shadow(-4px -2px 4px ${alpha(theme.palette.background.paper, 0.5)})
                                 ${isEnabled ? "grayscale(0)" : "grayscale(1) opacity(0.6)"}`,
                              ml: -1.5,
                              "&:hover": {
                                backgroundColor: (theme) => alpha(theme.palette.error.dark, isEnabled ? 0.25 : 1)
                              },

                            }}
                          />
                        </Box>
                      );
                    })}
                </Box>
              </Collapse>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>{children}</AccordionDetails>
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
