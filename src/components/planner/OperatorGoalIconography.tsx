import { Box } from "@mui/material";
import clsx from "clsx";
import Image from "next/image";

import operatorsJson from "data/operators.json";
import { OperatorData } from "types/operator";
import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import React from "react";

interface Props {
  goal: PlannerGoal;
}

const OperatorGoalIconography: React.FC<Props> = ({ goal }) => {
  const operator: OperatorData =
    operatorsJson[goal.operatorId as keyof typeof operatorsJson];

  let icon = null;
  switch (goal.category) {
    case OperatorGoalCategory.Level:
      icon = (
        <Image
          src={`/img/items/sprite_exp_card_t${goal.eliteLevel + 1}.png`}
          width={48}
          height={48}
          alt=""
        />
      );
      break;
    case OperatorGoalCategory.Module:
      icon = (
        <Image
          src={`/img/equip/${goal.moduleId}.png`}
          width={48}
          height={48}
          alt=""
        />
      );
      break;
    case OperatorGoalCategory.Elite:
      if (goal.eliteLevel >= 1) {
        icon = (
          <Image
            src={`/img/elite/${goal.eliteLevel}.png`}
            width={48}
            height={48}
            alt=""
          />
        );
      }
      break;
    case OperatorGoalCategory.Mastery: {
      const skill = operator.skillData!.find(
        (sk) => sk.skillId === goal.skillId
      )!;
      icon = (
        <Box position="relative">
          <Image
            src={`/img/skills/${(skill.iconId ?? skill.skillId).replace(
              "#",
              "_"
            )}.png`}
            width={48}
            height={48}
            alt=""
          ></Image>
          <Image
            style={{ position: "absolute", top: "32px", left: "32px" }}
            width={24}
            height={24}
            src={`/img/rank/bg.png`}
            alt={""}
          />
          <Image
            style={{ position: "absolute", top: "32px", left: "32px" }}
            src={`/img/rank/m-${goal.masteryLevel}.png`}
            width={24}
            height={24}
            alt=""
          />
        </Box>
      );
      break;
    }
    case OperatorGoalCategory.SkillLevel:
      if (goal.skillLevel >= 2 && goal.skillLevel < 4) {
        icon = (
          <Image
            src="/img/items/MTL_SKILL1.png"
            width={48}
            height={48}
            alt=""
          />
        );
      } else if (goal.skillLevel >= 4 && goal.skillLevel < 6) {
        icon = (
          <Image
            src="/img/items/MTL_SKILL2.png"
            width={48}
            height={48}
            alt=""
          />
        );
      } else {
        icon = (
          <Image
            src="/img/items/MTL_SKILL3.png"
            width={48}
            height={48}
            alt=""
          />
        );
      }
      break;
  }
  if (icon != null) {
    return (
      <Box
        className={clsx(
          goal.category === OperatorGoalCategory.Elite && "elite"
        )}
        component="span"
        mr={0.5}
        sx={{
          lineHeight: 0,
          "&.elite": {
            position: "relative",
            top: "-2px",
          },
        }}
      >
        {icon}
      </Box>
    );
  }
  return null;
};
export default OperatorGoalIconography;
