import React, { memo } from "react";
import { Box, Button } from "@mui/material";
import { KeyboardArrowDownSharp, KeyboardArrowUpSharp } from "@mui/icons-material";
import Image from "components/base/Image";
import { skillBackground } from "styles/theme/appTheme";

interface Props {
  skillLevel?: number;
  minSkillLevel?: number,
  maxSkillLevel?: number,
  disabled?: boolean;
  onChange: (skillLevel: number) => void;
}
const SkillLevel = memo((props: Props) => {
  const { skillLevel = 1, minSkillLevel = 1, maxSkillLevel = 4, disabled, onChange } = props;

  const previousSkillLevel = (skillLevel ?? 0) > 4 ? 4 : 1;
  const nextSkillLevel = (skillLevel ?? 0) < 4 ? 4 : 7;

  const rankButton = (rank: number) => (
    <Button sx={{ width: "100%" }}
      aria-label={`Skill Rank to ${rank}`}
      onClick={() => onChange(rank)}
      disabled={disabled || skillLevel === rank || rank > maxSkillLevel || rank < minSkillLevel}
    >
      <Image sx={{
        width: "40px",
        height: "40px",
      }}
        src={`/img/rank/${rank}.png`}
        sizes="40px"
        alt={`Rank ${rank}`}
      />
    </Button>
  );

  return (
    <Box sx={{
      display: "grid",
      gridAutoFlow: "column",
      gridTemplateColumns: "48px 48px 48px",
      gridTemplateRows: "32px 48px 32px",
      gap: "4px",
      "& .MuiButton-root": {
        p: 0,
        minWidth: 0,
        lineHeight: 0.5,
        color: "#ffffff",
      }
    }}>
      <div />
      {rankButton(previousSkillLevel)}
      <div />
      <Button
        aria-label="Raise Skill Rank"
        onClick={() => onChange(skillLevel! + 1)}
        disabled={disabled || skillLevel === maxSkillLevel}
      >
        <KeyboardArrowUpSharp fontSize="large" />
      </Button>
      <Box sx={{
        display: "grid",
        width: "48px",
        height: "48px",
        position: "relative",
        opacity: disabled ? 0.5 : 1,
        ...skillBackground,
      }}>
        {skillLevel
          ? <Image sx={{ display: "contents" }}
            src={`/img/rank/${skillLevel}.png`}
            sizes="48px"
            alt={`Rank ${skillLevel}`}
            style={{
              backgroundImage: "/img/rank/bg.png",
            }}
          />
          : null}
      </Box>
      <Button
        aria-label="Lower Skill Rank"
        onClick={() => onChange(skillLevel! - 1)}
        disabled={disabled || skillLevel === 1 || skillLevel === minSkillLevel}
      >
        <KeyboardArrowDownSharp fontSize="large" />
      </Button>
      <div />
      {rankButton(nextSkillLevel)}
      <div />
    </Box>
  )
})
export default SkillLevel;