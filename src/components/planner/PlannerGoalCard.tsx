import DeleteGoalIcon from "@mui/icons-material/CloseRounded";
import CompleteGoalIcon from "@mui/icons-material/Upload";
import {
  Box,
  Button,
  ButtonGroup,
  Paper,
  styled,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import React from "react";

import operatorsJson from "data/operators.json";

import ItemStack from "./ItemStack";
import OperatorGoalIconography from "./OperatorGoalIconography";
import { OpJsonObj } from "types/operator";
import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import getGoalIngredients from "util/getGoalIngredients";

const GoalCardButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(0.75),
  flexGrow: 1,
  backgroundColor: theme.palette.background.paper,
  "&:first-of-type": { borderTopLeftRadius: 0 },
  "&:last-of-type": { borderBottomLeftRadius: 0 },
  "&.MuiButtonGroup-grouped:not(:last-of-type)": {
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
}));

interface Props {
  goal: PlannerGoal;
  onGoalDeleted: (goal: PlannerGoal) => void;
  onGoalCompleted: (goal: PlannerGoal) => void;
}

const PlannerGoalCard = React.forwardRef<HTMLLIElement, Props>((props, ref) => {
  const { goal, onGoalDeleted, onGoalCompleted, ...rest } = props;
  const theme = useTheme();
  const isXSScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isXLScreen = useMediaQuery(theme.breakpoints.up("xl"));
  const operatorIconSize = isXSScreen ? 32 : 48;

  const operator: OpJsonObj =
    operatorsJson[goal.operatorId as keyof typeof operatorsJson];
  const [_, appellation] = operator.name.split(" the ");

  const goalName = (() => {
    switch (goal.category) {
      case OperatorGoalCategory.Elite:
        return `Elite ${goal.eliteLevel}`;
      case OperatorGoalCategory.SkillLevel:
        return `${isXLScreen ? "Skill Level" : "Sk.Lv."} ${goal.skillLevel}`;
      case OperatorGoalCategory.Mastery: {
        const skillNumber =
          operator.skills.findIndex((sk) => sk.skillId === goal.skillId) + 1;
        return isXLScreen
          ? `Skill ${skillNumber} Mastery ${goal.masteryLevel}`
          : `S${skillNumber} M${goal.masteryLevel}`;
      }
      case OperatorGoalCategory.Module: {
        const module = operator.modules.find(
          (m) => m.moduleId === goal.moduleId
        )!;
        return `Module ${module.typeName} Stage ${goal.moduleLevel}`;
      }
    }
  })();
  const goalLabel = `${operator.name} ${goalName}`;

  const ingredients = getGoalIngredients(goal);

  return (
    <Paper
      component="li"
      elevation={3}
      sx={{
        display: "grid",
        mb: 1,
        gridTemplateColumns: "1fr auto",
      }}
      ref={ref}
      {...rest}
    >
      <Paper
        sx={{
          display: "grid",
          p: 1,
          pb: {
            xs: 2,
            sm: 1,
          },
          alignItems: "center",
          gridTemplateAreas: {
            xs: `
              'icon name goalname'
              'mats mats mats'
            `,
            sm: `
              'icon name     mats'
              'icon goalname mats'
            `,
          },
          gridTemplateRows: "1fr auto",
          gridTemplateColumns: {
            xs: `${operatorIconSize}px auto 1fr`,
            xl: `${operatorIconSize}px 200px 1fr`,
          },
          columnGap: 1,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          borderRight: "1px solid rgba(255, 255, 255, 0.2)",
          "& .operator-avatar": {
            borderRadius: "0 0 0 40%",
          }
        }}
      >
        <Box gridArea="icon" display="flex">
          <Image
            src={`/img/avatars/${operator.id}.png`}
            width={operatorIconSize}
            height={operatorIconSize}
            alt=""
            className="operator-avatar"
          />
        </Box>

        <Typography
          component="span"
          sx={{ fontSize: 20, lineHeight: 1, gridArea: "name", ml: { xs: 0, sm: 1 } }}
        >
          {appellation ?? operator.name}
        </Typography>

        <Box
          gridArea="goalname"
          display="flex"
          alignItems="center"
          ml={{ xs: 0, sm: 1 }}
        >
          {!isXSScreen && <OperatorGoalIconography goal={goal} />}
          {goalName}
        </Box>

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
        variant="contained"
        sx={{
          display: "flex",
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        <Tooltip
          arrow
          describeChild
          title="Complete Goal"
          placement="left"
        >
          <GoalCardButton
            aria-label={`Complete goal: ${goalLabel}`}
            onClick={() => onGoalCompleted(goal)}
            sx={{
              color: "#fff",
              "&:hover": {
                backgroundColor: (theme) => theme.palette.success.dark,
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
            color: "#ccc",
            "&:hover": {
              backgroundColor: (theme) => theme.palette.error.dark,
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
