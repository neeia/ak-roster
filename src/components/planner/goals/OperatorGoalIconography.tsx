import { Box, BoxProps } from "@mui/material";
import clsx from "clsx";
import Image from "next/image";

import operatorsJson from "data/operators.json";
import { OperatorData } from "types/operators/operator";
import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import React from "react";

interface Props extends BoxProps {
  goal: PlannerGoal;
  size?: number;
}

const OperatorGoalIconography: React.FC<Props> = ({ goal, size = 48, sx, ...rest }) => {
  const operator: OperatorData = operatorsJson[goal.operatorId as keyof typeof operatorsJson];

  let icon = null;
  switch (goal.category) {
    case OperatorGoalCategory.Level:
      icon = <Image src={`/img/items/sprite_exp_card_t${goal.eliteLevel + 1}.png`} width={size} height={size} alt="" />;
      break;
    case OperatorGoalCategory.Module:
      icon = <Image src={`/img/equip/${goal.moduleId}.png`} width={size} height={size} alt="" />;
      break;
    case OperatorGoalCategory.Elite:
      if (goal.eliteLevel >= 1) {
        icon = <Image src={`/img/elite/${goal.eliteLevel}.png`} width={size} height={size} alt="" />;
      }
      break;
    case OperatorGoalCategory.Mastery: {
      const skill = operator.skillData?.find((sk) => sk.skillId === goal.skillId);
      icon = (
        <Box position="relative">
          <Image
            src={`/img/skills/${(skill?.iconId ?? skill?.skillId ?? "").replace("#", "_")}.png`}
            width={size}
            height={size}
            alt=""
          />
          <Image
            style={{ position: "absolute", top: (size * 2) / 3, left: (size * 2) / 3 }}
            width={size / 2}
            height={size / 2}
            src={`/img/rank/bg.png`}
            alt={""}
          />
          <Image
            style={{ position: "absolute", top: (size * 2) / 3, left: (size * 2) / 3 }}
            src={`/img/rank/m-${goal.masteryLevel}.png`}
            width={size / 2}
            height={size / 2}
            alt=""
          />
        </Box>
      );
      break;
    }
    case OperatorGoalCategory.SkillLevel:
      if (goal.skillLevel >= 2 && goal.skillLevel < 4) {
        icon = <Image src="/img/items/MTL_SKILL1.png" width={size} height={size} alt="" />;
      } else if (goal.skillLevel >= 4 && goal.skillLevel < 7) {
        icon = <Image src="/img/items/MTL_SKILL2.png" width={size} height={size} alt="" />;
      } else {
        icon = <Image src="/img/items/MTL_SKILL3.png" width={size} height={size} alt="" />;
      }
      break;
  }
  if (icon != null) {
    return (
      <Box
        className={clsx(goal.category === OperatorGoalCategory.Elite && "elite")}
        component="span"
        mr={0.5}
        sx={{
          lineHeight: 0,
          "&.elite": {
            position: "relative",
            top: "-2px",
          },
          ...sx,
        }}
        {...rest}
      >
        {icon}
      </Box>
    );
  }
  return null;
};
export default OperatorGoalIconography;
