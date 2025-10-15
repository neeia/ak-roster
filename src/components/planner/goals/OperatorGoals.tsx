import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ButtonBase,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import Image from "components/base/Image";
import AddCircleIcon from "@mui/icons-material/AddCircleOutlined";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircleOutlined";
import GoalData, { getGoalString } from "types/goalData";
import React, { memo, useCallback, useState } from "react";
import operatorJson from "data/operators";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Operator } from "types/operators/operator";
import imageBase from "util/imageBase";
import { CompletionIndicator, CompletionIndicatorProps } from "./CompletionIndicator";

interface Props extends Pick<CompletionIndicatorProps, 'completable' | 'completableByCrafting'> {
  operator: Operator;
  operatorGoal: GoalData;
  onGoalEdit: (opId: string, groupName: string) => void;
  onGoalMove: (opId: string, groupName: string) => void;
  removeAllGoalsFromOperator: (opId: string, groupName: string) => void;
  completeAllGoalsFromOperator: (opId: string, groupName: string) => void;
  children?: React.ReactNode;
  onOpSelect: (opId: string, groupName: string) => void;
  onGoalRefresh: (operatorGoal: GoalData) => void;
}

export const OperatorGoals = memo((props: Props) => {
  const {
    operatorGoal,
    onGoalEdit,
    onGoalMove,
    removeAllGoalsFromOperator,
    completeAllGoalsFromOperator,
    children,
    onOpSelect,
    onGoalRefresh,
    ...rest
  } = props;

  const [expanded, setExpanded] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isMenuOpen = Boolean(anchorEl);

  const imgUrl = `${imageBase}/avatars/${operatorGoal.op_id}.webp`;
  const opData = operatorJson[operatorGoal.op_id];

  const handleMoreButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMoreMenuClose = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setAnchorEl(null);
    },
    [setAnchorEl]
  );

  const handleEditGoalButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      handleMoreMenuClose(e);
      onGoalEdit(operatorGoal.op_id, operatorGoal.group_name);
    },
    [onGoalEdit, handleMoreMenuClose, operatorGoal]
  );

  const handleMoveGoalButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      handleMoreMenuClose(e);
      onGoalMove(operatorGoal.op_id, operatorGoal.group_name);
    },
    [onGoalMove, handleMoreMenuClose, operatorGoal]
  );

  const handleDeleteGoalsButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      handleMoreMenuClose(e);
      removeAllGoalsFromOperator(operatorGoal.op_id, operatorGoal.group_name);
    },
    [removeAllGoalsFromOperator, handleMoreMenuClose, operatorGoal]
  );

  const handleCompleteGoalsButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      handleMoreMenuClose(e);
      completeAllGoalsFromOperator(operatorGoal.op_id, operatorGoal.group_name);
    },
    [completeAllGoalsFromOperator, handleMoreMenuClose, operatorGoal]
  );

  const handleRefreshGoalClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      handleMoreMenuClose(e);
      onGoalRefresh(operatorGoal);
    },
    [onGoalRefresh, handleMoreMenuClose, operatorGoal]
  );

  return (
    <Accordion
      onChange={(_, expanded) => setExpanded(expanded)}
      sx={{
        backgroundColor: "background.default",
        mb: "16px !important",
        "&:before": {
          display: "none",
        },
        borderRadius: 1,
      }}
      slotProps={{ transition: { timeout: 250 } }}
    >
      <AccordionSummary
        sx={{
          "& .MuiAccordionSummary-content": {
            my: 1,
          },
          "& .MuiAccordionSummary-content.Mui-expanded": {
            my: 1.5,
          },
        }}
      >
        <Box
          sx={{
            width: "stretch",
            display: "flex",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <Box sx={{ gridArea: "opImage", position: "relative", marginLeft: -4 }}>
            <ButtonBase
              sx={{
                borderBottomLeftRadius: "50%",
                borderTopLeftRadius: 8,
                borderBottomRightRadius: 4,
                overflow: "hidden",
                width: 64,
                height: 64,
                transition: "opacity 0.1s",
                "&:focus, &:hover": {
                  opacity: 0.5,
                },
              }}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onOpSelect(operatorGoal.op_id, operatorGoal.group_name);
              }}
            >
              <CompletionIndicator
                {...rest}
                orientation="vertical"
              >
                <Image src={imgUrl} width={64} height={64} alt="" />
              </CompletionIndicator>
            </ButtonBase>
            {expanded ? (
              <RemoveCircleIcon
                sx={{
                  position: "absolute",
                  bottom: "-6px",
                  left: "0",
                  borderRadius: "50%",
                  backgroundColor: "background.paper",
                }}
              />
            ) : (
              <AddCircleIcon
                sx={{
                  position: "absolute",
                  bottom: "-6px",
                  left: "0",
                  borderRadius: "50%",
                  backgroundColor: "background.paper",
                }}
              />
            )}
          </Box>
          <Box sx={{ width: "100%" }}>
            <Typography variant="h5">{opData.name}</Typography>
            <Typography sx={{ fontVariant: "small-caps" }}>{getGoalString(operatorGoal, opData)}</Typography>
          </Box>
          <IconButton sx={{ alignSelf: "center" }} onClick={handleMoreButtonClick}>
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
            sx={{ "& button": { width: "100%" } }}
          >
            <MenuItem component="button" onClick={handleEditGoalButtonClick}>
              <Typography>Edit Goal</Typography>
            </MenuItem>
            <MenuItem component="button" onClick={handleRefreshGoalClick}>
              <Typography>Update & Clear</Typography>
            </MenuItem>
            <MenuItem component="button" onClick={handleMoveGoalButtonClick}>
              <Typography>Change Group</Typography>
            </MenuItem>
            <Tooltip placement="top" arrow
              slotProps={{
                popper: {
                  modifiers: [{
                    name: 'offset',
                    options: { offset: [0, 10], },
                  },],
                },
              }}
              title={
                <Typography variant="body2" >
                  Force complete and remove.<br />Consume or craft items set to 'Crafting'
                </Typography>} describeChild>
              <MenuItem component="button" onClick={handleCompleteGoalsButtonClick}>
                <Typography color="success">Complete all goals</Typography>
              </MenuItem>
            </Tooltip>
            <MenuItem component="button" onClick={handleDeleteGoalsButtonClick}>
              <Typography color="error">Delete all goals</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>{children}</AccordionDetails>
    </Accordion>
  );
});
OperatorGoals.displayName = "OperatorGoals";
export default OperatorGoals;
