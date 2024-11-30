import DeleteGoalIcon from "@mui/icons-material/CloseRounded";
import CompleteGoalIcon from "@mui/icons-material/Upload";
import {
  Box,
  Button,
  ButtonGroup,
  Paper,
  styled,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { memo, useCallback } from "react";

import operatorsJson from "data/operators.json";

import ItemStack from "./ItemStack";
import OperatorGoalIconography from "./OperatorGoalIconography";
import { OperatorData } from "types/operators/operator";
import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import getGoalIngredients from "util/getGoalIngredients";

const GoalCardButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(0.75),
  flexGrow: 1,
  backgroundColor: theme.palette.background.default,
  borderRadius: "0px",
}));

interface Props {
  goal: PlannerGoal;
  onGoalDeleted: (goal: PlannerGoal) => void;
  onGoalCompleted: (goal: PlannerGoal) => void;
}

const PlannerGoalCard = memo((props: Props) => {
  const { goal, onGoalDeleted, onGoalCompleted, ...rest } = props;
  const theme = useTheme();
  const isXSScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isXLScreen = useMediaQuery(theme.breakpoints.up("xl"));

  const operator: OperatorData =
    operatorsJson[goal.operatorId as keyof typeof operatorsJson];

  const goalName = useCallback(() => {
    switch (goal.category) {
      case OperatorGoalCategory.Level:
        return `Lv.${goal.fromLevel} to Lv.${goal.toLevel} for Elite ${goal.eliteLevel}`;
      case OperatorGoalCategory.Elite:
        return `Elite ${goal.eliteLevel}`;
      case OperatorGoalCategory.SkillLevel:
        return `${isXLScreen ? "Skill Level" : "Sk.Lv."} ${goal.skillLevel}`;
      case OperatorGoalCategory.Mastery: {
        const skillNumber =
          operator.skillData!.findIndex((sk) => sk.skillId === goal.skillId) +
          1;
        return isXLScreen
          ? `Skill ${skillNumber} Mastery ${goal.masteryLevel}`
          : `S${skillNumber} M${goal.masteryLevel}`;
      }
      case OperatorGoalCategory.Module: {
        const mod = operator.moduleData!.find(
          (m) => m.moduleId === goal.moduleId
        )!;
        return `${mod.typeName} (${mod.moduleName}) Stage ${goal.moduleLevel}`;
      }
    }
  }, [goal, isXLScreen, operator.moduleData, operator.skillData]);

  const goalLabel = `${operator.name} ${goalName}`;

  const ingredients = getGoalIngredients(goal);

  return (
    <Paper
      component="li"
      sx={{
        borderTop: "solid 2px",
        borderColor: (theme) => theme.palette.background.light,
        "&:last-of-type": {
          borderBottom: "solid 2px",
          borderColor: (theme) => theme.palette.background.light,
        },
        display: "grid",
        gridTemplateColumns: "1fr auto",
        borderRadius: "0px",
      }}
      {...rest}
    >
      <Paper
        sx={{
          backgroundColor: "background.default",
          display: "grid",
          p: 1,
          pb: {
            xs: 2,
            sm: 1,
          },
          alignItems: "center",
          gridTemplateAreas: {
            xs: `
              'icon goalname'
              'icon mats'
            `,
            sm: `
              'icon goalname mats'
            `,
          },
          gridTemplateRows: "1fr auto",
          gridTemplateColumns: {
            xs: `auto 1fr`,
            xl: `auto 1fr`,
          },
          columnGap: 3,
        }}
      >
        <Box
          gridArea="icon"
          display="flex"
          alignItems="center"
          ml={{ xs: 0, sm: 1 }}
        >
          {!isXSScreen && <OperatorGoalIconography goal={goal} />}
        </Box>

        <Box gridArea="goalname">{goalName()}</Box>

        <Box gridArea="mats" display="flex" justifyContent="space-evenly">
          {ingredients.map((ingredient) => (
            <ItemStack
              key={ingredient.id}
              itemId={ingredient.id}
              quantity={ingredient.quantity}
              size={55}
              showItemNameTooltip={true}
            />
          ))}
        </Box>
      </Paper>

      <ButtonGroup
        orientation="vertical"
        sx={{
          display: "grid",
          gridTemplateRows: "10fr 9fr",
        }}
      >
        <Tooltip arrow describeChild title="Complete Goal" placement="left">
          <GoalCardButton
            aria-label={`Complete goal: ${goalLabel}`}
            onClick={() => onGoalCompleted(goal)}
            sx={{
              borderWidth: "0 0 1px 2px",
              borderColor: (theme) => theme.palette.background.light,
              color: "#fff",
              "&:hover": {
                borderWidth: "1px 0 0 2px",
                borderColor: (theme) => theme.palette.background.light,
                backgroundColor: (theme) => theme.palette.success.main,
              },
            }}
          >
            <CompleteGoalIcon />
          </GoalCardButton>
        </Tooltip>
        <GoalCardButton
          aria-label={`Delete goal: ${goalLabel}`}
          onClick={() => onGoalDeleted(goal)}
          sx={{
            borderWidth: "1px 0 0 2px",
            borderColor: (theme) => theme.palette.background.light,
            color: "#ccc",
            "&:hover": {
              borderWidth: "1px 0 0 2px",
              borderColor: (theme) => theme.palette.background.light,
              backgroundColor: (theme) => theme.palette.error.main,
            },
          }}
        >
          <DeleteGoalIcon />
        </GoalCardButton>
      </ButtonGroup>
    </Paper>
  );
});
PlannerGoalCard.displayName = "PlannerGoalCard";
export default PlannerGoalCard;
