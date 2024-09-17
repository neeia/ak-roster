import React, { memo } from "react";
import { Box, Button } from "@mui/material";
import { KeyboardArrowDownSharp, KeyboardArrowUpSharp } from "@mui/icons-material";
import Image from "components/base/Image";
import Module from "./Module";

interface Props {
  skillLevel?: number;
  minSkillLevel?: number,
  maxSkillLevel?: number,
  disabled?: boolean;
  onChange: (skillLevel: number) => void;
}
const SelectSkillLevel = memo((props: Props) => {
  const { skillLevel = 1, minSkillLevel = 1, maxSkillLevel = 4, disabled, onChange } = props;

  const previousSkillLevel = (skillLevel ?? 0) > 4 ? 4 : 1;
  const nextSkillLevel = (skillLevel ?? 0) < 4 ? 4 : 7;

  function updateRank(rank: number) {
    onChange(rank);
  }

  const rankButton = (rank: number) => (
    <Button sx={{ width: "fit-content" }}
      aria-label={`Skill Rank to ${rank}`}
      onClick={() => updateRank(rank)}
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
      display: "flex",
      alignItems: "center",
      gap: "4px",
      "& .MuiButton-root": {
        display: "grid",
        p: 0.5,
        minWidth: 0,
        lineHeight: 0.5,
        color: "#ffffff",
      }
    }}>
      {rankButton(previousSkillLevel)}
      <Box sx={{
        display: "flex",
        flexDirection: "column-reverse",
        gap: "2px",
        "& > .MuiButton-root": {
          display: "grid",
          p: 0,
          height: "min-content",
        }
      }}>
        <Button
          aria-label="Lower Skill Rank"
          sx={{ display: { xs: "none", sm: "" }, }}
          onClick={() => updateRank(skillLevel! - 1)}
          disabled={disabled || skillLevel === 1 || skillLevel === minSkillLevel}
        >
          <KeyboardArrowDownSharp fontSize="large" />
        </Button>

        <Box sx={{
          display: "grid",
          width: "64px",
          height: "64px",
          position: "relative",
          opacity: disabled ? 0.5 : 1,
        }}>
          <Image sx={{ display: "contents" }}
            src={`/img/rank/bg.png`}
            sizes="64px"
            alt=""
          />
          {skillLevel
            ? <Image sx={{ display: "contents" }}
              src={`/img/rank/${skillLevel}.png`}
              sizes="64px"
              alt={`Rank ${skillLevel}`}
            />
            : null}
        </Box>
        <Button
          aria-label="Raise Skill Rank"
          sx={{ display: { xs: "none", sm: "" }, }}
          onClick={() => updateRank(skillLevel! + 1)}
          disabled={disabled || skillLevel === maxSkillLevel}
        >
          <KeyboardArrowUpSharp fontSize="large" />
        </Button>
      </Box>
      {rankButton(nextSkillLevel)}
    </Box>
  )
})
SkillLevel.displayName = "SkillLevel";
export default SelectSkillLevel;