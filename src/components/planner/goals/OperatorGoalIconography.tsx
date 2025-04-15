import { Box, BoxProps } from "@mui/material";
import clsx from "clsx";
import Image from "components/base/Image";
import operatorsJson from "data/operators.json";
import { OperatorData } from "types/operators/operator";
import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import React from "react";
import imageBase from "util/imageBase";

interface Props extends BoxProps {
  goal: PlannerGoal;
  size?: number;
}

const OperatorGoalIconography: React.FC<Props> = ({ goal, size = 48, sx, ...rest }) => {
  const operator: OperatorData = operatorsJson[goal.operatorId as keyof typeof operatorsJson];

  let icon = null;
  switch (goal.category) {
    case OperatorGoalCategory.Level:
      icon = (
        <Image
          src={`${imageBase}/items/sprite_exp_card_t${goal.eliteLevel + 1}.webp`}
          width={size}
          height={size}
          alt=""
        />
      );
      break;
    case OperatorGoalCategory.Module:
      icon = <Image src={`${imageBase}/equip/${goal.moduleId}.webp`} width={size} height={size} alt="" />;
      break;
    case OperatorGoalCategory.Elite:
      if (goal.eliteLevel >= 1) {
        icon = <Image src={`${imageBase}/elite/${goal.eliteLevel}.webp`} width={size} height={size} alt="" />;
      }
      break;
    case OperatorGoalCategory.Mastery: {
      const skill = operator.skillData?.find((sk) => sk.skillId === goal.skillId);
      icon = (
        <Box position="relative">
          <Image
            src={`${imageBase}/skills/${(skill?.iconId ?? skill?.skillId ?? "").replace("#", "_")}.webp`}
            width={size}
            height={size}
            alt=""
          />
          <Image
            style={{ position: "absolute", top: (size * 2) / 3, left: (size * 2) / 3 }}
            width={size / 2}
            height={size / 2}
            src={`${imageBase}/rank/bg.webp`}
            alt={""}
          />
          <Image
            style={{ position: "absolute", top: (size * 2) / 3, left: (size * 2) / 3 }}
            src={`${imageBase}/rank/m-${goal.masteryLevel}.webp`}
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
        icon = <Image src={`${imageBase}/items/MTL_SKILL1.webp`} width={size} height={size} alt="" />;
      } else if (goal.skillLevel >= 4 && goal.skillLevel < 7) {
        icon = <Image src={`${imageBase}/items/MTL_SKILL2.webp`} width={size} height={size} alt="" />;
      } else {
        icon = <Image src={`${imageBase}/items/MTL_SKILL3.webp`} width={size} height={size} alt="" />;
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
