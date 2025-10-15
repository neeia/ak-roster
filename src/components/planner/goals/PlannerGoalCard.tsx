import { alpha, Box, Button, Divider, styled, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { memo, useEffect, useState } from "react";
import ItemStack from "../depot/ItemStack";
import OperatorGoalIconography from "./OperatorGoalIconography";
import { OperatorData } from "types/operators/operator";
import { OperatorGoalCategory, PlannerGoal, PlannerGoalCalculated } from "types/goal";
import { DeleteForever, Upload } from "@mui/icons-material";
import operatorJson from "data/operators";
import { CompletionIndicator } from "./CompletionIndicator";
import LowPriorityIcon from '@mui/icons-material/LowPriority';

const GoalCardButton = styled(Button)({
  borderRadius: "0px",
  width: 40,
  height: 40,
  backgroundColor: "transparent",
});

type Props = PlannerGoalCalculated & {
  groupName: string;
  onGoalDeleted: (goal: PlannerGoal, groupName: string) => void;
  onGoalCompleted: (goal: PlannerGoal, groupName: string) => void;
}

const PlannerGoalCard = memo((props: Props) => {
  const { groupName, onGoalDeleted, onGoalCompleted, ...goal } = props;
  const { completable, completableByCrafting, requirementsNotMet, ingredients, available } = goal;
  const theme = useTheme();
  const isXSScreen = !useMediaQuery(theme.breakpoints.up("sm"));

  const [goalName, setGoalName] = useState("");

  const getRequirementString = (goal: PlannerGoal, status: string): React.JSX.Element => {
    let requirement = "";
    switch (goal.category) {
      case OperatorGoalCategory.Level:
        requirement = "<Elite or LVL>";
        break;
      case OperatorGoalCategory.Elite:
        requirement = goal.eliteLevel < 1 ? "<LVL>" : "<Elite or LVL>";
        break;
      case OperatorGoalCategory.SkillLevel:
        requirement = goal.skillLevel < 5 ? "<prev.SL>" : "<E1 or prev. SL>";
        break;
      case OperatorGoalCategory.Mastery:
        requirement = "<E2, SL7 or prev.M>";
        break;
      case OperatorGoalCategory.Module:
        requirement = "<E2, LVL or prev.S>";
        break;
    }
    return (<>
      <LowPriorityIcon sx={{ color: "primary.main", display: "inline-block", verticalAlign: "middle" }} />
      : Missing doable previous goals
      <Box component="span" display="flex" justifyContent="space-between">
        (<s>{status}</s>)
        <Box component="span" ml="auto">
          {requirement}
        </Box>
      </Box></>
    )
  }

  useEffect(() => {
    const opData: OperatorData = operatorJson[goal.operatorId];

    switch (goal.category) {
      case OperatorGoalCategory.Level:
        setGoalName(`E${goal.eliteLevel} Lv${goal.fromLevel} → ${goal.toLevel}`);
        break;
      case OperatorGoalCategory.Elite:
        setGoalName(`Elite ${goal.eliteLevel}`);
        break;
      case OperatorGoalCategory.SkillLevel:
        setGoalName(`Skill Level ${goal.skillLevel}`);
        break;
      case OperatorGoalCategory.Mastery: {
        const skillNumber = opData.skillData!.findIndex((sk) => sk.skillId === goal.skillId) + 1;
        setGoalName(`S${skillNumber} M${goal.masteryLevel}`);
        break;
      }
      case OperatorGoalCategory.Module: {
        const mod = opData.moduleData!.find((m) => m.moduleId === goal.moduleId)!;
        setGoalName(`${mod.typeName} S${goal.moduleLevel}`);
        break;
      }
    }
  }, [goal]);

  const goalLabel = `${operatorJson[goal.operatorId].name} ${goalName}`;

  return (
    <CompletionIndicator
      {...{ completable, completableByCrafting, requirementsNotMet }}
      orientation="vertical"
    >
      <Box
        component="div"//why li if no uls
        sx={{
          borderTop: "solid 1px",
          "&:last-of-type": {
            borderBottom: "solid 1px",
            borderColor: "background.light",
          },
          borderLeft: "solid 1px",
          borderColor: "background.light",
          backgroundColor: "background.default",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          borderRadius: "0px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            p: 1,
            alignItems: "center",
            gap: 2,
          }}
        >
          <OperatorGoalIconography
            goal={goal}
            size={isXSScreen ? 32 : 48}
            sx={{ display: "flex", alignItems: "center", ml: 0.5 }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "start", sm: "center" },
              gap: 1,
              width: "100%",
            }}
          >
            <Box sx={{ width: "100%" }}>{goalName}</Box>
            <Box sx={{ display: "flex", gap: 1, justifyContent: { xs: "start", sm: "end" } }}>
              {ingredients.map((ingredient) => (
                <ItemStack
                  key={ingredient.id}
                  itemId={ingredient.id}
                  quantity={ingredient.quantity}
                  size={isXSScreen ? 32 : 48}
                  showItemNameTooltip={true}
                />
              ))}
            </Box>
          </Box>
        </Box>
        {/* Action Button */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid",
            borderRight: "1px solid",
            borderColor: "background.light",
          }}
        >
          <Tooltip
            arrow
            describeChild
            title={<Typography variant="body1">
              {completable
                ? requirementsNotMet
                  ? getRequirementString(goal, "Completable")
                  : available ? "Complete Goal" : <>Complete at selected event<br />Not enough in current depot</>
                : completableByCrafting
                  ? requirementsNotMet
                    ? getRequirementString(goal, "Craftable")
                    : available ? "Craft materials and Complete Goal" : <>Craft at selected event<br />Not enough in current depot</>
                  : "Not enough craftable materials"}
            </Typography>
            }
            placement="left"
          >
            <span>
              <GoalCardButton
                aria-label={`Complete goal: ${goalLabel}`}
                onClick={() => onGoalCompleted(goal, groupName)}
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    backgroundColor: (theme) => alpha(theme.palette.success.dark, 0.25),
                    color: "success.main",
                  },
                }}
                disabled={!available ||
                  (!completable && !completableByCrafting)
                  || (completable || completableByCrafting) && requirementsNotMet}
              >
                <Upload fontSize="small" />
              </GoalCardButton>
            </span>
          </Tooltip>
          <Divider />
          <Tooltip arrow describeChild title={<Typography variant="body1">Delete Goal</Typography>} placement="left">
            <GoalCardButton
              aria-label={`Delete goal: ${goalLabel}`}
              onClick={() => onGoalDeleted(goal, groupName)}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: (theme) => alpha(theme.palette.error.dark, 0.25),
                  color: "error.main",
                },
              }}
            >
              <DeleteForever fontSize="small" />
            </GoalCardButton>
          </Tooltip>
        </Box>
      </Box>
    </CompletionIndicator>
  );
});
PlannerGoalCard.displayName = "PlannerGoalCard";
export default PlannerGoalCard;
