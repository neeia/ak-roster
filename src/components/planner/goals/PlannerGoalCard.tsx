import { alpha, Box, Button, Divider, styled, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import React, { memo, useEffect, useState } from "react";
import ItemStack from "../depot/ItemStack";
import OperatorGoalIconography from "./OperatorGoalIconography";
import { OperatorData } from "types/operators/operator";
import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import getGoalIngredients from "util/fns/depot/getGoalIngredients";
import { DeleteForever, Upload } from "@mui/icons-material";
import clsx from "clsx";
import operatorJson from "data/operators";

const GoalCardButton = styled(Button)({
  borderRadius: "0px",
  width: 40,
  height: 40,
  backgroundColor: "transparent",
});

interface Props {
  goal: PlannerGoal;
  groupName: string;
  onGoalDeleted: (goal: PlannerGoal, groupName: string) => void;
  onGoalCompleted: (goal: PlannerGoal, groupName: string) => void;
  completable?: boolean;
  completableByCrafting?: boolean;
}

const PlannerGoalCard = memo((props: Props) => {
  const { goal, groupName, onGoalDeleted, onGoalCompleted, completable = false, completableByCrafting = false } = props;
  const theme = useTheme();
  const isXSScreen = !useMediaQuery(theme.breakpoints.up("sm"));

  const [goalName, setGoalName] = useState("");

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

  const ingredients = getGoalIngredients(goal);

  return (
    <Box
      component="li"
      className={clsx({
        completable: completable,
        craftable: completableByCrafting && !completable,
      })}
      sx={{
        borderTop: "solid 1px",
        "&:last-of-type": {
          borderBottom: "solid 1px",
          borderColor: "background.light",
        },
        borderLeft: "solid 1px",
        position: "relative",
        "&:before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "2px",
          height: "100%",
        },
        "&.craftable:before": {
          backgroundColor: "warning.main",
        },
        "&.completable:before": {
          backgroundColor: "success.main",
        },
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
        <Tooltip arrow describeChild 
          title={(completable) ?
            "Complete Goal"
            : (completableByCrafting) ?
              "Craft materials and Complete Goal"
              : "Not enough craftable materials"} 
          placement="left">
          <span><GoalCardButton
            aria-label={`Complete goal: ${goalLabel}`}
            onClick={() => onGoalCompleted(goal, groupName)}
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: (theme) => alpha(theme.palette.success.dark, 0.25),
                color: "success.main",
              },
            }}
            disabled={!completable && !completableByCrafting}
          >
            <Upload fontSize="small" />
          </GoalCardButton></span>
        </Tooltip>
        <Divider />
        <Tooltip arrow describeChild title="Delete Goal" placement="left">
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
  );
});
PlannerGoalCard.displayName = "PlannerGoalCard";
export default PlannerGoalCard;
