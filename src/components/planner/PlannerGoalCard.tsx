import {
  alpha,
  Box,
  Button,
  ButtonGroup,
  Divider,
  Paper,
  styled,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { memo, useCallback, useEffect, useState } from "react";

import operatorsJson from "data/operators.json";

import ItemStack from "./ItemStack";
import OperatorGoalIconography from "./OperatorGoalIconography";
import { Operator, OperatorData } from "types/operators/operator";
import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import getGoalIngredients from "util/getGoalIngredients";
import useOperators from "util/hooks/useOperators";
import { DeleteForever, Upload } from "@mui/icons-material";

const GoalCardButton = styled(Button)({
  borderRadius: "0px",
  width: 40,
  height: 40,
  backgroundColor: "transparent",
});

interface Props {
  goal: PlannerGoal;
  onGoalDeleted: (goal: PlannerGoal) => void;
  onGoalCompleted: (goal: PlannerGoal, operator: Operator) => void;
}

const PlannerGoalCard = memo((props: Props) => {
  const { goal, onGoalDeleted, onGoalCompleted, ...rest } = props;
  const theme = useTheme();
  const isXSScreen = !useMediaQuery(theme.breakpoints.up("sm"));

  const [roster] = useOperators();

  const operator = roster[goal.operatorId];
  const opData: OperatorData = operatorsJson[goal.operatorId as keyof typeof operatorsJson];

  const [goalName, setGoalName] = useState("");

  useEffect(() => {
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

  const goalLabel = `${opData.name} ${goalName}`;

  const ingredients = getGoalIngredients(goal);

  return (
    <Box
      component="li"
      sx={{
        borderTop: "solid 1px",
        borderLeft: "solid 1px",
        "&:last-of-type": {
          borderBottom: "solid 1px",
          borderColor: "background.light",
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
        <Tooltip arrow describeChild title="Complete Goal" placement="left">
          <GoalCardButton
            aria-label={`Complete goal: ${goalLabel}`}
            onClick={() => onGoalCompleted(goal, operator!)}
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: (theme) => alpha(theme.palette.success.dark, 0.25),
                color: "success.main",
              },
            }}
          >
            <Upload fontSize="small" />
          </GoalCardButton>
        </Tooltip>
        <Divider />
        <Tooltip arrow describeChild title="Delete Goal" placement="left">
          <GoalCardButton
            aria-label={`Delete goal: ${goalLabel}`}
            onClick={() => onGoalDeleted(goal)}
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
